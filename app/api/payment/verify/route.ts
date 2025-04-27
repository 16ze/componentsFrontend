import { NextRequest } from "next/server";
import {
  validateRequest,
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { paymentVerifySchema } from "../../../../lib/api/validationSchemas";
import { mockOrders, getCurrentDate } from "../../../../lib/api/mockData";
import { OrderStatus, PaymentStatus } from "../../../../lib/types/api";

/**
 * POST /api/payment/verify - Vérifier un paiement 3D Secure
 *
 * Corps de la requête:
 * - paymentIntentId: ID de l'intention de paiement
 * - orderId: ID de la commande
 */
export const POST = withAuth(
  validateRequest(paymentVerifySchema)(async (req: NextRequest) => {
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

      // Vérifier si l'utilisateur est autorisé à vérifier cette commande
      if (order.userId !== userId) {
        return apiResponse.forbidden(
          "Vous n'êtes pas autorisé à vérifier cette commande"
        );
      }

      // Dans une application réelle, nous vérifierions l'état de l'intention de paiement auprès de Stripe
      // Pour cet exemple, nous simulons une vérification réussie

      // Simuler les chances de succès (90% de réussite)
      const isSuccess = Math.random() < 0.9;

      if (isSuccess) {
        // Paiement réussi

        // Mettre à jour le statut de paiement
        order.paymentStatus = PaymentStatus.PAID;

        // Mettre à jour le statut de la commande
        if (order.status === OrderStatus.PENDING) {
          order.status = OrderStatus.PROCESSING;
        }

        // Ajouter des détails de paiement
        order.paymentDetails = {
          id: body.paymentIntentId,
          provider: "stripe",
          status: "success",
          transactionId: body.paymentIntentId,
          amount: order.total,
          currency: "EUR",
          method: "card",
          timestamp: getCurrentDate(),
        };

        // Mettre à jour la date de modification
        order.updatedAt = getCurrentDate();

        // Dans une application réelle, nous sauvegarderions les modifications dans la base de données

        return apiResponse.success({
          success: true,
          order,
          payment: {
            status: "success",
            message: "Paiement vérifié avec succès",
          },
        });
      } else {
        // Paiement échoué

        // Mettre à jour le statut de paiement
        order.paymentStatus = PaymentStatus.FAILED;

        // Ajouter des détails de paiement
        order.paymentDetails = {
          id: body.paymentIntentId,
          provider: "stripe",
          status: "failed",
          transactionId: body.paymentIntentId,
          amount: order.total,
          currency: "EUR",
          method: "card",
          timestamp: getCurrentDate(),
        };

        // Mettre à jour la date de modification
        order.updatedAt = getCurrentDate();

        // Dans une application réelle, nous sauvegarderions les modifications dans la base de données

        return apiResponse.success({
          success: false,
          order,
          payment: {
            status: "failed",
            message: "La vérification 3D Secure a échoué",
          },
        });
      }
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
