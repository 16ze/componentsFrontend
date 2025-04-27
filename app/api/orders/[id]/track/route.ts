import { NextRequest } from "next/server";
import {
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../../lib/api/middleware";
import { mockOrders } from "../../../../../lib/api/mockData";
import { OrderStatus } from "../../../../../lib/types/api";

/**
 * GET /api/orders/[id]/track - Récupérer les informations de suivi d'une commande
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

      // Vérifier si l'utilisateur est autorisé à suivre cette commande
      if (order.userId !== userId && userRole !== "admin") {
        return apiResponse.forbidden(
          "Vous n'êtes pas autorisé à suivre cette commande"
        );
      }

      // Vérifier si la commande a un numéro de suivi
      if (!order.trackingNumber && order.status !== OrderStatus.SHIPPED) {
        return apiResponse.badRequest(
          "Cette commande n'a pas encore été expédiée"
        );
      }

      // Dans une application réelle, nous interrogerions l'API du transporteur pour obtenir les informations de suivi
      // Pour cet exemple, nous générons des informations de suivi fictives

      // Déterminer les événements de suivi en fonction du statut de la commande
      const trackingEvents = generateTrackingEvents(order);

      return apiResponse.success({
        order: {
          id: order.id,
          status: order.status,
          trackingNumber: order.trackingNumber || "Non disponible",
          carrier: "Transporteur XYZ",
        },
        tracking: {
          events: trackingEvents,
          estimatedDelivery: getEstimatedDelivery(order),
          url: order.trackingNumber
            ? `https://example.com/track/${order.trackingNumber}`
            : null,
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/**
 * Fonction utilitaire pour générer des événements de suivi fictifs
 */
function generateTrackingEvents(order) {
  const events = [];
  const orderDate = new Date(order.createdAt);

  // Commande créée
  events.push({
    date: order.createdAt,
    status: "Commande reçue",
    location: "En ligne",
  });

  // Commande traitée
  if (
    order.status !== OrderStatus.PENDING &&
    order.status !== OrderStatus.CANCELLED
  ) {
    const processedDate = new Date(orderDate);
    processedDate.setHours(processedDate.getHours() + 12);

    events.push({
      date: processedDate.toISOString(),
      status: "Commande traitée",
      location: "Centre de distribution",
    });
  }

  // Commande expédiée
  if (
    order.status === OrderStatus.SHIPPED ||
    order.status === OrderStatus.DELIVERED
  ) {
    const shippedDate = new Date(orderDate);
    shippedDate.setHours(shippedDate.getHours() + 36);

    events.push({
      date: shippedDate.toISOString(),
      status: "Commande expédiée",
      location: "Centre de distribution",
    });

    // En transit
    const transitDate = new Date(shippedDate);
    transitDate.setHours(transitDate.getHours() + 24);

    events.push({
      date: transitDate.toISOString(),
      status: "En transit",
      location: "Centre de tri régional",
    });
  }

  // Commande livrée
  if (order.status === OrderStatus.DELIVERED) {
    const deliveredDate = new Date(orderDate);
    deliveredDate.setDate(deliveredDate.getDate() + 3);

    events.push({
      date: deliveredDate.toISOString(),
      status: "Commande livrée",
      location: "Adresse de livraison",
    });
  }

  // Trier les événements par date (du plus récent au plus ancien)
  events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return events;
}

/**
 * Fonction utilitaire pour générer une date de livraison estimée
 */
function getEstimatedDelivery(order) {
  if (order.status === OrderStatus.DELIVERED) {
    return null; // Déjà livrée
  }

  if (order.status === OrderStatus.CANCELLED) {
    return null; // Annulée
  }

  const orderDate = new Date(order.createdAt);
  const estimatedDate = new Date(orderDate);
  estimatedDate.setDate(estimatedDate.getDate() + 5); // Livraison estimée dans 5 jours

  return estimatedDate.toISOString();
}

// OPTIONS pour gérer CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
