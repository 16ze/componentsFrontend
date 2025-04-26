import { StageType } from "../KanbanBoard/types";

export enum ActivityType {
  APPEL = "Appel",
  REUNION = "Réunion",
  EMAIL = "Email",
  TACHE = "Tâche",
  DEMONSTRATION = "Démonstration",
  NEGOCIATION = "Négociation",
  AUTRE = "Autre",
}

export enum TaskPriority {
  FAIBLE = "Faible",
  MOYENNE = "Moyenne",
  ELEVEE = "Élevée",
  URGENTE = "Urgente",
}

export enum TaskStatus {
  A_FAIRE = "À faire",
  EN_COURS = "En cours",
  TERMINEE = "Terminée",
  ANNULEE = "Annulée",
  EN_ATTENTE = "En attente",
}

export enum RecurrenceType {
  QUOTIDIENNE = "Quotidienne",
  HEBDOMADAIRE = "Hebdomadaire",
  MENSUELLE = "Mensuelle",
  PERSONNALISEE = "Personnalisée",
}

export enum ReminderType {
  NOTIFICATION = "Notification",
  EMAIL = "Email",
  SMS = "SMS",
  CALENDRIER = "Calendrier",
}

export interface ReminderConfig {
  type: ReminderType;
  delai: number; // en minutes avant l'événement
  active: boolean;
}

export interface RecurrenceConfig {
  type: RecurrenceType;
  frequence: number;
  finLe?: Date;
  nombreRepetitions?: number;
  joursSelectiones?: number[]; // 0-6, dimanche-samedi
}

export interface ActivityTemplate {
  id: string;
  nom: string;
  description: string;
  type: ActivityType;
  duree: number; // en minutes
  rappels: ReminderConfig[];
  etapesDefaut: string[];
}

export interface Activity {
  id: string;
  titre: string;
  description?: string;
  type: ActivityType;
  dateDebut: Date;
  dateFin: Date;
  duree?: number; // en minutes
  tempsPasse?: number; // temps réellement passé en minutes
  statut: TaskStatus;
  priorite: TaskPriority;
  assigneA: {
    id: string;
    nom: string;
  };
  clientId?: string;
  client?: {
    id: string;
    nom: string;
  };
  opportuniteId?: string;
  opportunite?: {
    id: string;
    nom: string;
  };
  tags?: string[];
  rappels?: ReminderConfig[];
  recurrence?: RecurrenceConfig;
  notes?: string;
  etapes?: Array<{
    nom: string;
    complete: boolean;
  }>;
  piece_jointes?: Array<{
    id: string;
    nom: string;
    url: string;
    type: string;
  }>;
  estHorsLigne?: boolean;
  creeLe: Date;
  modifieLe: Date;
}

export interface CalendarViewState {
  vue: "jour" | "semaine" | "mois" | "liste";
  date: Date;
}

export interface ActivityFilters {
  statut?: TaskStatus[];
  type?: ActivityType[];
  priorite?: TaskPriority[];
  assigneA?: string[];
  client?: string;
  opportunite?: string;
  periode?: {
    debut?: Date;
    fin?: Date;
  };
  recherche?: string;
  tagsSelectionnes?: string[];
  dateDebut?: Date;
  dateFin?: Date;
}

export interface ActivitySortOptions {
  champ: "dateDebut" | "priorite" | "type" | "statut" | "client";
  direction: "asc" | "desc";
}

export interface TimeTrackingEntry {
  id: string;
  activiteId: string;
  utilisateurId: string;
  debut: Date;
  fin?: Date;
  duree?: number; // en minutes
  notes?: string;
}
