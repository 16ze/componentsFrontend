// Génération du sitemap dynamique pour Next.js
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

// Simuler des données de l'API pour les catégories et produits
const CATEGORIES = [
  { id: "vetements", name: "Vêtements" },
  { id: "accessoires", name: "Accessoires" },
  { id: "maison", name: "Maison" },
];

const SUBCATEGORIES = {
  vetements: [
    { id: "hommes", name: "Hommes" },
    { id: "femmes", name: "Femmes" },
    { id: "enfants", name: "Enfants" },
    { id: "sport", name: "Sport" },
  ],
  accessoires: [
    { id: "sacs", name: "Sacs" },
    { id: "bijoux", name: "Bijoux" },
    { id: "ceintures", name: "Ceintures" },
    { id: "montres", name: "Montres" },
  ],
  maison: [
    { id: "decoration", name: "Décoration" },
    { id: "mobilier", name: "Mobilier" },
    { id: "cuisine", name: "Cuisine" },
    { id: "linge-maison", name: "Linge de maison" },
  ],
};

const PRODUCTS = [
  {
    id: "tshirt-homme-blanc",
    slug: "tshirt-homme-blanc",
    name: "T-shirt col rond",
    category: "vetements",
    subcategory: "hommes",
    updatedAt: "2023-12-01",
  },
  {
    id: "jean-homme-slim",
    slug: "jean-homme-slim",
    name: "Jean slim fit",
    category: "vetements",
    subcategory: "hommes",
    updatedAt: "2023-12-02",
  },
  {
    id: "robe-ete-fleurie",
    slug: "robe-ete-fleurie",
    name: "Robe d'été fleurie",
    category: "vetements",
    subcategory: "femmes",
    updatedAt: "2023-12-03",
  },
  {
    id: "vase-design",
    slug: "vase-design",
    name: "Vase design",
    category: "maison",
    subcategory: "decoration",
    updatedAt: "2023-12-04",
  },
  {
    id: "sac-main-cuir",
    slug: "sac-main-cuir",
    name: "Sac à main en cuir",
    category: "accessoires",
    subcategory: "sacs",
    updatedAt: "2023-12-05",
  },
];

// URL de base du site
const BASE_URL = "https://www.example.com";

export default async function sitemap() {
  // Pages statiques
  const staticPages = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/checkout`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Pages de catégories
  const categoryPages = CATEGORIES.map((category) => ({
    url: `${BASE_URL}/shop/${category.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Pages de sous-catégories
  const subcategoryPages = CATEGORIES.flatMap((category) =>
    SUBCATEGORIES[category.id].map((subcategory) => ({
      url: `${BASE_URL}/shop/${category.id}/${subcategory.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }))
  );

  // Pages de produits
  const productPages = PRODUCTS.map((product) => ({
    url: `${BASE_URL}/shop/product/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Combiner toutes les pages
  return [
    ...staticPages,
    ...categoryPages,
    ...subcategoryPages,
    ...productPages,
  ];
}
