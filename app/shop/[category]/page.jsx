import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

// Simuler les données de l'API
const CATEGORIES = {
  vetements: {
    name: "Vêtements",
    description: "Découvrez notre collection de vêtements de haute qualité",
    image: "/images/categories/vetements.jpg",
    subcategories: [
      {
        id: "hommes",
        name: "Hommes",
        image: "/images/subcategories/hommes.jpg",
      },
      {
        id: "femmes",
        name: "Femmes",
        image: "/images/subcategories/femmes.jpg",
      },
      {
        id: "enfants",
        name: "Enfants",
        image: "/images/subcategories/enfants.jpg",
      },
      { id: "sport", name: "Sport", image: "/images/subcategories/sport.jpg" },
    ],
    featuredProducts: [
      {
        id: 1,
        name: "T-shirt premium",
        price: 29.99,
        image: "/images/products/tshirt.jpg",
      },
      {
        id: 2,
        name: "Jeans coupe droite",
        price: 59.99,
        image: "/images/products/jeans.jpg",
      },
      {
        id: 3,
        name: "Veste d'hiver",
        price: 129.99,
        image: "/images/products/veste.jpg",
      },
    ],
  },
  accessoires: {
    name: "Accessoires",
    description: "Complétez votre style avec nos accessoires tendance",
    image: "/images/categories/accessoires.jpg",
    subcategories: [
      { id: "sacs", name: "Sacs", image: "/images/subcategories/sacs.jpg" },
      {
        id: "bijoux",
        name: "Bijoux",
        image: "/images/subcategories/bijoux.jpg",
      },
      {
        id: "ceintures",
        name: "Ceintures",
        image: "/images/subcategories/ceintures.jpg",
      },
      {
        id: "montres",
        name: "Montres",
        image: "/images/subcategories/montres.jpg",
      },
    ],
    featuredProducts: [
      {
        id: 4,
        name: "Sac à main cuir",
        price: 89.99,
        image: "/images/products/sac.jpg",
      },
      {
        id: 5,
        name: "Montre Classic",
        price: 149.99,
        image: "/images/products/montre.jpg",
      },
      {
        id: 6,
        name: "Collier argent",
        price: 49.99,
        image: "/images/products/collier.jpg",
      },
    ],
  },
  maison: {
    name: "Maison",
    description:
      "Transformez votre intérieur avec notre collection pour la maison",
    image: "/images/categories/maison.jpg",
    subcategories: [
      {
        id: "decoration",
        name: "Décoration",
        image: "/images/subcategories/decoration.jpg",
      },
      {
        id: "mobilier",
        name: "Mobilier",
        image: "/images/subcategories/mobilier.jpg",
      },
      {
        id: "cuisine",
        name: "Cuisine",
        image: "/images/subcategories/cuisine.jpg",
      },
      {
        id: "linge-maison",
        name: "Linge de maison",
        image: "/images/subcategories/linge.jpg",
      },
    ],
    featuredProducts: [
      {
        id: 7,
        name: "Vase design",
        price: 39.99,
        image: "/images/products/vase.jpg",
      },
      {
        id: 8,
        name: "Coussins décoratifs",
        price: 24.99,
        image: "/images/products/coussins.jpg",
      },
      {
        id: 9,
        name: "Lampe de table",
        price: 79.99,
        image: "/images/products/lampe.jpg",
      },
    ],
  },
};

// Génération des métadonnées dynamiques pour chaque catégorie
export async function generateMetadata({ params }) {
  const category = CATEGORIES[params.category];

  if (!category) {
    return {
      title: "Catégorie non trouvée",
      description: "La catégorie que vous recherchez n'existe pas",
    };
  }

  return {
    title: `${category.name} | Notre Boutique`,
    description: category.description,
    openGraph: {
      title: `${category.name} | Notre Boutique`,
      description: category.description,
      images: [
        { url: category.image, width: 1200, height: 630, alt: category.name },
      ],
    },
  };
}

// Génération statique des chemins pour les catégories principales
export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({
    category,
  }));
}

export default function CategoryPage({ params }) {
  const category = CATEGORIES[params.category];

  // Si la catégorie n'existe pas, renvoyer une page 404
  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center text-sm mb-6 text-muted-foreground">
        <Link href="/shop" className="hover:text-primary transition-colors">
          Boutique
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="font-medium text-foreground">{category.name}</span>
      </nav>

      {/* En-tête de la catégorie */}
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-12">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white p-6">
          <div className="text-center max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {category.name}
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Sous-catégories */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Sous-catégories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {category.subcategories.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/shop/${params.category}/${subcategory.id}`}
              className="group"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                <Image
                  src={subcategory.image}
                  alt={subcategory.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
              </div>
              <h3 className="font-medium text-center">{subcategory.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Produits populaires */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Produits populaires</h2>
          <Link
            href={`/shop?category=${params.category}`}
            className="text-primary hover:underline"
          >
            Voir tous les produits
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {category.featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/shop/product/${product.id}`}
              className="group"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-medium mb-1">{product.name}</h3>
              <p className="font-semibold">{product.price.toFixed(2)} €</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
