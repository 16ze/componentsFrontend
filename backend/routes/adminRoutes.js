const express = require("express");
const {
  login,
  register,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  getDashboardStats,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");
const { validateUserData } = require("../middleware/validationMiddleware");

const router = express.Router();

/**
 * @route   POST /api/admin/login
 * @desc    Authentifier un administrateur
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   POST /api/admin/register
 * @desc    Enregistrer un nouvel administrateur
 * @access  Private/Admin
 */
router.post("/register", protect, admin, validateUserData, register);

/**
 * @route   GET /api/admin/profile
 * @desc    Récupérer le profil administrateur
 * @access  Private
 */
router.get("/profile", protect, getProfile);

/**
 * @route   PUT /api/admin/profile
 * @desc    Mettre à jour le profil administrateur
 * @access  Private
 */
router.put("/profile", protect, validateUserData, updateProfile);

/**
 * @route   POST /api/admin/forgot-password
 * @desc    Demander un lien de réinitialisation de mot de passe
 * @access  Public
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route   POST /api/admin/reset-password/:token
 * @desc    Réinitialiser le mot de passe avec un token
 * @access  Public
 */
router.post("/reset-password/:token", resetPassword);

/**
 * @route   GET /api/admin/dashboard-stats
 * @desc    Récupérer les statistiques pour le tableau de bord
 * @access  Private/Admin
 */
router.get("/dashboard-stats", protect, admin, getDashboardStats);

module.exports = router;
