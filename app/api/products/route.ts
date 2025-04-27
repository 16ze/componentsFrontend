import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  validateRequest,
  withAdmin,
  apiResponse,
  handleApiError,
  rateLimit,
} from "@/lib/api/middleware";
import {
  productQuerySchema,
  productCreateSchema,
} from "@/lib/api/validationSchemas";
import {
  mockProducts,
  mockCategories,
  generateId,
  getCurrentDate,
} from "@/lib/api/mockData";
import { Product } from "@/lib/types/api";

/**
 * GET /api/products - Récupérer une liste de produits avec pagination et filtrage
 *
 * Paramètres de requête:
 * - page: numéro de page (par défaut: 1)
 * - limit: nombre d'éléments par page (par défaut: 12)
 * - sort: tri (par défaut: 'newest')
 * - category: filtrer par catégorie
 * - minPrice: prix minimum
 * - maxPrice: prix maximum
 * - brand: filtrer par marque
 * - featured: filtrer par produits mis en avant (true/false)
 * - inStock: filtrer par produits en stock (true/false)
 */
export const GET = rateLimit(
  100,
  60 * 1000
)(
  validateRequest(productQuerySchema)(async (req: NextRequest) => {
    try {
      // Récupérer les paramètres de requête
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "12", 10);
      const sort = url.searchParams.get("sort") || "newest";
      const category = url.searchParams.get("category");
      const minPrice = url.searchParams.has("minPrice")
        ? parseFloat(url.searchParams.get("minPrice") || "0")
        : undefined;
      const maxPrice = url.searchParams.has("maxPrice")
        ? parseFloat(url.searchParams.get("maxPrice") || "0")
        : undefined;
      const brand = url.searchParams.get("brand");
      const featured = url.searchParams.get("featured") === "true";
      const inStock = url.searchParams.get("inStock") === "true";

      // Filtrer les produits
      let filteredProducts = [...mockProducts];

      // Filtrer par catégorie
      if (category) {
        filteredProducts = filteredProducts.filter(
          (product) => product.category.slug === category
        );
      }

      // Filtrer par prix minimum
      if (minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          (product) => product.price >= minPrice
        );
      }

      // Filtrer par prix maximum
      if (maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          (product) => product.price <= maxPrice
        );
      }

      // Filtrer par marque
      if (brand) {
        filteredProducts = filteredProducts.filter(
          (product) => product.brand.toLowerCase() === brand.toLowerCase()
        );
      }

      // Filtrer par produits mis en avant
      if (featured) {
        filteredProducts = filteredProducts.filter(
          (product) => product.isFeatured
        );
      }

      // Filtrer par produits en stock
      if (inStock) {
        filteredProducts = filteredProducts.filter(
          (product) => product.countInStock > 0
        );
      }

      // Tri des produits
      switch (sort) {
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
          filteredProducts.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }

      // Calculer la pagination
      const totalItems = filteredProducts.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, totalItems);

      // Sélectionner les produits pour la page courante
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      // Extraire les marques disponibles
      const brands = Array.from(
        new Set(mockProducts.map((product) => product.brand))
      );

      // Calculer la plage de prix
      const prices = mockProducts.map((product) => product.price);
      const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };

      // Préparer la réponse
      return apiResponse.success(
        {
          products: paginatedProducts,
          filters: {
            categories: mockCategories,
            brands,
            priceRange,
          },
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

/**
 * POST /api/products - Ajouter un nouveau produit (admin seulement)
 *
 * Corps de la requête: Objet Product (voir productCreateSchema)
 */
export const POST = withAdmin(
  validateRequest(productCreateSchema)(async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Créer un nouveau produit
      const newProduct: Product = {
        id: generateId(),
        name: body.name,
        slug: body.slug,
        description: body.description,
        shortDescription: body.shortDescription,
        price: body.price,
        priceDiscount: body.priceDiscount,
        image: body.image,
        additionalImages: body.additionalImages,
        category: {
          id: body.categoryId,
          name: "", // Ceci serait normalement récupéré depuis la base de données
          slug: "", // Ceci serait normalement récupéré depuis la base de données
        },
        brand: body.brand,
        countInStock: body.countInStock,
        rating: 0, // Les nouveaux produits n'ont pas de notes
        numReviews: 0, // Les nouveaux produits n'ont pas d'avis
        isFeatured: body.isFeatured || false,
        attributes: body.attributes,
        variants: body.variants,
        sku: body.sku,
        weight: body.weight,
        dimensions: body.dimensions,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
        technicalDetails: body.technicalDetails,
      };

      // Récupérer les détails de la catégorie
      const category = mockCategories.find((cat) => cat.id === body.categoryId);
      if (category) {
        newProduct.category.name = category.name;
        newProduct.category.slug = category.slug;
      }

      // Dans un environnement réel, nous ajouterions le produit à la base de données
      // Pour cet exemple, nous retournons simplement le produit créé

      const responseData = {
        success: true,
        data: newProduct,
      };
      return NextResponse.json(responseData, { status: 201 });
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
