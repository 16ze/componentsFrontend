"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  photos?: string[];
  verified: boolean;
  helpful: number;
  unhelpful: number;
  createdAt: Date;
  updatedAt: Date;
  reportCount: number;
  status: "pending" | "approved" | "rejected";
  sellerResponse?: {
    id: string;
    sellerId: string;
    sellerName: string;
    response: string;
    createdAt: Date;
  };
  userVote?: "helpful" | "unhelpful" | null;
};

export type ReviewFilter = {
  rating?: number | null;
  verified?: boolean;
  hasPhotos?: boolean;
  sortBy: "recent" | "helpful" | "highest" | "lowest";
};

export type ReviewStats = {
  average: number;
  total: number;
  distribution: Record<number, number>;
  verifiedCount: number;
  withPhotosCount: number;
};

type ReviewsState = {
  reviews: Record<string, ProductReview[]>;
  userReviews: Record<string, Record<string, string>>;
  isLoading: boolean;
  error: string | null;

  // Actions
  addReview: (
    review: Omit<
      ProductReview,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "reportCount"
      | "status"
      | "helpful"
      | "unhelpful"
      | "userVote"
    >
  ) => Promise<ProductReview>;
  updateReview: (id: string, data: Partial<ProductReview>) => Promise<boolean>;
  deleteReview: (id: string) => Promise<boolean>;
  fetchProductReviews: (productId: string) => Promise<ProductReview[]>;
  getProductReviewStats: (productId: string) => Promise<ReviewStats>;
  voteReview: (
    id: string,
    vote: "helpful" | "unhelpful" | null
  ) => Promise<boolean>;
  reportReview: (id: string, reason: string) => Promise<boolean>;
  addSellerResponse: (
    reviewId: string,
    response: string,
    sellerId: string,
    sellerName: string
  ) => Promise<boolean>;
  moderateReview: (
    id: string,
    status: "approved" | "rejected"
  ) => Promise<boolean>;

  // Getters
  getReviewById: (id: string) => ProductReview | null;
  getUserReview: (userId: string, productId: string) => ProductReview | null;
  getFilteredReviews: (
    productId: string,
    filter: ReviewFilter
  ) => ProductReview[];
  hasUserReviewed: (userId: string, productId: string) => boolean;
};

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: {},
      userReviews: {},
      isLoading: false,
      error: null,

      addReview: async (review) => {
        try {
          set({ isLoading: true, error: null });

          // Simuler un délai API
          await new Promise((resolve) => setTimeout(resolve, 500));

          const productId = review.productId;
          const userId = review.userId;

          // Vérifier si l'utilisateur a déjà laissé un avis
          if (get().hasUserReviewed(userId, productId)) {
            throw new Error("Vous avez déjà laissé un avis pour ce produit");
          }

          // Générer un ID unique et les timestamps
          const id = `review-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          const now = new Date();

          const newReview: ProductReview = {
            id,
            ...review,
            createdAt: now,
            updatedAt: now,
            reportCount: 0,
            status: "pending",
            helpful: 0,
            unhelpful: 0,
          };

          // Mettre à jour le state
          const updatedReviews = { ...get().reviews };
          if (!updatedReviews[productId]) {
            updatedReviews[productId] = [];
          }
          updatedReviews[productId] = [newReview, ...updatedReviews[productId]];

          // Mettre à jour les avis par utilisateur
          const updatedUserReviews = { ...get().userReviews };
          if (!updatedUserReviews[userId]) {
            updatedUserReviews[userId] = {};
          }
          updatedUserReviews[userId][productId] = id;

          set({
            reviews: updatedReviews,
            userReviews: updatedUserReviews,
            isLoading: false,
          });

          return newReview;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          throw error;
        }
      },

      updateReview: async (id, data) => {
        try {
          set({ isLoading: true, error: null });

          // Simuler un délai API
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Trouver l'avis
          let reviewFound = false;
          const updatedReviews = { ...get().reviews };

          for (const productId in updatedReviews) {
            const index = updatedReviews[productId].findIndex(
              (r) => r.id === id
            );
            if (index !== -1) {
              updatedReviews[productId][index] = {
                ...updatedReviews[productId][index],
                ...data,
                updatedAt: new Date(),
              };
              reviewFound = true;
              break;
            }
          }

          if (!reviewFound) {
            throw new Error("Avis non trouvé");
          }

          set({ reviews: updatedReviews, isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return false;
        }
      },

      deleteReview: async (id) => {
        try {
          set({ isLoading: true, error: null });

          // Simuler un délai API
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Trouver l'avis
          let reviewFound = false;
          let userId = "";
          let productId = "";
          const updatedReviews = { ...get().reviews };

          for (const pId in updatedReviews) {
            const index = updatedReviews[pId].findIndex((r) => r.id === id);
            if (index !== -1) {
              userId = updatedReviews[pId][index].userId;
              productId = pId;
              updatedReviews[pId] = updatedReviews[pId].filter(
                (r) => r.id !== id
              );
              reviewFound = true;
              break;
            }
          }

          if (!reviewFound) {
            throw new Error("Avis non trouvé");
          }

          // Supprimer l'enregistrement utilisateur
          const updatedUserReviews = { ...get().userReviews };
          if (updatedUserReviews[userId]) {
            delete updatedUserReviews[userId][productId];
          }

          set({
            reviews: updatedReviews,
            userReviews: updatedUserReviews,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return false;
        }
      },

      fetchProductReviews: async (productId) => {
        try {
          set({ isLoading: true, error: null });

          // Simuler un délai API
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Si aucun avis n'existe encore pour ce produit, générer des avis fictifs pour la démo
          if (
            !get().reviews[productId] ||
            get().reviews[productId].length === 0
          ) {
            const mockReviews = getMockReviews(productId);
            const updatedReviews = { ...get().reviews };
            updatedReviews[productId] = mockReviews;

            set({ reviews: updatedReviews });
          }

          set({ isLoading: false });
          return get().reviews[productId] || [];
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return [];
        }
      },

      getProductReviewStats: async (productId) => {
        try {
          set({ isLoading: true, error: null });

          // Garantir que les avis sont chargés
          await get().fetchProductReviews(productId);

          // Calculer les statistiques
          const reviews = get().reviews[productId] || [];

          // Distribution par note
          const distribution: Record<number, number> = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          };

          let totalRating = 0;
          let verifiedCount = 0;
          let withPhotosCount = 0;

          reviews.forEach((review) => {
            // Incrémenter la distribution
            distribution[review.rating] =
              (distribution[review.rating] || 0) + 1;

            // Ajouter à la note totale
            totalRating += review.rating;

            // Compter les avis vérifiés
            if (review.verified) verifiedCount++;

            // Compter les avis avec photos
            if (review.photos && review.photos.length > 0) withPhotosCount++;
          });

          const average =
            reviews.length > 0
              ? parseFloat((totalRating / reviews.length).toFixed(1))
              : 0;

          set({ isLoading: false });

          return {
            average,
            total: reviews.length,
            distribution,
            verifiedCount,
            withPhotosCount,
          };
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });

          return {
            average: 0,
            total: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            verifiedCount: 0,
            withPhotosCount: 0,
          };
        }
      },

      voteReview: async (id, vote) => {
        try {
          set({ isLoading: true, error: null });

          // Simuler un délai API
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Trouver l'avis
          let reviewFound = false;
          const updatedReviews = { ...get().reviews };

          for (const productId in updatedReviews) {
            const index = updatedReviews[productId].findIndex(
              (r) => r.id === id
            );
            if (index !== -1) {
              const review = updatedReviews[productId][index];

              // Si le vote est le même que l'actuel, le supprimer
              if (review.userVote === vote) {
                if (vote === "helpful")
                  review.helpful = Math.max(0, review.helpful - 1);
                if (vote === "unhelpful")
                  review.unhelpful = Math.max(0, review.unhelpful - 1);
                review.userVote = null;
              }
              // Sinon, mettre à jour le vote
              else {
                // Si l'utilisateur avait un vote précédent, l'annuler
                if (review.userVote === "helpful")
                  review.helpful = Math.max(0, review.helpful - 1);
                if (review.userVote === "unhelpful")
                  review.unhelpful = Math.max(0, review.unhelpful - 1);

                // Ajouter le nouveau vote
                if (vote === "helpful") review.helpful++;
                if (vote === "unhelpful") review.unhelpful++;

                review.userVote = vote;
              }

              review.updatedAt = new Date();
              reviewFound = true;
              break;
            }
          }

          if (!reviewFound) {
            throw new Error("Avis non trouvé");
          }

          set({ reviews: updatedReviews, isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return false;
        }
      },

      reportReview: async (id, reason) => {
        try {
          set({ isLoading: true, error: null });

          // Simuler un délai API
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Trouver l'avis
          let reviewFound = false;
          const updatedReviews = { ...get().reviews };

          for (const productId in updatedReviews) {
            const index = updatedReviews[productId].findIndex(
              (r) => r.id === id
            );
            if (index !== -1) {
              updatedReviews[productId][index].reportCount++;
              updatedReviews[productId][index].updatedAt = new Date();
              reviewFound = true;
              break;
            }
          }

          if (!reviewFound) {
            throw new Error("Avis non trouvé");
          }

          set({ reviews: updatedReviews, isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return false;
        }
      },

      addSellerResponse: async (reviewId, response, sellerId, sellerName) => {
        try {
          set({ isLoading: true, error: null });

          // Simuler un délai API
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Trouver l'avis
          let reviewFound = false;
          const updatedReviews = { ...get().reviews };

          for (const productId in updatedReviews) {
            const index = updatedReviews[productId].findIndex(
              (r) => r.id === reviewId
            );
            if (index !== -1) {
              updatedReviews[productId][index].sellerResponse = {
                id: `response-${Date.now()}`,
                sellerId,
                sellerName,
                response,
                createdAt: new Date(),
              };
              updatedReviews[productId][index].updatedAt = new Date();
              reviewFound = true;
              break;
            }
          }

          if (!reviewFound) {
            throw new Error("Avis non trouvé");
          }

          set({ reviews: updatedReviews, isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return false;
        }
      },

      moderateReview: async (id, status) => {
        try {
          set({ isLoading: true, error: null });

          // Simuler un délai API
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Trouver l'avis
          let reviewFound = false;
          const updatedReviews = { ...get().reviews };

          for (const productId in updatedReviews) {
            const index = updatedReviews[productId].findIndex(
              (r) => r.id === id
            );
            if (index !== -1) {
              updatedReviews[productId][index].status = status;
              updatedReviews[productId][index].updatedAt = new Date();
              reviewFound = true;
              break;
            }
          }

          if (!reviewFound) {
            throw new Error("Avis non trouvé");
          }

          set({ reviews: updatedReviews, isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return false;
        }
      },

      // Obtenir un avis par son ID
      getReviewById: (id) => {
        for (const productId in get().reviews) {
          const review = get().reviews[productId].find((r) => r.id === id);
          if (review) return review;
        }
        return null;
      },

      // Obtenir l'avis d'un utilisateur pour un produit
      getUserReview: (userId, productId) => {
        const userReviews = get().userReviews[userId];
        if (!userReviews) return null;

        const reviewId = userReviews[productId];
        if (!reviewId) return null;

        const reviews = get().reviews[productId];
        if (!reviews) return null;

        return reviews.find((r) => r.id === reviewId) || null;
      },

      // Obtenir les avis filtrés d'un produit
      getFilteredReviews: (productId, filter) => {
        const reviews = get().reviews[productId] || [];

        // Filtrer par critères
        return reviews
          .filter((review) => {
            // Filtre par note
            if (
              filter.rating !== undefined &&
              filter.rating !== null &&
              review.rating !== filter.rating
            ) {
              return false;
            }

            // Filtre par vérification
            if (filter.verified && !review.verified) {
              return false;
            }

            // Filtre par présence de photos
            if (
              filter.hasPhotos &&
              (!review.photos || review.photos.length === 0)
            ) {
              return false;
            }

            return true;
          })
          .sort((a, b) => {
            // Tri
            switch (filter.sortBy) {
              case "recent":
                return (
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
                );
              case "helpful":
                return b.helpful - a.helpful;
              case "highest":
                return b.rating - a.rating;
              case "lowest":
                return a.rating - b.rating;
              default:
                return 0;
            }
          });
      },

      // Vérifier si un utilisateur a déjà laissé un avis
      hasUserReviewed: (userId, productId) => {
        const userReviews = get().userReviews[userId];
        if (!userReviews) return false;
        return !!userReviews[productId];
      },
    }),
    {
      name: "ecommerce-reviews",
    }
  )
);

// Fonctions utilitaires pour générer des avis fictifs
function getMockReviews(productId: string): ProductReview[] {
  const now = new Date();

  return [
    {
      id: `review-mock-1-${productId}`,
      productId,
      userId: "user-mock-1",
      userName: "Sophie Martin",
      userAvatar: "/images/avatars/avatar-1.png",
      rating: 5,
      title: "Excellent produit, parfait pour mon utilisation quotidienne",
      comment:
        "Je suis vraiment impressionné par la qualité et la durabilité de ce produit. Cela fait maintenant plusieurs semaines que je l'utilise quotidiennement et il répond parfaitement à mes besoins. La finition est soignée et les matériaux semblent de bonne qualité. Je recommande sans hésiter !",
      pros: ["Excellente qualité", "Rapport qualité-prix", "Design élégant"],
      cons: ["Délai de livraison un peu long"],
      photos: [
        "/images/products/review-photo-1.jpg",
        "/images/products/review-photo-2.jpg",
      ],
      verified: true,
      helpful: 12,
      unhelpful: 2,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      reportCount: 0,
      status: "approved",
      userVote: null,
    },
    {
      id: `review-mock-2-${productId}`,
      productId,
      userId: "user-mock-2",
      userName: "Thomas Dubois",
      userAvatar: "/images/avatars/avatar-2.png",
      rating: 4,
      title: "Très bon produit avec quelques petits défauts",
      comment:
        "Ce produit est globalement très satisfaisant. J'apprécie particulièrement sa facilité d'utilisation et son design moderne. Cependant, j'ai noté quelques petits défauts qui pourraient être améliorés, notamment au niveau de certaines finitions. Malgré cela, je suis content de mon achat et je le recommande.",
      pros: ["Facile à utiliser", "Design moderne", "Bonne performance"],
      cons: ["Quelques finitions à améliorer", "Prix un peu élevé"],
      photos: [],
      verified: true,
      helpful: 8,
      unhelpful: 1,
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      reportCount: 0,
      status: "approved",
      userVote: null,
    },
    {
      id: `review-mock-3-${productId}`,
      productId,
      userId: "user-mock-3",
      userName: "Julie Leroy",
      userAvatar: "/images/avatars/avatar-3.png",
      rating: 2,
      title: "Déçue par la qualité",
      comment:
        "J'attendais beaucoup de ce produit suite aux nombreux avis positifs, mais je suis malheureusement déçue. La qualité n'est pas à la hauteur du prix demandé et j'ai rencontré plusieurs problèmes dès les premières utilisations. Le service client a été réactif, mais cela ne compense pas les défauts du produit.",
      pros: ["Service client réactif"],
      cons: [
        "Qualité insuffisante",
        "Problèmes techniques",
        "Prix trop élevé pour la qualité",
      ],
      photos: ["/images/products/review-photo-3.jpg"],
      verified: true,
      helpful: 15,
      unhelpful: 4,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      reportCount: 0,
      status: "approved",
      sellerResponse: {
        id: `response-mock-1-${productId}`,
        sellerId: "seller-1",
        sellerName: "Support Client",
        response:
          "Bonjour Julie, nous sommes désolés de lire votre expérience négative avec notre produit. Nous avons pris note de vos remarques et souhaitons vous proposer un échange ou un remboursement. N'hésitez pas à contacter directement notre service client pour plus de détails. Merci pour votre retour qui nous aide à nous améliorer.",
        createdAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
      },
      userVote: null,
    },
    {
      id: `review-mock-4-${productId}`,
      productId,
      userId: "user-mock-4",
      userName: "Pierre Moreau",
      userAvatar: "/images/avatars/avatar-4.png",
      rating: 5,
      title: "Parfait, rien à redire !",
      comment:
        "Ce produit dépasse toutes mes attentes ! Je l'utilise depuis plusieurs mois maintenant et je n'ai absolument rien à redire. Il est robuste, performant et vraiment agréable à utiliser au quotidien. Un grand bravo à la marque pour ce produit d'exception.",
      pros: [
        "Excellente qualité",
        "Très performant",
        "Robuste",
        "Design soigné",
      ],
      cons: [],
      photos: [
        "/images/products/review-photo-4.jpg",
        "/images/products/review-photo-5.jpg",
        "/images/products/review-photo-6.jpg",
      ],
      verified: true,
      helpful: 24,
      unhelpful: 0,
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      reportCount: 0,
      status: "approved",
      userVote: null,
    },
    {
      id: `review-mock-5-${productId}`,
      productId,
      userId: "user-mock-5",
      userName: "Marie Dupont",
      userAvatar: "/images/avatars/avatar-5.png",
      rating: 3,
      title: "Correct mais sans plus",
      comment:
        "Ce produit est correct mais sans plus. Il remplit sa fonction principale mais manque de finitions et de fonctionnalités par rapport à certains concurrents. Le rapport qualité-prix est moyen. Je ne regrette pas mon achat mais je ne suis pas non plus enthousiaste.",
      pros: ["Fonctionnel", "Livraison rapide"],
      cons: ["Manque de fonctionnalités", "Finitions moyennes"],
      photos: [],
      verified: false,
      helpful: 5,
      unhelpful: 2,
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      reportCount: 0,
      status: "approved",
      userVote: null,
    },
  ];
}
