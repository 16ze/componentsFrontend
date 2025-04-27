import { NextRequest } from "next/server";
import { apiResponse, handleApiError } from "../../../../lib/api/middleware";
import { mockOrders, getCurrentDate } from "../../../../lib/api/mockData";
import { OrderStatus, PaymentStatus } from "../../../../lib/types/api";

/**
 * POST /api/payment/webhook - Webhook pour les événements de paiement Stripe/PayPal
 */
export async function POST(req: NextRequest) {
  try {
    // Récupérer les en-têtes
    const signature = req.headers.get("stripe-signature");

    // Vérifier la signature (dans une application réelle, avec la bibliothèque Stripe)
    if (!signature) {
      return apiResponse.badRequest("Signature manquante");
    }

    // Récupérer le corps de la requête
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    // Vérifier le type d'événement
    if (!event.type) {
      return apiResponse.badRequest("Type d'événement manquant");
    }

    // Traiter l'événement en fonction de son type
    switch (event.type) {
      case "payment_intent.succeeded":
        return handlePaymentIntentSucceeded(event.data.object);
      case "payment_intent.payment_failed":
        return handlePaymentIntentFailed(event.data.object);
      case "charge.refunded":
        return handleChargeRefunded(event.data.object);
      // Pour PayPal, les types d'événements seraient différents
      case "paypal.payment.complete":
        return handlePayPalPaymentComplete(event.data.object);
      case "paypal.payment.failed":
        return handlePayPalPaymentFailed(event.data.object);
      default:
        // Événement ignoré
        return apiResponse.success({ received: true });
    }
  } catch (error) {
    // Ne pas renvoyer d'informations détaillées sur l'erreur dans les webhooks
    console.error("Webhook error:", error);
    return new Response("Webhook Error", { status: 400 });
  }
}

/**
 * Gestionnaire pour les paiements Stripe réussis
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    // Récupérer l'ID de commande depuis les métadonnées
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      console.error("Pas d'ID de commande dans les métadonnées");
      return apiResponse.success({ received: true });
    }

    // Récupérer la commande
    const order = mockOrders[orderId];

    if (!order) {
      console.error(`Commande ${orderId} non trouvée`);
      return apiResponse.success({ received: true });
    }

    // Mettre à jour le statut de paiement
    order.paymentStatus = PaymentStatus.PAID;

    // Mettre à jour le statut de la commande
    if (order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.PROCESSING;
    }

    // Ajouter des détails de paiement
    order.paymentDetails = {
      id: paymentIntent.id,
      provider: "stripe",
      status: "success",
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convertir de centimes en euros
      currency: paymentIntent.currency,
      method: paymentIntent.payment_method_types[0],
      timestamp: getCurrentDate(),
    };

    // Mettre à jour la date de modification
    order.updatedAt = getCurrentDate();

    // Dans une application réelle, nous sauvegarderions les modifications dans la base de données

    return apiResponse.success({ received: true });
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error);
    return apiResponse.success({ received: true });
  }
}

/**
 * Gestionnaire pour les paiements Stripe échoués
 */
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    // Récupérer l'ID de commande depuis les métadonnées
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      console.error("Pas d'ID de commande dans les métadonnées");
      return apiResponse.success({ received: true });
    }

    // Récupérer la commande
    const order = mockOrders[orderId];

    if (!order) {
      console.error(`Commande ${orderId} non trouvée`);
      return apiResponse.success({ received: true });
    }

    // Mettre à jour le statut de paiement
    order.paymentStatus = PaymentStatus.FAILED;

    // Ajouter des détails de paiement
    order.paymentDetails = {
      id: paymentIntent.id,
      provider: "stripe",
      status: "failed",
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convertir de centimes en euros
      currency: paymentIntent.currency,
      method: paymentIntent.payment_method_types[0],
      timestamp: getCurrentDate(),
    };

    // Mettre à jour la date de modification
    order.updatedAt = getCurrentDate();

    // Dans une application réelle, nous sauvegarderions les modifications dans la base de données

    return apiResponse.success({ received: true });
  } catch (error) {
    console.error("Error handling payment intent failed:", error);
    return apiResponse.success({ received: true });
  }
}

/**
 * Gestionnaire pour les remboursements Stripe
 */
async function handleChargeRefunded(charge) {
  try {
    // Récupérer l'ID de commande depuis les métadonnées
    const paymentIntentId = charge.payment_intent;

    if (!paymentIntentId) {
      console.error("Pas d'ID d'intention de paiement");
      return apiResponse.success({ received: true });
    }

    // Dans une application réelle, nous rechercherions la commande par paymentIntentId
    // Pour cet exemple, nous ne faisons rien

    return apiResponse.success({ received: true });
  } catch (error) {
    console.error("Error handling charge refunded:", error);
    return apiResponse.success({ received: true });
  }
}

/**
 * Gestionnaire pour les paiements PayPal réussis
 */
async function handlePayPalPaymentComplete(paypalPayment) {
  // Logique similaire à handlePaymentIntentSucceeded, adaptée pour PayPal
  return apiResponse.success({ received: true });
}

/**
 * Gestionnaire pour les paiements PayPal échoués
 */
async function handlePayPalPaymentFailed(paypalPayment) {
  // Logique similaire à handlePaymentIntentFailed, adaptée pour PayPal
  return apiResponse.success({ received: true });
}

// OPTIONS pour gérer CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, stripe-signature",
    },
  });
};
