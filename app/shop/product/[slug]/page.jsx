import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Star,
  MessageCircle,
  Share2,
  ShoppingCart,
  Heart,
  Truck,
  RefreshCw,
  ShieldCheck,
  MinusCircle,
  PlusCircle,
} from "lucide-react";

// Simuler une API de produits
const PRODUCTS = {
  "tshirt-homme-blanc": {
    id: "tshirt-homme-blanc",
    name: "T-shirt col rond",
    price: 24.99,
    description:
      "T-shirt en coton biologique de haute qualité. Coupe classique avec col rond et manches courtes. Confortable et polyvalent, parfait pour une tenue décontractée.",
    longDescription: `
      <p>Ce t-shirt essentiel est fabriqué à partir de coton 100% biologique, offrant une douceur incomparable contre votre peau. Sa coupe classique est à la fois élégante et confortable, ce qui en fait une pièce polyvalente pour votre garde-robe.</p>
      <p>Caractéristiques:</p>
      <ul>
        <li>Coton 100% biologique certifié GOTS</li>
        <li>Col rond renforcé</li>
        <li>Coutures doubles pour plus de durabilité</li>
        <li>Coupe régulière</li>
        <li>Lavable en machine à 30°C</li>
      </ul>
      <p>Notre t-shirt est produit éthiquement dans des ateliers certifiés, garantissant des conditions de travail équitables tout au long de la chaîne d'approvisionnement.</p>
    `,
    category: "vetements",
    subcategory: "hommes",
    images: [
      "/images/products/tshirt-homme-blanc-1.jpg",
      "/images/products/tshirt-homme-blanc-2.jpg",
      "/images/products/tshirt-homme-blanc-3.jpg",
      "/images/products/tshirt-homme-blanc-4.jpg",
    ],
    variants: {
      colors: [
        {
          name: "Blanc",
          code: "#FFFFFF",
          image: "/images/variants/tshirt-blanc.jpg",
        },
        {
          name: "Noir",
          code: "#000000",
          image: "/images/variants/tshirt-noir.jpg",
        },
        {
          name: "Bleu marine",
          code: "#1B2735",
          image: "/images/variants/tshirt-marine.jpg",
        },
      ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    stock: {
      "Blanc-M": 15,
      "Blanc-L": 8,
      "Noir-M": 12,
      "Noir-L": 10,
      "Bleu marine-M": 5,
    },
    rating: 4.5,
    reviewCount: 28,
    related: ["chemise-homme-bleu", "pull-homme-col-v", "jean-homme-slim"],
    breadcrumbs: [
      { name: "Accueil", href: "/" },
      { name: "Boutique", href: "/shop" },
      { name: "Vêtements", href: "/shop/vetements" },
      { name: "Hommes", href: "/shop/vetements/hommes" },
    ],
    sku: "TSH-BLN-001",
    schema: {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: "T-shirt col rond",
      description:
        "T-shirt en coton biologique de haute qualité. Coupe classique avec col rond et manches courtes.",
      brand: {
        "@type": "Brand",
        name: "Notre Marque",
      },
    },
  },
  // Autres produits...
};

// Génération des métadonnées dynamiques pour chaque produit
export async function generateMetadata({ params }) {
  const { slug } = params;
  const product = PRODUCTS[slug];

  if (!product) {
    return {
      title: "Produit non trouvé",
      description: "Le produit que vous recherchez n'existe pas",
    };
  }

  return {
    title: `${product.name} | Notre Boutique`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Notre Boutique`,
      description: product.description,
      images: [
        {
          url: product.images[0],
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "product",
      locale: "fr_FR",
    },
    alternates: {
      canonical: `https://www.example.com/shop/product/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Génération statique des chemins pour les produits populaires
export async function generateStaticParams() {
  // Dans un environnement réel, vous récupéreriez les produits les plus populaires
  // pour les prérender statiquement
  return Object.keys(PRODUCTS)
    .slice(0, 5)
    .map((slug) => ({ slug }));
}

export default function ProductPage({ params }) {
  const { slug } = params;
  const product = PRODUCTS[slug];

  // Vérification de l'existence du produit
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <nav className="flex flex-wrap items-center text-sm mb-8 text-muted-foreground">
        {product.breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href}>
            <Link
              href={breadcrumb.href}
              className="hover:text-primary transition-colors"
            >
              {breadcrumb.name}
            </Link>
            {index < product.breadcrumbs.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-2" />
            )}
          </React.Fragment>
        ))}
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="font-medium text-foreground">{product.name}</span>
      </nav>

      {/* Contenu principal du produit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images du produit */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`relative aspect-square rounded-md overflow-hidden border ${
                  index === 0 ? "ring-2 ring-primary" : ""
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} - Vue ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Informations produit */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Prix et notes */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-semibold">
              {product.price.toFixed(2)} €
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : index < product.rating
                        ? "text-yellow-400 fill-yellow-400 opacity-50"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <Link
                href="#reviews"
                className="text-sm text-primary hover:underline"
              >
                {product.reviewCount} avis
              </Link>
            </div>
          </div>

          {/* Description courte */}
          <p className="text-muted-foreground mb-6">{product.description}</p>

          {/* Sélecteur de couleur */}
          <div className="mb-6">
            <h2 className="font-medium mb-2">Couleur</h2>
            <div className="flex space-x-2">
              {product.variants.colors.map((color) => (
                <div
                  key={color.name}
                  className="relative w-12 h-12 rounded-full overflow-hidden border cursor-pointer transition-all hover:scale-110"
                  title={color.name}
                >
                  {color.image ? (
                    <Image
                      src={color.image}
                      alt={color.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      style={{ backgroundColor: color.code }}
                      className="w-full h-full"
                    ></div>
                  )}
                  {color.name === "Blanc" && (
                    <div className="absolute inset-0 ring-2 ring-primary rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sélecteur de taille */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-medium">Taille</h2>
              <button className="text-primary text-sm hover:underline">
                Guide des tailles
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {product.variants.sizes.map((size) => {
                const isAvailable = Object.keys(product.stock).some((key) =>
                  key.includes(`-${size}`)
                );
                return (
                  <button
                    key={size}
                    disabled={!isAvailable}
                    className={`py-2 border rounded-md text-center font-medium ${
                      size === "M"
                        ? "bg-primary text-white"
                        : isAvailable
                        ? "hover:border-primary"
                        : "opacity-50 cursor-not-allowed bg-gray-50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantité */}
          <div className="mb-6">
            <h2 className="font-medium mb-2">Quantité</h2>
            <div className="flex items-center w-32 border rounded-md overflow-hidden">
              <button className="p-2 text-muted-foreground hover:text-primary">
                <MinusCircle className="h-5 w-5" />
              </button>
              <input
                type="number"
                min="1"
                defaultValue="1"
                className="flex-1 py-2 text-center focus:outline-none"
              />
              <button className="p-2 text-muted-foreground hover:text-primary">
                <PlusCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button className="flex-1 bg-primary text-white py-3 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              Ajouter au panier
            </button>
            <button className="p-3 border rounded-md hover:bg-gray-50">
              <Heart className="h-5 w-5" />
            </button>
            <button className="p-3 border rounded-md hover:bg-gray-50">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Informations additionnelles */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex gap-3">
              <div className="text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Livraison gratuite</p>
                <p className="text-sm text-muted-foreground">
                  Pour les commandes de plus de 50€
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-primary">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Retours sous 30 jours</p>
                <p className="text-sm text-muted-foreground">
                  Retours gratuits et faciles
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Garantie qualité</p>
                <p className="text-sm text-muted-foreground">
                  Produits testés et approuvés
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets de description, caractéristiques, avis */}
      <div className="mt-16">
        <div className="border-b mb-6">
          <div className="flex space-x-8">
            <button className="py-3 border-b-2 border-primary font-medium">
              Description
            </button>
            <button className="py-3 text-muted-foreground">
              Caractéristiques
            </button>
            <button className="py-3 text-muted-foreground">Livraison</button>
            <button className="py-3 text-muted-foreground">Avis</button>
          </div>
        </div>

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: product.longDescription }}
        ></div>
      </div>

      {/* Produits similaires */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Vous pourriez aussi aimer</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {product.related.map((relatedSlug) => {
            const relatedProduct = PRODUCTS[relatedSlug] || {
              id: relatedSlug,
              name: "Produit connexe",
              price: 29.99,
              images: ["/images/products/placeholder.jpg"],
            };
            return (
              <Link
                key={relatedProduct.id}
                href={`/shop/product/${relatedSlug}`}
                className="group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                  <Image
                    src={
                      relatedProduct.images?.[0] ||
                      "/images/products/placeholder.jpg"
                    }
                    alt={relatedProduct.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                  {relatedProduct.name}
                </h3>
                <p className="font-semibold">
                  {relatedProduct.price.toFixed(2)} €
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Script pour données structurées */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(product.schema) }}
      />
    </div>
  );
}
