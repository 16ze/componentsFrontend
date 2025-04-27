import { NextRequest } from "next/server";
import {
  validateRequest,
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { reviewSchema } from "../../../../lib/api/validationSchemas";
import {
  mockProducts,
  generateId,
  getCurrentDate,
} from "../../../../lib/api/mockData";

// Avis mockés (en production, ces données seraient en base de données)
const mockReviews = {
  user1: [
    {
      id: "rev1",
      userId: "user1",
      productId: "prod1",
      rating: 4,
      title: "Très bon produit",
      comment: "Je suis très satisfait de ce produit, il répond à mes attentes",
      createdAt: "2023-09-10T11:25:00Z",
      updatedAt: "2023-09-10T11:25:00Z",
    },
    {
      id: "rev2",
      userId: "user1",
      productId: "prod3",
      rating: 5,
      title: "Excellent",
      comment: "Parfait en tout point, je recommande vivement",
      createdAt: "2023-10-05T16:40:00Z",
      updatedAt: "2023-10-05T16:40:00Z",
    },
  ],
};

/**
 * GET /api/account/reviews - Récupérer tous les avis de l'utilisateur
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Récupérer l'ID utilisateur depuis le token JWT
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Récupérer les avis de l'utilisateur
    const userReviews = mockReviews[userId] || [];

    // Récupérer les détails des produits pour chaque avis
    const reviewsWithProducts = userReviews.map((review) => {
      const product = mockProducts.find((p) => p.id === review.productId);
      return {
        ...review,
        product: product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: product.image,
            }
          : null,
      };
    });

    return apiResponse.success({ reviews: reviewsWithProducts });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/account/reviews - Ajouter ou mettre à jour un avis
 *
 * Corps de la requête:
 * - productId: ID du produit évalué
 * - rating: Note (1-5)
 * - title: Titre de l'avis
 * - comment: Commentaire détaillé
 */
export const POST = withAuth(
  validateRequest(reviewSchema)(async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

      // Vérifier si le produit existe
      const product = mockProducts.find((p) => p.id === body.productId);

      if (!product) {
        return apiResponse.notFound("Produit non trouvé");
      }

      // Récupérer ou initialiser la liste d'avis de l'utilisateur
      if (!mockReviews[userId]) {
        mockReviews[userId] = [];
      }

      // Vérifier si l'utilisateur a déjà donné un avis pour ce produit
      const existingReviewIndex = mockReviews[userId].findIndex(
        (review) => review.productId === body.productId
      );

      const now = getCurrentDate();

      if (existingReviewIndex !== -1) {
        // Mettre à jour l'avis existant
        const existingReview = mockReviews[userId][existingReviewIndex];
        mockReviews[userId][existingReviewIndex] = {
          ...existingReview,
          rating: body.rating,
          title: body.title,
          comment: body.comment,
          updatedAt: now,
        };

        return apiResponse.success({
          review: {
            ...mockReviews[userId][existingReviewIndex],
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: product.image,
            },
          },
          message: "Avis mis à jour avec succès",
        });
      } else {
        // Créer un nouvel avis
        const newReview = {
          id: generateId(),
          userId,
          productId: body.productId,
          rating: body.rating,
          title: body.title,
          comment: body.comment,
          createdAt: now,
          updatedAt: now,
        };

        mockReviews[userId].push(newReview);

        return apiResponse.success({
          review: {
            ...newReview,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: product.image,
            },
          },
          message: "Avis ajouté avec succès",
        });
      }
    } catch (error) {
      return handleApiError(error);
    }
  })
);

/**
 * DELETE /api/account/reviews - Supprimer un avis
 *
 * Corps de la requête:
 * - reviewId: ID de l'avis à supprimer
 */
export const DELETE = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Récupérer l'ID utilisateur depuis le token JWT
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Vérifier si l'utilisateur a des avis
    if (!mockReviews[userId] || mockReviews[userId].length === 0) {
      return apiResponse.notFound("Aucun avis trouvé pour cet utilisateur");
    }

    // Trouver l'index de l'avis
    const reviewIndex = mockReviews[userId].findIndex(
      (review) => review.id === body.reviewId
    );

    // Vérifier si l'avis existe
    if (reviewIndex === -1) {
      return apiResponse.notFound("Avis non trouvé");
    }

    // Supprimer l'avis
    mockReviews[userId].splice(reviewIndex, 1);

    return apiResponse.success({ message: "Avis supprimé avec succès" });
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
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
