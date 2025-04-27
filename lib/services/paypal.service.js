/**
 * Service PayPal
 * Intégration avec l'API PayPal
 */

import axios from "axios";
import { logger } from "../utils/logger";

// Base URLs pour les environnements PayPal
const BASE_URLS = {
  sandbox: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com",
};

// Environnement PayPal (sandbox ou production)
const PAYPAL_ENV = process.env.PAYPAL_ENVIRONMENT || "sandbox";
const BASE_URL = BASE_URLS[PAYPAL_ENV];

// Identifiants PayPal
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;

// Messages d'erreur PayPal
const PAYPAL_ERROR_MESSAGES = {
  INSTRUMENT_DECLINED:
    "Votre méthode de paiement a été refusée. Veuillez essayer une autre méthode.",
  PAYER_CANNOT_PAY:
    "Problème avec votre compte PayPal. Veuillez contacter PayPal ou utiliser une autre méthode.",
  PAYMENT_SOURCE_INFO_CANNOT_BE_VERIFIED:
    "Vos informations de paiement ne peuvent pas être vérifiées. Veuillez essayer une autre méthode.",
  INTERNAL_SERVICE_ERROR:
    "Une erreur est survenue chez PayPal. Veuillez réessayer ultérieurement.",
  default:
    "Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.",
};

/**
 * Fonction utilitaire pour gérer les erreurs PayPal
 * @param {Error} error - L'erreur PayPal
 * @param {string} requestId - Identifiant de la requête pour le logging
 * @returns {Object} Erreur formatée avec message utilisateur
 */
const handlePayPalError = (error, requestId) => {
  let errorDetails = {
    name: "UNKNOWN_ERROR",
    message: "Erreur inconnue",
    details: [],
  };

  if (error.response && error.response.data) {
    errorDetails = error.response.data;
  }

  // Logger l'erreur pour le debugging (sans données sensibles)
  logger.error({
    message: "Erreur PayPal",
    name: errorDetails.name,
    requestId,
    paypalDebugId: error.response?.headers["paypal-debug-id"],
  });

  // Chercher le premier code d'erreur pertinent
  const errorDetail = errorDetails.details && errorDetails.details[0];
  const errorCode = errorDetail?.issue || errorDetails.name;

  // Retourner une erreur formatée pour l'utilisateur
  return {
    success: false,
    error: {
      code: errorCode,
      message:
        PAYPAL_ERROR_MESSAGES[errorCode] || PAYPAL_ERROR_MESSAGES.default,
      detail:
        process.env.NODE_ENV === "development"
          ? errorDetails.message
          : undefined,
    },
  };
};

/**
 * Fonction pour obtenir un token d'accès PayPal
 * @returns {Promise<string>} Token d'accès
 */
const getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");
    const response = await axios({
      method: "post",
      url: `${BASE_URL}/v1/oauth2/token`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "grant_type=client_credentials",
    });

    return response.data.access_token;
  } catch (error) {
    logger.error({
      message: "Erreur d'authentification PayPal",
      error: error.message,
    });
    throw new Error("Erreur d'authentification PayPal");
  }
};

/**
 * Crée un ordre PayPal
 * @param {Object} orderData - Données de la commande
 * @param {number} orderData.amount - Montant total
 * @param {string} orderData.currency - Code devise (EUR, USD, etc.)
 * @param {string} orderData.reference - Référence interne de la commande
 * @param {Array} orderData.items - Articles de la commande
 * @param {string} returnUrl - URL de retour après le paiement
 * @param {string} cancelUrl - URL en cas d'annulation
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Ordre PayPal ou erreur
 */
export const createOrder = async (
  orderData,
  returnUrl,
  cancelUrl,
  requestId
) => {
  try {
    const accessToken = await getAccessToken();

    // Préparer les données pour l'API PayPal
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderData.reference,
          amount: {
            currency_code: orderData.currency,
            value: (orderData.amount / 100).toFixed(2), // Convertir de centimes à devise
            breakdown: {
              item_total: {
                currency_code: orderData.currency,
                value: (orderData.amount / 100).toFixed(2),
              },
            },
          },
          items: orderData.items.map((item) => ({
            name: item.name,
            description: item.description || "",
            quantity: item.quantity.toString(),
            unit_amount: {
              currency_code: orderData.currency,
              value: (item.price / 100).toFixed(2),
            },
          })),
        },
      ],
      application_context: {
        brand_name: process.env.SHOP_NAME || "Kairo Digital",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    };

    const response = await axios({
      method: "post",
      url: `${BASE_URL}/v2/checkout/orders`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": requestId,
      },
      data: payload,
    });

    // Extraire et retourner les liens de paiement
    const approveLink = response.data.links.find(
      (link) => link.rel === "approve"
    );

    return {
      success: true,
      order: {
        id: response.data.id,
        status: response.data.status,
        approveUrl: approveLink ? approveLink.href : null,
      },
    };
  } catch (error) {
    return handlePayPalError(error, requestId);
  }
};

