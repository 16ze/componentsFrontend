"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  Truck,
  User,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// Simuler un contexte de checkout
// En production, cela serait probablement un store Zustand ou Context API
const useCheckout = () => {
  const [step, setStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    shipping: null,
    shippingMethod: null,
    payment: null,
  });
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Simuler une requête API pour récupérer les articles du panier
    setTimeout(() => {
      setCartItems([
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
    }, 500);
  }, []);

  const getTotals = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const shipping = checkoutData.shippingMethod?.price || 0;
    const discount = 0; // Ajouter la logique de remise si nécessaire
    const tax = (subtotal + shipping - discount) * 0.2; // TVA à 20%
    const total = subtotal + shipping + tax - discount;

    return { subtotal, shipping, discount, tax, total };
  };

  const updateCheckoutData = (key, value) => {
    setCheckoutData((prev) => ({ ...prev, [key]: value }));
  };

  const goToNextStep = () => {
    if (step < 4) {
      setStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const isStepComplete = (stepNumber) => {
    switch (stepNumber) {
      case 1: // Panier
        return cartItems.length > 0;
      case 2: // Livraison
        return checkoutData.shipping && checkoutData.shippingMethod;
      case 3: // Paiement
        return checkoutData.payment;
      default:
        return false;
    }
  };

  return {
    step,
    setStep,
    checkoutData,
    updateCheckoutData,
    cartItems,
    loading,
    getTotals,
    goToNextStep,
    goToPreviousStep,
    isStepComplete,
  };
};

// Metadata pour la page checkout
export const metadata = {
  title: "Finaliser votre commande | E-Commerce",
  description: "Terminez votre achat en toute sécurité",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    step,
    checkoutData,
    updateCheckoutData,
    cartItems,
    loading,
    getTotals,
    goToNextStep,
    goToPreviousStep,
    isStepComplete,
  } = useCheckout();

  // État pour gérer les messages d'erreur
  const [error, setError] = useState(null);

  // Les étapes du processus de checkout
  const STEPS = [
    { id: 1, name: "Panier", icon: ShoppingCart },
    { id: 2, name: "Livraison", icon: Truck },
    { id: 3, name: "Paiement", icon: CreditCard },
    { id: 4, name: "Confirmation", icon: CheckCircle2 },
  ];

  // Formatter les prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Placeholder pour les différentes étapes
  // En production, ce seraient des composants importés
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Votre panier</h2>
            <p className="text-muted-foreground">
              Vérifiez les articles de votre commande avant de continuer.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              {/* Simuler un composant CartReview */}
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between">
                    <div className="flex items-center">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground ml-2">
                        x{item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between font-medium">
                <div>Total</div>
                <div>{formatPrice(getTotals().total)}</div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informations de livraison</h2>
            <p className="text-muted-foreground">
              Veuillez fournir vos informations de livraison.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              {/* Simuler un composant ShippingForm */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="12 rue de Paris"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="75001"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Paris"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Méthode de livraison
                </label>
                <div className="space-y-2">
                  <label className="flex p-3 border rounded-md items-center cursor-pointer">
                    <input type="radio" name="shipping" className="mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">Livraison standard</div>
                      <div className="text-sm text-muted-foreground">
                        3-5 jours ouvrés
                      </div>
                    </div>
                    <div className="font-medium">4.99€</div>
                  </label>

                  <label className="flex p-3 border rounded-md items-center cursor-pointer">
                    <input type="radio" name="shipping" className="mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">Livraison express</div>
                      <div className="text-sm text-muted-foreground">
                        1-2 jours ouvrés
                      </div>
                    </div>
                    <div className="font-medium">9.99€</div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Paiement sécurisé</h2>
            <p className="text-muted-foreground">
              Choisissez votre méthode de paiement et complétez votre commande.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              {/* Simuler un composant PaymentForm */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Moyen de paiement
                </label>
                <div className="space-y-2">
                  <label className="flex p-3 border rounded-md items-center cursor-pointer">
                    <input type="radio" name="payment" className="mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">Carte bancaire</div>
                    </div>
                  </label>

                  <label className="flex p-3 border rounded-md items-center cursor-pointer">
                    <input type="radio" name="payment" className="mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">PayPal</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="MM/AA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CVC</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="123"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">
                    L'adresse de facturation est la même que l'adresse de
                    livraison
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Commande confirmée !</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Merci pour votre achat. Votre commande a été confirmée et sera
              expédiée sous peu.
            </p>
            <div className="py-4">
              <div className="p-4 border rounded-lg inline-block">
                <div className="text-sm text-muted-foreground">
                  Numéro de commande
                </div>
                <div className="font-semibold">#ORD-2023-1156</div>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <button
                onClick={() => router.push("/account/orders")}
                className="px-6 py-2 bg-primary text-white rounded-md font-medium"
              >
                Voir mes commandes
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-12 w-1/2"></div>
          <div className="grid grid-cols-4 gap-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Finaliser votre commande</h1>
        <p className="text-muted-foreground mb-8">
          Complétez les étapes ci-dessous pour terminer votre achat.
        </p>

        {/* Étapes de progression */}
        <div className="mb-12 relative">
          <div className="hidden md:flex mb-8">
            {STEPS.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const isActive = step === stepItem.id;
              const isComplete = step > stepItem.id;

              return (
                <div key={stepItem.id} className="flex-1 text-center">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isActive
                          ? "bg-primary text-white"
                          : isComplete
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        isActive || isComplete
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {stepItem.name}
                    </div>

                    {/* Ligne de connexion entre les étapes */}
                    {index < STEPS.length - 1 && (
                      <div className="absolute top-5 left-1/2 w-full h-[2px] bg-gray-200">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{
                            transform: `scaleX(${isComplete ? 1 : 0})`,
                            transformOrigin: "left",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Version mobile */}
          <div className="md:hidden mb-6">
            <div className="flex justify-between mb-2">
              <div className="text-sm font-medium">{STEPS[step - 1].name}</div>
              <div className="text-sm text-muted-foreground">
                Étape {step} sur {STEPS.length}
              </div>
            </div>
            <div className="bg-gray-200 h-1 rounded-full">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${(step / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Contenu de l'étape */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {renderStep()}
        </div>

        {/* Boutons de navigation */}
        {step < 4 && (
          <div className="flex justify-between">
            <button
              onClick={goToPreviousStep}
              className="px-6 py-3 border rounded-md font-medium flex items-center hover:bg-gray-50 transition-colors"
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 1 ? "Retour à la boutique" : "Précédent"}
            </button>

            <button
              onClick={goToNextStep}
              className="px-6 py-3 bg-primary text-white rounded-md font-medium flex items-center hover:bg-primary/90 transition-colors"
              disabled={!isStepComplete(step)}
            >
              {step === 3 ? "Payer maintenant" : "Continuer"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
