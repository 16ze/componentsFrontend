"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CartState } from "@/stores/ecommerceStore";

// Types pour les requêtes de paiement
export type StripePaymentMethod = {
  id: string;
  type: string;
  billingDetails: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      postalCode: string;
      country: string;
      state?: string;
    };
  };
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
};

export type StripePaymentIntent = {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethodId?: string;
  created: number;
  metadata?: Record<string, string>;
};

export type PaymentOptions = {
  savePaymentMethod?: boolean;
  setupFutureUsage?: "on_session" | "off_session";
  metadata?: Record<string, string>;
  customer_id?: string;
  receipt_email?: string;
  shipping?: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      postal_code: string;
      country: string;
      state?: string;
    };
    phone?: string;
  };
  returnUrl?: string;
  statement_descriptor?: string;
  isSandbox?: boolean;
};

export type PaymentError = {
  code: string;
  message: string;
  declineCode?: string;
  param?: string;
};

// Classe du connecteur Stripe
export class StripeConnector {
  private stripePromise: Promise<Stripe | null>;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl = "/api/payments/stripe") {
    this.stripePromise = loadStripe(apiKey);
    this.apiUrl = apiUrl;
  }

  /**
   * Crée une intention de paiement
   */
  async createPaymentIntent(
    amount: number,
    currency: string = "eur",
    options: PaymentOptions = {}
  ): Promise<StripePaymentIntent> {
    try {
      const response = await fetch(`${this.apiUrl}/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Erreur lors de la création de l'intention de paiement"
        );
      }

      return await response.json();
    } catch (error) {
      console.error(
        "Erreur lors de la création de l'intention de paiement:",
        error
      );
      throw error;
    }
  }

  /**
   * Confirme une intention de paiement
   */
  async confirmPayment(
    clientSecret: string,
    paymentMethodId: string,
    returnUrl?: string
  ): Promise<{
    success: boolean;
    error?: PaymentError;
    paymentIntent?: StripePaymentIntent;
  }> {
    try {
      const stripe = await this.stripePromise;

      if (!stripe) {
        throw new Error("Stripe n'a pas pu être initialisé");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethodId,
          return_url: returnUrl,
        }
      );

      if (error) {
        return {
          success: false,
          error: {
            code: error.code || "unknown",
            message: error.message || "Erreur de paiement",
            declineCode: error.decline_code,
            param: error.param,
          },
        };
      }

      if (!paymentIntent) {
        return {
          success: false,
          error: {
            code: "no_payment_intent",
            message: "Aucune intention de paiement retournée",
          },
        };
      }

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret || "",
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          paymentMethodId: paymentIntent.payment_method as string,
          created: paymentIntent.created,
          metadata: paymentIntent.metadata,
        },
      };
    } catch (error) {
      console.error("Erreur lors de la confirmation du paiement:", error);
      return {
        success: false,
        error: {
          code: "unexpected_error",
          message: error instanceof Error ? error.message : "Erreur inattendue",
        },
      };
    }
  }

  /**
   * Sauvegarde une méthode de paiement
   */
  async savePaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<{
    success: boolean;
    error?: PaymentError;
    paymentMethod?: StripePaymentMethod;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/save-payment-method`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId,
          customerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: "api_error",
            message:
              errorData.message ||
              "Erreur lors de la sauvegarde de la méthode de paiement",
          },
        };
      }

      const result = await response.json();
      return {
        success: true,
        paymentMethod: result.paymentMethod,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde de la méthode de paiement:",
        error
      );
      return {
        success: false,
        error: {
          code: "unexpected_error",
          message: error instanceof Error ? error.message : "Erreur inattendue",
        },
      };
    }
  }

  /**
   * Récupère les méthodes de paiement sauvegardées
   */
  async getSavedPaymentMethods(
    customerId: string,
    type: string = "card"
  ): Promise<{
    success: boolean;
    error?: PaymentError;
    paymentMethods?: StripePaymentMethod[];
  }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/get-payment-methods?customerId=${customerId}&type=${type}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: "api_error",
            message:
              errorData.message ||
              "Erreur lors de la récupération des méthodes de paiement",
          },
        };
      }

      const result = await response.json();
      return {
        success: true,
        paymentMethods: result.paymentMethods,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des méthodes de paiement:",
        error
      );
      return {
        success: false,
        error: {
          code: "unexpected_error",
          message: error instanceof Error ? error.message : "Erreur inattendue",
        },
      };
    }
  }

  /**
   * Supprime une méthode de paiement
   */
  async deletePaymentMethod(
    paymentMethodId: string
  ): Promise<{ success: boolean; error?: PaymentError }> {
    try {
      const response = await fetch(`${this.apiUrl}/delete-payment-method`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: "api_error",
            message:
              errorData.message ||
              "Erreur lors de la suppression de la méthode de paiement",
          },
        };
      }

      return { success: true };
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la méthode de paiement:",
        error
      );
      return {
        success: false,
        error: {
          code: "unexpected_error",
          message: error instanceof Error ? error.message : "Erreur inattendue",
        },
      };
    }
  }

  /**
   * Vérifie le statut 3DS d'une carte
   */
  async check3DSStatus(
    paymentMethodId: string
  ): Promise<{ requires3DS: boolean; error?: PaymentError }> {
    try {
      // Cette fonctionnalité nécessite une implémentation côté serveur
      // Ce code est une simulation
      return {
        requires3DS: Math.random() > 0.5, // Simuler une réponse aléatoire
      };
    } catch (error) {
      console.error("Erreur lors de la vérification du statut 3DS:", error);
      return {
        requires3DS: true, // Par défaut, supposons que 3DS est requis en cas d'erreur
        error: {
          code: "unexpected_error",
          message: error instanceof Error ? error.message : "Erreur inattendue",
        },
      };
    }
  }

  /**
   * Génère un client secret pour les paiements fractionnés
   */
  async createInstallmentPlan(
    amount: number,
    currency: string = "eur",
    installments: number,
    options: PaymentOptions = {}
  ): Promise<{
    success: boolean;
    error?: PaymentError;
    clientSecret?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/create-installment-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          installments,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: "api_error",
            message:
              errorData.message ||
              "Erreur lors de la création du plan de paiement fractionné",
          },
        };
      }

      const result = await response.json();
      return {
        success: true,
        clientSecret: result.clientSecret,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la création du plan de paiement fractionné:",
        error
      );
      return {
        success: false,
        error: {
          code: "unexpected_error",
          message: error instanceof Error ? error.message : "Erreur inattendue",
        },
      };
    }
  }
}

// Création d'une instance du connecteur avec la clé API publique de Stripe
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const isSandbox = process.env.NEXT_PUBLIC_PAYMENT_SANDBOX === "true";
const apiUrl = isSandbox
  ? "/api/payments/stripe/sandbox"
  : "/api/payments/stripe";

export const stripeConnector = new StripeConnector(stripePublicKey, apiUrl);
