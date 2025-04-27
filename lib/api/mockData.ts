import {
  Product,
  Category,
  Cart,
  Order,
  Review,
  OrderStatus,
  PaymentStatus,
} from "../types/api";
import { v4 as uuidv4 } from "uuid";

// Catégories mockées
export const mockCategories: Category[] = [
  {
    id: "cat1",
    name: "Électronique",
    slug: "electronique",
    description: "Tous les appareils électroniques",
    image: "https://placehold.co/600x400",
    children: [
      {
        id: "cat1-1",
        name: "Smartphones",
        slug: "smartphones",
        parentId: "cat1",
        level: 1,
        count: 15,
      },
      {
        id: "cat1-2",
        name: "Ordinateurs",
        slug: "ordinateurs",
        parentId: "cat1",
        level: 1,
        count: 12,
      },
      {
        id: "cat1-3",
        name: "Accessoires",
        slug: "accessoires",
        parentId: "cat1",
        level: 1,
        count: 25,
      },
    ],
    level: 0,
    count: 52,
  },
  {
    id: "cat2",
    name: "Vêtements",
    slug: "vetements",
    description: "Tout pour s'habiller",
    image: "https://placehold.co/600x400",
    children: [
      {
        id: "cat2-1",
        name: "Homme",
        slug: "homme",
        parentId: "cat2",
        level: 1,
        count: 20,
      },
      {
        id: "cat2-2",
        name: "Femme",
        slug: "femme",
        parentId: "cat2",
        level: 1,
        count: 30,
      },
      {
        id: "cat2-3",
        name: "Enfant",
        slug: "enfant",
        parentId: "cat2",
        level: 1,
        count: 18,
      },
    ],
    level: 0,
    count: 68,
  },
  {
    id: "cat3",
    name: "Maison & Jardin",
    slug: "maison-jardin",
    description: "Tout pour la maison et le jardin",
    image: "https://placehold.co/600x400",
    children: [
      {
        id: "cat3-1",
        name: "Cuisine",
        slug: "cuisine",
        parentId: "cat3",
        level: 1,
        count: 22,
      },
      {
        id: "cat3-2",
        name: "Mobilier",
        slug: "mobilier",
        parentId: "cat3",
        level: 1,
        count: 15,
      },
      {
        id: "cat3-3",
        name: "Décoration",
        slug: "decoration",
        parentId: "cat3",
        level: 1,
        count: 28,
      },
    ],
    level: 0,
    count: 65,
  },
  {
    id: "cat4",
    name: "Sport & Loisirs",
    slug: "sport-loisirs",
    description: "Tout pour le sport et les loisirs",
    image: "https://placehold.co/600x400",
    children: [
      {
        id: "cat4-1",
        name: "Fitness",
        slug: "fitness",
        parentId: "cat4",
        level: 1,
        count: 18,
      },
      {
        id: "cat4-2",
        name: "Outdoor",
        slug: "outdoor",
        parentId: "cat4",
        level: 1,
        count: 20,
      },
      {
        id: "cat4-3",
        name: "Jeux",
        slug: "jeux",
        parentId: "cat4",
        level: 1,
        count: 15,
      },
    ],
    level: 0,
    count: 53,
  },
];

