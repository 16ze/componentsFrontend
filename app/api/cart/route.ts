import { NextRequest } from "next/server";
import {
  validateRequest,
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../lib/api/middleware";
import { cartItemAddSchema } from "../../../lib/api/validationSchemas";
import {
  mockCarts,
  mockProducts,
  generateId,
  getCurrentDate,
} from "../../../lib/api/mockData";
import { Cart, CartItem } from "../../../lib/types/api";

/**
 * GET /api/cart - Récupérer le panier de l'utilisateur
 */
export async function GET(req: NextRequest) {
  try {
    // Dans une application réelle, nous utiliserions l'ID utilisateur pour récupérer leur panier
    // Pour cet exemple, nous renvoyons un panier mocké

    // Simulation de récupération de l'ID utilisateur depuis le token JWT
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Rechercher le panier de l'utilisateur
    const cart = mockCarts[userId] || {
      id: `cart-${userId}`,
      userId,
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
    };

    return apiResponse.success(cart);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/cart - Ajouter un produit au panier
 *
 * Corps de la requête:
 * - productId: ID du produit
 * - quantity: quantité (par défaut: 1)
 * - attributes: attributs du produit (couleur, taille, etc.)
 */
export const POST = validateRequest(cartItemAddSchema)(
  async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Simulation de récupération de l'ID utilisateur
      const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

      // Récupérer le produit
      const product = mockProducts.find((p) => p.id === body.productId);

      if (!product) {
        return apiResponse.notFound("Produit non trouvé");
      }

      // Vérifier le stock du produit
      if (product.countInStock <= 0) {
        return apiResponse.badRequest("Le produit est épuisé");
      }

      // Récupérer le panier ou en créer un nouveau
      let cart = mockCarts[userId] || {
        id: `cart-${userId}`,
        userId,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };

      // Vérifier si le produit existe déjà dans le panier
      const existingItemIndex = cart.items.findIndex((item) => {
        // Vérifier si le produit correspond
        if (item.productId !== body.productId) {
          return false;
        }

        // Si des attributs sont fournis, ils doivent correspondre
        if (body.attributes) {
          // Vérifier si les attributs sont identiques
          const existingAttrs = item.attributes || {};
          const newAttrs = body.attributes;

          const existingKeys = Object.keys(existingAttrs);
          const newKeys = Object.keys(newAttrs);

          // Vérifier que les clés sont identiques
          if (existingKeys.length !== newKeys.length) {
            return false;
          }

          // Vérifier que les valeurs sont identiques
          for (const key of newKeys) {
            if (existingAttrs[key] !== newAttrs[key]) {
              return false;
            }
          }

          return true;
        }

        // Si aucun attribut n'est fourni, considérer que c'est le même produit
        return !item.attributes || Object.keys(item.attributes).length === 0;
      });

      // Créer ou mettre à jour l'élément du panier
      if (existingItemIndex !== -1) {
        // Mettre à jour la quantité
        cart.items[existingItemIndex].quantity += body.quantity;
      } else {
        // Créer un nouvel élément
        const newItem: CartItem = {
          id: generateId(),
          productId: product.id,
          name: product.name,
          price: product.priceDiscount || product.price,
          quantity: body.quantity,
          image: product.image,
          attributes: body.attributes,
          sku: product.sku,
        };

        cart.items.push(newItem);
      }

      // Recalculer les totaux
      cart = calculateCartTotals(cart);

      // Mettre à jour la date
      cart.updatedAt = getCurrentDate();

      // Dans une application réelle, nous sauvegarderions le panier mis à jour
      // Pour cet exemple, nous retournons simplement le panier mis à jour

      return apiResponse.success(cart);
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/**
 * PUT /api/cart - Mettre à jour le panier (remplacer l'ensemble du panier)
 *
 * Corps de la requête:
 * - items: tableau d'éléments du panier
 */
export const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Simulation de récupération de l'ID utilisateur
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Vérifier si les items sont fournis
    if (!body.items || !Array.isArray(body.items)) {
      return apiResponse.badRequest("La liste des produits est requise");
    }

    // Récupérer le panier ou en créer un nouveau
    let cart = mockCarts[userId] || {
      id: `cart-${userId}`,
      userId,
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
    };

    // Remplacer les items du panier
    const newItems: CartItem[] = [];

    for (const item of body.items) {
      // Vérifier si l'élément est valide
      if (!item.productId || !item.quantity) {
        continue;
      }

      // Récupérer le produit
      const product = mockProducts.find((p) => p.id === item.productId);

      if (!product) {
        continue;
      }

      // Créer un nouvel élément
      const newItem: CartItem = {
        id: item.id || generateId(),
        productId: product.id,
        name: product.name,
        price: product.priceDiscount || product.price,
        quantity: item.quantity,
        image: product.image,
        attributes: item.attributes,
        sku: product.sku,
      };

      newItems.push(newItem);
    }

    // Mettre à jour les items du panier
    cart.items = newItems;

    // Recalculer les totaux
    cart = calculateCartTotals(cart);

    // Mettre à jour la date
    cart.updatedAt = getCurrentDate();

    // Dans une application réelle, nous sauvegarderions le panier mis à jour
    // Pour cet exemple, nous retournons simplement le panier mis à jour

    return apiResponse.success(cart);
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction utilitaire pour calculer les totaux du panier
function calculateCartTotals(cart: Cart): Cart {
  // Calculer le sous-total
  cart.subtotal = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Calculer la TVA (20% par défaut)
  cart.tax = Math.round(cart.subtotal * 0.2 * 100) / 100;

  // Calculer les frais de livraison (gratuits au-dessus de 50€, sinon 5.99€)
  cart.shipping = cart.subtotal > 50 ? 0 : 5.99;

  // Appliquer la réduction (si un code de réduction est présent)
  if (cart.couponCode) {
    // Simuler une réduction (pour un code de réduction existant)
    cart.discount = Math.min(50, Math.round(cart.subtotal * 0.1 * 100) / 100);
  } else {
    cart.discount = 0;
  }

  // Calculer le total
  cart.total =
    Math.round(
      (cart.subtotal + cart.tax + cart.shipping - cart.discount) * 100
    ) / 100;

  return cart;
}

// OPTIONS pour gérer CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
