const express = require("express");
const {
  submitContactForm,
  getContactSubmissions,
  getContactSubmissionById,
  updateContactSubmission,
  deleteContactSubmission,
} = require("../controllers/contactController");
const { protect, admin } = require("../middleware/authMiddleware");
const { validateContactData } = require("../middleware/validationMiddleware");

const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Soumettre un formulaire de contact
 * @access  Public
 */
router.post("/", validateContactData, submitContactForm);

/**
 * @route   GET /api/contact
 * @desc    Récupérer toutes les soumissions de contact
 * @access  Private/Admin
 */
router.get("/", protect, admin, getContactSubmissions);

/**
 * @route   GET /api/contact/:id
 * @desc    Récupérer une soumission de contact par son ID
 * @access  Private/Admin
 */
router.get("/:id", protect, admin, getContactSubmissionById);

/**
 * @route   PUT /api/contact/:id
 * @desc    Mettre à jour le statut d'une soumission de contact
 * @access  Private/Admin
 */
router.put("/:id", protect, admin, updateContactSubmission);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Supprimer une soumission de contact
 * @access  Private/Admin
 */
router.delete("/:id", protect, admin, deleteContactSubmission);

module.exports = router;
