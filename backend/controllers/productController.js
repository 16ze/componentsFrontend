/**
 * Contrôleur de produits pour la gestion complète des produits e-commerce
 * @module controllers/productController
 */

const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const { createError } = require("../utils/errorHandler");
const { isValidObjectId } = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { Parser } = require("json2csv");
const logger = require("../utils/logger");

/**
 * Crée un nouveau produit
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Produit créé
 */
exports.createProduct = async (req, res, next) => {
  try {
    // Validation des données d'entrée
    const { name, price, category, description } = req.body;

    if (!name || !price || !category || !description) {
      return next(
        createError(400, "Veuillez fournir toutes les informations requises")
      );
    }

    // Vérification de l'existence de la catégorie
    if (!isValidObjectId(category)) {
      return next(createError(400, "ID de catégorie invalide"));
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(createError(404, "Catégorie non trouvée"));
    }

    // Création du produit
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();

    // Mise à jour du nombre de produits dans la catégorie
    await Category.findByIdAndUpdate(category, { $inc: { count: 1 } });

    res.status(201).json({
      success: true,
      data: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère tous les produits avec filtrage, tri et pagination
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste de produits paginée
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      category,
      minPrice,
      maxPrice,
      inStock,
      search,
      featured,
    } = req.query;

    // Construction du filtre
    const filter = {};

    if (category) {
      // Recherche de la catégorie et de ses sous-catégories
      let categoryIds = [category];

      if (isValidObjectId(category)) {
        const mainCategory = await Category.findById(category);
        if (mainCategory) {
          // Recherche des sous-catégories
          const subCategories = await Category.find({ parentId: category });
          if (subCategories.length > 0) {
            categoryIds = [
              ...categoryIds,
              ...subCategories.map((cat) => cat._id),
            ];
          }
        }
      }

      filter.category = { $in: categoryIds };
    }

    // Filtre de prix
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Filtre de stock
    if (inStock === "true") {
      filter.countInStock = { $gt: 0 };
    }

    // Produits mis en avant
    if (featured === "true") {
      filter.isFeatured = true;
    }

    // Recherche textuelle
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    // Options de tri
    const sortOptions = {};
    sortOptions[sort] = order === "desc" ? -1 : 1;

    // Calcul de la pagination
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Exécution de la requête
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    // Comptage total pour la pagination
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      meta: {
        pagination: {
          total,
          pageSize: limitNumber,
          currentPage: pageNumber,
          totalPages: Math.ceil(total / limitNumber),
          hasNextPage: pageNumber < Math.ceil(total / limitNumber),
          hasPrevPage: pageNumber > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un produit par son ID
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Produit trouvé
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de produit invalide"));
    }

    const product = await Product.findById(id).populate(
      "category",
      "name slug parentId"
    );

    if (!product) {
      return next(createError(404, "Produit non trouvé"));
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un produit par son slug
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Produit trouvé
 */
exports.getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug }).populate(
      "category",
      "name slug parentId"
    );

    if (!product) {
      return next(createError(404, "Produit non trouvé"));
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mise à jour d'un produit
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Produit mis à jour
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de produit invalide"));
    }

    // Vérification de l'existence du produit
    const productExists = await Product.findById(id);
    if (!productExists) {
      return next(createError(404, "Produit non trouvé"));
    }

    // Si la catégorie change, mettre à jour les compteurs
    if (
      req.body.category &&
      req.body.category !== productExists.category.toString()
    ) {
      if (!isValidObjectId(req.body.category)) {
        return next(createError(400, "ID de catégorie invalide"));
      }

      const newCategory = await Category.findById(req.body.category);
      if (!newCategory) {
        return next(createError(404, "Nouvelle catégorie non trouvée"));
      }

      // Décrémente l'ancienne catégorie et incrémente la nouvelle
      await Category.findByIdAndUpdate(productExists.category, {
        $inc: { count: -1 },
      });
      await Category.findByIdAndUpdate(req.body.category, {
        $inc: { count: 1 },
      });
    }

    // Mise à jour du produit
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate("category", "name slug");

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suppression d'un produit
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Message de confirmation
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de produit invalide"));
    }

    // Vérification de l'existence du produit
    const product = await Product.findById(id);
    if (!product) {
      return next(createError(404, "Produit non trouvé"));
    }

    // Mise à jour du compteur de la catégorie
    await Category.findByIdAndUpdate(product.category, { $inc: { count: -1 } });

    // Suppression du produit
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Produit supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gestion des variantes de produits
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Produit avec variantes mises à jour
 */
exports.updateProductVariants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { variants } = req.body;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de produit invalide"));
    }

    if (!variants || !Array.isArray(variants)) {
      return next(
        createError(400, "Les variantes de produit doivent être un tableau")
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return next(createError(404, "Produit non trouvé"));
    }

    // Mise à jour des variantes
    product.variants = variants;

    // Mise à jour du stock total
    let totalStock = 0;
    variants.forEach((variant) => {
      totalStock += variant.stock || 0;
    });
    product.countInStock = totalStock;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupération des produits associés
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste de produits associés
 */
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de produit invalide"));
    }

    const product = await Product.findById(id);
    if (!product) {
      return next(createError(404, "Produit non trouvé"));
    }

    // Recherche des produits de la même catégorie, excluant le produit actuel
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
    })
      .populate("category", "name slug")
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupération des produits recommandés
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste de produits recommandés
 */
