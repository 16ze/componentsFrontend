import { NextRequest } from "next/server";
import {
  validateRequest,
  apiResponse,
  handleApiError,
} from "../../../../../lib/api/middleware";
import { cartItemUpdateSchema } from "../../../../../lib/api/validationSchemas";
import { mockCarts, getCurrentDate } from "../../../../../lib/api/mockData";

/**
 * PATCH /api/cart/items/[id] - Mettre à jour la quantité d'un produit dans le panier
 *
 * Corps de la requête:
 * - quantity: nouvelle quantité
 */
export const PATCH = validateRequest(cartItemUpdateSchema)(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const itemId = params.id;
      const body = await req.json();

      // Simulation de récupération de l'ID utilisateur
      const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

      // Récupérer le panier
      const cart = mockCarts[userId];

      // Vérifier si le panier existe
      if (!cart) {
        return apiResponse.notFound("Panier non trouvé");
      }

      // Rechercher l'élément du panier
      const itemIndex = cart.items.findIndex((item) => item.id === itemId);

      // Vérifier si l'élément existe
      if (itemIndex === -1) {
        return apiResponse.notFound("Élément du panier non trouvé");
      }

      // Mettre à jour la quantité
      cart.items[itemIndex].quantity = body.quantity;

      // Recalculer les totaux
      calculateCartTotals(cart);

      // Mettre à jour la date
      cart.updatedAt = getCurrentDate();

      // Dans une application réelle, nous sauvegarderions le panier mis à jour
      // Pour cet exemple, nous retournons simplement le panier mis à jour

      return apiResponse.success(cart);
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/**
 * DELETE /api/cart/items/[id] - Supprimer un produit du panier
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;

    // Simulation de récupération de l'ID utilisateur
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Récupérer le panier
    const cart = mockCarts[userId];

    // Vérifier si le panier existe
    if (!cart) {
      return apiResponse.notFound("Panier non trouvé");
    }

    // Rechercher l'élément du panier
    const itemIndex = cart.items.findIndex((item) => item.id === itemId);

    // Vérifier si l'élément existe
    if (itemIndex === -1) {
      return apiResponse.notFound("Élément du panier non trouvé");
    }

    // Supprimer l'élément
    cart.items.splice(itemIndex, 1);

    // Recalculer les totaux
    calculateCartTotals(cart);

    // Mettre à jour la date
    cart.updatedAt = getCurrentDate();

    // Dans une application réelle, nous sauvegarderions le panier mis à jour
    // Pour cet exemple, nous retournons simplement le panier mis à jour

    return apiResponse.success(cart);
  } catch (error) {
    return handleApiError(error);
  }
}

// Fonction utilitaire pour calculer les totaux du panier
function calculateCartTotals(cart) {
  // Calculer le sous-total
  cart.subtotal = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Calculer la TVA (20% par défaut)
  cart.tax = Math.round(cart.subtotal * 0.2 * 100) / 100;

  // Calculer les frais de livraison (gratuits au-dessus de 50€, sinon 5.99€)
  cart.shipping = cart.subtotal > 50 ? 0 : 5.99;

  // Appliquer la réduction (si un code de réduction est présent)
  if (cart.couponCode) {
    // Simuler une réduction (pour un code de réduction existant)
    cart.discount = Math.min(50, Math.round(cart.subtotal * 0.1 * 100) / 100);
  } else {
    cart.discount = 0;
  }

  // Calculer le total
  cart.total =
    Math.round(
      (cart.subtotal + cart.tax + cart.shipping - cart.discount) * 100
    ) / 100;

  return cart;
}

// OPTIONS pour gérer CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
