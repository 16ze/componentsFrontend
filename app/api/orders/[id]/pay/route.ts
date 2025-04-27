import { NextRequest } from "next/server";
import {
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../../lib/api/middleware";
import { mockOrders, getCurrentDate } from "../../../../../lib/api/mockData";
import { PaymentStatus } from "../../../../../lib/types/api";

/**
 * POST /api/orders/[id]/pay - Traiter le paiement d'une commande
 *
 * Corps de la requête:
 * - paymentMethodId: ID de la méthode de paiement
 * - savePaymentMethod: sauvegarder la méthode de paiement (optionnel)
 */
export const POST = withAuth(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const orderId = params.id;
      const body = await req.json();

      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.headers.get("X-User-ID");

      // Récupérer la commande
      const order = mockOrders[orderId];

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

      // Vérifier si la commande est déjà payée
      if (order.paymentStatus === PaymentStatus.PAID) {
        return apiResponse.badRequest("Cette commande est déjà payée");
      }

      // Dans une application réelle, nous traiterions le paiement avec Stripe, PayPal, etc.
      // Pour cet exemple, nous simulons un paiement réussi

      // Mettre à jour le statut de paiement
      order.paymentStatus = PaymentStatus.PAID;

      // Ajouter des détails de paiement
      order.paymentDetails = {
        id: `pay_${Math.random().toString(36).substr(2, 9)}`,
        provider: "stripe", // ou 'paypal', etc.
        status: "success",
        transactionId: `tx_${Math.random().toString(36).substr(2, 9)}`,
        amount: order.total,
        currency: "EUR",
        method: body.paymentMethodId,
        timestamp: getCurrentDate(),
      };

      // Mettre à jour la date de modification
      order.updatedAt = getCurrentDate();

      // Dans une application réelle, nous sauvegarderions les modifications dans la base de données

      return apiResponse.success({
        order,
        payment: {
          status: "success",
          message: "Paiement traité avec succès",
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
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
