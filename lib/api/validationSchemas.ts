import { z } from "zod";

// Schémas de validation pour l'API de produits
export const productQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 12)),
    sort: z.string().optional(),
    category: z.string().optional(),
    minPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    brand: z.string().optional(),
    featured: z
      .string()
      .optional()
      .transform((val) => val === "true"),
    inStock: z
      .string()
      .optional()
      .transform((val) => val === "true"),
  })
  .strict();

export const productSearchSchema = z
  .object({
    query: z
      .string()
      .min(2, "Le terme de recherche doit contenir au moins 2 caractères"),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 12)),
    category: z.string().optional(),
    minPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    brand: z.string().optional(),
    sort: z.string().optional(),
  })
  .strict();

export const productCreateSchema = z
  .object({
    name: z
      .string()
      .min(3, "Le nom du produit doit contenir au moins 3 caractères"),
    slug: z
      .string()
      .min(3, "Le slug doit contenir au moins 3 caractères")
      .regex(/^[a-z0-9-]+$/, "Le slug doit être en minuscules avec des tirets"),
    description: z
      .string()
      .min(10, "La description doit contenir au moins 10 caractères"),
    shortDescription: z.string().optional(),
    price: z.number().positive("Le prix doit être un nombre positif"),
    priceDiscount: z.number().optional(),
    image: z.string().url("L'image principale doit être une URL valide"),
    additionalImages: z
      .array(
        z
          .string()
          .url("Les images supplémentaires doivent être des URLs valides")
      )
      .optional(),
    categoryId: z.string().min(1, "La catégorie est requise"),
    brand: z.string().min(1, "La marque est requise"),
    countInStock: z
      .number()
      .int()
      .nonnegative("Le stock doit être un nombre entier positif ou nul"),
    isFeatured: z.boolean().optional(),
    attributes: z.record(z.string(), z.array(z.string())).optional(),
    variants: z
      .array(
        z.object({
          combination: z.array(z.string()),
          stock: z.number().int().nonnegative(),
        })
      )
      .optional(),
    sku: z.string().min(3, "Le SKU doit contenir au moins 3 caractères"),
    weight: z.number().positive().optional(),
    dimensions: z
      .object({
        width: z.number().positive(),
        height: z.number().positive(),
        depth: z.number().positive(),
      })
      .optional(),
    technicalDetails: z
      .record(z.string(), z.record(z.string(), z.string()))
      .optional(),
  })
  .strict();

export const productUpdateSchema = productCreateSchema.partial();

