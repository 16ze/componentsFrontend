import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Filter, SortAsc } from "lucide-react";

// Simuler les données de l'API
const CATEGORIES = {
  vetements: {
    name: "Vêtements",
    subcategories: {
      hommes: {
        name: "Hommes",
        description: "Collection de vêtements pour hommes",
        image: "/images/subcategories/hommes.jpg",
        filters: ["Taille", "Couleur", "Style", "Matériau"],
        products: [
          {
            id: "tshirt-homme-blanc",
            slug: "tshirt-homme-blanc",
            name: "T-shirt col rond",
            price: 24.99,
            image: "/images/products/tshirt-homme-blanc.jpg",
            rating: 4.5,
          },
          {
            id: "chemise-homme-bleu",
            slug: "chemise-homme-bleu",
            name: "Chemise en lin",
            price: 49.99,
            image: "/images/products/chemise-homme-bleu.jpg",
            rating: 4.2,
          },
          {
            id: "jean-homme-slim",
            slug: "jean-homme-slim",
            name: "Jean slim fit",
            price: 59.99,
            image: "/images/products/jean-homme-slim.jpg",
            rating: 4.7,
          },
          {
            id: "veste-homme-cuir",
            slug: "veste-homme-cuir",
            name: "Veste en cuir",
            price: 149.99,
            image: "/images/products/veste-homme-cuir.jpg",
            rating: 4.8,
          },
          {
            id: "pull-homme-col-v",
            slug: "pull-homme-col-v",
            name: "Pull col V",
            price: 39.99,
            image: "/images/products/pull-homme-col-v.jpg",
            rating: 4.0,
          },
          {
            id: "pantalon-chino",
            slug: "pantalon-chino",
            name: "Pantalon chino",
            price: 45.99,
            image: "/images/products/pantalon-chino.jpg",
            rating: 4.3,
          },
        ],
      },
      femmes: {
        name: "Femmes",
        description: "Collection de vêtements pour femmes",
        image: "/images/subcategories/femmes.jpg",
        filters: ["Taille", "Couleur", "Style", "Matériau"],
        products: [
          {
            id: "robe-ete-fleurie",
            slug: "robe-ete-fleurie",
            name: "Robe d'été fleurie",
            price: 39.99,
            image: "/images/products/robe-ete-fleurie.jpg",
            rating: 4.6,
          },
          {
            id: "blouse-soie",
            slug: "blouse-soie",
            name: "Blouse en soie",
            price: 59.99,
            image: "/images/products/blouse-soie.jpg",
            rating: 4.4,
          },
          {
            id: "jupe-midi-plissee",
            slug: "jupe-midi-plissee",
            name: "Jupe midi plissée",
            price: 49.99,
            image: "/images/products/jupe-midi-plissee.jpg",
            rating: 4.2,
          },
          {
            id: "pantalon-tailleur",
            slug: "pantalon-tailleur",
            name: "Pantalon de tailleur",
            price: 69.99,
            image: "/images/products/pantalon-tailleur.jpg",
            rating: 4.5,
          },
          {
            id: "tshirt-femme-col-v",
            slug: "tshirt-femme-col-v",
            name: "T-shirt col V",
            price: 19.99,
            image: "/images/products/tshirt-femme-col-v.jpg",
            rating: 4.1,
          },
          {
            id: "pull-femme-cachemire",
            slug: "pull-femme-cachemire",
            name: "Pull en cachemire",
            price: 89.99,
            image: "/images/products/pull-femme-cachemire.jpg",
            rating: 4.9,
          },
        ],
      },
      // Autres sous-catégories...
    },
  },
  // Autres catégories...
};

// Génération des métadonnées dynamiques pour chaque sous-catégorie
export async function generateMetadata({ params }) {
  const { category, subcategory } = params;

  if (
    !CATEGORIES[category] ||
    !CATEGORIES[category].subcategories[subcategory]
  ) {
    return {
      title: "Sous-catégorie non trouvée",
      description: "La sous-catégorie que vous recherchez n'existe pas",
    };
  }

  const subcategoryData = CATEGORIES[category].subcategories[subcategory];

  return {
    title: `${subcategoryData.name} - ${CATEGORIES[category].name} | Notre Boutique`,
    description: subcategoryData.description,
    openGraph: {
      title: `${subcategoryData.name} - ${CATEGORIES[category].name} | Notre Boutique`,
      description: subcategoryData.description,
      images: [
        {
          url: subcategoryData.image,
          width: 1200,
          height: 630,
          alt: subcategoryData.name,
        },
      ],
    },
  };
}

// Génération statique des chemins pour les sous-catégories principales
export async function generateStaticParams() {
  let paths = [];

  Object.entries(CATEGORIES).forEach(([categoryId, category]) => {
    Object.keys(category.subcategories).forEach((subcategoryId) => {
      paths.push({ category: categoryId, subcategory: subcategoryId });
    });
  });

  return paths;
}

export default function SubcategoryPage({ params }) {
  const { category, subcategory } = params;

  // Vérification de l'existence de la catégorie et sous-catégorie
  if (
    !CATEGORIES[category] ||
    !CATEGORIES[category].subcategories[subcategory]
  ) {
    notFound();
  }

  const categoryData = CATEGORIES[category];
  const subcategoryData = categoryData.subcategories[subcategory];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center text-sm mb-6 text-muted-foreground">
        <Link href="/shop" className="hover:text-primary transition-colors">
          Boutique
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link
          href={`/shop/${category}`}
          className="hover:text-primary transition-colors"
        >
          {categoryData.name}
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="font-medium text-foreground">
          {subcategoryData.name}
        </span>
      </nav>

      {/* En-tête de la sous-catégorie */}
      <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8">
        <Image
          src={subcategoryData.image}
          alt={subcategoryData.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white p-6">
          <div className="text-center max-w-xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {subcategoryData.name}
            </h1>
            <p className="text-base md:text-lg opacity-90">
              {subcategoryData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et résultats */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar des filtres */}
        <div className="md:w-1/4 space-y-6">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filtres</h2>
              <Filter className="h-4 w-4" />
            </div>

            {subcategoryData.filters.map((filter) => (
              <div key={filter} className="mb-4">
                <h3 className="font-medium mb-2">{filter}</h3>
                <div className="space-y-2">
                  {["Option 1", "Option 2", "Option 3"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-3 border-t mt-4">
              <button className="w-full py-2 bg-primary text-white rounded-md">
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>

        {/* Produits */}
        <div className="md:w-3/4">
          {/* Tri et compteur */}
          <div className="flex flex-wrap justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Affichage de{" "}
              <span className="font-medium">
                {subcategoryData.products.length}
              </span>{" "}
              produits
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm">Trier par:</span>
              <select className="py-1 px-2 border rounded text-sm">
                <option value="popular">Popularité</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="newest">Nouveautés</option>
              </select>
            </div>
          </div>

          {/* Grille de produits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategoryData.products.map((product) => (
              <Link
                key={product.id}
                href={`/shop/product/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-white text-primary font-medium text-sm py-1 px-2 rounded">
                    {product.rating}★
                  </div>
                </div>
                <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="font-semibold">{product.price.toFixed(2)} €</p>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center gap-2">
              <button className="px-4 py-2 border rounded-md bg-gray-50">
                Précédent
              </button>
              <button className="px-4 py-2 border rounded-md bg-primary text-white">
                1
              </button>
              <button className="px-4 py-2 border rounded-md">2</button>
              <button className="px-4 py-2 border rounded-md">3</button>
              <button className="px-4 py-2 border rounded-md bg-gray-50">
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
