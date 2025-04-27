import { NextRequest } from "next/server";
import {
  apiResponse,
  handleApiError,
  rateLimit,
} from "../../../../lib/api/middleware";
import { mockCategories } from "../../../../lib/api/mockData";

/**
 * GET /api/products/categories - Récupérer la hiérarchie des catégories
 */
export const GET = rateLimit(
  50,
  60 * 1000
)(async (req: NextRequest) => {
  try {
    // Récupérer toutes les catégories
    // Pour cet exemple, nous utilisons des données mockées
    const categories = mockCategories;

    return apiResponse.success({ categories });
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
