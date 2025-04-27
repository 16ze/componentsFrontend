import { NextRequest } from "next/server";
import {
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../../lib/api/middleware";
import { mockOrders, getCurrentDate } from "../../../../../lib/api/mockData";
import { OrderStatus, PaymentStatus } from "../../../../../lib/types/api";

/**
 * POST /api/orders/[id]/cancel - Annuler une commande
 */
export const POST = withAuth(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const orderId = params.id;
      const body = await req.json();

      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.headers.get("X-User-ID");
      const userRole = req.headers.get("X-User-Role");

      // Récupérer la commande
      const order = mockOrders[orderId];

      // Vérifier si la commande existe
      if (!order) {
        return apiResponse.notFound("Commande non trouvée");
      }

      // Vérifier si l'utilisateur est autorisé à annuler cette commande
      if (order.userId !== userId && userRole !== "admin") {
        return apiResponse.forbidden(
          "Vous n'êtes pas autorisé à annuler cette commande"
        );
      }

      // Vérifier si la commande peut être annulée
      if (
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED
      ) {
        return apiResponse.badRequest(
          "Cette commande ne peut pas être annulée car elle a déjà été expédiée ou livrée"
        );
      }

      if (order.status === OrderStatus.CANCELLED) {
        return apiResponse.badRequest("Cette commande est déjà annulée");
      }

      // Mettre à jour le statut
      order.status = OrderStatus.CANCELLED;

      // Ajouter la raison d'annulation si fournie
      if (body.reason) {
        order.cancellationReason = body.reason;
      }

      // Si la commande était payée, mettre à jour le statut de paiement pour un remboursement
      if (order.paymentStatus === PaymentStatus.PAID) {
        order.paymentStatus = PaymentStatus.REFUNDED;

        // Dans une application réelle, nous effectuerions un remboursement via Stripe, PayPal, etc.
        // et mettrions à jour les détails de paiement
        if (order.paymentDetails) {
          order.paymentDetails.status = "refunded";
        }
      }

      // Mettre à jour la date de modification
      order.updatedAt = getCurrentDate();

      // Dans une application réelle, nous sauvegarderions les modifications dans la base de données

      return apiResponse.success({
        order,
        cancellation: {
          status: "success",
          message: "Commande annulée avec succès",
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
