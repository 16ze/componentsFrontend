import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "@/components/ui/use-toast";

export type PlanPeriod = "monthly" | "yearly";

export interface UsageLimits {
  maxUsers: number;
  maxStorage: number; // en GB
  maxProjects: number;
  maxApiCalls: number;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  limits: UsageLimits;
  popularPlan?: boolean;
  trialDays?: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  pdfUrl: string;
}

export interface UsageMetrics {
  users: {
    current: number;
    limit: number;
  };
  storage: {
    current: number; // en GB
    limit: number;
  };
  projects: {
    current: number;
    limit: number;
  };
  apiCalls: {
    current: number;
    limit: number;
  };
}

export interface Subscription {
  id: string;
  planId: string;
  status: "active" | "trialing" | "canceled" | "past_due" | "incomplete";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancellationDate?: string;
  period: PlanPeriod;
  paymentMethodId: string;
}

interface SubscriptionState {
  plans: Plan[];
  currentSubscription: Subscription | null;
  invoices: Invoice[];
  usageMetrics: UsageMetrics | null;
  isLoading: boolean;
  error: string | null;
  selectedPeriod: PlanPeriod;

  // Actions
  fetchPlans: () => Promise<void>;
  fetchCurrentSubscription: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchUsageMetrics: () => Promise<void>;
  subscribeToPlan: (
    planId: string,
    period: PlanPeriod,
    paymentMethodId: string
  ) => Promise<boolean>;
  changePlan: (planId: string, period: PlanPeriod) => Promise<boolean>;
  cancelSubscription: (immediateEffect?: boolean) => Promise<boolean>;
  setPeriodSelection: (period: PlanPeriod) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      plans: [],
      currentSubscription: null,
      invoices: [],
      usageMetrics: null,
      isLoading: false,
      error: null,
      selectedPeriod: "monthly",

      setPeriodSelection: (period) => {
        set({ selectedPeriod: period });
      },

      fetchPlans: async () => {
        try {
          set({ isLoading: true, error: null });

          // Remplacez ceci par un appel API réel
          const response = await fetch("/api/subscriptions/plans");

          if (!response.ok) {
            throw new Error("Erreur lors de la récupération des plans");
          }

          const data = await response.json();
          set({ plans: data, isLoading: false });
        } catch (error) {
          console.error("Erreur lors de la récupération des plans", error);
          set({
            error: error instanceof Error ? error.message : "Erreur inconnue",
            isLoading: false,
          });
        }
      },

      fetchCurrentSubscription: async () => {
        try {
          set({ isLoading: true, error: null });

          // Remplacez ceci par un appel API réel
          const response = await fetch("/api/subscriptions/current");

          if (!response.ok) {
            throw new Error("Erreur lors de la récupération de l'abonnement");
          }

          const data = await response.json();
          set({ currentSubscription: data, isLoading: false });
        } catch (error) {
          console.error(
            "Erreur lors de la récupération de l'abonnement",
            error
          );
          set({
            error: error instanceof Error ? error.message : "Erreur inconnue",
            isLoading: false,
          });
        }
      },

      fetchInvoices: async () => {
        try {
          set({ isLoading: true, error: null });

          // Remplacez ceci par un appel API réel
          const response = await fetch("/api/subscriptions/invoices");

          if (!response.ok) {
            throw new Error("Erreur lors de la récupération des factures");
          }

          const data = await response.json();
          set({ invoices: data, isLoading: false });
        } catch (error) {
          console.error("Erreur lors de la récupération des factures", error);
          set({
            error: error instanceof Error ? error.message : "Erreur inconnue",
            isLoading: false,
          });
        }
      },

      fetchUsageMetrics: async () => {
        try {
          set({ isLoading: true, error: null });

          // Remplacez ceci par un appel API réel
          const response = await fetch("/api/subscriptions/usage");

          if (!response.ok) {
            throw new Error(
              "Erreur lors de la récupération des métriques d'utilisation"
            );
          }

          const data = await response.json();
          set({ usageMetrics: data, isLoading: false });
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des métriques d'utilisation",
            error
          );
          set({
            error: error instanceof Error ? error.message : "Erreur inconnue",
            isLoading: false,
          });
        }
      },

      subscribeToPlan: async (planId, period, paymentMethodId) => {
        try {
          set({ isLoading: true, error: null });

          // Remplacez ceci par un appel API réel
          const response = await fetch("/api/subscriptions/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ planId, period, paymentMethodId }),
          });

          if (!response.ok) {
            throw new Error("Erreur lors de la souscription au plan");
          }

          const data = await response.json();
          set({
            currentSubscription: data,
            isLoading: false,
          });

          toast({
            title: "Abonnement réussi",
            description: `Vous êtes maintenant abonné au plan ${
              get().plans.find((p) => p.id === planId)?.name || planId
            }`,
          });

          return true;
        } catch (error) {
          console.error("Erreur lors de la souscription au plan", error);
          set({
            error: error instanceof Error ? error.message : "Erreur inconnue",
            isLoading: false,
          });

          toast({
            title: "Erreur d'abonnement",
            description:
              error instanceof Error
                ? error.message
                : "Une erreur est survenue",
            variant: "destructive",
          });

          return false;
        }
      },

      changePlan: async (planId, period) => {
        try {
          set({ isLoading: true, error: null });

          // Remplacez ceci par un appel API réel
          const response = await fetch("/api/subscriptions/change-plan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ planId, period }),
          });

          if (!response.ok) {
            throw new Error("Erreur lors du changement de plan");
          }

          const data = await response.json();
          set({
            currentSubscription: data,
            isLoading: false,
          });

          toast({
            title: "Changement de plan réussi",
            description: `Votre abonnement a été mis à jour vers ${
              get().plans.find((p) => p.id === planId)?.name || planId
            }`,
          });

          return true;
        } catch (error) {
          console.error("Erreur lors du changement de plan", error);
          set({
            error: error instanceof Error ? error.message : "Erreur inconnue",
            isLoading: false,
          });

          toast({
            title: "Erreur de changement de plan",
            description:
              error instanceof Error
                ? error.message
                : "Une erreur est survenue",
            variant: "destructive",
          });

          return false;
        }
      },

      cancelSubscription: async (immediateEffect = false) => {
        try {
          set({ isLoading: true, error: null });

          // Remplacez ceci par un appel API réel
          const response = await fetch("/api/subscriptions/cancel", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ immediateEffect }),
          });

          if (!response.ok) {
            throw new Error("Erreur lors de l'annulation de l'abonnement");
          }

          const data = await response.json();
          set({
            currentSubscription: data,
            isLoading: false,
          });

          toast({
            title: "Annulation réussie",
            description: immediateEffect
              ? "Votre abonnement a été annulé immédiatement"
              : "Votre abonnement sera annulé à la fin de la période de facturation",
          });

          return true;
        } catch (error) {
          console.error("Erreur lors de l'annulation de l'abonnement", error);
          set({
            error: error instanceof Error ? error.message : "Erreur inconnue",
            isLoading: false,
          });

          toast({
            title: "Erreur d'annulation",
            description:
              error instanceof Error
                ? error.message
                : "Une erreur est survenue",
            variant: "destructive",
          });

          return false;
        }
      },
    }),
    {
      name: "subscription-store",
      partialize: (state) => ({
        selectedPeriod: state.selectedPeriod,
      }),
    }
  )
);
