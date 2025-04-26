import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

import {
  Integration,
  Automation,
  IntegrationType,
  IntegrationStatus,
  IntegrationFilters,
  AutomationFilters,
  ExecutionLog,
  AutomationTrigger,
  AutomationAction,
  ExecutionResult,
} from "@/components/integration/types";

interface IntegrationState {
  // Collections principales
  integrations: Integration[];
  automations: Automation[];
  executionLogs: ExecutionLog[];

  // État UI
  selectedIntegrationId: string | null;
  selectedAutomationId: string | null;
  integrationFilters: IntegrationFilters;
  automationFilters: AutomationFilters;

  // Actions - Intégrations
  addIntegration: (
    integration: Omit<
      Integration,
      "id" | "dateCreation" | "dateMiseAJour" | "derniereExecution"
    >
  ) => string;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  deleteIntegration: (id: string) => void;
  toggleIntegrationStatus: (id: string, active: boolean) => void;
  executeIntegration: (id: string) => Promise<ExecutionResult>;

  // Actions - Automatisations
  addAutomation: (
    automation: Omit<
      Automation,
      "id" | "dateCreation" | "dateMiseAJour" | "derniereExecution"
    >
  ) => string;
  updateAutomation: (id: string, updates: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomationStatus: (id: string, active: boolean) => void;
  executeAutomation: (id: string) => Promise<ExecutionResult>;

  // Actions - Logs
  addExecutionLog: (log: Omit<ExecutionLog, "id" | "dateExecution">) => string;
  clearExecutionLogs: (options?: {
    olderThan?: Date;
    integrationId?: string;
    automationId?: string;
  }) => void;

  // Actions - Filtres
  updateIntegrationFilters: (filters: Partial<IntegrationFilters>) => void;
  resetIntegrationFilters: () => void;
  updateAutomationFilters: (filters: Partial<AutomationFilters>) => void;
  resetAutomationFilters: () => void;

  // Sélecteurs
  getIntegrationById: (id: string) => Integration | undefined;
  getAutomationById: (id: string) => Automation | undefined;
  getRecentExecutionLogs: (limit?: number) => ExecutionLog[];
  getLogsByIntegrationId: (id: string, limit?: number) => ExecutionLog[];
  getLogsByAutomationId: (id: string, limit?: number) => ExecutionLog[];
}

// Valeurs par défaut
const defaultIntegrationFilters: IntegrationFilters = {
  search: "",
  types: [],
  statuts: [],
};

const defaultAutomationFilters: AutomationFilters = {
  recherche: "",
  statut: undefined,
};

// Exemples d'intégrations pour démarrer
const initialIntegrations: Integration[] = [
  {
    id: "1",
    nom: "API CRM",
    description:
      "Intégration avec notre système CRM pour synchroniser les clients",
    type: IntegrationType.API,
    statut: IntegrationStatus.ACTIVE,
    configuration: { endpoint: "https://api.crm.example.com" },
    dateCreation: new Date().toISOString(),
    dateMiseAJour: new Date().toISOString(),
    derniereExecution: {
      date: new Date().toISOString(),
      statut: "success",
      message: "Synchronisation réussie",
    },
  },
  {
    id: "2",
    nom: "Webhook Paiements",
    description: "Réception des notifications de paiement",
    type: IntegrationType.WEBHOOK,
    statut: IntegrationStatus.ACTIVE,
    configuration: { secret: "wh_secret_key" },
    dateCreation: new Date().toISOString(),
    dateMiseAJour: new Date().toISOString(),
    derniereExecution: {
      date: new Date().toISOString(),
      statut: "success",
      message: "Webhook reçu et traité",
    },
  },
];

// Exemples d'automatisations pour démarrer
const initialAutomations: Automation[] = [
  {
    id: "1",
    nom: "Synchronisation quotidienne des contacts",
    description:
      "Importe les nouveaux contacts depuis le CRM vers la base de données locale",
    active: true,
    trigger: {
      type: "schedule",
      configuration: { frequency: "daily", time: "02:00" },
    },
    actions: [
      {
        type: "sync_contacts",
        configuration: { source: "crm", destination: "local_db" },
      },
    ],
    dateCreation: new Date().toISOString(),
    dateMiseAJour: new Date().toISOString(),
    derniereExecution: {
      date: new Date().toISOString(),
      statut: "success",
      message: "Synchronisation réussie - 15 contacts importés",
    },
  },
];

// Création du store
const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set, get) => ({
      // État initial
      integrations: initialIntegrations,
      automations: initialAutomations,
      executionLogs: [],
      selectedIntegrationId: null,
      selectedAutomationId: null,
      integrationFilters: defaultIntegrationFilters,
      automationFilters: defaultAutomationFilters,

      // Actions - Intégrations
      addIntegration: (integrationData) => {
        const id = uuidv4();
        const now = new Date().toISOString();

        const newIntegration: Integration = {
          id,
          ...integrationData,
          dateCreation: now,
          dateMiseAJour: now,
          derniereExecution: null,
        };

        set((state) => ({
          integrations: [...state.integrations, newIntegration],
        }));

        return id;
      },

      updateIntegration: (id, updates) => {
        const now = new Date().toISOString();

        set((state) => ({
          integrations: state.integrations.map((integration) =>
            integration.id === id
              ? { ...integration, ...updates, dateMiseAJour: now }
              : integration
          ),
        }));
      },

      deleteIntegration: (id) => {
        set((state) => ({
          integrations: state.integrations.filter(
            (integration) => integration.id !== id
          ),
        }));
      },

      toggleIntegrationStatus: (id, active) => {
        const status = active
          ? IntegrationStatus.ACTIVE
          : IntegrationStatus.INACTIVE;

        set((state) => ({
          integrations: state.integrations.map((integration) =>
            integration.id === id
              ? {
                  ...integration,
                  statut: status,
                  dateMiseAJour: new Date().toISOString(),
                }
              : integration
          ),
        }));
      },

      executeIntegration: async (id) => {
        // Simulation d'une exécution d'intégration
        const integration = get().integrations.find((i) => i.id === id);

        if (!integration) {
          const result: ExecutionResult = {
            date: new Date().toISOString(),
            statut: "error",
            message: "Intégration non trouvée",
          };
          return result;
        }

        // Simulation d'un délai d'exécution
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Génération d'un résultat aléatoire pour la démonstration
        const success = Math.random() > 0.2;
        const result: ExecutionResult = {
          date: new Date().toISOString(),
          statut: success ? "success" : "error",
          message: success ? "Exécution réussie" : "Erreur pendant l'exécution",
        };

        // Mise à jour de l'intégration
        set((state) => ({
          integrations: state.integrations.map((i) =>
            i.id === id
              ? {
                  ...i,
                  derniereExecution: result,
                  dateMiseAJour: new Date().toISOString(),
                }
              : i
          ),
        }));

        // Ajout d'un log d'exécution
        get().addExecutionLog({
          integrationType: "integration",
          integrationId: id,
          statut: result.statut as "success" | "error" | "warning",
          message: result.message,
          details: {
            duration: Math.floor(Math.random() * 5000),
            items_processed: Math.floor(Math.random() * 100),
          },
        });

        return result;
      },

      // Actions - Automatisations
      addAutomation: (automationData) => {
        const id = uuidv4();
        const now = new Date().toISOString();

        const newAutomation: Automation = {
          id,
          ...automationData,
          dateCreation: now,
          dateMiseAJour: now,
          derniereExecution: null,
        };

        set((state) => ({
          automations: [...state.automations, newAutomation],
        }));

        return id;
      },

      updateAutomation: (id, updates) => {
        const now = new Date().toISOString();

        set((state) => ({
          automations: state.automations.map((automation) =>
            automation.id === id
              ? { ...automation, ...updates, dateMiseAJour: now }
              : automation
          ),
        }));
      },

      deleteAutomation: (id) => {
        set((state) => ({
          automations: state.automations.filter(
            (automation) => automation.id !== id
          ),
        }));
      },

      toggleAutomationStatus: (id, active) => {
        set((state) => ({
          automations: state.automations.map((automation) =>
            automation.id === id
              ? {
                  ...automation,
                  active,
                  dateMiseAJour: new Date().toISOString(),
                }
              : automation
          ),
        }));
      },

      executeAutomation: async (id) => {
        // Simulation d'une exécution d'automatisation
        const automation = get().automations.find((a) => a.id === id);

        if (!automation) {
          const result: ExecutionResult = {
            date: new Date().toISOString(),
            statut: "error",
            message: "Automatisation non trouvée",
          };
          return result;
        }

        // Simulation d'un délai d'exécution
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Génération d'un résultat aléatoire pour la démonstration
        const success = Math.random() > 0.2;
        const result: ExecutionResult = {
          date: new Date().toISOString(),
          statut: success ? "success" : "error",
          message: success
            ? "Automatisation exécutée avec succès"
            : "Erreur pendant l'exécution de l'automatisation",
        };

        // Mise à jour de l'automatisation
        set((state) => ({
          automations: state.automations.map((a) =>
            a.id === id
              ? {
                  ...a,
                  derniereExecution: result,
                  dateMiseAJour: new Date().toISOString(),
                }
              : a
          ),
        }));

        // Ajout d'un log d'exécution
        get().addExecutionLog({
          integrationType: "automation",
          integrationId: id,
          statut: result.statut as "success" | "error" | "warning",
          message: result.message,
          details: {
            duration: Math.floor(Math.random() * 3000),
            actions_executed: automation.actions.length,
          },
        });

        return result;
      },

      // Actions - Logs
      addExecutionLog: (logData) => {
        const id = uuidv4();

        const newLog: ExecutionLog = {
          id,
          ...logData,
          dateExecution: new Date(),
        };

        set((state) => ({
          executionLogs: [newLog, ...state.executionLogs],
        }));

        return id;
      },

      clearExecutionLogs: (options) => {
        set((state) => {
          let filteredLogs = [...state.executionLogs];

          if (options?.olderThan) {
            filteredLogs = filteredLogs.filter(
              (log) => log.dateExecution > options.olderThan!
            );
          }

          if (options?.integrationId) {
            filteredLogs = filteredLogs.filter(
              (log) =>
                !(
                  log.integrationType === "integration" &&
                  log.integrationId === options.integrationId
                )
            );
          }

          if (options?.automationId) {
            filteredLogs = filteredLogs.filter(
              (log) =>
                !(
                  log.integrationType === "automation" &&
                  log.integrationId === options.automationId
                )
            );
          }

          return { executionLogs: filteredLogs };
        });
      },

      // Actions - Filtres
      updateIntegrationFilters: (filters) => {
        set((state) => ({
          integrationFilters: { ...state.integrationFilters, ...filters },
        }));
      },

      resetIntegrationFilters: () => {
        set(() => ({
          integrationFilters: defaultIntegrationFilters,
        }));
      },

      updateAutomationFilters: (filters) => {
        set((state) => ({
          automationFilters: { ...state.automationFilters, ...filters },
        }));
      },

      resetAutomationFilters: () => {
        set(() => ({
          automationFilters: defaultAutomationFilters,
        }));
      },

      // Sélecteurs
      getIntegrationById: (id) => {
        return get().integrations.find((integration) => integration.id === id);
      },

      getAutomationById: (id) => {
        return get().automations.find((automation) => automation.id === id);
      },

      getRecentExecutionLogs: (limit = 10) => {
        return get().executionLogs.slice(0, limit);
      },

      getLogsByIntegrationId: (id, limit = 20) => {
        return get()
          .executionLogs.filter(
            (log) =>
              log.integrationType === "integration" && log.integrationId === id
          )
          .slice(0, limit);
      },

      getLogsByAutomationId: (id, limit = 20) => {
        return get()
          .executionLogs.filter(
            (log) =>
              log.integrationType === "automation" && log.integrationId === id
          )
          .slice(0, limit);
      },
    }),
    {
      name: "integration-storage",
      partialize: (state) => ({
        integrations: state.integrations,
        automations: state.automations,
        // Les logs ne sont pas persistés pour éviter de stocker trop de données
        integrationFilters: state.integrationFilters,
        automationFilters: state.automationFilters,
      }),
    }
  )
);

export default useIntegrationStore;
