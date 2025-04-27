/**
 * Contrôleur de commandes pour la gestion complète des commandes e-commerce
 * @module controllers/orderController
 */

const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const { createError } = require("../utils/errorHandler");
const { isValidObjectId } = require("mongoose");
const logger = require("../utils/logger");
const pdfService = require("../services/pdfService");
const emailService = require("../services/emailService");

/**
 * Crée une nouvelle commande à partir d'un panier
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Commande créée
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { cartId, paymentMethod, shippingAddress, billingAddress } = req.body;
    const userId = req.user.id;

    if (!cartId || !paymentMethod) {
      return next(
        createError(400, "ID de panier et méthode de paiement requis")
      );
    }

    // Récupération du panier
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return next(createError(404, "Panier non trouvé"));
    }

    if (cart.items.length === 0) {
      return next(createError(400, "Le panier est vide"));
    }

    // Vérification de la disponibilité des produits
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return next(createError(404, `Produit ${item.name} non trouvé`));
      }

      if (product.countInStock < item.quantity) {
        return next(createError(400, `Stock insuffisant pour ${product.name}`));
      }
    }

    // Création de la commande
    const order = new Order({
      userId,
      items: cart.items,
      shippingAddress: shippingAddress || cart.shippingAddress,
      billingAddress: billingAddress || shippingAddress || cart.shippingAddress,
      paymentMethod,
      subtotal: cart.subtotal,
      tax: cart.tax || 0,
      shipping: cart.shipping || 0,
      discount: cart.discount || 0,
      total: cart.total,
      status: "pending",
      paymentStatus: "pending",
      couponCode: cart.couponCode,
    });

    const savedOrder = await order.save();

    // Mise à jour des stocks
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { countInStock: -item.quantity },
      });
    }

    // Vidage du panier
    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shipping = 0;
    cart.discount = 0;
    cart.total = 0;
    cart.couponCode = null;

    await cart.save();

    // Envoi de confirmation par email
    const user = await User.findById(userId);
    if (user && user.email) {
      await emailService.sendOrderConfirmation(user.email, savedOrder);
    }

    res.status(201).json({
      success: true,
      data: savedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère une commande par son ID
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Commande trouvée
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de commande invalide"));
    }

    const order = await Order.findById(id);

    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Vérification que l'utilisateur a accès à cette commande
    if (!isAdmin && order.userId.toString() !== userId) {
      return next(createError(403, "Accès non autorisé à cette commande"));
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère toutes les commandes d'un utilisateur
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste des commandes de l'utilisateur
 */
