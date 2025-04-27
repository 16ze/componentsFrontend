import { NextRequest } from "next/server";
import {
  validateRequest,
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../lib/api/middleware";
import { orderCreateSchema } from "../../../lib/api/validationSchemas";
import {
  mockOrders,
  mockCarts,
  generateId,
  getCurrentDate,
} from "../../../lib/api/mockData";
import { OrderStatus, PaymentStatus } from "../../../lib/types/api";

/**
 * GET /api/orders - Récupérer l'historique des commandes de l'utilisateur
 *
 * Paramètres de requête:
 * - page: numéro de page (par défaut: 1)
 * - limit: nombre d'éléments par page (par défaut: 10)
 * - status: filtrer par statut
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Récupérer l'ID utilisateur depuis le token JWT
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Récupérer les paramètres de requête
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const status = url.searchParams.get("status");

    // Obtenir toutes les commandes de l'utilisateur
    let userOrders = Object.values(mockOrders).filter(
      (order) => order.userId === userId
    );

    // Filtrer par statut si spécifié
    if (status) {
      userOrders = userOrders.filter((order) => order.status === status);
    }

    // Trier par date de création (plus récentes en premier)
    userOrders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Calculer la pagination
    const totalItems = userOrders.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalItems);

    // Sélectionner les commandes pour la page courante
    const paginatedOrders = userOrders.slice(startIndex, endIndex);

    return apiResponse.success(
      { orders: paginatedOrders },
      {
        pagination: {
          total: totalItems,
          pageSize: limit,
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/orders - Créer une nouvelle commande
 *
 * Corps de la requête:
 * - shippingAddress: adresse de livraison
 * - billingAddress: adresse de facturation
 * - paymentMethod: méthode de paiement
 * - shippingMethod: méthode de livraison
 * - couponCode: code de réduction (optionnel)
 * - notes: notes pour la commande (optionnel)
 */
export const POST = withAuth(
  validateRequest(orderCreateSchema)(async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

      // Récupérer le panier de l'utilisateur
      const cart = mockCarts[userId];

      // Vérifier si le panier existe et n'est pas vide
      if (!cart || cart.items.length === 0) {
        return apiResponse.badRequest(
          "Le panier est vide. Impossible de créer une commande."
        );
      }

      // Générer un nouvel ID pour la commande
      const orderId = generateId();

      // Créer la commande
      const newOrder = {
        id: orderId,
        userId,
        items: [...cart.items], // Copie des articles du panier
        shippingAddress: body.shippingAddress,
        billingAddress: body.billingAddress,
        paymentMethod: body.paymentMethod,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        total: cart.total,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        notes: body.notes,
        couponCode: body.couponCode || cart.couponCode,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };

      // Dans une application réelle, nous sauvegarderions la commande dans la base de données
      // et viderions le panier après la création de la commande

      // Simuler l'ajout de la commande aux commandes mockées
      mockOrders[orderId] = newOrder;

      // Retourner la commande créée
      const response = new Response(
        JSON.stringify({
          success: true,
          data: newOrder,
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response;
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
