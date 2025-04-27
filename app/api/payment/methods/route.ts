import { NextRequest } from "next/server";
import {
  validateRequest,
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { paymentMethodAddSchema } from "../../../../lib/api/validationSchemas";
import { generateId, getCurrentDate } from "../../../../lib/api/mockData";

// Méthodes de paiement mockées (en production, ces données seraient en base de données)
const mockPaymentMethods = {
  user1: [
    {
      id: "pm_1",
      type: "card",
      card: {
        brand: "visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2025,
      },
      billingDetails: {
        name: "Jean Dupont",
        email: "jean.dupont@example.com",
      },
      isDefault: true,
      createdAt: "2023-01-15T10:30:00Z",
    },
  ],
};

/**
 * GET /api/payment/methods - Récupérer les méthodes de paiement de l'utilisateur
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Récupérer l'ID utilisateur depuis le token JWT
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Récupérer les méthodes de paiement de l'utilisateur
    const paymentMethods = mockPaymentMethods[userId] || [];

    return apiResponse.success({ paymentMethods });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/payment/methods - Ajouter une nouvelle méthode de paiement
 *
 * Corps de la requête:
 * - type: type de méthode de paiement (card, bank_account, paypal)
 * - token: token de paiement (généré par Stripe/PayPal)
 * - isDefault: si cette méthode doit être définie comme méthode par défaut
 */
export const POST = withAuth(
  validateRequest(paymentMethodAddSchema)(async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

      // Récupérer les méthodes de paiement existantes
      if (!mockPaymentMethods[userId]) {
        mockPaymentMethods[userId] = [];
      }

      // Dans une application réelle, nous utiliserions l'API Stripe pour créer/récupérer les détails de la méthode de paiement
      // Pour cet exemple, nous simulons une méthode de paiement

      // Créer une nouvelle méthode de paiement
      const newPaymentMethod = {
        id: `pm_${generateId()}`,
        type: body.type,
        // Simuler les détails de la carte en fonction du type
        ...(body.type === "card" && {
          card: {
            brand: "visa",
            last4: "4242",
            expMonth: 12,
            expYear: 2025,
          },
        }),
        // Simuler les détails du compte bancaire en fonction du type
        ...(body.type === "bank_account" && {
          bankAccount: {
            bankName: "Banque XYZ",
            last4: "6789",
          },
        }),
        // Simuler les détails PayPal en fonction du type
        ...(body.type === "paypal" && {
          paypal: {
            email: "user@example.com",
          },
        }),
        billingDetails: {
          name: "Jean Dupont",
          email: "jean.dupont@example.com",
        },
        isDefault: body.isDefault || false,
        createdAt: getCurrentDate(),
      };

      // Si la nouvelle méthode est définie comme méthode par défaut,
      // mettre à jour les autres méthodes
      if (newPaymentMethod.isDefault) {
        mockPaymentMethods[userId].forEach((method) => {
          method.isDefault = false;
        });
      }

      // Ajouter la nouvelle méthode
      mockPaymentMethods[userId].push(newPaymentMethod);

      return apiResponse.success({ paymentMethod: newPaymentMethod });
    } catch (error) {
      return handleApiError(error);
    }
  })
);

// OPTIONS pour gérer CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
