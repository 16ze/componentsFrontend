/**
 * Contrôleur de panier pour la gestion des paniers e-commerce
 * @module controllers/cartController
 */

const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const { createError } = require("../utils/errorHandler");
const { isValidObjectId } = require("mongoose");
const logger = require("../utils/logger");
const taxService = require("../services/taxService");
const shippingService = require("../services/shippingService");

/**
 * Récupère le panier d'un utilisateur
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Panier de l'utilisateur
 */
exports.getCart = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const userId = req.user ? req.user.id : null;

    let cart;

    if (cartId) {
      // Panier spécifique par ID (pour les clients non connectés)
      cart = await Cart.findById(cartId);
    } else if (userId) {
      // Panier de l'utilisateur connecté
      cart = await Cart.findOne({ userId });
    } else {
      return next(
        createError(400, "ID de panier ou utilisateur connecté requis")
      );
    }

    if (!cart) {
      // Création d'un nouveau panier si non existant
      if (userId) {
        cart = new Cart({
          userId,
          items: [],
          subtotal: 0,
          total: 0,
        });
        await cart.save();
      } else {
        return next(createError(404, "Panier non trouvé"));
      }
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajoute un article au panier
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Panier mis à jour
 */
exports.addToCart = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const { productId, quantity = 1, attributes = {} } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!productId) {
      return next(createError(400, "ID de produit requis"));
    }

    if (!isValidObjectId(productId)) {
      return next(createError(400, "ID de produit invalide"));
    }

    // Vérification de l'existence et disponibilité du produit
    const product = await Product.findById(productId);
    if (!product) {
      return next(createError(404, "Produit non trouvé"));
    }

    if (product.countInStock < quantity) {
      return next(
        createError(400, "Quantité demandée non disponible en stock")
      );
    }

    // Récupération ou création du panier
    let cart;

    if (cartId) {
      cart = await Cart.findById(cartId);
      if (!cart) {
        return next(createError(404, "Panier non trouvé"));
      }
    } else if (userId) {
      cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
          subtotal: 0,
          total: 0,
        });
      }
    } else {
      // Création d'un nouveau panier pour client non connecté
      cart = new Cart({
        items: [],
        subtotal: 0,
        total: 0,
      });
    }

    // Vérification si le produit existe déjà dans le panier
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        JSON.stringify(item.attributes) === JSON.stringify(attributes)
    );

    const price = product.priceDiscount || product.price;

    if (itemIndex > -1) {
      // Mise à jour de la quantité si le produit existe déjà
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Ajout d'un nouvel article
      cart.items.push({
        productId,
        name: product.name,
        price,
        quantity,
        image: product.image,
        attributes,
        sku: product.sku,
      });
    }

    // Recalcul des totaux
    await recalculateCart(cart);

    const savedCart = await cart.save();

    res.status(200).json({
      success: true,
      data: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour la quantité d'un article du panier
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Panier mis à jour
 */
exports.updateCartItem = async (req, res, next) => {
  try {
    const { cartId, itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!quantity || quantity < 1) {
      return next(createError(400, "Quantité invalide"));
    }

    // Récupération du panier
    let cart;

    if (cartId) {
      cart = await Cart.findById(cartId);
    } else if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      return next(
        createError(400, "ID de panier ou utilisateur connecté requis")
      );
    }

    if (!cart) {
      return next(createError(404, "Panier non trouvé"));
    }

    // Recherche de l'article dans le panier
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return next(createError(404, "Article non trouvé dans le panier"));
    }

    // Vérification du stock disponible
    const product = await Product.findById(cart.items[itemIndex].productId);
    if (!product) {
      return next(createError(404, "Produit non trouvé"));
    }

    if (product.countInStock < quantity) {
      return next(
        createError(400, "Quantité demandée non disponible en stock")
      );
    }

    // Mise à jour de la quantité
    cart.items[itemIndex].quantity = quantity;

    // Recalcul des totaux
    await recalculateCart(cart);

    const savedCart = await cart.save();

    res.status(200).json({
      success: true,
      data: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un article du panier
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Panier mis à jour
 */
exports.removeCartItem = async (req, res, next) => {
  try {
    const { cartId, itemId } = req.params;
    const userId = req.user ? req.user.id : null;

    // Récupération du panier
    let cart;

    if (cartId) {
      cart = await Cart.findById(cartId);
    } else if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      return next(
        createError(400, "ID de panier ou utilisateur connecté requis")
      );
    }

    if (!cart) {
      return next(createError(404, "Panier non trouvé"));
    }

    // Suppression de l'article
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    // Recalcul des totaux
    await recalculateCart(cart);

    const savedCart = await cart.save();

    res.status(200).json({
      success: true,
      data: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vide le panier
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Panier vide
 */
exports.clearCart = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const userId = req.user ? req.user.id : null;

    // Récupération du panier
    let cart;

    if (cartId) {
      cart = await Cart.findById(cartId);
    } else if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      return next(
        createError(400, "ID de panier ou utilisateur connecté requis")
      );
    }

    if (!cart) {
      return next(createError(404, "Panier non trouvé"));
    }

    // Vidage du panier
    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shipping = 0;
    cart.discount = 0;
    cart.total = 0;
    cart.couponCode = null;

    const savedCart = await cart.save();

    res.status(200).json({
      success: true,
      data: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Applique un code promo au panier
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Panier mis à jour avec réduction
 */
exports.applyCoupon = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const { couponCode } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!couponCode) {
      return next(createError(400, "Code promo requis"));
    }

    // Récupération du panier
    let cart;

    if (cartId) {
      cart = await Cart.findById(cartId);
    } else if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      return next(
        createError(400, "ID de panier ou utilisateur connecté requis")
      );
    }

    if (!cart) {
      return next(createError(404, "Panier non trouvé"));
    }

    // Vérification de la validité du coupon
    const coupon = await Coupon.findOne({
      code: couponCode,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!coupon) {
      return next(createError(404, "Code promo invalide ou expiré"));
    }

    // Vérification des conditions d'utilisation du coupon
    if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
      return next(
        createError(400, `Montant minimum requis: ${coupon.minOrderAmount}`)
      );
    }

    if (coupon.maxUsesPerUser && userId) {
      // Vérification du nombre d'utilisations par utilisateur
      const usedCount = await Order.countDocuments({
        userId,
        couponCode: couponCode,
      });

      if (usedCount >= coupon.maxUsesPerUser) {
        return next(
          createError(
            400,
            "Nombre maximum d'utilisations atteint pour ce coupon"
          )
        );
      }
    }

    // Mise à jour du panier avec le coupon
    cart.couponCode = couponCode;

    // Recalcul des totaux avec la réduction
    await recalculateCart(cart);

    const savedCart = await cart.save();

    res.status(200).json({
      success: true,
      data: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calcule les taxes en fonction de l'adresse de livraison
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Panier mis à jour avec taxes
 */
exports.calculateTaxes = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const { shippingAddress } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!shippingAddress) {
      return next(createError(400, "Adresse de livraison requise"));
    }

    // Récupération du panier
    let cart;

    if (cartId) {
      cart = await Cart.findById(cartId);
    } else if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      return next(
        createError(400, "ID de panier ou utilisateur connecté requis")
      );
    }

    if (!cart) {
      return next(createError(404, "Panier non trouvé"));
    }

    // Mise à jour de l'adresse de livraison
    cart.shippingAddress = shippingAddress;

    // Calcul des taxes via le service dédié
    const taxRate = await taxService.getTaxRate(
      shippingAddress.country,
      shippingAddress.state,
      shippingAddress.postalCode
    );

    // Mise à jour du montant des taxes
    cart.tax = (cart.subtotal * taxRate).toFixed(2);

    // Recalcul du total
    cart.total = (
      parseFloat(cart.subtotal) +
      parseFloat(cart.tax) +
      parseFloat(cart.shipping || 0) -
      parseFloat(cart.discount || 0)
    ).toFixed(2);

    const savedCart = await cart.save();

    res.status(200).json({
      success: true,
      data: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Estime les frais de livraison en fonction de l'adresse et des articles
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Options de livraison disponibles
 */
exports.estimateShipping = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const { shippingAddress } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!shippingAddress) {
      return next(createError(400, "Adresse de livraison requise"));
    }

    // Récupération du panier
    let cart;

    if (cartId) {
      cart = await Cart.findById(cartId);
    } else if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      return next(
        createError(400, "ID de panier ou utilisateur connecté requis")
      );
    }

    if (!cart) {
      return next(createError(404, "Panier non trouvé"));
    }

    // Récupération des options de livraison disponibles
    const shippingOptions = await shippingService.getShippingOptions(
      shippingAddress,
      cart.items
    );

    res.status(200).json({
      success: true,
      data: shippingOptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sélectionne une option de livraison pour le panier
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Panier mis à jour avec les frais de livraison
 */
exports.selectShippingOption = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const { shippingOptionId, shippingPrice } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!shippingOptionId || !shippingPrice) {
      return next(createError(400, "Option de livraison et prix requis"));
    }

    // Récupération du panier
    let cart;

    if (cartId) {
      cart = await Cart.findById(cartId);
    } else if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      return next(
        createError(400, "ID de panier ou utilisateur connecté requis")
      );
    }

    if (!cart) {
      return next(createError(404, "Panier non trouvé"));
    }

    // Mise à jour des frais de livraison
    cart.shipping = parseFloat(shippingPrice);
    cart.shippingOptionId = shippingOptionId;

    // Recalcul du total
    cart.total = (
      parseFloat(cart.subtotal) +
      parseFloat(cart.tax || 0) +
      parseFloat(cart.shipping) -
      parseFloat(cart.discount || 0)
    ).toFixed(2);

    const savedCart = await cart.save();

    res.status(200).json({
      success: true,
      data: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fusionne un panier invité avec le panier de l'utilisateur connecté
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Panier fusionné
 */
exports.mergeCart = async (req, res, next) => {
  try {
    const { guestCartId } = req.body;
    const userId = req.user.id; // L'utilisateur doit être connecté

    if (!guestCartId) {
      return next(createError(400, "ID du panier invité requis"));
    }

    // Récupération des deux paniers
    const guestCart = await Cart.findById(guestCartId);
    if (!guestCart) {
      return next(createError(404, "Panier invité non trouvé"));
    }

    let userCart = await Cart.findOne({ userId });

    // Création du panier utilisateur s'il n'existe pas
    if (!userCart) {
      userCart = new Cart({
        userId,
        items: [],
        subtotal: 0,
        total: 0,
      });
    }

    // Fusion des articles
    for (const guestItem of guestCart.items) {
      const existingItemIndex = userCart.items.findIndex(
        (item) =>
          item.productId.toString() === guestItem.productId.toString() &&
          JSON.stringify(item.attributes) ===
            JSON.stringify(guestItem.attributes)
      );

      if (existingItemIndex > -1) {
        // Mise à jour de la quantité si le produit existe déjà
        userCart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // Ajout du nouvel article
        userCart.items.push(guestItem);
      }
    }

    // Vérification des stocks pour tous les articles
    for (const item of userCart.items) {
      const product = await Product.findById(item.productId);
      if (product && product.countInStock < item.quantity) {
        item.quantity = product.countInStock;
      }
    }

    // Conservation des autres informations du panier invité si nécessaire
    if (guestCart.couponCode && !userCart.couponCode) {
      userCart.couponCode = guestCart.couponCode;
    }

    if (guestCart.shippingAddress && !userCart.shippingAddress) {
      userCart.shippingAddress = guestCart.shippingAddress;
    }

    // Recalcul des totaux
    await recalculateCart(userCart);

    const savedUserCart = await userCart.save();

    // Suppression du panier invité
    await Cart.findByIdAndDelete(guestCartId);

    res.status(200).json({
      success: true,
      data: savedUserCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifie la disponibilité des articles du panier avant validation
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Statut de disponibilité des articles
 */
exports.validateCartItems = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const userId = req.user ? req.user.id : null;

    // Récupération du panier
    let cart;

    if (cartId) {
      cart = await Cart.findById(cartId);
    } else if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      return next(
        createError(400, "ID de panier ou utilisateur connecté requis")
      );
    }

    if (!cart) {
      return next(createError(404, "Panier non trouvé"));
    }

    // Vérification de la disponibilité de chaque article
    const validationResults = [];
    let isValid = true;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        validationResults.push({
          itemId: item._id,
          productId: item.productId,
          name: item.name,
          isAvailable: false,
          message: "Produit non trouvé",
        });
        isValid = false;
        continue;
      }

      if (product.countInStock < item.quantity) {
        validationResults.push({
          itemId: item._id,
          productId: item.productId,
          name: item.name,
          isAvailable: false,
          quantityAvailable: product.countInStock,
          quantityRequested: item.quantity,
          message: `Stock insuffisant (${product.countInStock} disponible)`,
        });
        isValid = false;
      } else {
        validationResults.push({
          itemId: item._id,
          productId: item.productId,
          name: item.name,
          isAvailable: true,
        });
      }
    }

    res.status(200).json({
      success: true,
      isValid,
      data: validationResults,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère les paniers abandonnés (pour les administrateurs)
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste des paniers abandonnés
 */
exports.getAbandonedCarts = async (req, res, next) => {
  try {
    const { days = 7, limit = 50 } = req.query;

    // Calcul de la date limite
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    // Recherche des paniers abandonnés
    const abandonedCarts = await Cart.find({
      updatedAt: { $lt: dateLimit },
      items: { $ne: [] }, // Paniers non vides
    })
      .populate("userId", "email firstName lastName")
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: abandonedCarts.length,
      data: abandonedCarts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fonction utilitaire pour recalculer les totaux du panier
 * @async
 * @param {Object} cart - Instance du panier à recalculer
 */
async function recalculateCart(cart) {
  // Calcul du sous-total
  cart.subtotal = cart.items
    .reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0)
    .toFixed(2);

  // Application du coupon si présent
  if (cart.couponCode) {
    const coupon = await Coupon.findOne({ code: cart.couponCode });

    if (coupon && coupon.isActive) {
      // Calcul de la réduction selon le type de coupon
      if (coupon.discountType === "percentage") {
        cart.discount = ((cart.subtotal * coupon.discountValue) / 100).toFixed(
          2
        );
      } else {
        cart.discount = Math.min(coupon.discountValue, cart.subtotal).toFixed(
          2
        );
      }
    } else {
      // Coupon invalide ou expiré
      cart.couponCode = null;
      cart.discount = 0;
    }
  } else {
    cart.discount = 0;
  }

  // Recalcul du total
  cart.total = (
    parseFloat(cart.subtotal) +
    parseFloat(cart.tax || 0) +
    parseFloat(cart.shipping || 0) -
    parseFloat(cart.discount || 0)
  ).toFixed(2);

  return cart;
}
