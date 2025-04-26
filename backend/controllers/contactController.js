const ContactSubmission = require("../models/contactModel");
const asyncHandler = require("../middleware/asyncHandler");
const logger = require("../utils/logger");

/**
 * @desc    Soumettre un formulaire de contact
 * @route   POST /api/contact
 * @access  Public
 */
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Créer la soumission
  const contactSubmission = await ContactSubmission.create({
    name,
    email,
    subject,
    message,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Dans un environnement de production, on enverrait un email à l'administrateur
  // et un email de confirmation à l'utilisateur
  logger.info(`Nouveau message de contact de ${name} (${email}): ${subject}`);

  res.status(201).json({
    success: true,
    message:
      "Votre message a été envoyé avec succès. Nous vous contacterons bientôt.",
    data: {
      id: contactSubmission._id,
      name: contactSubmission.name,
      email: contactSubmission.email,
      subject: contactSubmission.subject,
      createdAt: contactSubmission.createdAt,
    },
  });
});

/**
 * @desc    Récupérer toutes les soumissions de contact
 * @route   GET /api/contact
 * @access  Private/Admin
 */
const getContactSubmissions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const status = req.query.status;

  let query = {};

  // Filtrer par statut si spécifié
  if (status) {
    query.status = status;
  }

  // Récupérer les soumissions
  const contactSubmissions = await ContactSubmission.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Compter le total
  const count = await ContactSubmission.countDocuments(query);

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: contactSubmissions,
  });
});

/**
 * @desc    Récupérer une soumission de contact par son ID
 * @route   GET /api/contact/:id
 * @access  Private/Admin
 */
const getContactSubmissionById = asyncHandler(async (req, res) => {
  const contactSubmission = await ContactSubmission.findById(req.params.id);

  if (!contactSubmission) {
    res.status(404);
    throw new Error("Message non trouvé");
  }

  res.status(200).json({
    success: true,
    data: contactSubmission,
  });
});

/**
 * @desc    Mettre à jour le statut d'une soumission de contact
 * @route   PUT /api/contact/:id
 * @access  Private/Admin
 */
const updateContactSubmission = asyncHandler(async (req, res) => {
  let contactSubmission = await ContactSubmission.findById(req.params.id);

  if (!contactSubmission) {
    res.status(404);
    throw new Error("Message non trouvé");
  }

  // Limiter les champs modifiables (principalement le statut et les notes)
  const allowedUpdates = ["status", "adminNotes"];
  const updates = {};

  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  // Si le statut change à "replied", enregistrer la date de réponse
  if (updates.status === "replied" && contactSubmission.status !== "replied") {
    updates.repliedAt = Date.now();
  }

  // Mettre à jour
  contactSubmission = await ContactSubmission.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: contactSubmission,
  });
});

/**
 * @desc    Supprimer une soumission de contact
 * @route   DELETE /api/contact/:id
 * @access  Private/Admin
 */
const deleteContactSubmission = asyncHandler(async (req, res) => {
  const contactSubmission = await ContactSubmission.findById(req.params.id);

  if (!contactSubmission) {
    res.status(404);
    throw new Error("Message non trouvé");
  }

  await contactSubmission.remove();

  res.status(200).json({
    success: true,
    message: "Message supprimé avec succès",
  });
});

module.exports = {
  submitContactForm,
  getContactSubmissions,
  getContactSubmissionById,
  updateContactSubmission,
  deleteContactSubmission,
};
