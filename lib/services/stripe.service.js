/**
 * Service Stripe
 * Wrapper autour de l'API Stripe avec gestion d'erreurs
 */

import Stripe from "stripe";
import { logger } from "../utils/logger";

// Initialisation de l'API Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Messages d'erreur utilisateur par code d'erreur Stripe
 */
const STRIPE_ERROR_MESSAGES = {
  card_declined:
    "Votre carte a été refusée. Veuillez utiliser une autre méthode de paiement.",
  expired_card: "Votre carte a expiré. Veuillez utiliser une autre carte.",
  incorrect_cvc:
    "Le code de sécurité est incorrect. Veuillez vérifier et réessayer.",
  incorrect_number:
    "Le numéro de carte est incorrect. Veuillez vérifier et réessayer.",
  processing_error:
    "Une erreur est survenue lors du traitement de votre carte. Veuillez réessayer.",
  rate_limit:
    "Le système de paiement est momentanément surchargé. Veuillez réessayer dans quelques instants.",
  invalid_request_error: "Demande invalide. Veuillez contacter le support.",
  authentication_required:
    "Authentification requise. Veuillez suivre les instructions supplémentaires.",
  insufficient_funds:
    "Fonds insuffisants. Veuillez utiliser une autre méthode de paiement.",
  default:
    "Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.",
};

/**
 * Fonction utilitaire pour gérer les erreurs Stripe
 * @param {Error} error - L'erreur Stripe
 * @param {string} requestId - Identifiant de la requête pour le logging
 * @returns {Object} Erreur formatée avec message utilisateur
 */
const handleStripeError = (error, requestId) => {
  const stripeError = error.raw || error;

  // Logger l'erreur pour le debugging (sans données sensibles)
  logger.error({
    message: "Erreur Stripe",
    code: stripeError.code,
    type: stripeError.type,
    requestId,
    stripeRequestId: stripeError.request_id,
  });

  // Retourner une erreur formatée pour l'utilisateur
  return {
    success: false,
    error: {
      code: stripeError.code,
      message:
        STRIPE_ERROR_MESSAGES[stripeError.code] ||
        STRIPE_ERROR_MESSAGES.default,
      detail:
        process.env.NODE_ENV === "development"
          ? stripeError.message
          : undefined,
    },
  };
};

/**
 * Crée un payment intent Stripe
 * @param {Object} params - Paramètres du payment intent
 * @param {number} params.amount - Montant en centimes
 * @param {string} params.currency - Code devise (EUR, USD, etc.)
 * @param {string} params.customerId - ID client Stripe (optionnel)
 * @param {string} params.description - Description du paiement
 * @param {Object} params.metadata - Métadonnées additionnelles
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Payment intent ou erreur
 */
export const createPaymentIntent = async (params, requestId) => {
  try {
    const { amount, currency, customerId, description, metadata } = params;

    const paymentIntentParams = {
      amount,
      currency,
      description,
      metadata: {
        ...metadata,
        requestId,
      },
      // Configuration pour le 3D Secure selon la réglementation SCA
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "always",
      },
    };

    // Ajouter le client s'il existe
    if (customerId) {
      paymentIntentParams.customer = customerId;
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams
    );

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    };
  } catch (error) {
    return handleStripeError(error, requestId);
  }
};

/**
 * Confirme un payment intent existant
 * @param {string} paymentIntentId - ID du payment intent à confirmer
 * @param {Object} params - Paramètres de confirmation
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Résultat de la confirmation
 */
export const confirmPaymentIntent = async (
  paymentIntentId,
  params,
  requestId
) => {
  try {
    const { payment_method, return_url } = params;

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method,
      return_url,
    });

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        nextAction: paymentIntent.next_action,
      },
    };
  } catch (error) {
    return handleStripeError(error, requestId);
  }
};

/**
 * Récupère un payment intent existant
 * @param {string} paymentIntentId - ID du payment intent
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Payment intent ou erreur
 */
export const retrievePaymentIntent = async (paymentIntentId, requestId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      },
    };
  } catch (error) {
    return handleStripeError(error, requestId);
  }
};

/**
 * Crée un client Stripe
 * @param {Object} customerData - Données du client
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Client créé ou erreur
 */
