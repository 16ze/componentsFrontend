import React from "react";

export const metadata = {
  title: "Notre Boutique | E-Commerce",
  description: "Découvrez notre collection de produits de qualité supérieure",
  keywords: "e-commerce, boutique en ligne, produits, achats",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.example.com/shop",
    title: "Notre Boutique | E-Commerce",
    description: "Découvrez notre collection de produits de qualité supérieure",
    siteName: "Nom de votre E-Commerce",
    images: [
      {
        url: "https://www.example.com/images/og-shop.jpg",
        width: 1200,
        height: 630,
        alt: "Notre Boutique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notre Boutique | E-Commerce",
    description: "Découvrez notre collection de produits de qualité supérieure",
    images: ["https://www.example.com/images/twitter-shop.jpg"],
  },
};

export default function ShopLayout({ children }) {
  return (
    <section>
      {/* En-tête commun à toutes les pages de la boutique */}
      <div className="bg-primary/5 py-8 mb-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Notre Boutique
          </h1>
          <p className="text-muted-foreground">
            Découvrez notre sélection de produits de qualité
          </p>
        </div>
      </div>

      {/* Contenu de la page */}
      {children}

      {/* Pied de page spécifique à la boutique */}
      <div className="bg-gray-50 mt-16 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-4">
            Pourquoi nous choisir ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-medium mb-2">Livraison rapide</h3>
              <p className="text-sm text-muted-foreground">
                Livraison en 24/48h sur tous nos produits
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-medium mb-2">Satisfaction garantie</h3>
              <p className="text-sm text-muted-foreground">
                30 jours pour changer d'avis
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-medium mb-2">Service client premium</h3>
              <p className="text-sm text-muted-foreground">
                Assistance 7j/7 pour répondre à vos questions
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