// Produits mockés
export const mockProducts: Product[] = [
  {
    id: "prod1",
    name: "Smartphone Pro X",
    slug: "smartphone-pro-x",
    description:
      'Le smartphone dernier cri avec les meilleures fonctionnalités. Écran OLED 6.5", processeur ultra-rapide, appareil photo 50MP et batterie longue durée.',
    shortDescription: 'Smartphone haut de gamme avec écran OLED 6.5"',
    price: 899.99,
    image: "https://placehold.co/600x800",
    additionalImages: [
      "https://placehold.co/600x800/eee/333",
      "https://placehold.co/600x800/333/eee",
      "https://placehold.co/600x800/f5f5f5/222",
    ],
    category: { id: "cat1-1", name: "Smartphones", slug: "smartphones" },
    brand: "TechPro",
    countInStock: 35,
    rating: 4.7,
    numReviews: 124,
    isFeatured: true,
    attributes: {
      Couleur: ["Noir", "Blanc", "Bleu"],
      Stockage: ["128GB", "256GB", "512GB"],
      RAM: ["8GB", "12GB"],
    },
    variants: [
      { combination: ["Noir", "128GB", "8GB"], stock: 10 },
      { combination: ["Noir", "256GB", "8GB"], stock: 8 },
      { combination: ["Noir", "512GB", "12GB"], stock: 5 },
      { combination: ["Blanc", "128GB", "8GB"], stock: 7 },
      { combination: ["Blanc", "256GB", "12GB"], stock: 5 },
      { combination: ["Bleu", "256GB", "8GB"], stock: 0 },
    ],
    sku: "SP-PRO-X",
    weight: 0.2,
    dimensions: {
      width: 7.5,
      height: 15.5,
      depth: 0.8,
    },
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-11-20T14:22:00Z",
    technicalDetails: {
      Processeur: {
        Type: "OctaCore",
        Fréquence: "2.9 GHz",
      },
      Écran: {
        Type: "OLED",
        Taille: "6.5 pouces",
        Résolution: "2400 x 1080 pixels",
      },
      Batterie: {
        Capacité: "4500 mAh",
        Type: "Li-Ion",
      },
    },
  },
  {
    id: "prod2",
    name: "Casque Audio Sans Fil",
    slug: "casque-audio-sans-fil",
    description:
      "Casque audio sans fil avec réduction de bruit active. Profitez d'un son de qualité supérieure sans être dérangé par les bruits extérieurs. Autonomie de 30 heures.",
    shortDescription: "Casque sans fil avec réduction de bruit active",
    price: 249.99,
    priceDiscount: 199.99,
    image: "https://placehold.co/600x600",
    additionalImages: [
      "https://placehold.co/600x600/222/ddd",
      "https://placehold.co/600x600/ddd/222",
    ],
    category: { id: "cat1-3", name: "Accessoires", slug: "accessoires" },
    brand: "AudioMax",
    countInStock: 22,
    rating: 4.8,
    numReviews: 56,
    isFeatured: true,
    attributes: {
      Couleur: ["Noir", "Blanc", "Rouge"],
    },
    variants: [
      { combination: ["Noir"], stock: 10 },
      { combination: ["Blanc"], stock: 7 },
      { combination: ["Rouge"], stock: 5 },
    ],
    sku: "AM-CASQ-01",
    weight: 0.3,
    dimensions: {
      width: 18,
      height: 20,
      depth: 9,
    },
    createdAt: "2023-06-20T14:15:00Z",
    updatedAt: "2023-11-12T09:45:00Z",
    technicalDetails: {
      Audio: {
        Type: "Over-ear",
        Impédance: "32 Ohm",
        "Réponse en fréquence": "20 Hz - 20 kHz",
      },
      Batterie: {
        Autonomie: "30 heures",
        "Temps de charge": "2 heures",
      },
      Connectivité: {
        Bluetooth: "5.0",
        Portée: "10 mètres",
      },
    },
  },
  {
    id: "prod3",
    name: "Laptop UltraBook",
    slug: "laptop-ultrabook",
    description:
      "Ordinateur portable ultra-fin et léger. Parfait pour les professionnels en déplacement. Processeur i7, 16GB de RAM et SSD 512GB.",
    shortDescription: "Ordinateur portable ultra-fin avec i7",
    price: 1299.99,
    image: "https://placehold.co/800x600",
    additionalImages: [
      "https://placehold.co/800x600/eee/333",
      "https://placehold.co/800x600/333/eee",
    ],
    category: { id: "cat1-2", name: "Ordinateurs", slug: "ordinateurs" },
    brand: "TechBook",
    countInStock: 15,
    rating: 4.6,
    numReviews: 42,
    isFeatured: true,
    attributes: {
      Couleur: ["Argent", "Gris Sidéral"],
      Stockage: ["512GB", "1TB"],
      RAM: ["16GB", "32GB"],
    },
    variants: [
      { combination: ["Argent", "512GB", "16GB"], stock: 5 },
      { combination: ["Argent", "1TB", "16GB"], stock: 3 },
      { combination: ["Argent", "1TB", "32GB"], stock: 2 },
      { combination: ["Gris Sidéral", "512GB", "16GB"], stock: 4 },
      { combination: ["Gris Sidéral", "1TB", "32GB"], stock: 1 },
    ],
    sku: "TB-ULTRA-01",
    weight: 1.4,
    dimensions: {
      width: 32,
      height: 1.8,
      depth: 22,
    },
    createdAt: "2023-03-10T09:45:00Z",
    updatedAt: "2023-10-25T11:30:00Z",
    technicalDetails: {
      Processeur: {
        Type: "Intel Core i7",
        Fréquence: "3.2 GHz",
        Cœurs: "8",
      },
      Écran: {
        Type: "IPS",
        Taille: "14 pouces",
        Résolution: "2560 x 1440 pixels",
      },
      Batterie: {
        Autonomie: "12 heures",
        Type: "Li-Polymer",
      },
    },
  },
  // Ajoutez d'autres produits selon vos besoins
];

// Données mockées pour les paniers
export const mockCarts: Record<string, Cart> = {
  cart1: {
    id: "cart1",
    userId: "user1",
    items: [
      {
        id: "item1",
        productId: "prod1",
        name: "Smartphone Pro X",
        price: 899.99,
        quantity: 1,
        image: "https://placehold.co/600x800",
        attributes: {
          Couleur: "Noir",
          Stockage: "256GB",
          RAM: "8GB",
        },
        sku: "SP-PRO-X",
      },
      {
        id: "item2",
        productId: "prod2",
        name: "Casque Audio Sans Fil",
        price: 199.99, // Prix avec réduction
        quantity: 1,
        image: "https://placehold.co/600x600",
        attributes: {
          Couleur: "Noir",
        },
        sku: "AM-CASQ-01",
      },
    ],
    subtotal: 1099.98,
    tax: 220.0,
    shipping: 15.0,
    discount: 50.0,
    total: 1284.98,
    couponCode: "WELCOME50",
    createdAt: "2023-11-25T10:15:00Z",
    updatedAt: "2023-11-25T10:30:00Z",
  },
};

