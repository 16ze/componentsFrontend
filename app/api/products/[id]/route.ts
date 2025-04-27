import { NextRequest } from "next/server";
import {
  validateRequest,
  withAdmin,
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { productUpdateSchema } from "../../../../lib/api/validationSchemas";
import { mockProducts, getCurrentDate } from "../../../../lib/api/mockData";
import { Product } from "../../../../lib/types/api";

/**
 * GET /api/products/[id] - Récupérer les détails d'un produit par son ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Chercher le produit par ID ou slug
    const product = mockProducts.find(
      (p) => p.id === productId || p.slug === productId
    );

    // Vérifier si le produit existe
    if (!product) {
      return apiResponse.notFound("Produit non trouvé");
    }

    return apiResponse.success(product);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/products/[id] - Mettre à jour un produit (admin seulement)
 */
export const PUT = withAdmin(
  validateRequest(productUpdateSchema)(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
      try {
        const productId = params.id;
        const body = await req.json();

        // Chercher le produit par ID
        const productIndex = mockProducts.findIndex((p) => p.id === productId);

        // Vérifier si le produit existe
        if (productIndex === -1) {
          return apiResponse.notFound("Produit non trouvé");
        }

        // Récupérer le produit existant
        const existingProduct = mockProducts[productIndex];

        // Mettre à jour le produit
        const updatedProduct: Product = {
          ...existingProduct,
          ...body,
          updatedAt: getCurrentDate(),
        };

        // Conserver l'ID et la date de création
        updatedProduct.id = existingProduct.id;
        updatedProduct.createdAt = existingProduct.createdAt;

        // Dans un environnement réel, nous mettrions à jour le produit dans la base de données
        // Pour cet exemple, nous retournons simplement le produit mis à jour

        return apiResponse.success(updatedProduct);
      } catch (error) {
        return handleApiError(error);
      }
    }
  )
);

/**
 * DELETE /api/products/[id] - Supprimer un produit (admin seulement)
 */
export const DELETE = withAdmin(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const productId = params.id;

      // Chercher le produit par ID
      const productIndex = mockProducts.findIndex((p) => p.id === productId);

      // Vérifier si le produit existe
      if (productIndex === -1) {
        return apiResponse.notFound("Produit non trouvé");
      }

      // Dans un environnement réel, nous supprimerions le produit de la base de données
      // Pour cet exemple, nous retournons simplement un message de succès

      return apiResponse.success({
        message: "Produit supprimé avec succès",
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
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
