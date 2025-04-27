"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  CreditCard,
  RefreshCw,
  MinusCircle,
  PlusCircle,
} from "lucide-react";

// Simuler un store pour le panier
// Dans un environnement réel, cela serait géré par un state manager comme Zustand
const useCartItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler une requête API
    setTimeout(() => {
      setItems([
        {
          id: 1,
          name: "T-shirt col rond",
          price: 24.99,
          image: "/images/products/tshirt-homme-blanc-1.jpg",
          color: "Blanc",
          size: "M",
          quantity: 2,
          slug: "tshirt-homme-blanc",
        },
        {
          id: 2,
          name: "Jean slim fit",
          price: 59.99,
          image: "/images/products/jean-homme-slim.jpg",
          color: "Bleu délavé",
          size: "32",
          quantity: 1,
          slug: "jean-homme-slim",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return { items, loading, updateQuantity, removeItem, getSubtotal };
};

// Métadonnées pour la page Panier
export const metadata = {
  title: "Votre Panier | E-Commerce",
  description:
    "Consultez les articles dans votre panier et procédez au paiement",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, getSubtotal } =
    useCartItems();

  // Calculer les montants
  const subtotal = getSubtotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  // Formatter les prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {[1, 2].map((index) => (
              <div key={index} className="p-4 border rounded-lg animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="w-24 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="md:col-span-1">
            <div className="p-6 border rounded-lg shadow-sm animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si le panier est vide
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
          <ShoppingCart className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Vous n'avez aucun article dans votre panier. Parcourez notre boutique
          pour découvrir nos produits.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md font-medium"
        >
          Continuer vos achats
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Liste des produits */}
        <div className="md:col-span-2">
          <div className="hidden md:grid grid-cols-12 gap-4 py-3 px-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-6">Produit</div>
            <div className="col-span-2 text-center">Prix unitaire</div>
            <div className="col-span-2 text-center">Quantité</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Produit et image */}
                  <div className="col-span-12 md:col-span-6 flex gap-4">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/shop/product/${item.slug}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>{item.color}</span>
                        {item.size && (
                          <>
                            <span className="mx-1">•</span>
                            <span>Taille: {item.size}</span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-500 mt-2 flex items-center hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Prix unitaire */}
                  <div className="col-span-4 md:col-span-2 text-left md:text-center">
                    <div className="md:hidden text-sm text-muted-foreground mb-1">
                      Prix unitaire
                    </div>
                    {formatPrice(item.price)}
                  </div>

                  {/* Quantité */}
                  <div className="col-span-4 md:col-span-2 text-left md:text-center">
                    <div className="md:hidden text-sm text-muted-foreground mb-1">
                      Quantité
                    </div>
                    <div className="inline-flex items-center border rounded-md">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 text-muted-foreground hover:text-primary"
                        aria-label="Diminuer la quantité"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        className="w-10 py-1 text-center focus:outline-none"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 text-muted-foreground hover:text-primary"
                        aria-label="Augmenter la quantité"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-4 md:col-span-2 text-left md:text-right font-medium">
                    <div className="md:hidden text-sm text-muted-foreground mb-1">
                      Total
                    </div>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-between items-center mt-8">
            <Link
              href="/shop"
              className="px-6 py-2 border rounded-md hover:bg-gray-50 transition-colors flex items-center"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Continuer mes achats
            </Link>
            <button className="px-6 py-2 border rounded-md hover:bg-gray-50 transition-colors flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Mettre à jour le panier
            </button>
          </div>
        </div>

        {/* Récapitulatif de commande */}
        <div className="md:col-span-1">
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span>
                  {shipping === 0 ? "Gratuit" : formatPrice(shipping)}
                </span>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-medium">
                  <span>Total (TTC)</span>
                  <span className="text-lg">{formatPrice(total)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  TVA incluse
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3 bg-primary text-white rounded-md font-medium flex items-center justify-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Procéder au paiement
            </Link>

            <div className="mt-6 text-sm text-muted-foreground space-y-2">
              <div className="flex items-center">
                <Image
                  src="/images/payment/visa.svg"
                  alt="Visa"
                  width={36}
                  height={12}
                  className="mr-2"
                />
                <Image
                  src="/images/payment/mastercard.svg"
                  alt="Mastercard"
                  width={36}
                  height={12}
                  className="mr-2"
                />
                <Image
                  src="/images/payment/amex.svg"
                  alt="American Express"
                  width={36}
                  height={12}
                  className="mr-2"
                />
                <Image
                  src="/images/payment/paypal.svg"
                  alt="PayPal"
                  width={36}
                  height={12}
                />
              </div>
              <p>Livraison gratuite à partir de 50€</p>
              <p>Paiement 100% sécurisé</p>
            </div>
          </div>

          {/* Code promo */}
          <div className="mt-4 p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Code promo</h3>
            <div className="flex">
              <input
                type="text"
                placeholder="Entrez votre code"
                className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-r-md">
                Appliquer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
