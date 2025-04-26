import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Opportunity,
  KanbanColumn,
  StageType,
  KanbanFilters,
  KanbanSortOptions,
  OpportunityStatus,
} from "../components/crm/KanbanBoard/types";

interface KanbanState {
  columns: KanbanColumn[];
  focusedStage: StageType | null;
  filters: KanbanFilters;
  sortOption: KanbanSortOptions;
  selectedOpportunity: Opportunity | null;

  // Actions
  setColumns: (columns: KanbanColumn[]) => void;
  moveOpportunity: (
    opportunityId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    index: number
  ) => void;
  updateOpportunity: (opportunity: Opportunity) => void;
  addOpportunity: (opportunity: Opportunity) => void;
  removeOpportunity: (opportunityId: string) => void;
  setFocusedStage: (stage: StageType | null) => void;
  setFilters: (filters: Partial<KanbanFilters>) => void;
  resetFilters: () => void;
  setSortOption: (sortOption: KanbanSortOptions) => void;
  selectOpportunity: (opportunityId: string | null) => void;
  updateOpportunityStage: (opportunityId: string, newStage: StageType) => void;
  updateOpportunityStatus: (
    opportunityId: string,
    newStatus: OpportunityStatus
  ) => void;
}

const defaultColumns: KanbanColumn[] = [
  {
    id: "1",
    title: "Prospection",
    type: StageType.PROSPECTION,
    opportunities: [],
    color: "#3498db",
  },
  {
    id: "2",
    title: "Qualification",
    type: StageType.QUALIFICATION,
    opportunities: [],
    color: "#9b59b6",
  },
  {
    id: "3",
    title: "Proposition",
    type: StageType.PROPOSITION,
    opportunities: [],
    color: "#f39c12",
  },
  {
    id: "4",
    title: "Négociation",
    type: StageType.NEGOCIATION,
    opportunities: [],
    color: "#e74c3c",
  },
  {
    id: "5",
    title: "Clôture",
    type: StageType.CLOTURE,
    opportunities: [],
    color: "#2ecc71",
  },
];

const defaultFilters: KanbanFilters = {
  salesRep: undefined,
  dateRange: undefined,
  amountRange: undefined,
  client: undefined,
  source: undefined,
  status: undefined,
};

const defaultSortOption: KanbanSortOptions = {
  field: "updatedAt",
  direction: "desc",
};

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      columns: defaultColumns,
      focusedStage: null,
      filters: defaultFilters,
      sortOption: defaultSortOption,
      selectedOpportunity: null,

      setColumns: (columns) => set({ columns }),

      moveOpportunity: (
        opportunityId,
        sourceColumnId,
        destinationColumnId,
        index
      ) => {
        const state = get();
        const columns = [...state.columns];

        // Trouver les colonnes source et destination
        const sourceColumn = columns.find((col) => col.id === sourceColumnId);
        const destinationColumn = columns.find(
          (col) => col.id === destinationColumnId
        );

        if (!sourceColumn || !destinationColumn) return;

        // Trouver l'opportunité à déplacer
        const opportunityIndex = sourceColumn.opportunities.findIndex(
          (opp) => opp.id === opportunityId
        );
        if (opportunityIndex === -1) return;

        // Extraire l'opportunité de la colonne source
        const [opportunity] = sourceColumn.opportunities.splice(
          opportunityIndex,
          1
        );

        // Mettre à jour l'étape de l'opportunité
        const updatedOpportunity = {
          ...opportunity,
          stage: destinationColumn.type,
          updatedAt: new Date(),
        };

        // Insérer l'opportunité dans la colonne de destination à l'index spécifié
        destinationColumn.opportunities.splice(index, 0, updatedOpportunity);

        set({ columns });
      },

      updateOpportunity: (opportunity) => {
        const state = get();
        const columns = [...state.columns];

        for (const column of columns) {
          const opportunityIndex = column.opportunities.findIndex(
            (opp) => opp.id === opportunity.id
          );
          if (opportunityIndex !== -1) {
            column.opportunities[opportunityIndex] = {
              ...opportunity,
              updatedAt: new Date(),
            };
            break;
          }
        }

        set({ columns });
      },

      addOpportunity: (opportunity) => {
        const state = get();
        const columns = [...state.columns];

        const targetColumn = columns.find(
          (col) => col.type === opportunity.stage
        );
        if (!targetColumn) return;

        targetColumn.opportunities.push({
          ...opportunity,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        set({ columns });
      },

      removeOpportunity: (opportunityId) => {
        const state = get();
        const columns = [...state.columns];

        for (const column of columns) {
          const opportunityIndex = column.opportunities.findIndex(
            (opp) => opp.id === opportunityId
          );
          if (opportunityIndex !== -1) {
            column.opportunities.splice(opportunityIndex, 1);
            break;
          }
        }

        set({ columns });
      },

      setFocusedStage: (stage) => set({ focusedStage: stage }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      setSortOption: (sortOption) => set({ sortOption }),

      selectOpportunity: (opportunityId) => {
        if (!opportunityId) {
          set({ selectedOpportunity: null });
          return;
        }

        const state = get();
        for (const column of state.columns) {
          const opportunity = column.opportunities.find(
            (opp) => opp.id === opportunityId
          );
          if (opportunity) {
            set({ selectedOpportunity: opportunity });
            return;
          }
        }
      },

      updateOpportunityStage: (opportunityId, newStage) => {
        const state = get();
        const columns = [...state.columns];

        let opportunity: Opportunity | null = null;
        let sourceColumnId = "";

        // Trouver l'opportunité et sa colonne actuelle
        for (const column of columns) {
          const opportunityIndex = column.opportunities.findIndex(
            (opp) => opp.id === opportunityId
          );
          if (opportunityIndex !== -1) {
            opportunity = column.opportunities[opportunityIndex];
            sourceColumnId = column.id;
            break;
          }
        }

        if (!opportunity) return;

        // Trouver la colonne de destination
        const destinationColumn = columns.find((col) => col.type === newStage);
        if (!destinationColumn) return;

        // Utiliser moveOpportunity pour déplacer l'opportunité
        get().moveOpportunity(
          opportunityId,
          sourceColumnId,
          destinationColumn.id,
          destinationColumn.opportunities.length
        );
      },

      updateOpportunityStatus: (opportunityId, newStatus) => {
        const state = get();
        const columns = [...state.columns];

        for (const column of columns) {
          const opportunityIndex = column.opportunities.findIndex(
            (opp) => opp.id === opportunityId
          );
          if (opportunityIndex !== -1) {
            column.opportunities[opportunityIndex] = {
              ...column.opportunities[opportunityIndex],
              status: newStatus,
              updatedAt: new Date(),
            };
            break;
          }
        }

        set({ columns });
      },
    }),
    {
      name: "kanban-storage",
    }
  )
);

