/**
 * Contrôleur de clients pour la gestion des utilisateurs e-commerce
 * @module controllers/customerController
 */

const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const WishList = require("../models/wishListModel");
const { createError } = require("../utils/errorHandler");
const { isValidObjectId } = require("mongoose");
const logger = require("../utils/logger");

/**
 * Récupère le profil d'un client
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Profil du client
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour le profil d'un client
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Profil mis à jour
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { email, firstName, lastName, phone, avatar } = req.body;

    // Vérification si l'email est déjà utilisé
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return next(createError(400, "Cet email est déjà utilisé"));
      }
    }

    // Mise à jour du profil
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(email && { email }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(avatar && { avatar }),
      },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajoute une adresse au profil d'un client
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Adresse créée
 */
exports.addAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      addressLine1,
      city,
      postalCode,
      country,
      phone,
      addressLine2,
      state,
      isDefault,
    } = req.body;

    // Validation des champs requis
    if (
      !firstName ||
      !lastName ||
      !addressLine1 ||
      !city ||
      !postalCode ||
      !country ||
      !phone
    ) {
      return next(
        createError(400, "Veuillez fournir toutes les informations requises")
      );
    }

    // Création de l'adresse
    const newAddress = new Address({
      userId,
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault: isDefault || false,
    });

    // Si c'est l'adresse par défaut, mettre à jour les autres
    if (isDefault) {
      await Address.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    const savedAddress = await newAddress.save();

    res.status(201).json({
      success: true,
      data: savedAddress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère les adresses d'un client
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste des adresses
 */
exports.getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const addresses = await Address.find({ userId });

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour une adresse
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Adresse mise à jour
 */
exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isDefault, ...addressData } = req.body;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID d'adresse invalide"));
    }

    // Vérification de l'existence de l'adresse
    const address = await Address.findById(id);
    if (!address) {
      return next(createError(404, "Adresse non trouvée"));
    }

    // Vérification que l'utilisateur est propriétaire de l'adresse
    if (address.userId.toString() !== userId) {
      return next(createError(403, "Accès non autorisé à cette adresse"));
    }

    // Si l'adresse devient celle par défaut, mettre à jour les autres
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    // Mise à jour de l'adresse
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { ...addressData, isDefault: isDefault || false },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime une adresse
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Message de confirmation
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID d'adresse invalide"));
    }

    // Vérification de l'existence de l'adresse
    const address = await Address.findById(id);
    if (!address) {
      return next(createError(404, "Adresse non trouvée"));
    }

    // Vérification que l'utilisateur est propriétaire de l'adresse
    if (address.userId.toString() !== userId) {
      return next(createError(403, "Accès non autorisé à cette adresse"));
    }

    // Suppression de l'adresse
    await Address.findByIdAndDelete(id);

    // Si c'était l'adresse par défaut, définir une autre adresse comme défaut
    if (address.isDefault) {
      const otherAddress = await Address.findOne({ userId });
      if (otherAddress) {
        otherAddress.isDefault = true;
        await otherAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Adresse supprimée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère l'historique des commandes d'un client
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Historique des commandes
 */
exports.getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Construction du filtre
    const filter = { userId };

    if (status) {
      filter.status = status;
    }

    // Pagination
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Exécution de la requête
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    // Comptage total pour la pagination
    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
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
 * Ajoute un produit à la liste de souhaits
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste de souhaits mise à jour
 */
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return next(createError(400, "ID de produit requis"));
    }

    if (!isValidObjectId(productId)) {
      return next(createError(400, "ID de produit invalide"));
    }

    // Vérification de l'existence du produit
    const product = await Product.findById(productId);
    if (!product) {
      return next(createError(404, "Produit non trouvé"));
    }

    // Récupération ou création de la liste de souhaits
    let wishlist = await WishList.findOne({ userId });

    if (!wishlist) {
      wishlist = new WishList({
        userId,
        products: [],
      });
    }

    // Vérification si le produit est déjà dans la liste
    if (wishlist.products.includes(productId)) {
      return res.status(200).json({
        success: true,
        message: "Le produit est déjà dans la liste de souhaits",
        data: wishlist,
      });
    }

    // Ajout du produit à la liste
    wishlist.products.push(productId);

    const savedWishlist = await wishlist.save();

    res.status(200).json({
      success: true,
      data: savedWishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère la liste de souhaits d'un client
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste de souhaits avec détails des produits
 */
exports.getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Récupération de la liste de souhaits avec les détails des produits
    const wishlist = await WishList.findOne({ userId }).populate("products");

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: { userId, products: [] },
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un produit de la liste de souhaits
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste de souhaits mise à jour
 */
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(productId)) {
      return next(createError(400, "ID de produit invalide"));
    }

    // Récupération de la liste de souhaits
    const wishlist = await WishList.findOne({ userId });

    if (!wishlist) {
      return next(createError(404, "Liste de souhaits non trouvée"));
    }

    // Suppression du produit de la liste
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    const updatedWishlist = await wishlist.save();

    res.status(200).json({
      success: true,
      data: updatedWishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gère les points de fidélité
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Points de fidélité mis à jour
 */
exports.manageLoyaltyPoints = async (req, res, next) => {
  try {
    const { action, points, reason } = req.body;
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Vérification des permissions
    const targetUserId = id || userId;
    if (targetUserId !== userId && !isAdmin) {
      return next(
        createError(403, "Non autorisé à gérer les points de cet utilisateur")
      );
    }

    if (!action || !points) {
      return next(createError(400, "Action et points requis"));
    }

    if (!["add", "subtract", "set"].includes(action)) {
      return next(createError(400, "Action invalide"));
    }

    if (points < 0) {
      return next(createError(400, "Le nombre de points doit être positif"));
    }

    // Récupération de l'utilisateur
    const user = await User.findById(targetUserId);
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    let currentPoints = user.loyaltyPoints || 0;
    let newPoints;

    // Application de l'action
    switch (action) {
      case "add":
        newPoints = currentPoints + points;
        break;
      case "subtract":
        newPoints = Math.max(0, currentPoints - points);
        break;
      case "set":
        newPoints = points;
        break;
    }

    // Mise à jour des points
    user.loyaltyPoints = newPoints;

    // Ajout à l'historique des points
    if (!user.loyaltyHistory) {
      user.loyaltyHistory = [];
    }

    user.loyaltyHistory.push({
      action,
      points,
      previousBalance: currentPoints,
      newBalance: newPoints,
      reason:
        reason ||
        `Points ${
          action === "add"
            ? "ajoutés"
            : action === "subtract"
            ? "soustraits"
            : "définis"
        }`,
      date: new Date(),
    });

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        loyaltyPoints: user.loyaltyPoints,
        lastTransaction: user.loyaltyHistory[user.loyaltyHistory.length - 1],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère l'historique des points de fidélité
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Historique des points de fidélité
 */
exports.getLoyaltyHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Vérification des permissions
    const targetUserId = id || userId;
    if (targetUserId !== userId && !isAdmin) {
      return next(
        createError(403, "Non autorisé à voir l'historique de cet utilisateur")
      );
    }

    // Récupération de l'utilisateur
    const user = await User.findById(targetUserId).select(
      "loyaltyPoints loyaltyHistory"
    );
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        loyaltyPoints: user.loyaltyPoints || 0,
        history: user.loyaltyHistory || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gère les consentements RGPD et marketing
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Consentements mis à jour
 */
exports.updateConsents = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { marketingEmail, marketingSMS, dataSharing, cookiePreferences } =
      req.body;

    // Récupération de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    // Initialisation de l'objet de consentements s'il n'existe pas
    if (!user.consents) {
      user.consents = {};
    }

    // Mise à jour des consentements
    if (marketingEmail !== undefined) {
      user.consents.marketingEmail = {
        value: marketingEmail,
        date: new Date(),
      };
    }

    if (marketingSMS !== undefined) {
      user.consents.marketingSMS = {
        value: marketingSMS,
        date: new Date(),
      };
    }

    if (dataSharing !== undefined) {
      user.consents.dataSharing = {
        value: dataSharing,
        date: new Date(),
      };
    }

    if (cookiePreferences) {
      user.consents.cookiePreferences = {
        ...cookiePreferences,
        date: new Date(),
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        consents: user.consents,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère les comportements d'achat d'un client
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Comportements d'achat
 */
exports.getPurchaseBehavior = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Vérification des permissions
    const targetUserId = id || userId;
    if (targetUserId !== userId && !isAdmin) {
      return next(
        createError(
          403,
          "Non autorisé à voir les comportements de cet utilisateur"
        )
      );
    }

    // Récupération des commandes de l'utilisateur
    const orders = await Order.find({
      userId: targetUserId,
      paymentStatus: "paid",
    });

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          userId: targetUserId,
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          categories: [],
          lastPurchaseDate: null,
        },
      });
    }

    // Calcul des métriques de base
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalSpent / totalOrders;
    const lastPurchaseDate = orders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0].createdAt;

    // Analyse des catégories de produits achetés
    const productIds = orders.flatMap((order) =>
      order.items.map((item) => item.productId)
    );

    const products = await Product.find({
      _id: { $in: productIds },
    }).populate("category", "name");

    const categoryMap = {};
    products.forEach((product) => {
      const categoryName = product.category
        ? product.category.name
        : "Non catégorisé";
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
    });

    const categories = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
      percentage: ((count / productIds.length) * 100).toFixed(2),
    }));

    res.status(200).json({
      success: true,
      data: {
        userId: targetUserId,
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastPurchaseDate,
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};
