"use client";

import { loadScript } from "@paypal/paypal-js";
import { CartState } from "@/stores/ecommerceStore";

// Types pour les requêtes de paiement
export type PayPalOrder = {
  id: string;
  status: string;
  purchaseUnits: Array<{
    amount: {
      value: string;
      currency_code: string;
    };
    shipping?: {
      name: {
        full_name: string;
      };
      address: {
        address_line_1: string;
        address_line_2?: string;
        admin_area_2: string;
        admin_area_1?: string;
        postal_code: string;
        country_code: string;
      };
    };
  }>;
  payer?: {
    name?: {
      given_name: string;
      surname: string;
    };
    email_address?: string;
    payer_id?: string;
  };
  create_time: string;
  update_time: string;
};

export type PayPalPaymentSource = {
  id: string;
  name: string;
  email?: string;
  last4?: string;
  expiry?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
};

export type PayPalOrderOptions = {
  currency?: string;
  intent?: "CAPTURE" | "AUTHORIZE";
  shipping?: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
    };
  };
  description?: string;
  customId?: string;
  payer?: {
    email: string;
    name?: string;
  };
  metadata?: Record<string, string>;
  returnUrl?: string;
  cancelUrl?: string;
  isSandbox?: boolean;
};

export type PayPalError = {
  code: string;
  message: string;
  details?: Array<{
    issue: string;
    description?: string;
    field?: string;
    value?: string;
  }>;
};

// Classe du connecteur PayPal
export class PayPalConnector {
  private clientId: string;
  private apiUrl: string;
  private isSandbox: boolean;

  constructor(
    clientId: string,
    apiUrl = "/api/payments/paypal",
    isSandbox = false
  ) {
    this.clientId = clientId;
    this.apiUrl = apiUrl;
    this.isSandbox = isSandbox;
  }

  /**
   * Initialise le SDK PayPal
   */
  async initializePayPalSDK(
    currency = "EUR",
    intent = "CAPTURE"
  ): Promise<any> {
    try {
      return await loadScript({
        "client-id": this.clientId,
        currency,
        intent: intent.toLowerCase(),
        "data-namespace": "paypalCheckoutSDK",
        "enable-funding": "paylater,venmo,card",
        "disable-funding": "",
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation du SDK PayPal:", error);
      throw error;
    }
  }

  /**
   * Crée une commande PayPal
   */
  async createOrder(
    amount: number,
    options: PayPalOrderOptions = {}
  ): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: options.currency || "EUR",
          intent: options.intent || "CAPTURE",
          description: options.description,
          custom_id: options.customId,
          return_url: options.returnUrl,
          cancel_url: options.cancelUrl,
          shipping: options.shipping,
          payer: options.payer,
          metadata: options.metadata,
          is_sandbox: this.isSandbox || options.isSandbox,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Erreur lors de la création de la commande PayPal"
        );
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Erreur lors de la création de la commande PayPal:", error);
      throw error;
    }
  }

  /**
   * Capture une commande PayPal après approbation
   */
  async captureOrder(
    orderId: string
  ): Promise<{ success: boolean; error?: PayPalError; order?: PayPalOrder }> {
    try {
      const response = await fetch(`${this.apiUrl}/capture-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          is_sandbox: this.isSandbox,
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
              "Erreur lors de la capture de la commande PayPal",
            details: errorData.details,
          },
        };
      }

      const orderData = await response.json();
      return {
        success: true,
        order: orderData,
      };
    } catch (error) {
      console.error("Erreur lors de la capture de la commande PayPal:", error);
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
   * Vérifie le statut d'une commande PayPal
   */
  async checkOrderStatus(
    orderId: string
  ): Promise<{ success: boolean; error?: PayPalError; order?: PayPalOrder }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/check-order-status?order_id=${orderId}&is_sandbox=${this.isSandbox}`,
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
              "Erreur lors de la vérification du statut de la commande PayPal",
            details: errorData.details,
          },
        };
      }

      const orderData = await response.json();
      return {
        success: true,
        order: orderData,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du statut de la commande PayPal:",
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
   * Sauvegarde une source de paiement PayPal
   */
  async savePaymentSource(
    payerId: string,
    customerId: string,
    email: string,
    name?: string
  ): Promise<{
    success: boolean;
    error?: PayPalError;
    source?: PayPalPaymentSource;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/save-payment-source`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payer_id: payerId,
          customer_id: customerId,
          email,
          name,
          is_sandbox: this.isSandbox,
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
              "Erreur lors de la sauvegarde de la source de paiement PayPal",
            details: errorData.details,
          },
        };
      }

      const sourceData = await response.json();
      return {
        success: true,
        source: sourceData.source,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde de la source de paiement PayPal:",
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
   * Récupère les sources de paiement PayPal sauvegardées
   */
  async getSavedPaymentSources(
    customerId: string
  ): Promise<{
    success: boolean;
    error?: PayPalError;
    sources?: PayPalPaymentSource[];
  }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/get-payment-sources?customer_id=${customerId}&is_sandbox=${this.isSandbox}`,
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
              "Erreur lors de la récupération des sources de paiement PayPal",
            details: errorData.details,
          },
        };
      }

      const result = await response.json();
      return {
        success: true,
        sources: result.sources,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des sources de paiement PayPal:",
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
   * Convertit un objet d'adresse au format API
   */
  formatShippingAddress(address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  }) {
    return {
      address_line_1: address.line1,
      address_line_2: address.line2,
      admin_area_2: address.city,
      admin_area_1: address.state,
      postal_code: address.postalCode,
      country_code: address.country,
    };
  }
}

// Création d'une instance du connecteur avec la clé client ID de PayPal
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const isSandbox = process.env.NEXT_PUBLIC_PAYMENT_SANDBOX === "true";
const apiUrl = isSandbox
  ? "/api/payments/paypal/sandbox"
  : "/api/payments/paypal";

export const paypalConnector = new PayPalConnector(
  paypalClientId,
  apiUrl,
  isSandbox
);
