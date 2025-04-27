import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../types/api";
import { headers } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-dev-only";

export type NextApiHandler = (
  req: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

export type MiddlewareHandler = (handler: NextApiHandler) => NextApiHandler;

/**
 * Middleware pour valider les données d'entrée avec Zod
 */
export function validateRequest<T extends z.ZodType>(
  schema: T
): MiddlewareHandler {
  return (handler: NextApiHandler) => {
    return async (
      req: NextRequest,
      context: { params: Record<string, string> }
    ) => {
      try {
        if (req.method === "GET") {
          // Valider les paramètres de requête pour GET
          const url = new URL(req.url);
          const queryParams = Object.fromEntries(url.searchParams.entries());
          schema.parse(queryParams);
        } else {
          // Valider le corps de la requête pour POST, PUT, etc.
          const body = await req.json();
          schema.parse(body);

          // Recréer la requête avec les données validées
          // car req.json() consomme le corps
          const newReq = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(body),
            cache: req.cache,
            credentials: req.credentials,
            integrity: req.integrity,
            keepalive: req.keepalive,
            mode: req.mode,
            redirect: req.redirect,
            referrer: req.referrer,
            referrerPolicy: req.referrerPolicy,
          });

          return handler(newReq, context);
        }

        return handler(req, context);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation des données échouée",
              details: error.errors,
            },
          };
          return NextResponse.json(response, { status: 400 });
        }

        const response: ApiResponse = {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur interne du serveur",
          },
        };
        return NextResponse.json(response, { status: 500 });
      }
    };
  };
}

/**
 * Middleware pour l'authentification JWT
 */
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (
    req: NextRequest,
    context: { params: Record<string, string> }
  ) => {
    try {
      const headersList = headers();
      const authorization = headersList.get("Authorization");

      if (!authorization || !authorization.startsWith("Bearer ")) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Non autorisé - Token JWT manquant",
          },
        };
        return NextResponse.json(response, { status: 401 });
      }

      const token = authorization.split(" ")[1];

      try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Créer un nouvel objet de requête avec les informations utilisateur
        // car nous ne pouvons pas modifier directement la requête
        const newReq = new NextRequest(req.url, {
          method: req.method,
          headers: new Headers(req.headers),
          body: req.body,
        });

        // Ajouter les informations utilisateur à l'en-tête
        newReq.headers.set("X-User-ID", (decoded as any).id);
        newReq.headers.set("X-User-Role", (decoded as any).role);

        return handler(newReq, context);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Token JWT invalide ou expiré",
          },
        };
        return NextResponse.json(response, { status: 401 });
      }
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur interne du serveur",
        },
      };
      return NextResponse.json(response, { status: 500 });
    }
  };
}

/**
 * Middleware pour vérifier si l'utilisateur est admin
 */
export function withAdmin(handler: NextApiHandler): NextApiHandler {
  return async (
    req: NextRequest,
    context: { params: Record<string, string> }
  ) => {
    try {
      // D'abord, appliquer l'authentification
      const authRes = await withAuth(async (r, c) => {
        const role = r.headers.get("X-User-Role");

        if (role !== "admin") {
          const response: ApiResponse = {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Accès refusé - Rôle administrateur requis",
            },
          };
          return NextResponse.json(response, { status: 403 });
        }

        return handler(r, c);
      })(req, context);

      return authRes;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur interne du serveur",
        },
      };
      return NextResponse.json(response, { status: 500 });
    }
  };
}

/**
 * Middleware pour limiter le taux de requêtes
 */
const rateLimits = new Map<string, { count: number; timestamp: number }>();

export function rateLimit(limit: number, windowMs: number): MiddlewareHandler {
  return (handler: NextApiHandler) => {
    return async (
      req: NextRequest,
      context: { params: Record<string, string> }
    ) => {
      try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const now = Date.now();
        const windowStart = now - windowMs;

        const clientRateLimit = rateLimits.get(ip);

        if (!clientRateLimit || clientRateLimit.timestamp < windowStart) {
          // Nouveau client ou fenêtre expirée
          rateLimits.set(ip, { count: 1, timestamp: now });
        } else if (clientRateLimit.count >= limit) {
          // Limite dépassée
          const response: ApiResponse = {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Trop de requêtes, veuillez réessayer plus tard",
            },
          };
          return NextResponse.json(response, { status: 429 });
        } else {
          // Incrémenter le compteur
          clientRateLimit.count += 1;
          rateLimits.set(ip, clientRateLimit);
        }

        return handler(req, context);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur interne du serveur",
          },
        };
        return NextResponse.json(response, { status: 500 });
      }
    };
  };
}

/**
 * Helper pour gérer les erreurs de manière cohérente
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  let statusCode = 500;
  let errorCode = "INTERNAL_SERVER_ERROR";
  let message = "Une erreur interne est survenue";
  let details = undefined;

  if (error instanceof z.ZodError) {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Validation des données échouée";
    details = error.errors;
  } else if (error instanceof Error) {
    message = error.message;

    // Gestion des erreurs spécifiques
    if ("code" in error && typeof (error as any).code === "string") {
      const errCode = (error as any).code;

      if (errCode === "NOT_FOUND") {
        statusCode = 404;
        errorCode = "NOT_FOUND";
      } else if (errCode === "UNAUTHORIZED") {
        statusCode = 401;
        errorCode = "UNAUTHORIZED";
      } else if (errCode === "FORBIDDEN") {
        statusCode = 403;
        errorCode = "FORBIDDEN";
      }
    }
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details,
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Fonctions utilitaires pour créer des réponses API standardisées
 */
export const apiResponse = {
  success<T>(data: T, meta?: ApiResponse["meta"]): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta,
    };
    return NextResponse.json(response);
  },

  error(
    statusCode: number,
    code: string,
    message: string,
    details?: any
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
    return NextResponse.json(response, { status: statusCode });
  },

  notFound(message = "Ressource non trouvée"): NextResponse {
    return this.error(404, "NOT_FOUND", message);
  },

  badRequest(message = "Requête invalide", details?: any): NextResponse {
    return this.error(400, "BAD_REQUEST", message, details);
  },

  unauthorized(message = "Non autorisé"): NextResponse {
    return this.error(401, "UNAUTHORIZED", message);
  },

  forbidden(message = "Accès refusé"): NextResponse {
    return this.error(403, "FORBIDDEN", message);
  },
};
