const path = require("path");
const fs = require("fs").promises;
const GalleryImage = require("../models/galleryModel");
const asyncHandler = require("../middleware/asyncHandler");
const logger = require("../utils/logger");

/**
 * @desc    Récupérer toutes les images
 * @route   GET /api/gallery
 * @access  Public
 */
const getImages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;
  const category = req.query.category;

  let query = {};

  // Filtrer par catégorie si spécifiée
  if (category) {
    query.category = category;
  }

  // Récupérer les images
  const images = await GalleryImage.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Compter le total des images
  const count = await GalleryImage.countDocuments(query);

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: images,
  });
});

/**
 * @desc    Récupérer une image par son ID
 * @route   GET /api/gallery/:id
 * @access  Public
 */
const getImageById = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findById(req.params.id);

  if (!image) {
    res.status(404);
    throw new Error("Image non trouvée");
  }

  res.status(200).json({
    success: true,
    data: image,
  });
});

/**
 * @desc    Uploader une nouvelle image
 * @route   POST /api/gallery
 * @access  Private/Admin
 */
const uploadImage = asyncHandler(async (req, res) => {
  // Vérifier si un fichier a été uploadé
  if (!req.file) {
    res.status(400);
    throw new Error("Veuillez fournir une image");
  }

  const { title, description, category, alt } = req.body;

  // Valider les données
  if (!title || !category) {
    // Supprimer le fichier uploadé si les données sont invalides
    await fs.unlink(req.file.path);

    res.status(400);
    throw new Error("Veuillez fournir un titre et une catégorie");
  }

  // Créer l'image dans la base de données
  const image = await GalleryImage.create({
    title,
    description: description || "",
    category,
    alt: alt || title,
    imageUrl: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });

  res.status(201).json({
    success: true,
    data: image,
  });
});

/**
 * @desc    Mettre à jour les informations d'une image
 * @route   PUT /api/gallery/:id
 * @access  Private/Admin
 */
const updateImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findById(req.params.id);

  if (!image) {
    res.status(404);
    throw new Error("Image non trouvée");
  }

  // Mettre à jour l'image
  const updatedImage = await GalleryImage.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedImage,
  });
});

/**
 * @desc    Supprimer une image
 * @route   DELETE /api/gallery/:id
 * @access  Private/Admin
 */
const deleteImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findById(req.params.id);

  if (!image) {
    res.status(404);
    throw new Error("Image non trouvée");
  }

  // Supprimer le fichier physique
  try {
    const filePath = path.join(__dirname, "..", image.imageUrl);
    await fs.unlink(filePath);
    logger.info(`Fichier supprimé: ${filePath}`);
  } catch (error) {
    logger.error(`Erreur lors de la suppression du fichier: ${error.message}`);
    // Ne pas échouer si le fichier n'existe pas
  }

  // Supprimer l'entrée dans la base de données
  await image.remove();

  res.status(200).json({
    success: true,
    message: "Image supprimée",
  });
});

module.exports = {
  getImages,
  getImageById,
  uploadImage,
  updateImage,
  deleteImage,
};
