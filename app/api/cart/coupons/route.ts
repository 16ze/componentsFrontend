import { NextRequest } from "next/server";
import {
  validateRequest,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { couponApplySchema } from "../../../../lib/api/validationSchemas";
import { mockCarts, getCurrentDate } from "../../../../lib/api/mockData";

// Liste des codes promo valides (en production, ces données seraient en base de données)
const validCoupons = {
  WELCOME10: {
    type: "percentage",
    value: 10,
    maxAmount: null,
    minCartValue: 0,
    expiresAt: "2025-12-31T23:59:59Z",
  },
  WELCOME20: {
    type: "percentage",
    value: 20,
    maxAmount: 50,
    minCartValue: 100,
    expiresAt: "2025-12-31T23:59:59Z",
  },
  FREESHIP: {
    type: "free_shipping",
    value: null,
    maxAmount: null,
    minCartValue: 0,
    expiresAt: "2025-12-31T23:59:59Z",
  },
  SUMMER5: {
    type: "fixed",
    value: 5,
    maxAmount: null,
    minCartValue: 50,
    expiresAt: "2025-12-31T23:59:59Z",
  },
};

/**
 * POST /api/cart/coupons - Valider et appliquer un code promo
 *
 * Corps de la requête:
 * - code: code de réduction
 */
export const POST = validateRequest(couponApplySchema)(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const couponCode = body.code.toUpperCase();

      // Simulation de récupération de l'ID utilisateur
      const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

      // Récupérer le panier
      const cart = mockCarts[userId];

      // Vérifier si le panier existe
      if (!cart) {
        return apiResponse.notFound("Panier non trouvé");
      }

      // Vérifier si le code promo est valide
      const coupon = validCoupons[couponCode];

      if (!coupon) {
        return apiResponse.badRequest("Code promo invalide");
      }

      // Vérifier si le code promo est expiré
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return apiResponse.badRequest("Code promo expiré");
      }

      // Vérifier si le panier atteint la valeur minimale
      if (coupon.minCartValue > 0 && cart.subtotal < coupon.minCartValue) {
        return apiResponse.badRequest(
          `Ce code promo nécessite un panier d'une valeur minimale de ${coupon.minCartValue}€`
        );
      }

      // Appliquer le code promo au panier
      cart.couponCode = couponCode;

      // Calculer la réduction
      if (coupon.type === "percentage") {
        cart.discount = (cart.subtotal * coupon.value) / 100;

        // Appliquer un montant maximum si défini
        if (coupon.maxAmount && cart.discount > coupon.maxAmount) {
          cart.discount = coupon.maxAmount;
        }
      } else if (coupon.type === "fixed") {
        cart.discount = coupon.value;
      } else if (coupon.type === "free_shipping") {
        cart.shipping = 0;
      }

      // Arrondir la réduction à 2 décimales
      cart.discount = Math.round(cart.discount * 100) / 100;

      // Recalculer le total
      cart.total =
        Math.round(
          (cart.subtotal + cart.tax + cart.shipping - cart.discount) * 100
        ) / 100;

      // Mettre à jour la date
      cart.updatedAt = getCurrentDate();

      // Dans une application réelle, nous sauvegarderions le panier mis à jour
      // Pour cet exemple, nous retournons simplement le panier mis à jour avec la réduction appliquée

      return apiResponse.success({
        cart,
        coupon: {
          code: couponCode,
          type: coupon.type,
          value: coupon.value,
          discount: cart.discount,
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
