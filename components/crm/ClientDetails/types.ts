import { Client, Contact } from "../ClientsTable/types";

export type ActivityType = "call" | "email" | "meeting" | "note" | "task";
export type OpportunityStatus =
  | "new"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";
export type DocumentType = "contract" | "proposal" | "invoice" | "other";
export type NoteType = "general" | "meeting" | "call" | "followup";
export type ScoreLevel = "low" | "medium" | "high" | "excellent";

export interface ClientScore {
  value: number;
  level: "low" | "medium" | "high" | "excellent";
  lastUpdated: string;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: Date;
  duration?: number; // En minutes
  createdBy: string;
  clientId: string;
  contactId?: string;
  relatedOpportunityId?: string;
  completed: boolean;
  result?: string;
}

export interface Opportunity {
  id: string;
  clientId: string;
  title: string;
  value: number;
  status: OpportunityStatus;
  createdAt: Date;
  updatedAt: Date;
  expectedCloseDate: Date;
  probability: number; // 0-100
  assignedTo: string;
  products?: string[];
  notes?: string;
  activities?: Activity[];
}

export interface Document {
  id: string;
  clientId: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  lastModifiedAt: Date;
  version: number;
  previousVersions?: Document[];
  relatedOpportunityId?: string;
}

export interface Note {
  id: string;
  clientId: string;
  type: NoteType;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  mentions?: string[]; // Liste des IDs des utilisateurs mentionnés
  relatedOpportunityId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  isMain: boolean;
}

export interface ClientMetrics {
  totalValue: number;
  totalOpportunities: number;
  wonOpportunities: number;
  lostOpportunities: number;
  conversionRate: number;
  averageDealSize: number;
  averageSalesCycle: number; // En jours
  lastActivityDate?: Date;
}

export interface ClientWithDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  score: ClientScore;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  changedAt: Date;
  changedBy: string;
}

export interface ChangeHistory {
  id: string;
  clientId: string;
  changes: FieldChange[];
  changedAt: Date;
  changedBy: string;
}
