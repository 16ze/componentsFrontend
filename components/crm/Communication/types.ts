import { v4 as uuidv4 } from "uuid";

export enum CommunicationType {
  EMAIL = "Email",
  SMS = "SMS",
  APPEL = "Appel",
  MESSAGE_INTERNE = "Message interne",
  NOTIFICATION = "Notification",
}

export enum CommunicationStatus {
  BROUILLON = "Brouillon",
  PROGRAMMEE = "Programmée",
  ENVOYEE = "Envoyée",
  ECHEC = "Échec",
  EN_ATTENTE = "En attente",
  RECUE = "Reçue",
  ARCHIVEE = "Archivée",
}

export enum CommunicationFolder {
  BOITE_RECEPTION = "Boîte de réception",
  ENVOYES = "Envoyés",
  BROUILLONS = "Brouillons",
  ARCHIVES = "Archives",
  SPAM = "Spam",
  CORBEILLE = "Corbeille",
}

export enum EmailTemplateCategory {
  PROSPECTION = "Prospection",
  PROPOSITION = "Proposition",
  NEGOCIATION = "Négociation",
  SUIVI = "Suivi",
  RELANCE = "Relance",
  REMERCIEMENT = "Remerciement",
  ONBOARDING = "Onboarding",
  SUPPORT = "Support",
  EVENEMENT = "Événement",
  AUTRE = "Autre",
}

export enum CommunicationPriority {
  BASSE = "Basse",
  NORMALE = "Normale",
  HAUTE = "Haute",
  URGENTE = "Urgente",
}

export enum TrackingEventType {
  OUVERTURE = "Ouverture",
  CLIC = "Clic",
  REPONSE = "Réponse",
  REBOND = "Rebond",
  DESABONNEMENT = "Désabonnement",
}

export interface ConsentPreferences {
  marketing: boolean;
  notifications: boolean;
  emailsCommercials: boolean;
  sms: boolean;
  appelsCommercials: boolean;
  dateConsentement: Date;
  derniereMiseAJour: Date;
  ip?: string;
  source?: string;
}

export interface TrackingEvent {
  id: string;
  communicationId: string;
  type: TrackingEventType;
  date: Date;
  details?: {
    url?: string;
    userAgent?: string;
    ip?: string;
    localisation?: string;
    dureeVisite?: number;
  };
}

export interface DynamicVariable {
  code: string;
  description: string;
  valeurParDefaut: string;
  categorie:
    | "client"
    | "opportunite"
    | "utilisateur"
    | "entreprise"
    | "systeme";
}

export interface EmailTemplate {
  id: string;
  nom: string;
  sujet: string;
  contenuHtml: string;
  contenuTexte: string;
  categorie: EmailTemplateCategory;
  variables: DynamicVariable[];
  tags?: string[];
  creePar: string;
  dateCreation: Date;
  dateModification: Date;
  actif: boolean;
  metriques?: {
    tauxOuverture?: number;
    tauxClics?: number;
    tauxReponses?: number;
    tauxConversion?: number;
    nombreEnvois: number;
  };
}

export interface SequenceEmail {
  id: string;
  nom: string;
  description?: string;
  declencheur:
    | "nouveau_client"
    | "opportunite_inactive"
    | "contrat_renouvellement"
    | "evenement"
    | "manuel";
  conditionsDeclenchement?: {
    typesClient?: string[];
    segmentsClient?: string[];
    tailleEntreprise?: string[];
    secteurActivite?: string[];
    valeurOpportunite?: {
      min?: number;
      max?: number;
    };
    joursInactivite?: number;
    statutOpportunite?: string[];
  };
  emails: Array<{
    ordre: number;
    templateId: string;
    delai: number; // en heures depuis l'étape précédente
    conditionsEnvoi?: {
      siPasOuverture?: boolean;
      siPasClic?: boolean;
      siPasReponse?: boolean;
    };
    optimisationHoraire: boolean;
  }>;
  active: boolean;
  dateCreation: Date;
  dateModification: Date;
  creePar: string;
  statistiques?: {
    nombreDeclenchements: number;
    nombreEmailsEnvoyes: number;
    tauxConversion: number;
    tauxDesabonnement: number;
  };
}

export interface Communication {
  id: string;
  type: CommunicationType;
  statut: CommunicationStatus;
  dossier: CommunicationFolder;
  expediteur: {
    id: string;
    nom: string;
    email?: string;
    telephone?: string;
  };
  destinataires: Array<{
    id: string;
    nom: string;
    email?: string;
    telephone?: string;
    type: "to" | "cc" | "bcc";
  }>;
  sujet?: string;
  contenuHtml?: string;
  contenuTexte: string;
  dateCreation: Date;
  dateModification: Date;
  dateEnvoi?: Date;
  dateProgrammee?: Date;
  priorite: CommunicationPriority;
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
  templateId?: string;
  templateNom?: string;
  sequenceId?: string;
  sequenceEtape?: number;
  pieceJointes?: Array<{
    id: string;
    nom: string;
    taille: number;
    type: string;
    url: string;
  }>;
  tags?: string[];
  metadonnees?: {
    campagneId?: string;
    campagneNom?: string;
    sourceId?: string;
    sourceName?: string;
    ipEnvoi?: string;
    userAgent?: string;
  };
  tracking?: {
    ouvert: boolean;
    dateOuverture?: Date;
    nombreOuvertures?: number;
    clics?: Array<{
      url: string;
      date: Date;
      nombreClics: number;
    }>;
    repondu: boolean;
    dateReponse?: Date;
  };
  optimisationHoraire?: boolean;
  estBrouillonAuto?: boolean;
  estImportant?: boolean;
  reponseAId?: string;
}

export interface CommunicationFilters {
  type?: CommunicationType[];
  statut?: CommunicationStatus[];
  dossier?: CommunicationFolder;
  clientId?: string;
  opportuniteId?: string;
  expediteurId?: string[];
  destinataireId?: string[];
  periode?: {
    debut?: Date;
    fin?: Date;
  };
  contient?: string;
  tags?: string[];
  nonLus?: boolean;
  avecPieceJointe?: boolean;
  importants?: boolean;
}

export interface AnalyticsMetrics {
  tauxOuverture: number;
  tauxClics: number;
  tauxReponses: number;
  tauxRebonds: number;
  tauxDesabonnement: number;
  meilleursHoraires: Array<{
    jour: number; // 0-6 pour dimanche-samedi
    heure: number; // 0-23
    tauxEngagement: number;
  }>;
  meilleursTemplates: Array<{
    templateId: string;
    templateNom: string;
    tauxEngagement: number;
    nombreEnvois: number;
  }>;
}
