/**
 * Service de gestion des commandes
 * Mise à jour des commandes post-paiement
 */

import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

// Mock d'une base de données pour le développement
// En production, cela serait remplacé par des appels à une vraie base de données
const ordersDB = new Map();

/**
 * Crée une nouvelle commande
 * @param {Object} orderData - Données de la commande
 * @returns {Promise<Object>} Commande créée
 */
export const createOrder = async (orderData) => {
  try {
    // Générer un ID de commande unique
    const orderId = orderData.id || `ORD-${Date.now()}`;

    // Créer l'objet commande
    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
      ...orderData,
      // Ajouter un identifiant unique pour chaque transaction
      paymentId: orderData.paymentId || `txn_${uuidv4().replace(/-/g, "")}`,
    };

    // Enregistrer dans notre "base de données"
    ordersDB.set(orderId, order);

    logger.info({
      message: "Commande créée",
      orderId,
      amount: order.total,
      customerEmail: order.customer?.email,
    });

    return order;
  } catch (error) {
    logger.error({
      message: "Erreur lors de la création de la commande",
      error: error.message,
    });

    throw new Error("Erreur lors de la création de la commande");
  }
};

/**
 * Récupère une commande par son ID
 * @param {string} orderId - ID de la commande
 * @returns {Promise<Object|null>} Commande trouvée ou null
 */
export const getOrder = async (orderId) => {
  try {
    // Récupérer depuis notre "base de données"
    const order = ordersDB.get(orderId);

    if (!order) {
      logger.warn({
        message: "Commande introuvable",
        orderId,
      });
      return null;
    }

    return order;
  } catch (error) {
    logger.error({
      message: "Erreur lors de la récupération de la commande",
      orderId,
      error: error.message,
    });

    throw new Error(`Erreur lors de la récupération de la commande ${orderId}`);
  }
};

/**
 * Met à jour le statut de paiement d'une commande
 * @param {string} orderId - ID de la commande
 * @param {Object} paymentData - Données de paiement à mettre à jour
 * @returns {Promise<Object>} Commande mise à jour
 */
export const updateOrderPayment = async (orderId, paymentData) => {
  try {
    // Récupérer la commande existante
    const order = await getOrder(orderId);

    if (!order) {
      throw new Error(`Commande ${orderId} introuvable`);
    }

    // Mettre à jour les données de paiement
    const updatedOrder = {
      ...order,
      payment: {
        ...order.payment,
        ...paymentData,
      },
      updatedAt: new Date().toISOString(),
    };

    // Mettre à jour le statut de la commande en fonction du paiement
    if (paymentData.status) {
      // Mapping des statuts de paiement vers les statuts de commande
      const statusMapping = {
        pending: "awaiting_payment",
        processing: "processing",
        completed: "paid",
        failed: "payment_failed",
        refunded: "refunded",
        partially_refunded: "partially_refunded",
        cancelled: "cancelled",
      };

      updatedOrder.status = statusMapping[paymentData.status] || order.status;
    }

    // Enregistrer les modifications
    ordersDB.set(orderId, updatedOrder);

    logger.info({
      message: "Paiement de commande mis à jour",
      orderId,
      paymentStatus: paymentData.status,
      orderStatus: updatedOrder.status,
    });

    // Si le paiement est terminé avec succès, déclencher les actions post-paiement
    if (paymentData.status === "completed") {
      await handleSuccessfulPayment(orderId);
    }

    return updatedOrder;
  } catch (error) {
    logger.error({
      message: "Erreur lors de la mise à jour du paiement de la commande",
      orderId,
      error: error.message,
    });

    throw new Error(
      `Erreur lors de la mise à jour du paiement de la commande ${orderId}`
    );
  }
};

/**
 * Actions à exécuter après un paiement réussi
 * @param {string} orderId - ID de la commande
 * @returns {Promise<void>}
 */
const handleSuccessfulPayment = async (orderId) => {
  try {
    logger.info({
      message: "Traitement post-paiement",
      orderId,
    });

    // 1. Déclencher l'envoi de l'email de confirmation
    await sendOrderConfirmationEmail(orderId);

    // 2. Générer et enregistrer la facture
    await generateInvoice(orderId);

    // 3. Mettre à jour les stocks
    await updateInventory(orderId);

    // 4. Autres actions post-paiement (fidélité, analytics, etc.)

    logger.info({
      message: "Traitement post-paiement terminé avec succès",
      orderId,
    });
  } catch (error) {
    logger.error({
      message: "Erreur lors du traitement post-paiement",
      orderId,
      error: error.message,
    });

    // Ne pas propager l'erreur pour ne pas bloquer le processus principal
    // mais enregistrer pour traitement manuel ultérieur
  }
};