// Données mockées pour les commandes
export const mockOrders: Record<string, Order> = {
  order1: {
    id: "order1",
    userId: "user1",
    items: [
      {
        id: "item1",
        productId: "prod1",
        name: "Smartphone Pro X",
        price: 899.99,
        quantity: 1,
        image: "https://placehold.co/600x800",
        attributes: {
          Couleur: "Noir",
          Stockage: "256GB",
          RAM: "8GB",
        },
        sku: "SP-PRO-X",
      },
      {
        id: "item2",
        productId: "prod2",
        name: "Casque Audio Sans Fil",
        price: 199.99,
        quantity: 1,
        image: "https://placehold.co/600x600",
        attributes: {
          Couleur: "Noir",
        },
        sku: "AM-CASQ-01",
      },
    ],
    shippingAddress: {
      firstName: "Jean",
      lastName: "Dupont",
      addressLine1: "123 Rue de Paris",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
      phone: "+33123456789",
    },
    billingAddress: {
      firstName: "Jean",
      lastName: "Dupont",
      addressLine1: "123 Rue de Paris",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
      phone: "+33123456789",
    },
    paymentMethod: "credit_card",
    paymentDetails: {
      id: "pay1",
      provider: "stripe",
      status: "success",
      transactionId: "tx_1234567",
      amount: 1284.98,
      currency: "EUR",
      method: "credit_card",
      timestamp: "2023-11-25T11:00:00Z",
    },
    subtotal: 1099.98,
    tax: 220.0,
    shipping: 15.0,
    discount: 50.0,
    total: 1284.98,
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    trackingNumber: "TRACK123456FR",
    notes: "Livraison rapide demandée",
    createdAt: "2023-11-25T11:00:00Z",
    updatedAt: "2023-11-27T14:30:00Z",
  },
  order2: {
    id: "order2",
    userId: "user1",
    items: [
      {
        id: "item3",
        productId: "prod3",
        name: "Laptop UltraBook",
        price: 1299.99,
        quantity: 1,
        image: "https://placehold.co/800x600",
        attributes: {
          Couleur: "Argent",
          Stockage: "512GB",
          RAM: "16GB",
        },
        sku: "TB-ULTRA-01",
      },
    ],
    shippingAddress: {
      firstName: "Jean",
      lastName: "Dupont",
      addressLine1: "123 Rue de Paris",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
      phone: "+33123456789",
    },
    billingAddress: {
      firstName: "Jean",
      lastName: "Dupont",
      addressLine1: "123 Rue de Paris",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
      phone: "+33123456789",
    },
    paymentMethod: "paypal",
    paymentDetails: {
      id: "pay2",
      provider: "paypal",
      status: "success",
      transactionId: "pp_7654321",
      amount: 1559.99,
      currency: "EUR",
      method: "paypal",
      timestamp: "2023-12-01T09:15:00Z",
    },
    subtotal: 1299.99,
    tax: 260.0,
    shipping: 0, // Livraison gratuite
    discount: 0,
    total: 1559.99,
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PAID,
    createdAt: "2023-12-01T09:15:00Z",
    updatedAt: "2023-12-01T09:20:00Z",
  },
};

// Données mockées pour les avis
export const mockReviews: Record<string, Review[]> = {
  prod1: [
    {
      id: "review1",
      productId: "prod1",
      userId: "user1",
      userName: "Jean D.",
      rating: 5,
      title: "Excellent smartphone",
      content:
        "J'ai acheté ce smartphone il y a un mois et j'en suis très satisfait. L'appareil photo est impressionnant et la batterie tient toute la journée.",
      isVerifiedPurchase: true,
      createdAt: "2023-06-10T14:30:00Z",
      updatedAt: "2023-06-10T14:30:00Z",
    },
    {
      id: "review2",
      productId: "prod1",
      userId: "user2",
      userName: "Marie L.",
      rating: 4,
      title: "Très bon, mais un peu cher",
      content:
        "Smartphone de très bonne qualité, avec d'excellentes performances. Seul bémol, le prix qui reste élevé.",
      isVerifiedPurchase: true,
      createdAt: "2023-07-22T09:45:00Z",
      updatedAt: "2023-07-22T09:45:00Z",
    },
  ],
  prod2: [
    {
      id: "review3",
      productId: "prod2",
      userId: "user3",
      userName: "Pierre M.",
      rating: 5,
      title: "Casque exceptionnel",
      content:
        "La qualité sonore est incroyable et la réduction de bruit fonctionne parfaitement. Je le recommande vivement.",
      isVerifiedPurchase: true,
      createdAt: "2023-08-05T16:20:00Z",
      updatedAt: "2023-08-05T16:20:00Z",
    },
  ],
};

// Fonction pour générer des IDs uniques
export function generateId(): string {
  return uuidv4();
}

// Fonction pour obtenir la date actuelle au format ISO
export function getCurrentDate(): string {
  return new Date().toISOString();
}
