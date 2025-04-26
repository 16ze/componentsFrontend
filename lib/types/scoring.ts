// Types pour le système de scoring des leads

// Types de critères
export type CritereType = "demographique" | "comportemental";

// Catégories de critères démographiques
export type CategorieDemographique =
  | "industrie"
  | "taille"
  | "localisation"
  | "budget"
  | "autre";

// Catégories de critères comportementaux
export type CategorieComportementale =
  | "visite"
  | "telechargement"
  | "email"
  | "evenement"
  | "interaction"
  | "autre";

// Statut de qualification du lead basé sur le score
export type StatutQualification = "froid" | "tiede" | "chaud" | "qualifie";

// Interface pour un critère de scoring
export interface CritereScoringBase {
  id: string;
  nom: string;
  description: string;
  type: CritereType;
  poids: number;
  actif: boolean;
}

// Interface pour un critère démographique
export interface CritereDemographique extends CritereScoringBase {
  type: "demographique";
  categorie: CategorieDemographique;
  valeurs: {
    valeur: string;
    points: number;
  }[];
}

// Interface pour un critère comportemental
export interface CritereComportemental extends CritereScoringBase {
  type: "comportemental";
  categorie: CategorieComportementale;
  points: number;
  decroissance?: {
    active: boolean;
    periodeJours: number;
    pourcentage: number;
  };
}

// Union type pour tous les types de critères
export type CritereScoring = CritereDemographique | CritereComportemental;

// Interface pour une règle de scoring (un ensemble de critères)
export interface RegleScoring {
  id: string;
  nom: string;
  description: string;
  criteres: CritereScoring[];
  seuils: {
    froid: number;
    tiede: number;
    chaud: number;
    qualifie: number;
  };
  actions: ActionScoring[];
  secteurActivite?: string;
  estModele: boolean;
}

// Interface pour une action basée sur un changement de score
export interface ActionScoring {
  id: string;
  nom: string;
  description: string;
  declencheur: {
    type: "score_depasse" | "score_change" | "statut_change";
    valeur?: number;
    de?: StatutQualification;
    vers?: StatutQualification;
  };
  action: {
    type: "notification" | "email" | "assignation" | "tache";
    destinataire?: string;
    modele?: string;
    utilisateurId?: string;
  };
}

// Interface pour l'historique des scores d'un lead
export interface HistoriqueScore {
  id: string;
  leadId: string;
  date: Date;
  score: number;
  statut: StatutQualification;
  details: {
    critereId: string;
    points: number;
  }[];
}

// Interface pour les données d'entraînement du modèle ML
export interface DonneeEntrainement {
  leadId: string;
  criteres: {
    critereId: string;
    valeur: string | number;
  }[];
  score: number;
  converti: boolean;
  dateConversion?: Date;
}

// Interface pour un modèle de test A/B
export interface ModeleTestAB {
  id: string;
  nom: string;
  regleId: string;
  dateDebut: Date;
  dateFin?: Date;
  population: number;
  conversions: number;
  actif: boolean;
}

// Interface pour les analyses de performance des modèles
export interface AnalysePerformanceModele {
  modeleId: string;
  tauxConversion: number;
  scoresMoyens: {
    convertis: number;
    nonConvertis: number;
  };
  distributionScores: {
    froid: number;
    tiede: number;
    chaud: number;
    qualifie: number;
  };
}
