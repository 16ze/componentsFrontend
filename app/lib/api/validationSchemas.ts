import { z } from "zod";

// Schéma pour la validation d'inscription
export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

// Schéma pour la validation de connexion
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Schéma pour la validation d'ajout au panier
export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  variant: z.string().optional(),
});

// Schéma pour la validation de mise à jour de panier
export const updateCartItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().positive(),
});

// Schéma pour la validation de wishlists
export const wishlistSchema = z.object({
  productId: z.string(),
});

// Schéma pour l'ajout d'un produit à la liste de souhaits
export const wishlistAddSchema = z.object({
  productId: z.string().min(1, "L'ID du produit est requis"),
});

// Schéma pour la validation des avis produits
export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100),
  comment: z.string().min(10).max(1000),
});

// Schéma pour la création d'avis produits (utilisé dans l'API publique)
export const reviewCreateSchema = z.object({
  productId: z.string().min(1, "L'ID du produit est requis"),
  rating: z.number().min(1).max(5, "La note doit être entre 1 et 5"),
  title: z.string().optional(),
  content: z
    .string()
    .min(10, "Le contenu de l'avis doit contenir au moins 10 caractères"),
});

// Schéma pour la validation d'adresse
export const addressCreateSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  addressLine1: z.string().min(5).max(100),
  addressLine2: z.string().optional(),
  city: z.string().min(2).max(50),
  state: z.string().optional(),
  postalCode: z.string().min(3).max(10),
  country: z.string().min(2).max(2),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  isDefault: z.boolean().optional(),
});

// Plus de schémas peuvent être ajoutés selon les besoins
