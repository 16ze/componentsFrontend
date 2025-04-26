export enum TagType {
  SYSTEM = "system",
  USER = "user",
}

export enum TagColor {
  RED = "red",
  ORANGE = "orange",
  YELLOW = "yellow",
  GREEN = "green",
  BLUE = "blue",
  INDIGO = "indigo",
  PURPLE = "purple",
  PINK = "pink",
  GRAY = "gray",
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  color: TagColor;
  type: TagType;
  parentId?: string; // Pour la hiérarchie
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  count?: number; // Nombre de clients avec ce tag
  permissions?: TagPermissions; // Nouvelles permissions pour les tags
  usageStats?: TagUsageStats; // Statistiques d'utilisation
}

// Nouvelle interface pour les permissions des tags
export interface TagPermissions {
  canEdit: string[]; // IDs des rôles qui peuvent éditer
  canDelete: string[]; // IDs des rôles qui peuvent supprimer
  canAssign: string[]; // IDs des rôles qui peuvent assigner
  isPublic: boolean; // Si le tag est visible par tous
}

// Nouvelle interface pour les statistiques d'utilisation des tags
export interface TagUsageStats {
  totalUsage: number;
  clientsCount: number;
  campaignsCount: number;
  lastUsed: string;
  usageHistory: Array<{ date: string; count: number }>;
}

export enum OperatorType {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  BETWEEN = "between",
  IN_LIST = "in_list",
  NOT_IN_LIST = "not_in_list",
  IS_SET = "is_set",
  IS_NOT_SET = "is_not_set",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  BEFORE = "before", // Nouvelle condition pour dates
  AFTER = "after", // Nouvelle condition pour dates
  WITHIN_TIMEFRAME = "within_timeframe", // Nouvelle condition (ex: 30 derniers jours)
  HAS_TAG = "has_tag", // Nouvelle condition
  HAS_ANY_TAG_FROM = "has_any_tag_from", // Nouvelle condition
  HAS_ALL_TAGS_FROM = "has_all_tags_from", // Nouvelle condition
}

export enum LogicalOperator {
  AND = "and",
  OR = "or",
  NOT = "not", // Ajout de l'opérateur NON pour la négation
}

export enum ConditionField {
  // Informations de base
  NAME = "name",
  EMAIL = "email",
  PHONE = "phone",
  COMPANY = "company",

  // Comportement
  LAST_ACTIVITY = "last_activity",
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
  VISITS_COUNT = "visits_count",
  ENGAGEMENT_SCORE = "engagement_score", // Nouveau champ

  // Valeur
  TOTAL_REVENUE = "total_revenue",
  AVERAGE_ORDER = "average_order",
  PURCHASE_COUNT = "purchase_count",
  LAST_PURCHASE = "last_purchase",
  LIFETIME_VALUE = "lifetime_value",
  RECURRING_REVENUE = "recurring_revenue", // Nouveau champ

  // Géographie
  COUNTRY = "country",
  CITY = "city",
  REGION = "region",
  POSTAL_CODE = "postal_code",
  TIMEZONE = "timezone", // Nouveau champ

  // Source
  SOURCE = "source",
  CAMPAIGN = "campaign",
  REFERRER = "referrer",
  UTM_MEDIUM = "utm_medium", // Nouveau champ
  UTM_SOURCE = "utm_source", // Nouveau champ
  UTM_CAMPAIGN = "utm_campaign", // Nouveau champ

  // Tags
  TAGS = "tags", // Nouveau champ pour conditions basées sur les tags

  // Personnalisé
  CUSTOM = "custom",
}

export interface Condition {
  id: string;
  field: ConditionField | string; // String pour les champs personnalisés
  operator: OperatorType;
  value: any;
  additionalValue?: any; // Pour les opérateurs comme BETWEEN
  customFieldId?: string; // Pour les champs personnalisés
  weight?: number; // Poids pour les conditions (scoring)
}

export interface ConditionGroup {
  id: string;
  conditions: Condition[];
  operator: LogicalOperator;
  groups?: ConditionGroup[]; // Sous-groupes pour les conditions imbriquées
  weight?: number; // Poids pour les groupes (scoring)
}