/**
 * Envoie un email de confirmation de commande
 * @param {string} orderId - ID de la commande
 * @returns {Promise<void>}
 */
const sendOrderConfirmationEmail = async (orderId) => {
  // Simulé - à remplacer par l'intégration avec votre service d'emails
  logger.info({
    message: "Email de confirmation envoyé",
    orderId,
  });
};

/**
 * Génère une facture pour une commande
 * @param {string} orderId - ID de la commande
 * @returns {Promise<Object>} Facture générée
 */
const generateInvoice = async (orderId) => {
  try {
    const order = await getOrder(orderId);

    if (!order) {
      throw new Error(`Commande ${orderId} introuvable`);
    }

    // Générer un numéro de facture unique
    const invoiceNumber = `INV-${Date.now()}`;

    // Créer l'objet facture
    const invoice = {
      id: invoiceNumber,
      orderId: order.id,
      date: new Date().toISOString(),
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      shipping: order.shipping?.cost || 0,
      total: order.total || 0,
      currency: order.currency || "EUR",
      paymentMethod: order.payment?.method || "unknown",
    };

    // Simulé - en production, sauvegarder dans la base de données
    logger.info({
      message: "Facture générée",
      invoiceNumber,
      orderId,
    });

    // Mettre à jour la commande avec les infos de facturation
    const updatedOrder = {
      ...order,
      invoice: {
        id: invoiceNumber,
        date: invoice.date,
      },
    };

    ordersDB.set(orderId, updatedOrder);

    return invoice;
  } catch (error) {
    logger.error({
      message: "Erreur lors de la génération de la facture",
      orderId,
      error: error.message,
    });

    throw new Error(
      `Erreur lors de la génération de la facture pour la commande ${orderId}`
    );
  }
};

/**
 * Met à jour les stocks après une commande payée
 * @param {string} orderId - ID de la commande
 * @returns {Promise<void>}
 */
const updateInventory = async (orderId) => {
  try {
    const order = await getOrder(orderId);

    if (!order) {
      throw new Error(`Commande ${orderId} introuvable`);
    }

    // Simulé - en production, mettre à jour les stocks dans la base de données
    logger.info({
      message: "Stocks mis à jour",
      orderId,
      itemCount: order.items?.length || 0,
    });
  } catch (error) {
    logger.error({
      message: "Erreur lors de la mise à jour des stocks",
      orderId,
      error: error.message,
    });

    // Enregistrer pour résolution manuelle
  }
};

/**
 * Récupère l'historique des commandes d'un client
 * @param {string} customerId - ID du client
 * @param {Object} options - Options de pagination
 * @returns {Promise<Array>} Liste des commandes
 */
export const getCustomerOrders = async (customerId, options = {}) => {
  try {
    // Simulé - en production, requête filtrée à la base de données
    const customerOrders = Array.from(ordersDB.values())
      .filter((order) => order.customer?.id === customerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    logger.info({
      message: "Récupération des commandes client",
      customerId,
      orderCount: customerOrders.length,
    });

    return customerOrders;
  } catch (error) {
    logger.error({
      message: "Erreur lors de la récupération des commandes client",
      customerId,
      error: error.message,
    });

    throw new Error(
      `Erreur lors de la récupération des commandes pour le client ${customerId}`
    );
  }
};

/**
 * Ajoute une note interne à une commande
 * @param {string} orderId - ID de la commande
 * @param {string} note - Contenu de la note
 * @param {string} author - Auteur de la note
 * @returns {Promise<Object>} Commande mise à jour
 */
export const addOrderNote = async (orderId, note, author) => {
  try {
    const order = await getOrder(orderId);

    if (!order) {
      throw new Error(`Commande ${orderId} introuvable`);
    }

    // Créer la note
    const newNote = {
      id: uuidv4(),
      content: note,
      author,
      createdAt: new Date().toISOString(),
    };

    // Ajouter à la liste des notes
    const notes = order.notes || [];

    const updatedOrder = {
      ...order,
      notes: [...notes, newNote],
      updatedAt: new Date().toISOString(),
    };

    // Enregistrer les modifications
    ordersDB.set(orderId, updatedOrder);

    logger.info({
      message: "Note ajoutée à la commande",
      orderId,
      noteId: newNote.id,
    });

    return updatedOrder;
  } catch (error) {
    logger.error({
      message: "Erreur lors de l'ajout d'une note à la commande",
      orderId,
      error: error.message,
    });

    throw new Error(
      `Erreur lors de l'ajout d'une note à la commande ${orderId}`
    );
  }
};

export default {
  createOrder,
  getOrder,
  updateOrderPayment,
  getCustomerOrders,
  addOrderNote,
};
