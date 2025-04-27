import { NextRequest } from "next/server";
import {
  validateRequest,
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { paymentIntentCreateSchema } from "../../../../lib/api/validationSchemas";
import { mockOrders, getCurrentDate } from "../../../../lib/api/mockData";

/**
 * POST /api/payment/create-intent - Créer une intention de paiement Stripe
 *
 * Corps de la requête:
 * - orderId: ID de la commande
 * - paymentMethod: méthode de paiement
 */
export const POST = withAuth(
  validateRequest(paymentIntentCreateSchema)(async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.headers.get("X-User-ID");

      // Récupérer la commande
      const order = mockOrders[body.orderId];

      // Vérifier si la commande existe
      if (!order) {
        return apiResponse.notFound("Commande non trouvée");
      }

      // Vérifier si l'utilisateur est autorisé à payer cette commande
      if (order.userId !== userId) {
        return apiResponse.forbidden(
          "Vous n'êtes pas autorisé à payer cette commande"
        );
      }

      // Dans une application réelle, nous utiliserions l'API Stripe pour créer un PaymentIntent
      // Pour cet exemple, nous simulons une réponse Stripe

      // Générer un ID pour l'intention de paiement
      const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 9)}`;

      // Simuler une réponse Stripe
      const stripeResponse = {
        id: paymentIntentId,
        object: "payment_intent",
        amount: Math.round(order.total * 100), // Stripe utilise les montants en centimes
        currency: "eur",
        customer: userId,
        payment_method: body.paymentMethod,
        status: "requires_confirmation",
        client_secret: `${paymentIntentId}_secret_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        created: Date.now(),
        metadata: {
          orderId: order.id,
        },
      };

      return apiResponse.success({
        paymentIntent: stripeResponse,
      });
    } catch (error) {
      return handleApiError(error);
    }
  })
);

// OPTIONS pour gérer CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