export enum SegmentType {
  DYNAMIC = "dynamic", // Basé uniquement sur des règles
  STATIC = "static", // Liste manuelle de clients
  MIXED = "mixed", // Combinaison de règles et liste manuelle
  PREDICTIVE = "predictive", // Nouveau type pour segments basés sur modèles prédictifs
  BEHAVIORAL = "behavioral", // Nouveau type pour segments basés sur comportement
}

export enum SegmentVisibility {
  PRIVATE = "private", // Visible uniquement par le créateur
  TEAM = "team", // Visible par l'équipe du créateur
  ORGANIZATION = "organization", // Visible par toute l'organisation
  PUBLIC = "public", // Visible par tous (partenaires inclus)
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  type: SegmentType;
  rootGroup?: ConditionGroup; // Pour les segments dynamiques
  staticMembers?: string[]; // IDs des clients pour les segments statiques
  excludedMembers?: string[]; // IDs des clients exclus manuellement
  tags?: string[]; // IDs des tags associés
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastCalculatedAt?: string;
  count?: number; // Nombre de clients dans le segment
  isTemplate?: boolean; // Si c'est un modèle prédéfini
  industryType?: string; // Pour les modèles par industrie
  visibility?: SegmentVisibility; // Contrôle de la visibilité
  refreshRate?: "realtime" | "hourly" | "daily" | "weekly" | "manual"; // Fréquence de rafraîchissement
  kpis?: string[]; // Liste des KPIs spécifiques à ce segment
  isStarred?: boolean; // Si le segment est marqué comme favori
  predictiveModel?: string; // Référence au modèle prédictif (si applicable)
  behavioralData?: BehavioralSegmentData; // Données comportementales (si applicable)
}

// Nouvelle interface pour les données de segment comportemental
export interface BehavioralSegmentData {
  eventSequence: Array<{
    eventName: string;
    timeframe?: string;
    conditions?: Condition[];
  }>;
  conversionGoal?: {
    eventName: string;
    value?: number;
  };
  timeWindow?: string; // ex: "30d", "90d"
}

// Mise à jour de l'interface AutoTagRule
export interface AutoTagRule {
  id: string;
  name: string;
  description?: string;
  tagId: string;
  rootGroup: ConditionGroup;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastRunAt?: string;
  priority?: number; // Priorité d'exécution
  applyToExisting?: boolean; // Appliquer aux clients existants
  schedule?: {
    frequency: "realtime" | "hourly" | "daily" | "weekly";
    lastDay?: number; // Pour hebdomadaire
    time?: string; // Format HH:MM
  };
  triggers?: Array<{
    eventType: string;
    conditions?: Condition[];
  }>;
}

// Mise à jour de l'interface SegmentAnalytics
export interface SegmentAnalytics {
  id: string;
  segmentId: string;
  kpis: Record<string, number>; // Différentes métriques
  growthRate: number; // Taux de croissance
  churnRate: number; // Taux d'attrition
  conversionRate?: number; // Taux de conversion
  engagementScore?: number; // Score d'engagement
  calculatedAt: string;
  chartData?: {
    timeline: Array<{ date: string; count: number }>;
    distribution: Array<{ label: string; value: number }>;
  };
  predictions?: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
  comparisons?: Record<
    string,
    {
      segmentId: string;
      segmentName: string;
      differences: Record<string, { value: number; percentage: number }>;
    }
  >;
  lastUpdated?: string;
}

export interface SegmentChange {
  id: string;
  segmentId: string;
  userId: string;
  changeType: "created" | "updated" | "deleted" | "merged" | "split";
  details: Record<string, any>; // Détails du changement
  timestamp: string;
  relatedSegments?: string[]; // IDs des segments liés (pour merge/split)
}

export interface SegmentRecommendation {
  id: string;
  name: string;
  description?: string;
  rootGroup: ConditionGroup;
  estimatedCount: number;
  confidence: number; // 0-1
  baseSegmentId?: string; // Segment à partir duquel la recommandation est générée
  createdAt: string;
  insights?: string[]; // Insights sur pourquoi ce segment est recommandé
  potentialValue?: number; // Valeur potentielle de ce segment
  similarSegments?: string[]; // IDs des segments similaires
}

