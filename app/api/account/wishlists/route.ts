import { NextRequest } from "next/server";
import {
  validateRequest,
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { wishlistAddSchema } from "../../../../lib/api/validationSchemas";
import {
  mockProducts,
  generateId,
  getCurrentDate,
} from "../../../../lib/api/mockData";

// Liste de souhaits mockées (en production, ces données seraient en base de données)
const mockWishlists = {
  user1: {
    id: "wishlist1",
    userId: "user1",
    items: [
      {
        id: "wish1",
        productId: "prod1",
        addedAt: "2023-10-15T14:30:00Z",
      },
      {
        id: "wish2",
        productId: "prod2",
        addedAt: "2023-11-05T09:45:00Z",
      },
    ],
    createdAt: "2023-10-15T14:30:00Z",
    updatedAt: "2023-11-05T09:45:00Z",
  },
};

/**
 * GET /api/account/wishlists - Récupérer la liste de souhaits de l'utilisateur
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Récupérer l'ID utilisateur depuis le token JWT
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Récupérer la liste de souhaits
    const wishlist = mockWishlists[userId];

    // Si l'utilisateur n'a pas de liste de souhaits, en créer une vide
    if (!wishlist) {
      const newWishlist = {
        id: `wishlist-${userId}`,
        userId,
        items: [],
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };

      mockWishlists[userId] = newWishlist;

      return apiResponse.success({ wishlist: newWishlist, products: [] });
    }

    // Récupérer les informations des produits
    const products = wishlist.items
      .map((item) => {
        const product = mockProducts.find((p) => p.id === item.productId);
        return product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              priceDiscount: product.priceDiscount,
              image: product.image,
              brand: product.brand,
              addedAt: item.addedAt,
            }
          : null;
      })
      .filter(Boolean);

    return apiResponse.success({ wishlist, products });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/account/wishlists - Ajouter un produit à la liste de souhaits
 *
 * Corps de la requête:
 * - productId: ID du produit à ajouter
 */
export const POST = withAuth(
  validateRequest(wishlistAddSchema)(async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

      // Vérifier si le produit existe
      const product = mockProducts.find((p) => p.id === body.productId);

      if (!product) {
        return apiResponse.notFound("Produit non trouvé");
      }

      // Récupérer ou créer la liste de souhaits
      let wishlist = mockWishlists[userId];

      if (!wishlist) {
        wishlist = {
          id: `wishlist-${userId}`,
          userId,
          items: [],
          createdAt: getCurrentDate(),
          updatedAt: getCurrentDate(),
        };

        mockWishlists[userId] = wishlist;
      }

      // Vérifier si le produit est déjà dans la liste
      const existingItem = wishlist.items.find(
        (item) => item.productId === body.productId
      );

      if (existingItem) {
        return apiResponse.badRequest(
          "Ce produit est déjà dans votre liste de souhaits"
        );
      }

      // Ajouter le produit à la liste
      const newItem = {
        id: generateId(),
        productId: body.productId,
        addedAt: getCurrentDate(),
      };

      wishlist.items.push(newItem);
      wishlist.updatedAt = getCurrentDate();

      // Préparer la réponse produit
      const productResponse = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        priceDiscount: product.priceDiscount,
        image: product.image,
        brand: product.brand,
        addedAt: newItem.addedAt,
      };

      return apiResponse.success({
        wishlist,
        product: productResponse,
        message: "Produit ajouté à la liste de souhaits",
      });
    } catch (error) {
      return handleApiError(error);
    }
  })
);

/**
 * DELETE /api/account/wishlists - Supprimer un produit de la liste de souhaits
 *
 * Corps de la requête:
 * - productId: ID du produit à supprimer
 */
export const DELETE = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Récupérer l'ID utilisateur depuis le token JWT
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Récupérer la liste de souhaits
    const wishlist = mockWishlists[userId];

    // Vérifier si l'utilisateur a une liste de souhaits
    if (!wishlist) {
      return apiResponse.notFound("Liste de souhaits non trouvée");
    }

    // Trouver l'index de l'élément
    const itemIndex = wishlist.items.findIndex(
      (item) => item.productId === body.productId
    );

    // Vérifier si le produit est dans la liste
    if (itemIndex === -1) {
      return apiResponse.notFound(
        "Produit non trouvé dans la liste de souhaits"
      );
    }

    // Supprimer le produit
    wishlist.items.splice(itemIndex, 1);
    wishlist.updatedAt = getCurrentDate();

    return apiResponse.success({
      wishlist,
      message: "Produit supprimé de la liste de souhaits",
    });
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
