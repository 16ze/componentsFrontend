import { NextRequest } from "next/server";
import {
  validateRequest,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { shippingOptionsQuerySchema } from "../../../../lib/api/validationSchemas";

/**
 * GET /api/cart/shipping - Récupérer les options de livraison et calculer les frais
 *
 * Paramètres de requête:
 * - countryCode: code pays ISO à 2 lettres
 * - postalCode: code postal
 * - items: liste des articles (sku + quantité)
 */
export const GET = validateRequest(shippingOptionsQuerySchema)(
  async (req: NextRequest) => {
    try {
      // Récupérer les paramètres de requête
      const url = new URL(req.url);
      const countryCode = url.searchParams.get("countryCode") || "";
      const postalCode = url.searchParams.get("postalCode") || "";
      const items = JSON.parse(url.searchParams.get("items") || "[]");

      // Valider les paramètres
      if (!countryCode || !postalCode || !items.length) {
        return apiResponse.badRequest("Paramètres de requête invalides");
      }

      // Calculer la valeur totale des articles
      const cartValue = items.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0
      );

      // Options de livraison en fonction du pays
      const shippingOptions = getShippingOptionsByCountry(
        countryCode,
        cartValue
      );

      return apiResponse.success({ shippingOptions });
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/**
 * Fonction utilitaire pour obtenir les options de livraison en fonction du pays
 */
function getShippingOptionsByCountry(countryCode, cartValue) {
  // Options de base disponibles pour tous les pays
  const options = [
    {
      id: "standard",
      name: "Livraison standard",
      price: cartValue > 50 ? 0 : 5.99,
      estimatedDays: "3-5",
      isFree: cartValue > 50,
    },
  ];

  // Ajouter des options spécifiques en fonction du pays
  switch (countryCode.toUpperCase()) {
    case "FR":
      options.push(
        {
          id: "express",
          name: "Livraison express",
          price: 9.99,
          estimatedDays: "1-2",
          isFree: false,
        },
        {
          id: "pickup",
          name: "Point relais",
          price: 3.99,
          estimatedDays: "2-4",
          isFree: cartValue > 100,
        }
      );
      break;
    case "BE":
    case "LU":
    case "DE":
    case "NL":
      options.push({
        id: "express",
        name: "Livraison express",
        price: 12.99,
        estimatedDays: "1-3",
        isFree: false,
      });
      break;
    case "GB":
      options.push({
        id: "express",
        name: "Livraison express",
        price: 14.99,
        estimatedDays: "2-3",
        isFree: false,
      });
      break;
    default:
      options.push({
        id: "international",
        name: "Livraison internationale",
        price: 19.99,
        estimatedDays: "5-10",
        isFree: cartValue > 200,
      });
  }

  return options;
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