// Utilitaire pour obtenir les statistiques par colonne
export const getColumnStats = (column: KanbanColumn) => {
  const opportunities = column.opportunities;
  const count = opportunities.length;

  if (count === 0) {
    return { count: 0, totalAmount: 0, averageAmount: 0, totalWeighted: 0 };
  }

  const totalAmount = opportunities.reduce(
    (total, opp) => total + opp.amount,
    0
  );
  const averageAmount = totalAmount / count;
  const totalWeighted = opportunities.reduce(
    (total, opp) => total + (opp.amount * opp.probability) / 100,
    0
  );

  return {
    count,
    totalAmount,
    averageAmount,
    totalWeighted,
  };
};

// Fonction utilitaire pour filtrer les opportunités en fonction des filtres
export const filterOpportunities = (
  opportunities: Opportunity[],
  filters: KanbanFilters
): Opportunity[] => {
  return opportunities.filter((opp) => {
    // Filtre par commercial
    if (filters.salesRep && opp.assignedTo.id !== filters.salesRep) {
      return false;
    }

    // Filtre par période
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;

      if (start && opp.expectedCloseDate < start) {
        return false;
      }

      if (end && opp.expectedCloseDate > end) {
        return false;
      }
    }

    // Filtre par montant
    if (filters.amountRange) {
      const { min, max } = filters.amountRange;

      if (min !== null && opp.amount < min) {
        return false;
      }

      if (max !== null && opp.amount > max) {
        return false;
      }
    }

    // Filtre par client
    if (
      filters.client &&
      !opp.clientName.toLowerCase().includes(filters.client.toLowerCase())
    ) {
      return false;
    }

    // Filtre par source
    if (filters.source && opp.source !== filters.source) {
      return false;
    }

    // Filtre par statut
    if (filters.status && opp.status !== filters.status) {
      return false;
    }

    return true;
  });
};

// Fonction utilitaire pour trier les opportunités
export const sortOpportunities = (
  opportunities: Opportunity[],
  sortOption: KanbanSortOptions
): Opportunity[] => {
  return [...opportunities].sort((a, b) => {
    const { field, direction } = sortOption;
    const multiplier = direction === "asc" ? 1 : -1;

    switch (field) {
      case "amount":
        return (a.amount - b.amount) * multiplier;
      case "probability":
        return (a.probability - b.probability) * multiplier;
      case "expectedCloseDate":
        return (
          (a.expectedCloseDate.getTime() - b.expectedCloseDate.getTime()) *
          multiplier
        );
      case "updatedAt":
        return (a.updatedAt.getTime() - b.updatedAt.getTime()) * multiplier;
      case "clientName":
        return a.clientName.localeCompare(b.clientName) * multiplier;
      default:
        return 0;
    }
  });
};
