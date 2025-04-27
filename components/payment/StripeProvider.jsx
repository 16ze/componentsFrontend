"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Configuration des apparences pour Stripe Elements
const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#0570de",
    colorBackground: "#ffffff",
    colorText: "#30313d",
    colorDanger: "#df1b41",
    fontFamily: "System-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      padding: "10px 14px",
    },
    ".Input:focus": {
      boxShadow: "0 0 0 2px rgba(5, 112, 222, 0.4)",
      borderColor: "#0570de",
    },
    ".Error": {
      fontSize: "0.875rem",
      color: "#df1b41",
      marginTop: "2px",
    },
    ".Label": {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#4a5568",
      marginBottom: "4px",
    },
  },
};

// Options pour Stripe Elements
const elementsOptions = {
  appearance,
  locale: "fr",
};

/**
 * Wrapper autour de Stripe Elements pour faciliter l'intégration de paiement
 * @param {Object} props - Propriétés du composant
 * @param {string} props.clientSecret - Clé secrète client pour le PaymentIntent
 * @param {Object} props.options - Options supplémentaires pour Stripe Elements
 * @param {boolean} props.skipLoader - Ne pas afficher le loader pendant le chargement
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Composant StripeProvider
 */
const StripeProvider = ({
  clientSecret = null,
  options = {},
  skipLoader = false,
  children,
}) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger Stripe au montage du composant
  useEffect(() => {
    const loadStripeInstance = async () => {
      try {
        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!stripeKey) {
          console.error(
            "La clé publique Stripe est manquante. Veuillez définir NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY."
          );
          return;
        }

        const stripe = await loadStripe(stripeKey);
        setStripePromise(stripe);
      } catch (error) {
        console.error("Erreur lors du chargement de Stripe:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStripeInstance();
  }, []);

  // Options finales pour Elements
  const finalOptions = {
    ...elementsOptions,
    ...options,
    clientSecret,
  };

  // Afficher un indicateur de chargement si nécessaire
  if (isLoading && !skipLoader) {
    return (
      <div className="flex items-center justify-center p-4 rounded-md border border-gray-200 bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-sm text-gray-600">
          Chargement de Stripe...
        </span>
      </div>
    );
  }

  // Ne pas continuer si Stripe n'a pas pu être chargé
  if (!stripePromise && !skipLoader) {
    return (
      <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">
        Impossible de charger Stripe. Veuillez réessayer ou contacter le
        support.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={finalOptions}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
