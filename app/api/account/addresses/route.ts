import { NextRequest } from "next/server";
import {
  validateRequest,
  withAuth,
  apiResponse,
  handleApiError,
} from "../../../../lib/api/middleware";
import { addressCreateSchema } from "../../../../lib/api/validationSchemas";
import { generateId, getCurrentDate } from "../../../../lib/api/mockData";

// Type étendu d'Address avec un ID
interface AddressWithId
  extends Omit<import("../../../../lib/types/api").Address, "isDefault"> {
  id: string;
  isDefault?: boolean;
}

// Adresses mockées (en production, ces données seraient en base de données)
const mockAddresses: Record<string, AddressWithId[]> = {
  user1: [
    {
      id: "addr1",
      firstName: "Jean",
      lastName: "Dupont",
      addressLine1: "123 Rue de Paris",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
      phone: "+33123456789",
      isDefault: true,
    },
    {
      id: "addr2",
      firstName: "Jean",
      lastName: "Dupont",
      addressLine1: "456 Avenue Victor Hugo",
      city: "Lyon",
      postalCode: "69001",
      country: "FR",
      phone: "+33123456789",
      isDefault: false,
    },
  ],
};

/**
 * GET /api/account/addresses - Récupérer les adresses de l'utilisateur
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Récupérer l'ID utilisateur depuis le token JWT
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Récupérer les adresses de l'utilisateur
    const addresses = mockAddresses[userId] || [];

    return apiResponse.success({ addresses });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/account/addresses - Ajouter une nouvelle adresse
 *
 * Corps de la requête: voir addressCreateSchema
 */
export const POST = withAuth(
  validateRequest(addressCreateSchema)(async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

      // S'assurer que l'utilisateur a un tableau d'adresses
      if (!mockAddresses[userId]) {
        mockAddresses[userId] = [];
      }

      // Vérifier si l'adresse doit être définie comme adresse par défaut
      const isDefault = body.isDefault || false;

      // Si la nouvelle adresse est définie comme adresse par défaut,
      // mettre à jour les autres adresses
      if (isDefault) {
        mockAddresses[userId].forEach((address) => {
          address.isDefault = false;
        });
      }

      // Créer la nouvelle adresse
      const newAddress: AddressWithId = {
        id: generateId(),
        firstName: body.firstName,
        lastName: body.lastName,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        state: body.state,
        postalCode: body.postalCode,
        country: body.country,
        phone: body.phone,
        email: body.email,
        isDefault,
      };

      // Ajouter l'adresse
      mockAddresses[userId].push(newAddress);

      return apiResponse.success({ address: newAddress });
    } catch (error) {
      return handleApiError(error);
    }
  })
);

/**
 * DELETE /api/account/addresses - Supprimer une adresse
 *
 * Corps de la requête:
 * - id: ID de l'adresse à supprimer
 */
export const DELETE = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Récupérer l'ID utilisateur depuis le token JWT
    const userId = req.headers.get("X-User-ID") || "user1"; // Fallback pour les tests

    // Vérifier si l'utilisateur a des adresses
    if (!mockAddresses[userId]) {
      return apiResponse.notFound("Adresse non trouvée");
    }

    // Trouver l'index de l'adresse
    const addressIndex = mockAddresses[userId].findIndex(
      (addr) => addr.id === body.id
    );

    // Vérifier si l'adresse existe
    if (addressIndex === -1) {
      return apiResponse.notFound("Adresse non trouvée");
    }

    // Vérifier si c'est l'adresse par défaut
    const isDefault = mockAddresses[userId][addressIndex].isDefault;

    // Supprimer l'adresse
    mockAddresses[userId].splice(addressIndex, 1);

    // Si c'était l'adresse par défaut et qu'il reste des adresses,
    // définir la première adresse comme adresse par défaut
    if (isDefault && mockAddresses[userId].length > 0) {
      mockAddresses[userId][0].isDefault = true;
    }

    return apiResponse.success({
      message: "Adresse supprimée avec succès",
    });
  } catch (error) {
    return handleApiError(error);
  }
});

// OPTIONS pour gérer CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
