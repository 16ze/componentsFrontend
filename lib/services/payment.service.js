/**
 * Service de paiement
 * Logique commune et abstractions pour les passerelles de paiement
 */

import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import stripeService from "./stripe.service";
import paypalService from "./paypal.service";
import orderService from "./order.service";

// Types de passerelles de paiement supportées
export const PAYMENT_GATEWAYS = {
  STRIPE: "stripe",
  PAYPAL: "paypal",
  APPLEPAY: "applepay",
  GOOGLEPAY: "googlepay",
  BANKTRANSFER: "banktransfer",
};

// Types d'événements de paiement
export const PAYMENT_EVENTS = {
  CREATED: "payment.created",
  AUTHORIZED: "payment.authorized",
  CAPTURED: "payment.captured",
  FAILED: "payment.failed",
  REFUNDED: "payment.refunded",
  DISPUTED: "payment.disputed",
};

// Statuts de paiement standardisés
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
  DISPUTED: "disputed",
  CANCELLED: "cancelled",
};

/**
 * Génère un identifiant de requête unique pour le suivi des paiements
 * @returns {string} Identifiant de requête
 */
const generateRequestId = () => {
  return `pay_${uuidv4().replace(/-/g, "")}`;
};

/**
 * Détermine si un paiement nécessite une authentification 3D Secure
 * @param {number} amount - Montant du paiement
 * @param {string} currency - Devise
 * @param {Object} billingData - Données de facturation
 * @returns {boolean} Vrai si 3DS est requis
 */
const is3DSRequired = (amount, currency, billingData) => {
  // Implémentation des règles SCA (Strong Customer Authentication)
  // Règle générale: transactions européennes > 30€ requièrent SCA
  const europeanCountries = [
    "FR",
    "DE",
    "IT",
    "ES",
    "BE",
    "NL",
    "PT",
    "LU",
    "IE",
    "AT",
    "FI",
    "GR",
    "SI",
    "CY",
    "MT",
    "SK",
    "EE",
    "LV",
    "LT",
  ];

  // Si le pays de facturation est européen et le montant > 3000 centimes (30€)
  if (europeanCountries.includes(billingData.country) && amount > 3000) {
    return true;
  }

  // Exceptions et cas spécifiques
  const lowRiskExceptions = [
    // Paiements récurrents de faible valeur
    // Transactions dans certaines catégories (transports, parkings, etc.)
  ];

  // On peut ajouter d'autres règles métier ici

  return false;
};

/**
 * Crée une nouvelle transaction de paiement
 * @param {Object} paymentData - Données de paiement
 * @param {string} paymentData.gateway - Passerelle de paiement (stripe, paypal, etc.)
 * @param {number} paymentData.amount - Montant en centimes
 * @param {string} paymentData.currency - Code devise
 * @param {string} paymentData.orderId - ID de la commande associée
 * @param {Object} paymentData.customer - Données client
 * @param {Object} paymentData.metadata - Métadonnées additionnelles
 * @param {Object} options - Options de la transaction
 * @returns {Promise<Object>} Transaction créée
 */