exports.getRecommendedProducts = async (req, res, next) => {
  try {
    // Recommandations basées sur les produits populaires, les mieux notés, ou en promotion
    const { limit = 6, strategy = "popular" } = req.query;

    let sortOptions = {};

    switch (strategy) {
      case "rated":
        sortOptions = { rating: -1 };
        break;
      case "discount":
        sortOptions = { priceDiscount: -1 };
        break;
      case "popular":
      default:
        sortOptions = { numReviews: -1 };
        break;
    }

    const recommendedProducts = await Product.find({
      countInStock: { $gt: 0 },
    })
      .populate("category", "name slug")
      .sort(sortOptions)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: recommendedProducts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gestion des alertes de stock bas
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste de produits avec stock bas
 */
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const { threshold = 5 } = req.query;

    const lowStockProducts = await Product.find({
      countInStock: { $gt: 0, $lte: parseInt(threshold, 10) },
    })
      .populate("category", "name slug")
      .sort({ countInStock: 1 });

    res.status(200).json({
      success: true,
      data: lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mise à jour du stock d'un produit
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Produit avec stock mis à jour
 */
exports.updateProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de produit invalide"));
    }

    if (isNaN(quantity)) {
      return next(createError(400, "La quantité doit être un nombre"));
    }

    const product = await Product.findById(id);
    if (!product) {
      return next(createError(404, "Produit non trouvé"));
    }

    // Mise à jour du stock
    product.countInStock = parseInt(quantity, 10);
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Import de produits en masse depuis un fichier CSV
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Message de confirmation avec le nombre de produits importés
 */
exports.importProductsFromCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, "Aucun fichier CSV fourni"));
    }

    const results = [];
    const filePath = path.resolve(req.file.path);

    // Lecture et parsing du fichier CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          // Validation et import des produits
          let importedCount = 0;
          let failedCount = 0;

          const importPromises = results.map(async (item) => {
            try {
              // Validation basique
              if (!item.name || !item.price) {
                failedCount++;
                return;
              }

              // Recherche ou création de la catégorie
              let categoryId = null;
              if (item.category) {
                const category = await Category.findOne({
                  name: item.category,
                });
                if (category) {
                  categoryId = category._id;
                } else {
                  // Créer la catégorie si elle n'existe pas
                  const newCategory = new Category({
                    name: item.category,
                    slug: item.category.toLowerCase().replace(/\s+/g, "-"),
                  });
                  const savedCategory = await newCategory.save();
                  categoryId = savedCategory._id;
                }
              }

              // Création du produit
              const product = new Product({
                name: item.name,
                slug: item.slug || item.name.toLowerCase().replace(/\s+/g, "-"),
                description: item.description || "",
                price: parseFloat(item.price),
                priceDiscount: item.priceDiscount
                  ? parseFloat(item.priceDiscount)
                  : undefined,
                image: item.image || "",
                brand: item.brand || "",
                category: categoryId,
                countInStock: parseInt(item.countInStock, 10) || 0,
                isFeatured: item.isFeatured === "true",
                sku: item.sku || `SKU-${Date.now()}`,
              });

              await product.save();
              importedCount++;
            } catch (error) {
              logger.error(
                `Erreur lors de l'import du produit: ${error.message}`
              );
              failedCount++;
            }
          });

          await Promise.all(importPromises);

          // Suppression du fichier temporaire
          fs.unlinkSync(filePath);

          res.status(200).json({
            success: true,
            message: `Import terminé: ${importedCount} produits importés, ${failedCount} échecs.`,
          });
        } catch (error) {
          // Suppression du fichier en cas d'erreur
          fs.unlinkSync(filePath);
          next(error);
        }
      })
      .on("error", (error) => {
        // Suppression du fichier en cas d'erreur
        fs.unlinkSync(filePath);
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

/**
 * Export de produits au format CSV
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 */
exports.exportProductsToCSV = async (req, res, next) => {
  try {
    const { category } = req.query;

    // Filtre optionnel par catégorie
    const filter = {};
    if (category && isValidObjectId(category)) {
      filter.category = category;
    }

    // Récupération des produits
    const products = await Product.find(filter).populate("category", "name");

    // Transformation des données pour l'export
    const productsForExport = products.map((product) => ({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      priceDiscount: product.priceDiscount || "",
      image: product.image || "",
      brand: product.brand || "",
      category: product.category ? product.category.name : "",
      countInStock: product.countInStock,
      isFeatured: product.isFeatured ? "true" : "false",
      sku: product.sku || "",
      rating: product.rating || "",
    }));

    // Configuration des champs CSV
    const fields = [
      "name",
      "slug",
      "description",
      "price",
      "priceDiscount",
      "image",
      "brand",
      "category",
      "countInStock",
      "isFeatured",
      "sku",
      "rating",
    ];

    // Génération du CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(productsForExport);

    // Configuration de la réponse
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products.csv");

    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * Export de produits au format JSON
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 */
exports.exportProductsToJSON = async (req, res, next) => {
  try {
    const { category } = req.query;

    // Filtre optionnel par catégorie
    const filter = {};
    if (category && isValidObjectId(category)) {
      filter.category = category;
    }

    // Récupération des produits
    const products = await Product.find(filter).populate("category", "name");

    // Transformation des données pour l'export
    const productsForExport = products.map((product) => ({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      priceDiscount: product.priceDiscount,
      image: product.image,
      brand: product.brand,
      category: product.category ? product.category.name : "",
      countInStock: product.countInStock,
      isFeatured: product.isFeatured,
      sku: product.sku,
      rating: product.rating,
    }));

    // Configuration de la réponse
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=products.json");

    res.status(200).json(productsForExport);
  } catch (error) {
    next(error);
  }
};
