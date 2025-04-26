export enum IntegrationType {
  API = "api",
  WEBHOOK = "webhook",
  EMAIL = "email",
  FILE = "file",
  DATABASE = "database",
  CUSTOM = "custom",
}

export enum IntegrationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  EN_ATTENTE = "en_attente",
  ERREUR = "erreur",
}

export interface ExecutionResult {
  date: string;
  statut: "success" | "warning" | "error";
  message: string;
}

export interface Integration {
  id: string;
  nom: string;
  description: string;
  type: IntegrationType;
  statut: IntegrationStatus;
  configuration: Record<string, any>;
  dateCreation: string;
  dateMiseAJour: string;
  derniereExecution: ExecutionResult | null;
}

export interface IntegrationFilters {
  types?: IntegrationType[];
  statuts?: IntegrationStatus[];
  search?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface AutomationTrigger {
  type: "event" | "schedule" | "webhook" | "manual";
  configuration: Record<string, any>;
}

export interface AutomationAction {
  type: string;
  configuration: Record<string, any>;
}

export interface Automation {
  id: string;
  nom: string;
  description: string;
  active: boolean;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  dateCreation: string;
  dateMiseAJour: string;
  derniereExecution: ExecutionResult | null;
}

export interface AutomationCondition {
  champ: string;
  operateur: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
  valeur: any;
}

export interface AutomationFilters {
  statut?: IntegrationStatus;
  recherche?: string;
}

export interface ExecutionLog {
  id: string;
  integrationType: "integration" | "automation";
  integrationId: string;
  statut: "success" | "error" | "warning";
  message: string;
  details?: Record<string, any>;
  dateExecution: Date;
}