export const createTransaction = async (paymentData, options = {}) => {
  const requestId = generateRequestId();
  const {
    gateway,
    amount,
    currency,
    orderId,
    customer,
    metadata = {},
  } = paymentData;

  try {
    logger.info({
      message: "Création d'une transaction de paiement",
      requestId,
      gateway,
      amount,
      currency,
      orderId,
    });

    // Préparer des métadonnées communes
    const commonMetadata = {
      orderId,
      customerEmail: customer.email,
      ...metadata,
    };

    // Créer un identifiant client chez le PSP si nécessaire
    let customerId = customer.gatewayCustomerId;

    // Créer la transaction selon la passerelle choisie
    switch (gateway) {
      case PAYMENT_GATEWAYS.STRIPE:
        // Si pas d'ID client Stripe, on le crée
        if (!customerId && options.shouldCreateCustomer) {
          const customerResponse = await stripeService.createCustomer(
            {
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
              userId: customer.id,
            },
            requestId
          );

          if (customerResponse.success) {
            customerId = customerResponse.customer.id;
            // Sauvegarder l'ID client pour le futur
            await updateCustomerGatewayId(customer.id, gateway, customerId);
          }
        }

        // Créer le payment intent Stripe
        const stripeResult = await stripeService.createPaymentIntent(
          {
            amount,
            currency,
            customerId,
            description: `Commande ${orderId}`,
            metadata: commonMetadata,
          },
          requestId
        );

        if (!stripeResult.success) {
          throw new Error(stripeResult.error.message);
        }

        return {
          id: stripeResult.paymentIntent.id,
          clientSecret: stripeResult.paymentIntent.clientSecret,
          amount,
          currency,
          status: mapGatewayStatusToStandard(
            gateway,
            stripeResult.paymentIntent.status
          ),
          gateway,
          requiresAction:
            stripeResult.paymentIntent.status === "requires_action",
          paymentMethodOptions: {
            supportsSavedMethods: !!customerId,
          },
        };

      case PAYMENT_GATEWAYS.PAYPAL:
        // Récupérer les détails de la commande
        const order = await orderService.getOrder(orderId);

        if (!order) {
          throw new Error("Commande introuvable");
        }

        // URLs de retour pour PayPal
        const returnUrl =
          options.returnUrl ||
          `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirm`;
        const cancelUrl =
          options.cancelUrl ||
          `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/payment`;

        // Préparer les données pour PayPal
        const orderData = {
          amount,
          currency,
          reference: orderId,
          items: order.items.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        // Créer l'ordre PayPal
        const paypalResult = await paypalService.createOrder(
          orderData,
          returnUrl,
          cancelUrl,
          requestId
        );

        if (!paypalResult.success) {
          throw new Error(paypalResult.error.message);
        }

        return {
          id: paypalResult.order.id,
          approveUrl: paypalResult.order.approveUrl,
          amount,
          currency,
          status: mapGatewayStatusToStandard(
            gateway,
            paypalResult.order.status
          ),
          gateway,
          requiresAction: true, // PayPal nécessite toujours une redirection
          paymentMethodOptions: {
            supportsSavedMethods: false,
          },
        };

      case PAYMENT_GATEWAYS.BANKTRANSFER:
        // Générer des références de virement
        const reference = `VIR-${orderId.replace("ORD-", "")}`;

        // Enregistrer les détails du virement en base de données
        await orderService.updateOrderPayment(orderId, {
          gateway,
          status: PAYMENT_STATUS.PENDING,
          reference,
          amount,
          currency,
        });

        return {
          id: reference,
          reference,
          amount,
          currency,
          status: PAYMENT_STATUS.PENDING,
          gateway,
          requiresAction: false,
          bankDetails: {
            name: process.env.BANK_ACCOUNT_NAME,
            iban: process.env.BANK_ACCOUNT_IBAN,
            bic: process.env.BANK_ACCOUNT_BIC,
            reference,
          },
        };

      default:
        throw new Error(`Passerelle de paiement '${gateway}' non supportée`);
    }
  } catch (error) {
    logger.error({
      message: "Erreur lors de la création de la transaction",
      requestId,
      error: error.message,
    });

    return {
      success: false,
      error: {
        message: error.message,
        code: "PAYMENT_CREATION_FAILED",
      },
    };
  }
};

/**
 * Confirme une transaction de paiement
 * @param {Object} confirmData - Données de confirmation
 * @param {string} confirmData.gateway - Passerelle de paiement
 * @param {string} confirmData.transactionId - ID de la transaction
 * @param {string} confirmData.orderId - ID de la commande
 * @param {Object} confirmData.paymentMethod - Données de la méthode de paiement
 * @param {boolean} confirmData.saveMethod - Sauvegarder la méthode pour usage futur
 * @param {Object} options - Options de confirmation
 * @returns {Promise<Object>} Résultat de la confirmation
 */
export const confirmTransaction = async (confirmData, options = {}) => {
  const requestId = generateRequestId();
  const { gateway, transactionId, orderId, paymentMethod, saveMethod } =
    confirmData;

  try {
    logger.info({
      message: "Confirmation d'une transaction de paiement",
      requestId,
      gateway,
      transactionId,
      orderId,
    });

    switch (gateway) {
      case PAYMENT_GATEWAYS.STRIPE:
        // Configurer le retour après 3DS si nécessaire
        const returnUrl =
          options.returnUrl ||
          `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirm?id=${transactionId}`;

        // Confirmer le payment intent
        const stripeResult = await stripeService.confirmPaymentIntent(
          transactionId,
          {
            payment_method: paymentMethod.id,
            return_url: returnUrl,
          },
          requestId
        );

        if (!stripeResult.success) {
          throw new Error(stripeResult.error.message);
        }

        // Si la méthode doit être sauvegardée et qu'on a un client
        if (saveMethod && paymentMethod.customerId) {
          await stripeService.attachPaymentMethod(
            paymentMethod.customerId,
            paymentMethod.id,
            false, // Ne pas définir comme méthode par défaut
            requestId
          );
        }

        // Mise à jour du statut de la commande
        await orderService.updateOrderPayment(orderId, {
          gatewayTransactionId: transactionId,
          status: mapGatewayStatusToStandard(
            gateway,
            stripeResult.paymentIntent.status
          ),
        });

        return {
          success: true,
          status: mapGatewayStatusToStandard(
            gateway,
            stripeResult.paymentIntent.status
          ),
          requiresAction: !!stripeResult.paymentIntent.nextAction,
          nextAction: stripeResult.paymentIntent.nextAction,
        };

      case PAYMENT_GATEWAYS.PAYPAL:
        // Capturer le paiement PayPal
        const paypalResult = await paypalService.capturePayment(
          transactionId,
          requestId
        );

        if (!paypalResult.success) {
          throw new Error(paypalResult.error.message);
        }

        // Mise à jour du statut de la commande
        await orderService.updateOrderPayment(orderId, {
          gatewayTransactionId: paypalResult.payment.id,
          paypalOrderId: transactionId,
          status: mapGatewayStatusToStandard(
            gateway,
            paypalResult.payment.status
          ),
        });

        return {
          success: true,
          status: mapGatewayStatusToStandard(
            gateway,
            paypalResult.payment.status
          ),
          requiresAction: false,
        };

      default:
        throw new Error(`Passerelle de paiement '${gateway}' non supportée`);
    }
  } catch (error) {
    logger.error({
      message: "Erreur lors de la confirmation de la transaction",
      requestId,
      error: error.message,
    });

    return {
      success: false,
      error: {
        message: error.message,
        code: "PAYMENT_CONFIRMATION_FAILED",
      },
    };
  }
};

/**
 * Récupère les moyens de paiement enregistrés d'un client
 * @param {Object} params - Paramètres
 * @param {string} params.customerId - ID du client dans l'application
 * @param {string} params.gateway - Passerelle de paiement
 * @returns {Promise<Object>} Liste des méthodes de paiement
 */
export const getSavedPaymentMethods = async ({ customerId, gateway }) => {
  const requestId = generateRequestId();

  try {
    // Récupérer l'ID du client chez la passerelle de paiement
    const customer = await getCustomerGatewayId(customerId, gateway);

    if (!customer || !customer.gatewayCustomerId) {
      return {
        success: true,
        paymentMethods: [],
      };
    }

    switch (gateway) {
      case PAYMENT_GATEWAYS.STRIPE:
        const stripeResult = await stripeService.listPaymentMethods(
          customer.gatewayCustomerId,
          requestId
        );

        if (!stripeResult.success) {
          throw new Error(stripeResult.error.message);
        }

        return {
          success: true,
          paymentMethods: stripeResult.paymentMethods.map((method) => ({
            id: method.id,
            type: method.type,
            isDefault: method.isDefault,
            last4: method.card.last4,
            brand: method.card.brand,
            expiryMonth: method.card.expMonth,
            expiryYear: method.card.expYear,
            formatted: `${method.card.brand} se terminant par ${method.card.last4} (expire ${method.card.expMonth}/${method.card.expYear})`,
          })),
        };

      default:
        return {
          success: true,
          paymentMethods: [],
        };
    }
  } catch (error) {
    logger.error({
      message: "Erreur lors de la récupération des méthodes de paiement",
      requestId,
      error: error.message,
    });

    return {
      success: false,
      error: {
        message: error.message,
        code: "PAYMENT_METHODS_RETRIEVAL_FAILED",
      },
    };
  }
};

/**
 * Supprime une méthode de paiement enregistrée
 * @param {Object} params - Paramètres
 * @param {string} params.customerId - ID du client
 * @param {string} params.methodId - ID de la méthode à supprimer
 * @param {string} params.gateway - Passerelle de paiement
 * @returns {Promise<Object>} Résultat de la suppression
 */
export const deletePaymentMethod = async ({
  customerId,
  methodId,
  gateway,
}) => {
  const requestId = generateRequestId();

  try {
    switch (gateway) {
      case PAYMENT_GATEWAYS.STRIPE:
        const stripeResult = await stripeService.deletePaymentMethod(
          methodId,
          requestId
        );

        if (!stripeResult.success) {
          throw new Error(stripeResult.error.message);
        }

        return {
          success: true,
          message: "Méthode de paiement supprimée avec succès",
        };

      default:
        throw new Error(
          `Suppression de méthode de paiement non supportée pour ${gateway}`
        );
    }
  } catch (error) {
    logger.error({
      message: "Erreur lors de la suppression de la méthode de paiement",
      requestId,
      error: error.message,
    });

    return {
      success: false,
      error: {
        message: error.message,
        code: "PAYMENT_METHOD_DELETION_FAILED",
      },
    };
  }
};

/**
 * Obtient l'ID client chez la passerelle de paiement
 * Fonction simulée - à implémenter avec votre base de données
 * @param {string} customerId - ID du client dans l'application
 * @param {string} gateway - Passerelle de paiement
 * @returns {Promise<Object>} Données du client
 */
const getCustomerGatewayId = async (customerId, gateway) => {
  // Simulé - à remplacer par un accès à la base de données
  // En production, cette fonction récupérerait l'ID du client dans votre DB
  console.log(`Récupération de l'ID client ${customerId} pour ${gateway}`);
  return { gatewayCustomerId: null };
};

/**
 * Met à jour l'ID client chez la passerelle de paiement
 * Fonction simulée - à implémenter avec votre base de données
 * @param {string} customerId - ID du client dans l'application
 * @param {string} gateway - Passerelle de paiement
 * @param {string} gatewayCustomerId - ID du client chez la passerelle
 * @returns {Promise<boolean>} Succès de la mise à jour
 */
const updateCustomerGatewayId = async (
  customerId,
  gateway,
  gatewayCustomerId
) => {
  // Simulé - à remplacer par un accès à la base de données
  console.log(
    `Mise à jour de l'ID client ${customerId} pour ${gateway}: ${gatewayCustomerId}`
  );
  return true;
};

/**
 * Convertit un statut spécifique à une passerelle en statut standard
 * @param {string} gateway - Passerelle de paiement
 * @param {string} status - Statut chez la passerelle
 * @returns {string} Statut standardisé
 */
const mapGatewayStatusToStandard = (gateway, status) => {
  // Mapping des statuts Stripe
  const stripeStatusMap = {
    requires_payment_method: PAYMENT_STATUS.PENDING,
    requires_confirmation: PAYMENT_STATUS.PENDING,
    requires_action: PAYMENT_STATUS.PROCESSING,
    processing: PAYMENT_STATUS.PROCESSING,
    succeeded: PAYMENT_STATUS.COMPLETED,
    canceled: PAYMENT_STATUS.CANCELLED,
  };

  // Mapping des statuts PayPal
  const paypalStatusMap = {
    CREATED: PAYMENT_STATUS.PENDING,
    SAVED: PAYMENT_STATUS.PENDING,
    APPROVED: PAYMENT_STATUS.PROCESSING,
    VOIDED: PAYMENT_STATUS.CANCELLED,
    COMPLETED: PAYMENT_STATUS.COMPLETED,
    PAYER_ACTION_REQUIRED: PAYMENT_STATUS.PROCESSING,
  };

  // Sélectionner le mapping en fonction de la passerelle
  switch (gateway) {
    case PAYMENT_GATEWAYS.STRIPE:
      return stripeStatusMap[status] || PAYMENT_STATUS.PENDING;
    case PAYMENT_GATEWAYS.PAYPAL:
      return paypalStatusMap[status] || PAYMENT_STATUS.PENDING;
    default:
      return PAYMENT_STATUS.PENDING;
  }
};

export default {
  PAYMENT_GATEWAYS,
  PAYMENT_STATUS,
  PAYMENT_EVENTS,
  createTransaction,
  confirmTransaction,
  getSavedPaymentMethods,
  deletePaymentMethod,
};
