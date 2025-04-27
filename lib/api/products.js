/**
 * Récupère les produits avec filtrage, tri et pagination
 * @param {string} queryParams - Paramètres de requête URL
 * @returns {Promise<Object>} - Données de produits filtrées et paginées
 */
export async function fetchProducts(queryParams) {
  try {
    // Ici, on appelerait normalement une API externe
    // Pour l'exemple, on simule un délai et on renvoie des données de test
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          products: mockProducts,
          pagination: {
            total: mockProducts.length,
            totalPages: Math.ceil(mockProducts.length / 12),
            currentPage: 1,
            pageSize: 12,
            hasNextPage: mockProducts.length > 12,
            hasPrevPage: false,
          },
          filters: {
            priceRange: { min: 0, max: 1000 },
            categories: mockCategories,
            attributes: mockAttributes,
          },
        });
      }, 500);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    throw error;
  }
}

/**
 * Récupère un produit unique par son ID ou son slug
 * @param {string} idOrSlug - Identifiant ou slug du produit
 * @returns {Promise<Object>} - Données du produit
 */
export async function fetchProduct(idOrSlug) {
  try {
    // Rechercher dans les produits mocké
    const product = mockProducts.find(
      (p) => p.id === idOrSlug || p.slug === idOrSlug
    );

    if (!product) {
      throw new Error("Produit introuvable");
    }

    // Simuler un délai de réseau
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(product);
      }, 300);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    throw error;
  }
}

/**
 * Récupère les produits similaires à un produit donné
 * @param {string} productId - ID du produit
 * @param {number} limit - Nombre maximum de produits à récupérer
 * @returns {Promise<Array>} - Liste des produits similaires
 */
export async function fetchRelatedProducts(productId, limit = 4) {
  try {
    // Simuler des produits similaires (dans une app réelle, cela serait basé sur la catégorie ou d'autres attributs)
    const relatedProducts = mockProducts
      .filter((p) => p.id !== productId)
      .slice(0, limit);

    // Simuler un délai de réseau
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(relatedProducts);
      }, 300);
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des produits similaires:",
      error
    );
    throw error;
  }
}

// Données mockées pour les tests
const mockCategories = [
  { id: "cat1", name: "Vêtements", count: 15 },
  { id: "cat2", name: "Électronique", count: 8 },
  { id: "cat3", name: "Maison", count: 12 },
  { id: "cat4", name: "Sport", count: 6 },
];

const mockAttributes = {
  Couleur: [
    { name: "Rouge", count: 10 },
    { name: "Bleu", count: 8 },
    { name: "Noir", count: 15 },
    { name: "Blanc", count: 12 },
  ],
  Taille: [
    { name: "S", count: 8 },
    { name: "M", count: 12 },
    { name: "L", count: 10 },
    { name: "XL", count: 6 },
  ],
  Matière: [
    { name: "Coton", count: 12 },
    { name: "Polyester", count: 8 },
    { name: "Laine", count: 5 },
    { name: "Lin", count: 3 },
  ],
};