/**
 * Capture un paiement PayPal après approbation
 * @param {string} orderId - ID de l'ordre PayPal
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Résultat de la capture ou erreur
 */
export const capturePayment = async (orderId, requestId) => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios({
      method: "post",
      url: `${BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": requestId,
      },
    });

    const captureId =
      response.data.purchase_units[0]?.payments?.captures[0]?.id;

    return {
      success: true,
      payment: {
        id: captureId,
        orderId: response.data.id,
        status: response.data.status,
        payerId: response.data.payer?.payer_id,
      },
    };
  } catch (error) {
    return handlePayPalError(error, requestId);
  }
};

/**
 * Récupère les détails d'un ordre PayPal
 * @param {string} orderId - ID de l'ordre
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Détails de l'ordre ou erreur
 */
export const getOrderDetails = async (orderId, requestId) => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios({
      method: "get",
      url: `${BASE_URL}/v2/checkout/orders/${orderId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      order: {
        id: response.data.id,
        status: response.data.status,
        amount: {
          total: response.data.purchase_units[0].amount.value,
          currency: response.data.purchase_units[0].amount.currency_code,
        },
        payer: response.data.payer,
      },
    };
  } catch (error) {
    return handlePayPalError(error, requestId);
  }
};

/**
 * Rembourse un paiement PayPal
 * @param {string} captureId - ID de la capture de paiement
 * @param {Object} refundData - Données du remboursement
 * @param {string} refundData.amount - Montant à rembourser
 * @param {string} refundData.currency - Devise
 * @param {string} refundData.reason - Raison du remboursement
 * @param {string} requestId - Identifiant de requête pour le tracking
 * @returns {Promise<Object>} Résultat du remboursement ou erreur
 */
export const refundPayment = async (captureId, refundData, requestId) => {
  try {
    const accessToken = await getAccessToken();

    const payload = {
      amount: {
        value: (refundData.amount / 100).toFixed(2),
        currency_code: refundData.currency,
      },
      note_to_payer: refundData.reason || "Remboursement",
    };

    const response = await axios({
      method: "post",
      url: `${BASE_URL}/v2/payments/captures/${captureId}/refund`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": requestId,
      },
      data: payload,
    });

    return {
      success: true,
      refund: {
        id: response.data.id,
        captureId: captureId,
        status: response.data.status,
        amount: {
          value: response.data.amount.value,
          currency: response.data.amount.currency_code,
        },
      },
    };
  } catch (error) {
    return handlePayPalError(error, requestId);
  }
};

/**
 * Vérifie la validité et authentifie un webhook PayPal
 * @param {Object} headers - En-têtes HTTP de la requête
 * @param {string} body - Corps de la requête (JSON brut)
 * @param {string} webhookId - ID du webhook configuré dans PayPal
 * @returns {Promise<Object>} Résultat de la vérification
 */
export const verifyWebhook = async (headers, body, webhookId) => {
  try {
    const accessToken = await getAccessToken();

    const payload = {
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    };

    const response = await axios({
      method: "post",
      url: `${BASE_URL}/v1/notifications/verify-webhook-signature`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: payload,
    });

    return {
      success: true,
      verified: response.data.verification_status === "SUCCESS",
      event: payload.webhook_event,
    };
  } catch (error) {
    logger.error({
      message: "Erreur de vérification de webhook PayPal",
      error: error.message,
    });

    return {
      success: false,
      verified: false,
      error: {
        message: "Erreur de vérification de webhook",
        detail: error.message,
      },
    };
  }
};

export default {
  createOrder,
  capturePayment,
  getOrderDetails,
  refundPayment,
  verifyWebhook,
};
