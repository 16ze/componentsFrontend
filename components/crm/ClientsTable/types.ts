// Types pour les données clients
export type ContactType = "primary" | "secondary";
export type ClientStatus =
  | "lead"
  | "prospect"
  | "client"
  | "inactive"
  | "archived";
export type ClientSource =
  | "website"
  | "referral"
  | "cold-call"
  | "event"
  | "partner"
  | "other";
export type UserRole = "admin" | "commercial" | "readonly";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  type: ContactType;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  contacts: Contact[];
  status: ClientStatus;
  value: number;
  source: ClientSource;
  tags: string[];
  assignedTo?: string;
  lastActivity: Date;
  createdAt: Date;
  notes?: string;
}

// Types pour les filtres
export interface ClientFilters {
  status?: ClientStatus[];
  source?: ClientSource[];
  assignedTo?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  tags?: string[];
}

// Types pour les colonnes
export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

// Types pour les actions
export type ActionType = "edit" | "delete" | "changeStatus";

// Types pour les exportations
export type ExportFormat = "pdf" | "csv" | "excel";

// Types pour les préférences utilisateur
export interface UserPreferences {
  viewMode: "table" | "card";
  columnsConfig: ColumnConfig[];
  itemsPerPage: number;
  defaultSortColumn?: string;
  defaultSortDirection?: "asc" | "desc";
}

// Types pour la pagination
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

// Type pour les permissions
export interface Permissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManageUsers: boolean;
}
