"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from "@stripe/react-stripe-js";
import {
  Lock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Chargement de Stripe (devrait être remplacé par votre clé publique)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Schéma de validation pour le formulaire de paiement
const paymentSchema = z.object({
  savePaymentMethod: z.boolean().optional(),
  billingAddressSameAsShipping: z.boolean().optional(),
});

// Composant principal de paiement
export default function PaymentProcessor({
  initialData,
  onSave,
  shippingData,
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);

  // Récupérer la clé secrète du client Stripe au chargement
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      setIsLoading(true);
      try {
        // Simulation d'une requête API pour obtenir un intent de paiement
        // Dans un cas réel, cela devrait être une requête API réelle à votre backend
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulons une réponse de l'API avec un client_secret et un payment_intent_id
        const clientSecretMock =
          "pi_mock_secret_" + Math.random().toString(36).substring(2, 15);
        const paymentIntentMock = {
          id: "pi_" + Math.random().toString(36).substring(2, 10),
          amount: 12345, // en centimes
          currency: "eur",
          status: "requires_payment_method",
        };

        setClientSecret(clientSecretMock);
        setPaymentIntent(paymentIntentMock);
      } catch (error) {
        console.error(
          "Erreur lors de la création de l'intention de paiement:",
          error
        );
        setPaymentStatus({
          type: "error",
          message: "Impossible de préparer le paiement. Veuillez réessayer.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentIntent();
  }, []);

  // Options pour Stripe Elements
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#0f766e",
      colorBackground: "#ffffff",
      colorText: "#1e293b",
      colorDanger: "#df1b41",
      fontFamily: "system-ui, sans-serif",
      fontSizeSm: "0.875rem",
      fontWeightNormal: "400",
      borderRadius: "0.375rem",
      spacingUnit: "0.5rem",
    },
  };

  const options = {
    clientSecret,
    appearance,
    locale: "fr",
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Paiement sécurisé</h2>
        <p className="text-muted-foreground flex items-center">
          <Lock className="mr-2 h-4 w-4" />
          Toutes les transactions sont sécurisées et cryptées
        </p>
      </div>

      {paymentStatus?.type === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{paymentStatus.message}</AlertDescription>
        </Alert>
      )}

      {paymentStatus?.type === "success" && (
        <Alert className="bg-green-50 text-green-800 border-green-200 mb-6">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {paymentStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Préparation du paiement...</p>
        </div>
      ) : clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            initialData={initialData}
            onSave={onSave}
            shippingData={shippingData}
            setPaymentStatus={setPaymentStatus}
          />
        </Elements>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-destructive font-medium">
            Impossible de charger le système de paiement. Veuillez réessayer.
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t">
        <div className="flex flex-wrap gap-4 justify-center">
          <img src="/images/payment/visa.svg" alt="Visa" className="h-8" />
          <img
            src="/images/payment/mastercard.svg"
            alt="Mastercard"
            className="h-8"
          />
          <img
            src="/images/payment/amex.svg"
            alt="American Express"
            className="h-8"
          />
          <img
            src="/images/payment/apple-pay.svg"
            alt="Apple Pay"
            className="h-8"
          />
          <img
            src="/images/payment/google-pay.svg"
            alt="Google Pay"
            className="h-8"
          />
        </div>

        <div className="flex items-center justify-center mt-6 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 mr-2" />
          Paiement 100% sécurisé via Stripe
        </div>
      </div>
    </div>
  );
}

// Formulaire de paiement avec Stripe Elements
function CheckoutForm({ initialData, onSave, shippingData, setPaymentStatus }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Initialiser le formulaire
  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      savePaymentMethod: initialData?.savePaymentMethod || false,
      billingAddressSameAsShipping:
        initialData?.billingAddressSameAsShipping !== false,
    },
  });

  // Traiter la soumission du formulaire de paiement
  const onSubmit = async (formData) => {
    if (!stripe || !elements) {
      // Stripe n'est pas encore chargé
      return;
    }

    setIsSubmitting(true);
    setCardError(null);

    try {
      // Confirmer le paiement avec Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation`,
          payment_method_data: {
            billing_details: {
              name: `${shippingData?.firstName} ${shippingData?.lastName}`,
              email: shippingData?.email,
              phone: shippingData?.phone,
              // Les détails de facturation sont gérés par l'élément AddressElement de Stripe
            },
          },
          // Information de stockage de la méthode de paiement pour une utilisation future
          // Uniquement si l'utilisateur a activé l'option
          setup_future_usage: formData.savePaymentMethod
            ? "off_session"
            : undefined,
        },
        redirect: "if_required",
      });

      if (error) {
        // Gérer les erreurs de paiement
        console.error("Erreur de paiement:", error);
        setCardError(error.message);

        setPaymentStatus({
          type: "error",
          message: error.message || "Une erreur est survenue lors du paiement.",
        });
      } else if (paymentIntent) {
        // Paiement réussi
        console.log("Paiement réussi:", paymentIntent);

        // Simuler un délai pour le traitement du paiement
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Sauvegarder les données du formulaire
        onSave({
          ...formData,
          paymentMethod: paymentMethod,
          paymentIntentId: paymentIntent.id,
          lastFour: paymentIntent.payment_method?.card?.last4 || "1234", // Simulé pour la démo
        });

        // Afficher un message de succès
        setPaymentStatus({
          type: "success",
          message: "Paiement traité avec succès ! Vous allez être redirigé...",
        });
      }
    } catch (error) {
      console.error("Erreur inattendue lors du paiement:", error);
      setPaymentStatus({
        type: "error",
        message: "Une erreur inattendue est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Les méthodes de paiement disponibles
  const paymentMethods = [
    { id: "card", label: "Carte bancaire", icon: CreditCard },
    {
      id: "applepay",
      label: "Apple Pay",
      icon: CreditCard,
      disabled: !stripe?.canMakePayment?.({ applePay: true }),
    },
    {
      id: "googlepay",
      label: "Google Pay",
      icon: CreditCard,
      disabled: !stripe?.canMakePayment?.({ googlePay: true }),
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Sélection de la méthode de paiement */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Méthode de paiement</h3>

          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="space-y-3"
          >
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`
                    flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                    ${
                      method.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent"
                    }
                    ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-input"
                    }
                  `}
                >
                  <RadioItem
                    value={method.id}
                    id={method.id}
                    disabled={method.disabled}
                    className="sr-only"
                  />
                  <div className="w-8 h-8 mr-4 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{method.label}</span>
                  {paymentMethod === method.id && (
                    <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                  )}
                </label>
              );
            })}
          </RadioGroup>
        </div>

        <Separator className="my-6" />

        {/* Informations de paiement */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informations de paiement</h3>

          {/* Formulaire Stripe */}
          <div className="p-4 border rounded-lg bg-accent/10">
            <PaymentElement
              options={{
                layout: "tabs",
                paymentMethodOrder: ["card", "apple_pay", "google_pay"],
                fields: {
                  billingDetails: {
                    name: "never",
                    email: "never",
                    phone: "never",
                  },
                },
              }}
              className="mb-6"
            />
          </div>

          {cardError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cardError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Options de facturation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Adresse de facturation</h3>

          <FormField
            control={form.control}
            name="billingAddressSameAsShipping"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Utiliser mon adresse de livraison comme adresse de
                    facturation
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {!form.watch("billingAddressSameAsShipping") && (
            <div className="p-4 border rounded-lg">
              <AddressElement
                options={{
                  mode: "billing",
                  defaultValues: {
                    name: `${shippingData?.firstName} ${shippingData?.lastName}`,
                    address: {
                      line1: shippingData?.address || "",
                      line2: shippingData?.apartment || "",
                      city: shippingData?.city || "",
                      postal_code: shippingData?.postalCode || "",
                      country: shippingData?.country || "FR",
                    },
                  },
                  fields: {
                    phone: "never",
                  },
                  validation: {
                    phone: {
                      required: "never",
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Option pour sauvegarder la méthode de paiement */}
        <FormField
          control={form.control}
          name="savePaymentMethod"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Sauvegarder cette méthode de paiement pour mes prochains
                  achats
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Vos informations de paiement seront sécurisées avec Stripe.
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full mt-8"
          size="lg"
          disabled={isSubmitting || !stripe || !elements}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            "Confirmer et payer"
          )}
        </Button>
      </form>
    </Form>
  );
}
