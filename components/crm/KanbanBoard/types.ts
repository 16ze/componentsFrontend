export enum StageType {
  PROSPECTION = "Prospection",
  QUALIFICATION = "Qualification",
  PROPOSITION = "Proposition",
  NEGOCIATION = "Négociation",
  CLOTURE = "Clôture",
}

export type OpportunityStatus = "active" | "won" | "lost";

export interface Opportunity {
  id: string;
  title: string;
  clientName: string;
  amount: number;
  probability: number;
  expectedCloseDate: Date;
  assignedTo: {
    id: string;
    name: string;
    avatar?: string;
  };
  stage: StageType;
  status: OpportunityStatus;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
  notes?: string;
  isStuck?: boolean;
  isDelayed?: boolean;
}

export interface KanbanColumn {
  id: string;
  title: string;
  type: StageType;
  opportunities: Opportunity[];
  color?: string;
}

export interface KanbanFilters {
  salesRep?: string;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  amountRange?: {
    min: number | null;
    max: number | null;
  };
  client?: string;
  source?: string;
  status?: OpportunityStatus;
}

export interface KanbanSortOptions {
  field:
    | "amount"
    | "probability"
    | "expectedCloseDate"
    | "updatedAt"
    | "clientName";
  direction: "asc" | "desc";
}

export interface ColumnStats {
  count: number;
  totalAmount: number;
  averageAmount: number;
  totalWeighted?: number;
}