const mockProducts = [
  {
    id: "prod1",
    name: "T-shirt Premium",
    slug: "t-shirt-premium",
    image: "https://placehold.co/600x800",
    additionalImages: [
      "https://placehold.co/600x800/eee/333",
      "https://placehold.co/600x800/333/eee",
    ],
    brand: "ModeBrand",
    category: { id: "cat1", name: "Vêtements", slug: "vetements" },
    description:
      "Un t-shirt premium en coton bio de qualité supérieure. Parfait pour toutes les saisons.",
    shortDescription: "T-shirt en coton bio de qualité supérieure",
    price: 39.99,
    priceDiscount: 29.99,
    countInStock: 25,
    rating: 4.5,
    numReviews: 12,
    isFeatured: true,
    attributes: {
      Couleur: ["Noir", "Blanc", "Bleu"],
      Taille: ["S", "M", "L", "XL"],
      Matière: ["Coton"],
    },
    variants: [
      { combination: ["Noir", "S"], stock: 5 },
      { combination: ["Noir", "M"], stock: 8 },
      { combination: ["Noir", "L"], stock: 4 },
      { combination: ["Blanc", "M"], stock: 0 },
      { combination: ["Bleu", "L"], stock: 3 },
    ],
    sku: "TS-PR-001",
    weight: 0.2,
    dimensions: {
      width: 30,
      height: 3,
      depth: 20,
    },
    createdAt: "2023-04-12T10:30:00Z",
    technicalDetails: {
      Composition: {
        "Matière principale": "100% coton bio",
        Certification: "GOTS",
      },
      Entretien: {
        Lavage: "Lavage en machine à 30°C",
        Repassage: "Fer doux",
        Séchage: "Séchage à plat",
      },
    },
  },
  {
    id: "prod2",
    name: "Casque Audio Bluetooth",
    slug: "casque-audio-bluetooth",
    image: "https://placehold.co/600x600",
    additionalImages: [
      "https://placehold.co/600x600/222/ddd",
      "https://placehold.co/600x600/ddd/222",
    ],
    brand: "TechAudio",
    category: { id: "cat2", name: "Électronique", slug: "electronique" },
    description:
      "Casque audio Bluetooth avec réduction de bruit active. Autonomie de 30 heures.",
    shortDescription: "Casque audio Bluetooth avec réduction de bruit",
    price: 199.99,
    countInStock: 10,
    rating: 4.8,
    numReviews: 24,
    isFeatured: true,
    attributes: {
      Couleur: ["Noir", "Blanc"],
    },
    sku: "HA-BT-002",
    weight: 0.3,
    dimensions: {
      width: 18,
      height: 20,
      depth: 8,
    },
    createdAt: "2023-05-20T14:15:00Z",
    technicalDetails: {
      Caractéristiques: {
        Type: "Circum-aural",
        Bluetooth: "5.0",
        Autonomie: "30 heures",
        "Réduction de bruit": "Active",
      },
      Contenu: {
        Accessoires:
          "Câble de charge USB-C, câble audio 3.5mm, étui de transport",
      },
    },
  },
  {
    id: "prod3",
    name: "Canapé Moderne",
    slug: "canape-moderne",
    image: "https://placehold.co/600x400",
    additionalImages: [
      "https://placehold.co/600x400/eee/333",
      "https://placehold.co/600x400/333/eee",
    ],
    brand: "HomeDeco",
    category: { id: "cat3", name: "Maison", slug: "maison" },
    description:
      "Canapé moderne 3 places avec coussins décoratifs. Tissu haute résistance.",
    shortDescription: "Canapé moderne 3 places",
    price: 799.99,
    priceDiscount: 699.99,
    countInStock: 3,
    rating: 4.6,
    numReviews: 8,
    isFeatured: true,
    attributes: {
      Couleur: ["Gris", "Bleu"],
      Matière: ["Polyester", "Velours"],
    },
    sku: "SO-MD-003",
    weight: 45,
    dimensions: {
      width: 220,
      height: 85,
      depth: 95,
    },
    createdAt: "2023-03-05T09:45:00Z",
    technicalDetails: {
      Caractéristiques: {
        Places: "3",
        Structure: "Bois massif et panneaux de particules",
        Garnissage: "Mousse polyuréthane haute résilience",
        Pieds: "Métal noir",
      },
      Entretien: {
        Coussin: "Housses déhoussables et lavables",
        Tissu: "Nettoyage à sec recommandé",
      },
    },
  },
  {
    id: "prod4",
    name: "Ballon de Yoga",
    slug: "ballon-yoga",
    image: "https://placehold.co/600x600",
    brand: "SportFit",
    category: { id: "cat4", name: "Sport", slug: "sport" },
    description:
      "Ballon de yoga anti-éclatement. Idéal pour le Pilates et les exercices de fitness.",
    shortDescription: "Ballon de yoga anti-éclatement",
    price: 24.99,
    countInStock: 30,
    rating: 4.2,
    numReviews: 15,
    attributes: {
      Couleur: ["Rouge", "Bleu", "Noir"],
      Taille: ["65 cm", "75 cm"],
    },
    sku: "YB-SF-004",
    weight: 1.2,
    dimensions: {
      width: 65,
      height: 65,
      depth: 65,
    },
    createdAt: "2023-06-10T16:20:00Z",
    technicalDetails: {
      Caractéristiques: {
        Matière: "PVC anti-éclatement",
        "Pression max": "300 kg",
        Surface: "Antidérapante",
      },
      Contenu: {
        Inclus: "Pompe manuelle, 2 bouchons d'étanchéité, guide d'exercices",
      },
    },
  },
  {
    id: "prod5",
    name: "Veste d'Hiver",
    slug: "veste-hiver",
    image: "https://placehold.co/600x800",
    additionalImages: ["https://placehold.co/600x800/333/ddd"],
    brand: "ModeBrand",
    category: { id: "cat1", name: "Vêtements", slug: "vetements" },
    description:
      "Veste d'hiver chaude et imperméable. Parfaite pour les activités outdoor.",
    shortDescription: "Veste d'hiver chaude et imperméable",
    price: 149.99,
    countInStock: 7,
    rating: 4.7,
    numReviews: 11,
    attributes: {
      Couleur: ["Noir", "Bleu"],
      Taille: ["M", "L", "XL"],
    },
    sku: "JK-WN-005",
    weight: 0.8,
    dimensions: {
      width: 60,
      height: 5,
      depth: 40,
    },
    createdAt: "2023-02-15T11:30:00Z",
  },
];
