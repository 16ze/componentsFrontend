const express = require("express");
const {
  getImages,
  getImageById,
  uploadImage,
  updateImage,
  deleteImage,
} = require("../controllers/galleryController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

/**
 * @route   GET /api/gallery
 * @desc    Récupérer toutes les images
 * @access  Public
 */
router.get("/", getImages);

/**
 * @route   GET /api/gallery/:id
 * @desc    Récupérer une image par son ID
 * @access  Public
 */
router.get("/:id", getImageById);

/**
 * @route   POST /api/gallery
 * @desc    Uploader une nouvelle image
 * @access  Private/Admin
 */
router.post("/", protect, admin, upload.single("image"), uploadImage);

/**
 * @route   PUT /api/gallery/:id
 * @desc    Mettre à jour les informations d'une image
 * @access  Private/Admin
 */
router.put("/:id", protect, admin, updateImage);

/**
 * @route   DELETE /api/gallery/:id
 * @desc    Supprimer une image
 * @access  Private/Admin
 */
router.delete("/:id", protect, admin, deleteImage);

module.exports = router;
