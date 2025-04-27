import { NextRequest } from "next/server";
import {
  validateRequest,
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { checkoutInitSchema } from "../../../../lib/api/validationSchemas";
import {
  mockCarts,
  mockOrders,
  generateId,
  getCurrentDate,
} from "../../../../lib/api/mockData";
import { OrderStatus, PaymentStatus } from "../../../../lib/types/api";

/**
 * POST /api/cart/checkout - Initialiser le processus de checkout
 *
 * Corps de la requête:
 * - shippingAddress: adresse de livraison
 * - billingAddress: adresse de facturation (optionnel, utilise shippingAddress si non fourni)
 * - sameAsBilling: si l'adresse de facturation est identique à l'adresse de livraison
 * - shippingMethod: méthode de livraison
 * - paymentMethod: méthode de paiement
 */
export const POST = withAuth(
  validateRequest(checkoutInitSchema)(async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

      // Récupérer le panier
      const cart = mockCarts[userId];

      // Vérifier si le panier existe et a des articles
      if (!cart || cart.items.length === 0) {
        return apiResponse.badRequest("Le panier est vide");
      }

      // Déterminer l'adresse de facturation
      const billingAddress = body.sameAsBilling
        ? body.shippingAddress
        : body.billingAddress || body.shippingAddress;

      // Générer un nouvel ID pour la commande
      const orderId = generateId();

      // Créer une commande préliminaire
      const order = {
        id: orderId,
        userId,
        items: [...cart.items], // Copie des articles du panier
        shippingAddress: body.shippingAddress,
        billingAddress,
        paymentMethod: body.paymentMethod,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        total: cart.total,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };

      // Dans une application réelle, nous sauvegarderions la commande dans la base de données
      // Pour cet exemple, nous retournons simplement la commande préliminaire

      // Retourner la commande avec un identifiant de session de paiement
      return apiResponse.success({
        order,
        checkoutSession: {
          id: `checkout_${orderId}`,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Expire dans 30 minutes
        },
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