exports.getUserOrders = async (req, res, next) => {
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
 * Récupère toutes les commandes (admin)
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste de toutes les commandes
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      sort = "createdAt",
      order = "desc",
      startDate,
      endDate,
      minTotal,
      maxTotal,
      search,
    } = req.query;

    // Construction du filtre
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Filtre par plage de dates
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateObj;
      }
    }

    // Filtre par montant total
    if (minTotal || maxTotal) {
      filter.total = {};
      if (minTotal) filter.total.$gte = Number(minTotal);
      if (maxTotal) filter.total.$lte = Number(maxTotal);
    }

    // Recherche textuelle
    if (search) {
      filter.$or = [
        { "shippingAddress.firstName": { $regex: search, $options: "i" } },
        { "shippingAddress.lastName": { $regex: search, $options: "i" } },
        { "shippingAddress.email": { $regex: search, $options: "i" } },
      ];

      // Si la recherche est un ID valide, chercher aussi par ID
      if (isValidObjectId(search)) {
        filter.$or.push({ _id: search });
      }
    }

    // Options de tri
    const sortOptions = {};
    sortOptions[sort] = order === "desc" ? -1 : 1;

    // Pagination
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Exécution de la requête
    const orders = await Order.find(filter)
      .populate("userId", "email firstName lastName")
      .sort(sortOptions)
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
 * Met à jour le statut d'une commande
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Commande mise à jour
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de commande invalide"));
    }

    if (!status) {
      return next(createError(400, "Statut requis"));
    }

    // Vérification des valeurs de statut valides
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
      "refunded",
    ];
    if (!validStatuses.includes(status)) {
      return next(createError(400, "Statut invalide"));
    }

    const order = await Order.findById(id);
    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Actions spécifiques selon le changement de statut
    switch (status) {
      case "cancelled":
        // Remise en stock des produits
        if (
          order.status !== "cancelled" &&
          order.status !== "returned" &&
          order.status !== "refunded"
        ) {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { countInStock: item.quantity },
            });
          }
        }
        break;

      case "refunded":
        // Mise à jour du statut de paiement
        order.paymentStatus = "refunded";
        break;

      case "delivered":
        // Mise à jour du statut de paiement si applicable
        if (order.paymentMethod === "cashOnDelivery") {
          order.paymentStatus = "paid";
        }
        break;
    }

    // Mise à jour du statut
    order.status = status;

    // Ajout des notes si fournies
    if (notes) {
      order.notes = notes;
    }

    // Enregistrement des modifications
    const updatedOrder = await order.save();

    // Notification par email du changement de statut
    try {
      const user = await User.findById(order.userId);
      if (user && user.email) {
        await emailService.sendOrderStatusUpdate(user.email, updatedOrder);
      }
    } catch (emailError) {
      logger.error(
        `Erreur lors de l'envoi de l'email de mise à jour: ${emailError.message}`
      );
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour le statut de paiement d'une commande
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Commande mise à jour
 */
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentDetails } = req.body;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de commande invalide"));
    }

    if (!paymentStatus) {
      return next(createError(400, "Statut de paiement requis"));
    }

    // Vérification des valeurs de statut valides
    const validPaymentStatuses = [
      "pending",
      "authorized",
      "paid",
      "failed",
      "refunded",
      "partially_refunded",
    ];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return next(createError(400, "Statut de paiement invalide"));
    }

    const order = await Order.findById(id);
    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Mise à jour du statut de paiement
    order.paymentStatus = paymentStatus;

    // Mise à jour des détails de paiement si fournis
    if (paymentDetails) {
      order.paymentDetails = {
        ...order.paymentDetails,
        ...paymentDetails,
        timestamp: new Date(),
      };
    }

    // Actions spécifiques selon le changement de statut
    if (paymentStatus === "paid" && order.status === "pending") {
      order.status = "processing";
    }

    if (paymentStatus === "refunded" && order.status !== "refunded") {
      order.status = "refunded";

      // Remise en stock des produits
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { countInStock: item.quantity },
        });
      }
    }

    // Enregistrement des modifications
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Génère une facture PDF pour une commande
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 */
exports.generateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de commande invalide"));
    }

    const order = await Order.findById(id).populate(
      "userId",
      "email firstName lastName"
    );

    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Vérification que l'utilisateur a accès à cette commande
    if (!isAdmin && order.userId._id.toString() !== userId) {
      return next(createError(403, "Accès non autorisé à cette commande"));
    }

    // Génération du PDF
    const pdfBuffer = await pdfService.generateInvoice(order);

    // Configuration de la réponse
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${id}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère l'historique d'une commande
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Historique de la commande
 */
exports.getOrderHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de commande invalide"));
    }

    const order = await Order.findById(id);

    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Vérification que l'utilisateur a accès à cette commande
    if (!isAdmin && order.userId.toString() !== userId) {
      return next(createError(403, "Accès non autorisé à cette commande"));
    }

    // L'historique peut être stocké dans un champ dédié ou généré à partir des logs
    const history = order.statusHistory || [];

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calcule des statistiques sur les ventes
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Statistiques de ventes
 */
exports.getSalesStats = async (req, res, next) => {
  try {
    const { period = "month", startDate, endDate } = req.query;

    // Définition de la période
    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      // Période personnalisée
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      // Périodes prédéfinies
      switch (period) {
        case "day":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            },
          };
          break;
        case "week":
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          dateFilter = {
            createdAt: {
              $gte: lastWeek,
            },
          };
          break;
        case "month":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            },
          };
          break;
        case "year":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), 0, 1),
            },
          };
          break;
      }
    }

    // Filtre pour les commandes payées uniquement
    const filter = {
      ...dateFilter,
      paymentStatus: "paid",
    };

    // Calcul des statistiques
    const totalOrders = await Order.countDocuments(filter);

    const salesData = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          cost: { $sum: "$subtotal" },
          tax: { $sum: "$tax" },
          shipping: { $sum: "$shipping" },
          discount: { $sum: "$discount" },
          averageOrderValue: { $avg: "$total" },
        },
      },
    ]);

    // Top produits vendus
    const topProducts = await Order.aggregate([
      { $match: filter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    // Répartition par statut
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Formatage des résultats
    const stats = {
      totalOrders,
      sales:
        salesData.length > 0
          ? {
              revenue: salesData[0].revenue,
              cost: salesData[0].cost,
              tax: salesData[0].tax,
              shipping: salesData[0].shipping,
              discount: salesData[0].discount,
              profit: salesData[0].revenue - salesData[0].cost,
              averageOrderValue: salesData[0].averageOrderValue,
            }
          : {
              revenue: 0,
              cost: 0,
              tax: 0,
              shipping: 0,
              discount: 0,
              profit: 0,
              averageOrderValue: 0,
            },
      topProducts,
      ordersByStatus: ordersByStatus.reduce((result, item) => {
        result[item._id] = item.count;
        return result;
      }, {}),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