// Schémas de validation pour l'API de panier
export const cartItemAddSchema = z
  .object({
    productId: z.string().min(1, "L'ID du produit est requis"),
    quantity: z
      .number()
      .int()
      .positive("La quantité doit être un nombre entier positif"),
    attributes: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const cartItemUpdateSchema = z
  .object({
    quantity: z
      .number()
      .int()
      .positive("La quantité doit être un nombre entier positif"),
  })
  .strict();

export const couponApplySchema = z
  .object({
    code: z
      .string()
      .min(3, "Le code de coupon doit contenir au moins 3 caractères"),
  })
  .strict();

export const shippingOptionsQuerySchema = z
  .object({
    countryCode: z
      .string()
      .length(2, "Le code pays doit être au format ISO à 2 lettres"),
    postalCode: z.string().min(3, "Le code postal est requis"),
    items: z
      .array(
        z.object({
          sku: z.string(),
          quantity: z.number().int().positive(),
        })
      )
      .min(1, "Au moins un article est requis"),
  })
  .strict();

// Schémas de validation pour l'API de checkout
export const checkoutInitSchema = z
  .object({
    shippingAddress: z.object({
      firstName: z.string().min(2, "Le prénom est requis"),
      lastName: z.string().min(2, "Le nom est requis"),
      addressLine1: z.string().min(5, "L'adresse est requise"),
      addressLine2: z.string().optional(),
      city: z.string().min(2, "La ville est requise"),
      state: z.string().optional(),
      postalCode: z.string().min(3, "Le code postal est requis"),
      country: z
        .string()
        .length(2, "Le pays doit être au format ISO à 2 lettres"),
      phone: z.string().min(8, "Le numéro de téléphone est requis"),
      email: z.string().email("L'email doit être valide"),
    }),
    billingAddress: z
      .object({
        firstName: z.string().min(2, "Le prénom est requis"),
        lastName: z.string().min(2, "Le nom est requis"),
        addressLine1: z.string().min(5, "L'adresse est requise"),
        addressLine2: z.string().optional(),
        city: z.string().min(2, "La ville est requise"),
        state: z.string().optional(),
        postalCode: z.string().min(3, "Le code postal est requis"),
        country: z
          .string()
          .length(2, "Le pays doit être au format ISO à 2 lettres"),
        phone: z.string().min(8, "Le numéro de téléphone est requis"),
        email: z.string().email("L'email doit être valide"),
      })
      .optional(),
    sameAsBilling: z.boolean().optional(),
    shippingMethod: z.string().min(1, "La méthode de livraison est requise"),
    paymentMethod: z.string().min(1, "La méthode de paiement est requise"),
  })
  .strict();

// Schémas de validation pour l'API de commandes
export const orderCreateSchema = z
  .object({
    shippingAddress: z.object({
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      addressLine1: z.string().min(5),
      addressLine2: z.string().optional(),
      city: z.string().min(2),
      state: z.string().optional(),
      postalCode: z.string().min(3),
      country: z.string().length(2),
      phone: z.string().min(8),
      email: z.string().email(),
    }),
    billingAddress: z.object({
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      addressLine1: z.string().min(5),
      addressLine2: z.string().optional(),
      city: z.string().min(2),
      state: z.string().optional(),
      postalCode: z.string().min(3),
      country: z.string().length(2),
      phone: z.string().min(8),
      email: z.string().email(),
    }),
    paymentMethod: z.string().min(1),
    shippingMethod: z.string().min(1),
    couponCode: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict();

export const orderStatusUpdateSchema = z
  .object({
    status: z.enum(
      [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ],
      {
        errorMap: () => ({ message: "Le statut doit être une valeur valide" }),
      }
    ),
  })
  .strict();

export const orderPaymentStatusUpdateSchema = z
  .object({
    paymentStatus: z.enum(
      [
        "pending",
        "authorized",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      {
        errorMap: () => ({
          message: "Le statut de paiement doit être une valeur valide",
        }),
      }
    ),
  })
  .strict();

// Schémas de validation pour l'API de paiement
export const paymentIntentCreateSchema = z
  .object({
    orderId: z.string().min(1, "L'ID de commande est requis"),
    paymentMethod: z.string().min(1, "La méthode de paiement est requise"),
  })
  .strict();

export const paymentVerifySchema = z
  .object({
    paymentIntentId: z
      .string()
      .min(1, "L'ID de l'intention de paiement est requis"),
    orderId: z.string().min(1, "L'ID de commande est requis"),
  })
  .strict();

export const paymentMethodAddSchema = z
  .object({
    type: z.enum(["card", "bank_account", "paypal"], {
      errorMap: () => ({
        message: "Le type de méthode de paiement doit être une valeur valide",
      }),
    }),
    token: z.string().min(1, "Le token de paiement est requis"),
    isDefault: z.boolean().optional(),
  })
  .strict();

// Schémas de validation pour l'API utilisateur
export const addressCreateSchema = z
  .object({
    firstName: z.string().min(2, "Le prénom est requis"),
    lastName: z.string().min(2, "Le nom est requis"),
    addressLine1: z.string().min(5, "L'adresse est requise"),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "La ville est requise"),
    state: z.string().optional(),
    postalCode: z.string().min(3, "Le code postal est requis"),
    country: z
      .string()
      .length(2, "Le pays doit être au format ISO à 2 lettres"),
    phone: z.string().min(8, "Le numéro de téléphone est requis"),
    email: z.string().email("L'email doit être valide").optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const reviewCreateSchema = z
  .object({
    productId: z.string().min(1, "L'ID du produit est requis"),
    rating: z.number().min(1).max(5, "La note doit être entre 1 et 5"),
    title: z.string().optional(),
    content: z
      .string()
      .min(10, "Le contenu de l'avis doit contenir au moins 10 caractères"),
  })
  .strict();

export const wishlistAddSchema = z
  .object({
    productId: z.string().min(1, "L'ID du produit est requis"),
  })
  .strict();