export enum ConditionOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  BETWEEN = "between",
  NOT_BETWEEN = "not_between",
  IS_EMPTY = "is_empty",
  IS_NOT_EMPTY = "is_not_empty",
  IN_LIST = "in_list",
  NOT_IN_LIST = "not_in_list",
  HAS_ANY_TAG = "has_any_tag",
  HAS_ALL_TAGS = "has_all_tags",
  HAS_NO_TAG = "has_no_tag",
}

export enum GroupOperator {
  AND = "AND",
  OR = "OR",
  NOT = "NOT", // Ajouté
}

export enum EntityType {
  CLIENT = "client",
  CONTACT = "contact",
  OPPORTUNITE = "opportunite",
  ACTIVITE = "activite",
  CAMPAIGN = "campaign", // Ajouté
  DEAL = "deal", // Ajouté
}

export enum FieldType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  BOOLEAN = "boolean",
  SELECT = "select",
  MULTI_SELECT = "multi_select",
  TAG = "tag",
  RELATION = "relation",
  GEO = "geo", // Ajouté pour les données géographiques
  EMAIL = "email", // Ajouté pour la validation d'email
  PHONE = "phone", // Ajouté pour la validation de téléphone
  URL = "url", // Ajouté pour la validation d'URL
  CURRENCY = "currency", // Ajouté pour les montants financiers
  PERCENTAGE = "percentage", // Ajouté pour les pourcentages
}

export interface FieldDefinition {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  entity: EntityType;
  isSystem: boolean;
  options?: string[];
  relatedEntity?: EntityType;
  validations?: Record<string, any>; // Règles de validation
  isFilterable?: boolean; // Si le champ peut être utilisé dans les filtres
  isSegmentable?: boolean; // Si le champ peut être utilisé dans les segments
  defaultValue?: any; // Valeur par défaut
  unit?: string; // Unité (ex: €, $, %, etc.)
}

export interface TagRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  conditionGroup: ConditionGroup;
  tagId: string;
  entityType: EntityType;
  createdAt: string;
  updatedAt: string;
  priority?: number; // Priorité d'exécution
  triggers?: Array<{
    eventType: string;
    conditions?: Condition[];
  }>;
}

export interface SegmentationUIState {
  selectedSegmentId?: string;
  selectedTagId?: string;
  isSegmentBuilderOpen: boolean;
  isTagBuilderOpen: boolean;
  activeTab:
    | "segments"
    | "tags"
    | "rules"
    | "analytics"
    | "predictions"
    | "templates";
  comparingSegments?: string[]; // IDs des segments en cours de comparaison
  tagHierarchyView: "flat" | "tree"; // Type d'affichage pour les tags
}

export interface SegmentationFilters {
  search: string;
  types: SegmentType[];
  tags: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  createdBy?: string[];
  industries?: string[];
  sortBy: "name" | "createdAt" | "updatedAt" | "memberCount" | "growthRate";
  sortOrder: "asc" | "desc";
  starred?: boolean; // Filtrer par segments favoris
}

export interface TagFilters {
  search: string;
  colors: string[];
  types: TagType[];
  sortBy: "name" | "createdAt" | "usage";
  sortOrder: "asc" | "desc";
  hierarchyLevel?: number; // Niveau dans la hiérarchie
  createdBy?: string[];
}

export interface TagStats {
  id: string;
  usageCount: number;
  entityDistribution: {
    [key in EntityType]?: number;
  };
  recentChanges?: Array<{
    date: string;
    change: number;
  }>;
}

export interface SegmentTemplate {
  id: string;
  name: string;
  description: string;
  industryType: string;
  rootGroup: ConditionGroup;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  popularity: number; // Nombre d'utilisations
  kpis: string[]; // KPIs recommandés pour ce template
}

export interface SegmentBulkAction {
  id: string;
  name: string;
  segmentId: string;
  actionType:
    | "email"
    | "sms"
    | "task"
    | "status_update"
    | "tag"
    | "assignment"
    | "custom";
  parameters: Record<string, any>;
  status: "draft" | "scheduled" | "running" | "completed" | "failed";
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
  resultStats?: {
    total: number;
    success: number;
    failed: number;
    pending: number;
  };
}

export interface SegmentCache {
  id: string;
  segmentId: string;
  clientIds: string[];
  calculatedAt: string;
  expiresAt: string;
  version: number;
}
