import { NextRequest } from "next/server";
import {
  validateRequest,
  apiResponse,
  handleApiError,
  rateLimit,
} from "../../../../lib/api/middleware";
import { productSearchSchema } from "../../../../lib/api/validationSchemas";
import { mockProducts } from "../../../../lib/api/mockData";

/**
 * GET /api/products/search - Rechercher des produits avec filtrage avancé
 *
 * Paramètres de requête:
 * - query: terme de recherche (obligatoire)
 * - page: numéro de page (par défaut: 1)
 * - limit: nombre d'éléments par page (par défaut: 12)
 * - category: filtrer par catégorie
 * - minPrice: prix minimum
 * - maxPrice: prix maximum
 * - brand: filtrer par marque
 * - sort: tri (par défaut: pertinence)
 */
export const GET = rateLimit(
  100,
  60 * 1000
)(
  validateRequest(productSearchSchema)(async (req: NextRequest) => {
    try {
      // Récupérer les paramètres de requête
      const url = new URL(req.url);
      const searchQuery = url.searchParams.get("query") || "";
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "12", 10);
      const category = url.searchParams.get("category");
      const minPrice = url.searchParams.has("minPrice")
        ? parseFloat(url.searchParams.get("minPrice") || "0")
        : undefined;
      const maxPrice = url.searchParams.has("maxPrice")
        ? parseFloat(url.searchParams.get("maxPrice") || "0")
        : undefined;
      const brand = url.searchParams.get("brand");
      const sort = url.searchParams.get("sort") || "relevance";

      // Fonction de recherche (recherche simple basée sur le texte)
      const searchTerms = searchQuery
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0);

      // Calculer un score de pertinence pour chaque produit
      const productsWithScore = mockProducts.map((product) => {
        let score = 0;

        // Recherche dans le titre
        searchTerms.forEach((term) => {
          if (product.name.toLowerCase().includes(term)) {
            score += 10; // Le titre est le plus important
          }

          // Recherche dans la description courte
          if (product.shortDescription?.toLowerCase().includes(term)) {
            score += 5;
          }

          // Recherche dans la description complète
          if (product.description.toLowerCase().includes(term)) {
            score += 3;
          }

          // Recherche dans la marque
          if (product.brand.toLowerCase().includes(term)) {
            score += 4;
          }

          // Recherche dans la catégorie
          if (product.category.name.toLowerCase().includes(term)) {
            score += 4;
          }

          // Recherche dans les attributs
          if (product.attributes) {
            Object.entries(product.attributes).forEach(
              ([attrName, attrValues]) => {
                if (attrName.toLowerCase().includes(term)) {
                  score += 2;
                }

                attrValues.forEach((attrValue) => {
                  if (attrValue.toLowerCase().includes(term)) {
                    score += 2;
                  }
                });
              }
            );
          }
        });

        return { ...product, score };
      });

      // Filtrer les produits avec un score > 0
      let filteredProducts = productsWithScore.filter(
        (product) => product.score > 0
      );

      // Appliquer les filtres additionnels
      if (category) {
        filteredProducts = filteredProducts.filter(
          (product) => product.category.slug === category
        );
      }

      if (minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          (product) => product.price >= minPrice
        );
      }

      if (maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          (product) => product.price <= maxPrice
        );
      }

      if (brand) {
        filteredProducts = filteredProducts.filter(
          (product) => product.brand.toLowerCase() === brand.toLowerCase()
        );
      }

      // Tri des produits
      switch (sort) {
        case "relevance":
          // Tri par score de pertinence (par défaut pour la recherche)
          filteredProducts.sort((a, b) => b.score - a.score);
          break;
        case "newest":
          filteredProducts.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "price-low-high":
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case "price-high-low":
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case "name-a-z":
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-z-a":
          filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "popularity":
          filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          filteredProducts.sort((a, b) => b.score - a.score);
      }

      // Pagination
      const totalItems = filteredProducts.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, totalItems);

      // Sélectionner les produits pour la page courante
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      // Supprimer la propriété score avant d'envoyer la réponse
      const productsWithoutScore = paginatedProducts.map(
        ({ score, ...product }) => product
      );

      return apiResponse.success(
        {
          products: productsWithoutScore,
          query: searchQuery,
        },
        {
          pagination: {
            total: totalItems,
            pageSize: limit,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        }
      );
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