export const createCustomer = async (customerData, requestId) => {
  try {
    const customer = await stripe.customers.create({
      email: customerData.email,
      name: `${customerData.firstName} ${customerData.lastName}`,
      phone: customerData.phone,
      metadata: {
        userId: customerData.userId,
        requestId,
      },
    });

    return {
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
    };
  } catch (error) {
    return handleStripeError(error, requestId);
  }
};

/**
 * Enregistre une méthode de paiement pour un client
 * @param {string} customerId - ID du client Stripe
 * @param {string} paymentMethodId - ID de la méthode de paiement
 * @param {boolean} setAsDefault - Définir comme méthode par défaut
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const attachPaymentMethod = async (
  customerId,
  paymentMethodId,
  setAsDefault,
  requestId
) => {
  try {
    // Attacher la méthode de paiement au client
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Définir comme méthode par défaut si demandé
    if (setAsDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    return {
      success: true,
      message: "Méthode de paiement enregistrée avec succès",
    };
  } catch (error) {
    return handleStripeError(error, requestId);
  }
};

/**
 * Récupère les méthodes de paiement d'un client
 * @param {string} customerId - ID du client Stripe
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Liste des méthodes de paiement ou erreur
 */
export const listPaymentMethods = async (customerId, requestId) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    // Récupérer le client pour connaître sa méthode par défaut
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId =
      customer.invoice_settings?.default_payment_method;

    // Formater les méthodes de paiement
    const formattedMethods = paymentMethods.data.map((method) => ({
      id: method.id,
      type: method.type,
      isDefault: method.id === defaultPaymentMethodId,
      card: {
        brand: method.card.brand,
        last4: method.card.last4,
        expMonth: method.card.exp_month,
        expYear: method.card.exp_year,
      },
      billingDetails: method.billing_details,
    }));

    return {
      success: true,
      paymentMethods: formattedMethods,
    };
  } catch (error) {
    return handleStripeError(error, requestId);
  }
};

/**
 * Supprime une méthode de paiement
 * @param {string} paymentMethodId - ID de la méthode de paiement
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const deletePaymentMethod = async (paymentMethodId, requestId) => {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);

    return {
      success: true,
      message: "Méthode de paiement supprimée avec succès",
    };
  } catch (error) {
    return handleStripeError(error, requestId);
  }
};

/**
 * Crée/met à jour une configuration de webhook
 * @param {string} url - URL du webhook
 * @param {Array<string>} events - Événements à écouter
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const setupWebhook = async (url, events, requestId) => {
  try {
    // Récupérer les webhooks existants pour éviter les doublons
    const webhooks = await stripe.webhookEndpoints.list();
    const existingWebhook = webhooks.data.find(
      (webhook) => webhook.url === url
    );

    if (existingWebhook) {
      // Mettre à jour le webhook existant
      const updatedWebhook = await stripe.webhookEndpoints.update(
        existingWebhook.id,
        {
          enabled_events: events,
        }
      );

      return {
        success: true,
        webhook: {
          id: updatedWebhook.id,
          secret: "******", // Le secret ne peut pas être récupéré après création
          url: updatedWebhook.url,
        },
        message: "Webhook mis à jour avec succès",
      };
    } else {
      // Créer un nouveau webhook
      const webhook = await stripe.webhookEndpoints.create({
        url,
        enabled_events: events,
      });

      return {
        success: true,
        webhook: {
          id: webhook.id,
          secret: webhook.secret,
          url: webhook.url,
        },
        message: "Webhook créé avec succès",
      };
    }
  } catch (error) {
    return handleStripeError(error, requestId);
  }
};

/**
 * Vérifie la signature d'un événement webhook
 * @param {string} payload - Corps de la requête brut
 * @param {string} signature - En-tête de signature Stripe
 * @param {string} webhookSecret - Secret du webhook
 * @returns {Object} Événement vérifié ou erreur
 */
export const verifyWebhookEvent = (payload, signature, webhookSecret) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return {
      success: true,
      event,
    };
  } catch (error) {
    logger.error({
      message: "Erreur de vérification de webhook Stripe",
      error: error.message,
    });

    return {
      success: false,
      error: {
        message: "Signature de webhook invalide",
        detail: error.message,
      },
    };
  }
};

export default {
  createPaymentIntent,
  confirmPaymentIntent,
  retrievePaymentIntent,
  createCustomer,
  attachPaymentMethod,
  listPaymentMethods,
  deletePaymentMethod,
  setupWebhook,
  verifyWebhookEvent,
};
