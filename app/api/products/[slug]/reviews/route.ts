import { NextRequest, NextResponse } from "next/server";
import {
  validateRequest,
  withAuth,
  apiResponse,
  handleApiError,
  rateLimit,
} from "../../../../../lib/api/middleware";
import { reviewCreateSchema } from "../../../../../lib/api/validationSchemas";
import {
  mockProducts,
  mockReviews,
  generateId,
  getCurrentDate,
} from "../../../../../lib/api/mockData";
import { Review, ApiResponse } from "../../../../../lib/types/api";

/**
 * GET /api/products/[slug]/reviews - Récupérer les avis d'un produit
 *
 * Paramètres de requête:
 * - page: numéro de page (par défaut: 1)
 * - limit: nombre d'éléments par page (par défaut: 10)
 * - sort: tri (newest, highest-rating, lowest-rating)
 */
export const GET = rateLimit(
  50,
  60 * 1000
)(async (req: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const productSlug = params.slug;

    // Chercher le produit par slug
    const product = mockProducts.find((p) => p.slug === productSlug);

    // Vérifier si le produit existe
    if (!product) {
      return apiResponse.notFound("Produit non trouvé");
    }

    // Paramètres de pagination et tri
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const sort = url.searchParams.get("sort") || "newest";

    // Récupérer les avis du produit
    const productReviews = mockReviews[product.id] || [];

    // Trier les avis
    let sortedReviews = [...productReviews];

    switch (sort) {
      case "newest":
        sortedReviews.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "highest-rating":
        sortedReviews.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest-rating":
        sortedReviews.sort((a, b) => a.rating - b.rating);
        break;
      default:
        sortedReviews.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

    // Calculer les métriques des notes
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    productReviews.forEach((review) => {
      ratingCounts[review.rating] += 1;
    });

    // Calculer la note moyenne
    const totalRating = productReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating =
      productReviews.length > 0 ? totalRating / productReviews.length : 0;

    return apiResponse.success({
      reviews: paginatedReviews,
      pagination: {
        page,
        limit,
        totalItems: sortedReviews.length,
        totalPages: Math.ceil(sortedReviews.length / limit),
      },
      metrics: {
        totalReviews: productReviews.length,
        averageRating,
        ratingCounts,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/products/[slug]/reviews - Ajouter un avis sur un produit
 *
 * Corps de la requête: voir reviewCreateSchema
 */
export const POST = withAuth(
  validateRequest(reviewCreateSchema)(
    async (req: NextRequest, { params }: { params: { slug: string } }) => {
      try {
        const productSlug = params.slug;
        const body = await req.json();

        // Récupérer l'ID utilisateur depuis le token JWT
        const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests
        const userName = req.headers.get("X-User-Name") || "Utilisateur"; // Fallback pour les tests

        // Chercher le produit par slug
        const product = mockProducts.find((p) => p.slug === productSlug);

        // Vérifier si le produit existe
        if (!product) {
          return apiResponse.notFound("Produit non trouvé");
        }

        // Vérifier si l'utilisateur a déjà donné un avis sur ce produit
        const existingReviews = mockReviews[product.id] || [];
        const hasReviewed = existingReviews.some(
          (review) => review.userId === userId
        );

        if (hasReviewed) {
          return apiResponse.badRequest(
            "Vous avez déjà publié un avis sur ce produit"
          );
        }

        // Créer le nouvel avis
        const now = getCurrentDate();
        const newReview: Review = {
          id: generateId(),
          productId: product.id,
          userId,
          userName,
          rating: body.rating,
          title: body.title,
          content: body.content,
          isVerifiedPurchase: false, // Dans un système réel, nous vérifierions si l'utilisateur a acheté le produit
          createdAt: now,
          updatedAt: now,
        };

        // Ajouter l'avis au produit
        if (!mockReviews[product.id]) {
          mockReviews[product.id] = [];
        }

        mockReviews[product.id].push(newReview);

        // Mettre à jour la note moyenne et le nombre d'avis du produit
        const totalRating = mockReviews[product.id].reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating = totalRating / mockReviews[product.id].length;

        // Dans un système réel, nous mettrions à jour le produit dans la base de données
        // Pour cet exemple, nous simulerons cette mise à jour
        const productIndex = mockProducts.findIndex((p) => p.id === product.id);
        if (productIndex !== -1) {
          mockProducts[productIndex].rating = averageRating;
          mockProducts[productIndex].numReviews =
            mockReviews[product.id].length;
        }

        // Retourner une réponse avec statut 201 (Created)
        const responseData = {
          success: true,
          data: {
            review: newReview,
            message: "Avis ajouté avec succès",
          },
        };

        return NextResponse.json(responseData, { status: 201 });
      } catch (error) {
        return handleApiError(error);
      }
    }
  )
);

/**
 * DELETE /api/products/[slug]/reviews/[reviewId] - Supprimer un avis (pour une version future)
 * Le paramètre reviewId serait ajouté à l'URL pour cette méthode
 */

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
