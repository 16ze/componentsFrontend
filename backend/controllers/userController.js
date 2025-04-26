const User = require("../models/userModel");
const asyncHandler = require("../middleware/asyncHandler");
const crypto = require("crypto");
const { BookingService } = require("../services/bookingService");
const logger = require("../utils/logger");

/**
 * @desc    Authentifier un utilisateur et générer un token
 * @route   POST /api/admin/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Email ou mot de passe invalide");
  }

  // Vérifier si le mot de passe correspond
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Email ou mot de passe invalide");
  }

  // Générer le token JWT
  const token = user.generateAuthToken();

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token,
    },
  });
});

/**
 * @desc    Enregistrer un nouvel utilisateur (admin uniquement)
 * @route   POST /api/admin/register
 * @access  Private/Admin
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, isAdmin = false } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Utilisateur déjà existant");
  }

  // Créer l'utilisateur
  const user = await User.create({
    name,
    email,
    password,
    isAdmin,
  });

  if (user) {
    // Générer le token JWT
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token,
      },
    });
  } else {
    res.status(400);
    throw new Error("Données utilisateur invalides");
  }
});

/**
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @route   GET /api/admin/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.status(200).json({
      success: true,
      data: user,
    });
  } else {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }
});

/**
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @route   PUT /api/admin/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        phone: updatedUser.phone,
      },
    });
  } else {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }
});

/**
 * @desc    Demander un lien de réinitialisation de mot de passe
 * @route   POST /api/admin/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  // Récupérer l'utilisateur par email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error("Aucun utilisateur avec cet email");
  }

  // Générer et enregistrer un token de réinitialisation
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Créer l'URL de réinitialisation
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/admin/reset-password/${resetToken}`;

  // En production, envoyer un email avec ce lien
  logger.info(`Token de réinitialisation pour ${user.email}: ${resetUrl}`);

  res.status(200).json({
    success: true,
    message: "Email envoyé",
  });
});

/**
 * @desc    Réinitialiser le mot de passe
 * @route   POST /api/admin/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  // Récupérer et hacher le token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Trouver l'utilisateur par token et vérifier qu'il n'est pas expiré
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token invalide ou expiré");
  }

  // Définir le nouveau mot de passe
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Générer un nouveau token JWT
  const token = user.generateAuthToken();

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token,
    },
  });
});

/**
 * @desc    Récupérer les statistiques pour le tableau de bord
 * @route   GET /api/admin/dashboard-stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Statistiques des réservations
  const bookingService = new BookingService();
  const bookingStats = await bookingService.getBookingStats();

  // Compter les messages de contact non lus
  const ContactSubmission = require("../models/contactModel");
  const unreadContactCount = await ContactSubmission.countDocuments({
    status: "new",
  });

  // Compter les utilisateurs
  const userCount = await User.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      bookings: bookingStats,
      unreadContactCount,
      userCount,
    },
  });
});

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  getDashboardStats,
};
