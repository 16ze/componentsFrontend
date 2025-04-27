import { NextRequest } from "next/server";
import {
  apiResponse,
  handleApiError,
  rateLimit,
} from "../../../../lib/api/middleware";
import { mockProducts } from "../../../../lib/api/mockData";

/**
 * GET /api/products/featured - Récupérer les produits mis en avant
 *
 * Paramètres de requête:
 * - limit: nombre d'éléments à récupérer (par défaut: 6)
 */
export const GET = rateLimit(
  50,
  60 * 1000
)(async (req: NextRequest) => {
  try {
    // Récupérer les paramètres de requête
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "6", 10);

    // Filtrer les produits mis en avant
    const featuredProducts = mockProducts.filter(
      (product) => product.isFeatured
    );

    // Limiter le nombre de produits
    const limitedProducts = featuredProducts.slice(0, limit);

    return apiResponse.success({ products: limitedProducts });
  } catch (error) {
    return handleApiError(error);
  }
});

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
