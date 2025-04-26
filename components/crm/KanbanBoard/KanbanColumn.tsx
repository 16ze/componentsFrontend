import { useMemo } from "react";
import { Droppable } from "react-beautiful-dnd";
import { KanbanColumn as KanbanColumnType, Opportunity } from "./types";
import { OpportunityCard } from "./OpportunityCard";
import {
  filterOpportunities,
  sortOpportunities,
  getColumnStats,
} from "../../../stores/kanbanStore";
import { useKanbanStore } from "../../../stores/kanbanStore";
import {
  BarChart2,
  DollarSign,
  MoreHorizontal,
  PlusCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

interface KanbanColumnProps {
  column: KanbanColumnType;
  isFocused: boolean;
}

export function KanbanColumn({ column, isFocused }: KanbanColumnProps) {
  const { filters, sortOption, setFocusedStage } = useKanbanStore();

  const filteredOpportunities = useMemo(() => {
    return sortOpportunities(
      filterOpportunities(column.opportunities, filters),
      sortOption
    );
  }, [column.opportunities, filters, sortOption]);

  const stats = useMemo(() => {
    return getColumnStats({ ...column, opportunities: filteredOpportunities });
  }, [column, filteredOpportunities]);

  const columnWidth = isFocused ? "w-full md:max-w-3xl mx-auto" : "w-72";

  return (
    <div
      className={`flex flex-col ${columnWidth} transition-all duration-300 ease-in-out`}
    >
      <div
        className="flex items-center justify-between mb-2 p-2 rounded-t-md"
        style={{ backgroundColor: `${column.color}20` }} // Utilisation du code couleur avec 20% d'opacité
      >
        <div className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: column.color }}
          ></div>
          <h3 className="font-semibold text-gray-700">
            {column.title}
            <span className="ml-2 text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-1">
              {filteredOpportunities.length}
            </span>
          </h3>
        </div>

        <div className="flex space-x-2">
          <button
            className={`p-1 text-gray-500 hover:text-gray-700 focus:outline-none ${
              isFocused ? "bg-gray-200 rounded-full" : ""
            }`}
            onClick={() => setFocusedStage(isFocused ? null : column.type)}
            title={isFocused ? "Quitter le mode focus" : "Mode focus"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isFocused ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              )}
            </svg>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Ajouter une opportunité</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {!isFocused && (
        <div className="p-2 mb-2 bg-gray-50 rounded-md text-xs grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <DollarSign className="h-3 w-3 mr-1 text-gray-500" />
            <span className="text-gray-600">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(stats.totalAmount)}
            </span>
          </div>
          <div className="flex items-center">
            <BarChart2 className="h-3 w-3 mr-1 text-gray-500" />
            <span className="text-gray-600">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(stats.totalWeighted || 0)}
            </span>
          </div>
        </div>
      )}

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] flex-grow p-2 rounded-b-md transition-colors ${
              snapshot.isDraggingOver ? "bg-gray-100" : "bg-gray-50"
            }`}
          >
            {filteredOpportunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-md">
                <p>Aucune opportunité</p>
                <p className="text-xs">Glissez-déposez ici</p>
              </div>
            ) : (
              filteredOpportunities.map((opportunity, index) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  index={index}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {isFocused && (
        <div className="mt-3 p-3 bg-white rounded-md shadow text-sm">
          <h4 className="font-semibold text-gray-700 mb-2">
            Statistiques de colonne
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 mb-1">
                Nombre d'opportunités
              </p>
              <p className="font-semibold">{stats.count}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Valeur moyenne</p>
              <p className="font-semibold">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(stats.averageAmount)}
              </p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Valeur totale</p>
              <p className="font-semibold">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(stats.totalAmount)}
              </p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Valeur pondérée</p>
              <p className="font-semibold">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(stats.totalWeighted || 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
