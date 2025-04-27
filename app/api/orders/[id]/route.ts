import { NextRequest } from "next/server";
import {
  validateRequest,
  withAuth,
  withAdmin,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { orderStatusUpdateSchema } from "../../../../lib/api/validationSchemas";
import { mockOrders, getCurrentDate } from "../../../../lib/api/mockData";

/**
 * GET /api/orders/[id] - Récupérer les détails d'une commande
 */
export const GET = withAuth(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const orderId = params.id;

      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.headers.get("X-User-ID");
      const userRole = req.headers.get("X-User-Role");

      // Récupérer la commande
      const order = mockOrders[orderId];

      // Vérifier si la commande existe
      if (!order) {
        return apiResponse.notFound("Commande non trouvée");
      }

      // Vérifier si l'utilisateur est autorisé à accéder à cette commande
      if (order.userId !== userId && userRole !== "admin") {
        return apiResponse.forbidden(
          "Vous n'êtes pas autorisé à accéder à cette commande"
        );
      }

      return apiResponse.success(order);
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/**
 * PUT /api/orders/[id] - Mettre à jour le statut d'une commande (admin seulement)
 *
 * Corps de la requête:
 * - status: nouveau statut de la commande
 */
export const PUT = withAdmin(
  validateRequest(orderStatusUpdateSchema)(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
      try {
        const orderId = params.id;
        const body = await req.json();

        // Récupérer la commande
        const order = mockOrders[orderId];

        // Vérifier si la commande existe
        if (!order) {
          return apiResponse.notFound("Commande non trouvée");
        }

        // Mettre à jour le statut
        order.status = body.status;

        // Mettre à jour la date de modification
        order.updatedAt = getCurrentDate();

        // Dans une application réelle, nous sauvegarderions les modifications dans la base de données

        return apiResponse.success(order);
      } catch (error) {
        return handleApiError(error);
      }
    }
  )
);

// OPTIONS pour gérer CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
