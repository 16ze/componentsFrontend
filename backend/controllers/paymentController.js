/**
 * Contrôleur de paiements pour la gestion des opérations de paiement e-commerce
 * @module controllers/paymentController
 */

const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const { createError } = require("../utils/errorHandler");
const { isValidObjectId } = require("mongoose");
const logger = require("../utils/logger");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const crypto = require("crypto");

/**
 * Initialise une session de paiement avec Stripe
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Informations de session Stripe
 */
exports.createStripeCheckoutSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!orderId) {
      return next(createError(400, "ID de commande requis"));
    }

    if (!isValidObjectId(orderId)) {
      return next(createError(400, "ID de commande invalide"));
    }

    // Récupération de la commande
    const order = await Order.findById(orderId);
    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Vérification que l'utilisateur est propriétaire de la commande
    if (order.userId.toString() !== userId) {
      return next(createError(403, "Accès non autorisé à cette commande"));
    }

    // Vérification que la commande est en attente de paiement
    if (order.paymentStatus !== "pending") {
      return next(
        createError(400, "Cette commande a déjà été payée ou annulée")
      );
    }

    // Récupération des informations de l'utilisateur
    const user = await User.findById(userId);

    // Création de la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      client_reference_id: orderId,
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            images: [item.image],
            metadata: {
              productId: item.productId.toString(),
              sku: item.sku,
            },
          },
          unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: orderId.toString(),
        userId: userId,
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(order.shipping * 100),
              currency: "eur",
            },
            display_name: "Frais de livraison",
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "LU", "CH", "DE", "ES", "IT"],
      },
      payment_intent_data: {
        metadata: {
          orderId: orderId.toString(),
          userId: userId,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initialise une session de paiement avec PayPal
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Informations de session PayPal
 */
exports.createPaypalOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!orderId) {
      return next(createError(400, "ID de commande requis"));
    }

    // Récupération de la commande
    const order = await Order.findById(orderId);
    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Vérification que l'utilisateur est propriétaire de la commande
    if (order.userId.toString() !== userId) {
      return next(createError(403, "Accès non autorisé à cette commande"));
    }

    // Implémentation de l'API PayPal ici
    // Note: Ceci est un exemple simplifié, l'implémentation réelle dépendra du SDK PayPal utilisé

    // Exemple de réponse
    res.status(200).json({
      success: true,
      data: {
        paypalOrderId: "sample-paypal-order-id",
        approvalUrl:
          "https://www.sandbox.paypal.com/checkoutnow?token=sample-token",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook pour les événements Stripe
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 */
exports.stripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["stripe-signature"];
    let event;

    // Vérification de la signature
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody || req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error(`Erreur de signature webhook: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Traitement des événements
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { orderId } = session.metadata;

        // Mise à jour de la commande
        await handleSuccessfulPayment(
          orderId,
          "stripe",
          session.id,
          session.amount_total / 100, // Conversion des centimes en euros
          "paid"
        );

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata;

        // Enregistrement du paiement réussi
        await handleSuccessfulPayment(
          orderId,
          "stripe",
          paymentIntent.id,
          paymentIntent.amount / 100,
          "paid"
        );

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata;

        // Mise à jour du statut de paiement
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "failed",
            "paymentDetails.status": "failed",
            "paymentDetails.errorMessage":
              paymentIntent.last_payment_error?.message || "Paiement échoué",
          });
        }

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntent = await stripe.paymentIntents.retrieve(
          charge.payment_intent
        );
        const { orderId } = paymentIntent.metadata;

        if (orderId) {
          const refundStatus =
            charge.amount_refunded === charge.amount
              ? "refunded"
              : "partially_refunded";

          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: refundStatus,
            status: refundStatus === "refunded" ? "refunded" : "processing",
            "paymentDetails.refundId": charge.refunds.data[0]?.id,
            "paymentDetails.refundAmount": charge.amount_refunded / 100,
            "paymentDetails.refundReason": "Remboursement via Stripe",
          });
        }

        break;
      }

      default:
        // Événement non géré
        logger.info(`Événement Stripe non géré: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Erreur webhook Stripe: ${error.message}`);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

/**
 * Webhook pour les événements PayPal
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 */
exports.paypalWebhook = async (req, res, next) => {
  try {
    // Vérification de l'authenticité de la requête
    // Note: Ceci est un exemple simplifié, l'implémentation réelle dépendra de l'API PayPal

    const event = req.body;

    // Traitement des événements
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const { orderId } = event.resource.custom_id;

        // Mise à jour de la commande
        await handleSuccessfulPayment(
          orderId,
          "paypal",
          event.resource.id,
          parseFloat(event.resource.amount.value),
          "paid"
        );

        break;
      }

      case "PAYMENT.CAPTURE.REFUNDED": {
        const { orderId } = event.resource.custom_id;

        // Mise à jour de la commande avec statut remboursé
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "refunded",
          status: "refunded",
          "paymentDetails.refundId": event.resource.id,
          "paymentDetails.refundAmount": parseFloat(
            event.resource.amount.value
          ),
          "paymentDetails.refundReason": "Remboursement via PayPal",
        });

        break;
      }

      default:
        // Événement non géré
        logger.info(`Événement PayPal non géré: ${event.event_type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Erreur webhook PayPal: ${error.message}`);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

/**
 * Vérifie le statut d'un paiement
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Statut du paiement
 */
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isValidObjectId(orderId)) {
      return next(createError(400, "ID de commande invalide"));
    }

    // Récupération de la commande
    const order = await Order.findById(orderId);
    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Vérification que l'utilisateur est autorisé
    if (!isAdmin && order.userId.toString() !== userId) {
      return next(createError(403, "Accès non autorisé à cette commande"));
    }

    // Si déjà payé, retourner le statut actuel
    if (order.paymentStatus !== "pending") {
      return res.status(200).json({
        success: true,
        data: {
          orderId: order._id,
          status: order.paymentStatus,
          paymentDetails: order.paymentDetails,
        },
      });
    }

    // Vérification du statut auprès du fournisseur de paiement
    const paymentId = order.paymentDetails?.transactionId;

    if (!paymentId) {
      return res.status(200).json({
        success: true,
        data: {
          orderId: order._id,
          status: "pending",
          message: "Aucun paiement initié",
        },
      });
    }

    // Vérification auprès de Stripe ou PayPal selon le cas
    if (order.paymentMethod === "stripe" && paymentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

      let status;
      switch (paymentIntent.status) {
        case "succeeded":
          status = "paid";
          break;
        case "processing":
          status = "processing";
          break;
        case "requires_payment_method":
          status = "failed";
          break;
        default:
          status = "pending";
      }

      // Mise à jour du statut si nécessaire
      if (status !== order.paymentStatus) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: status,
          "paymentDetails.status": paymentIntent.status,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          orderId: order._id,
          status,
          stripeStatus: paymentIntent.status,
        },
      });
    }

    // PayPal ou autre méthode de paiement
    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        status: order.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enregistre une méthode de paiement pour un utilisateur
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Méthode de paiement enregistrée
 */
exports.savePaymentMethod = async (req, res, next) => {
  try {
    const { type, token, isDefault = false } = req.body;
    const userId = req.user.id;

    if (!type || !token) {
      return next(createError(400, "Type et token requis"));
    }

    // Validation du type de paiement
    const validTypes = ["card", "paypal", "bank_account"];
    if (!validTypes.includes(type)) {
      return next(createError(400, "Type de paiement invalide"));
    }

    let paymentMethodId;
    let paymentDetails = {};

    // Création de la méthode de paiement chez le fournisseur
    if (type === "card") {
      // Création d'un client Stripe si nécessaire
      const user = await User.findById(userId);
      let stripeCustomerId = user.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });

        stripeCustomerId = customer.id;
        await User.findByIdAndUpdate(userId, { stripeCustomerId });
      }

      // Création de la méthode de paiement
      const paymentMethod = await stripe.paymentMethods.attach(token, {
        customer: stripeCustomerId,
      });

      // Si défaut, mettre à jour le client
      if (isDefault) {
        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.id,
          },
        });
      }

      paymentMethodId = paymentMethod.id;
      paymentDetails = {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
      };
    } else if (type === "paypal") {
      // Implémentation PayPal ici
      paymentMethodId = token;
      paymentDetails = {
        email: req.body.email, // Adresse PayPal associée
      };
    } else if (type === "bank_account") {
      // Implémentation compte bancaire ici
      paymentMethodId = token;
      paymentDetails = {
        bankName: req.body.bankName,
        last4: req.body.last4,
      };
    }

    // Enregistrement en base de données
    const paymentMethod = new Payment({
      userId,
      provider: type === "card" ? "stripe" : type,
      type,
      token: paymentMethodId,
      details: paymentDetails,
      isDefault,
    });

    // Si c'est la méthode par défaut, mettre à jour les autres
    if (isDefault) {
      await Payment.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    const savedMethod = await paymentMethod.save();

    res.status(201).json({
      success: true,
      data: savedMethod,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère les méthodes de paiement d'un utilisateur
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Liste des méthodes de paiement
 */
exports.getUserPaymentMethods = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const paymentMethods = await Payment.find({ userId });

    res.status(200).json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime une méthode de paiement
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Message de confirmation
 */
exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return next(createError(400, "ID de méthode de paiement invalide"));
    }

    // Récupération de la méthode de paiement
    const paymentMethod = await Payment.findById(id);
    if (!paymentMethod) {
      return next(createError(404, "Méthode de paiement non trouvée"));
    }

    // Vérification que l'utilisateur est propriétaire
    if (paymentMethod.userId.toString() !== userId) {
      return next(
        createError(403, "Accès non autorisé à cette méthode de paiement")
      );
    }

    // Suppression chez le fournisseur
    if (paymentMethod.provider === "stripe") {
      try {
        await stripe.paymentMethods.detach(paymentMethod.token);
      } catch (stripeError) {
        logger.error(
          `Erreur lors de la suppression dans Stripe: ${stripeError.message}`
        );
      }
    }

    // Suppression en base de données
    await Payment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Méthode de paiement supprimée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initie un remboursement
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {Object} Détails du remboursement
 */
exports.initiateRefund = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;
    const isAdmin = req.user.role === "admin";

    if (!isAdmin) {
      return next(
        createError(
          403,
          "Seuls les administrateurs peuvent initier des remboursements"
        )
      );
    }

    if (!isValidObjectId(orderId)) {
      return next(createError(400, "ID de commande invalide"));
    }

    // Récupération de la commande
    const order = await Order.findById(orderId);
    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Vérification que la commande a été payée
    if (order.paymentStatus !== "paid") {
      return next(
        createError(400, "Seules les commandes payées peuvent être remboursées")
      );
    }

    // Vérification du montant de remboursement
    const refundAmount = amount || order.total;
    if (refundAmount <= 0 || refundAmount > order.total) {
      return next(createError(400, "Montant de remboursement invalide"));
    }

    let refund;

    // Remboursement via le fournisseur de paiement
    if (
      order.paymentMethod === "stripe" &&
      order.paymentDetails?.transactionId
    ) {
      refund = await stripe.refunds.create({
        payment_intent: order.paymentDetails.transactionId,
        amount: Math.round(refundAmount * 100),
        reason: "requested_by_customer",
        metadata: {
          orderId: orderId.toString(),
          reason: reason || "Remboursement demandé par l'administrateur",
        },
      });
    } else if (
      order.paymentMethod === "paypal" &&
      order.paymentDetails?.transactionId
    ) {
      // Implémentation du remboursement PayPal ici
      refund = {
        id: `paypal-refund-${Date.now()}`,
        status: "completed",
      };
    } else {
      // Remboursement manuel
      refund = {
        id: `manual-refund-${Date.now()}`,
        status: "completed",
      };
    }

    // Mise à jour du statut de la commande
    const refundStatus =
      refundAmount === order.total ? "refunded" : "partially_refunded";

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: refundStatus,
      status: refundStatus === "refunded" ? "refunded" : order.status,
      "paymentDetails.refundId": refund.id,
      "paymentDetails.refundAmount": refundAmount,
      "paymentDetails.refundReason": reason || "Remboursement administrateur",
    });

    res.status(200).json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refundAmount,
        status: refund.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fonction utilitaire pour gérer un paiement réussi
 * @async
 * @param {String} orderId - ID de la commande
 * @param {String} provider - Fournisseur de paiement
 * @param {String} transactionId - ID de la transaction
 * @param {Number} amount - Montant payé
 * @param {String} status - Statut du paiement
 */
async function handleSuccessfulPayment(
  orderId,
  provider,
  transactionId,
  amount,
  status
) {
  try {
    // Mise à jour de la commande
    const order = await Order.findById(orderId);

    if (!order) {
      logger.error(
        `Commande ${orderId} non trouvée pour mise à jour de paiement`
      );
      return;
    }

    // Mise à jour du statut de paiement
    order.paymentStatus = status;
    order.status = "processing"; // Passage au statut "en traitement"

    // Mise à jour des détails de paiement
    order.paymentDetails = {
      provider,
      status,
      transactionId,
      amount,
      currency: "EUR",
      method: provider,
      timestamp: new Date(),
    };

    await order.save();

    // Notification par email
    try {
      const user = await User.findById(order.userId);
      if (user && user.email) {
        await emailService.sendPaymentConfirmation(user.email, order);
      }
    } catch (emailError) {
      logger.error(
        `Erreur lors de l'envoi de l'email de confirmation: ${emailError.message}`
      );
    }

    logger.info(`Paiement réussi pour la commande ${orderId}`);
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du paiement: ${error.message}`);
  }
}
