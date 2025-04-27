"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  ShoppingCart,
  Truck,
  CreditCard,
  Package2,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCartStore } from "@/stores/cartStore";
import ShippingForm from "./ShippingForm";
import PaymentProcessor from "./PaymentProcessor";
import OrderConfirmation from "./OrderConfirmation";
import OrderSummary from "./OrderSummary";
import CartPage from "../shop/CartPage";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Définition des étapes du processus de checkout
const CHECKOUT_STEPS = [
  { id: "cart", label: "Panier", icon: ShoppingCart, path: "/checkout" },
  {
    id: "shipping",
    label: "Livraison",
    icon: Truck,
    path: "/checkout/shipping",
  },
  {
    id: "payment",
    label: "Paiement",
    icon: CreditCard,
    path: "/checkout/payment",
  },
  {
    id: "confirmation",
    label: "Confirmation",
    icon: Package2,
    path: "/checkout/confirmation",
  },
];

export default function CheckoutFlow() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cartStore = useCartStore();

  // État local pour suivre l'étape actuelle et les données saisies
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Récupérer les données de progression depuis localStorage
  const [checkoutData, setCheckoutData] = useLocalStorage("checkout-data", {
    shipping: null,
    billing: null,
    payment: null,
    shippingMethod: null,
  });

  // Détermine l'étape actuelle en fonction de l'URL
  useEffect(() => {
    const stepFromPath = CHECKOUT_STEPS.findIndex(
      (step) =>
        pathname === step.path ||
        (pathname.startsWith(step.path) && step.path !== "/checkout")
    );

    if (stepFromPath !== -1) {
      setCurrentStepIndex(stepFromPath);
    } else {
      // Rediriger vers la première étape si l'URL ne correspond à aucune étape
      router.push(CHECKOUT_STEPS[0].path);
    }
  }, [pathname, router]);

  // Vérifier si le panier est vide et rediriger si nécessaire
  useEffect(() => {
    if (cartStore.items.length === 0 && currentStepIndex > 0) {
      setError(
        "Votre panier est vide. Veuillez ajouter des articles avant de continuer."
      );
      setTimeout(() => {
        router.push("/shop");
      }, 3000);
    } else {
      setError(null);
    }
  }, [cartStore.items.length, currentStepIndex, router]);

  // Calculer le pourcentage de progression
  const progressPercentage =
    (currentStepIndex / (CHECKOUT_STEPS.length - 1)) * 100;

  // Vérifier si l'étape actuelle est valide (données requises présentes)
  const isCurrentStepValid = () => {
    switch (CHECKOUT_STEPS[currentStepIndex].id) {
      case "cart":
        return cartStore.items.length > 0;
      case "shipping":
        return (
          checkoutData.shipping !== null && checkoutData.shippingMethod !== null
        );
      case "payment":
        return checkoutData.payment !== null;
      case "confirmation":
        return true;
      default:
        return false;
    }
  };

  // Naviguer vers l'étape suivante
  const goToNextStep = () => {
    if (currentStepIndex < CHECKOUT_STEPS.length - 1 && isCurrentStepValid()) {
      setIsNavigating(true);
      const nextStep = CHECKOUT_STEPS[currentStepIndex + 1];

      // Sauvegarder l'état actuel dans l'URL si nécessaire
      const currentQueryParams = Object.fromEntries(searchParams.entries());
      const queryString = new URLSearchParams(currentQueryParams).toString();
      const nextUrl = queryString
        ? `${nextStep.path}?${queryString}`
        : nextStep.path;

      router.push(nextUrl);
      setIsNavigating(false);
    } else if (!isCurrentStepValid()) {
      setError(
        "Veuillez remplir tous les champs obligatoires avant de continuer."
      );
    }
  };

  // Naviguer vers l'étape précédente
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setIsNavigating(true);
      const prevStep = CHECKOUT_STEPS[currentStepIndex - 1];

      // Préserver les paramètres d'URL
      const currentQueryParams = Object.fromEntries(searchParams.entries());
      const queryString = new URLSearchParams(currentQueryParams).toString();
      const prevUrl = queryString
        ? `${prevStep.path}?${queryString}`
        : prevStep.path;

      router.push(prevUrl);
      setIsNavigating(false);
    }
  };

  // Mettre à jour les données de checkout
  const updateCheckoutData = (key, value) => {
    setCheckoutData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Rendu du contenu de l'étape actuelle
  const renderStepContent = () => {
    const currentStep = CHECKOUT_STEPS[currentStepIndex];

    switch (currentStep.id) {
      case "cart":
        return <CartPage isCheckout />;

      case "shipping":
        return (
          <ShippingForm
            initialData={checkoutData.shipping}
            onSave={(data) => updateCheckoutData("shipping", data)}
            onShippingMethodSelect={(method) =>
              updateCheckoutData("shippingMethod", method)
            }
            selectedShippingMethod={checkoutData.shippingMethod}
          />
        );

      case "payment":
        return (
          <PaymentProcessor
            initialData={checkoutData.payment}
            onSave={(data) => updateCheckoutData("payment", data)}
            shippingData={checkoutData.shipping}
          />
        );

      case "confirmation":
        return (
          <OrderConfirmation
            orderData={{
              items: cartStore.items,
              shipping: checkoutData.shipping,
              payment: checkoutData.payment,
              shippingMethod: checkoutData.shippingMethod,
            }}
          />
        );

      default:
        return <div>Étape inconnue</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Indicateur de progression */}
      <div className="mb-8 md:mb-12">
        <div className="hidden md:flex justify-between mb-2">
          {CHECKOUT_STEPS.map((step, index) => {
            const isActive = currentStepIndex === index;
            const isCompleted = currentStepIndex > index;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center w-1/${
                  CHECKOUT_STEPS.length
                } relative ${
                  isActive || isCompleted
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2 
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }
                `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-sm font-medium">{step.label}</span>

                {/* Ligne de connexion entre les étapes */}
                {index < CHECKOUT_STEPS.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-[2px] bg-muted">
                    <div
                      className="h-full bg-primary origin-left transition-all duration-300"
                      style={{ transform: `scaleX(${isCompleted ? 1 : 0})` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Version mobile: barre de progression simple */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between mb-1 text-sm">
            <span className="font-medium">
              {CHECKOUT_STEPS[currentStepIndex].label}
            </span>
            <span className="text-muted-foreground">
              Étape {currentStepIndex + 1} sur {CHECKOUT_STEPS.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenu principal de l'étape */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-lg shadow-sm p-6 border"
            >
              {renderStepContent()}

              {/* Boutons de navigation (sauf sur la page de confirmation) */}
              {currentStepIndex < CHECKOUT_STEPS.length - 1 && (
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={currentStepIndex === 0 || isNavigating}
                  >
                    Retour
                  </Button>

                  <Button
                    onClick={goToNextStep}
                    disabled={!isCurrentStepValid() || isNavigating}
                    className="gap-2"
                  >
                    {CHECKOUT_STEPS[currentStepIndex + 1]?.label || "Continuer"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Résumé de la commande (toujours visible) */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={cartStore.items}
            shippingMethod={checkoutData.shippingMethod}
            isCheckoutFlow
            currentStep={CHECKOUT_STEPS[currentStepIndex].id}
          />
        </div>
      </div>
    </div>
  );
}
