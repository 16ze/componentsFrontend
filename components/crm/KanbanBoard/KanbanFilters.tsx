import { useState } from "react";
import { useKanbanStore } from "../../../stores/kanbanStore";
import { KanbanSortOptions, OpportunityStatus } from "./types";
import {
  Filter,
  SortAsc,
  SortDesc,
  Calendar as CalendarIcon,
  DollarSign,
  User,
  Tag,
  RefreshCcw,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

export function KanbanFilters() {
  const { filters, setFilters, resetFilters, sortOption, setSortOption } =
    useKanbanStore();
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isAmountPopoverOpen, setIsAmountPopoverOpen] = useState(false);

  // Options de tri
  const sortFields: { label: string; value: KanbanSortOptions["field"] }[] = [
    { label: "Montant", value: "amount" },
    { label: "Probabilité", value: "probability" },
    { label: "Date de clôture", value: "expectedCloseDate" },
    { label: "Dernière mise à jour", value: "updatedAt" },
    { label: "Client", value: "clientName" },
  ];

  // Formater la plage de dates pour l'affichage
  const formatDateRange = () => {
    if (!filters.dateRange) return "Toutes les périodes";

    const { start, end } = filters.dateRange;
    if (start && end) {
      return `${format(start, "dd/MM/yyyy", { locale: fr })} - ${format(
        end,
        "dd/MM/yyyy",
        { locale: fr }
      )}`;
    } else if (start) {
      return `Après le ${format(start, "dd/MM/yyyy", { locale: fr })}`;
    } else if (end) {
      return `Avant le ${format(end, "dd/MM/yyyy", { locale: fr })}`;
    }

    return "Toutes les périodes";
  };

  // Formater la plage de montant pour l'affichage
  const formatAmountRange = () => {
    if (!filters.amountRange) return "Tous les montants";

    const { min, max } = filters.amountRange;
    const formatAmount = (amount: number | null) => {
      if (amount === null) return "";
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (min !== null && max !== null) {
      return `${formatAmount(min)} - ${formatAmount(max)}`;
    } else if (min !== null) {
      return `> ${formatAmount(min)}`;
    } else if (max !== null) {
      return `< ${formatAmount(max)}`;
    }

    return "Tous les montants";
  };

  // Gérer le changement de direction de tri
  const toggleSortDirection = () => {
    setSortOption({
      ...sortOption,
      direction: sortOption.direction === "asc" ? "desc" : "asc",
    });
  };

  // Gérer le changement de champ de tri
  const handleSortFieldChange = (field: KanbanSortOptions["field"]) => {
    setSortOption({
      ...sortOption,
      field,
    });
  };

  // Gérer les changements de plage de dates
  const handleDateRangeChange = (date: Date | null, type: "start" | "end") => {
    const currentRange = filters.dateRange || { start: null, end: null };
    setFilters({
      dateRange: {
        ...currentRange,
        [type]: date,
      },
    });
  };

  // Gérer les changements de plage de montant
  const handleAmountRangeChange = (amount: string, type: "min" | "max") => {
    const currentRange = filters.amountRange || { min: null, max: null };
    const numAmount = amount ? parseInt(amount, 10) : null;

    setFilters({
      amountRange: {
        ...currentRange,
        [type]: numAmount,
      },
    });
  };

  // Gérer le changement de statut
  const handleStatusChange = (status: OpportunityStatus | undefined) => {
    setFilters({ status });
  };

  return (
    <div className="bg-white p-3 rounded-md shadow-sm mb-4 flex flex-wrap gap-2 items-center">
      <div className="flex items-center mr-2">
        <Filter className="h-4 w-4 mr-1 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtres:</span>
      </div>

      {/* Filtre par client */}
      <div className="relative flex items-center border border-gray-300 rounded-md px-2 h-8 w-40">
        <User className="h-3 w-3 text-gray-500 mr-1" />
        <input
          value={filters.client || ""}
          onChange={(e) => setFilters({ client: e.target.value })}
          placeholder="Client..."
          className="h-full w-full text-sm border-0 focus:outline-none focus:ring-0"
        />
      </div>

      {/* Filtre par période */}
      <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 text-sm font-normal justify-start px-3"
            size="sm"
          >
            <CalendarIcon className="h-3 w-3 mr-2 text-gray-500" />
            <span className="truncate max-w-[150px]">{formatDateRange()}</span>
            <ChevronDown className="h-3 w-3 ml-2 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Période</h4>
              <div className="grid gap-2">
                <div>
                  <h5 className="text-xs text-gray-500 mb-1">Date de début</h5>
                  <Calendar
                    mode="single"
                    selected={filters.dateRange?.start || undefined}
                    onSelect={(date) => handleDateRangeChange(date, "start")}
                    initialFocus
                  />
                </div>
                <div>
                  <h5 className="text-xs text-gray-500 mb-1">Date de fin</h5>
                  <Calendar
                    mode="single"
                    selected={filters.dateRange?.end || undefined}
                    onSelect={(date) => handleDateRangeChange(date, "end")}
                    initialFocus
                  />
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ dateRange: undefined })}
                >
                  Réinitialiser
                </Button>
                <Button size="sm" onClick={() => setIsDatePopoverOpen(false)}>
                  Appliquer
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Filtre par montant */}
      <Popover open={isAmountPopoverOpen} onOpenChange={setIsAmountPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 text-sm font-normal justify-start px-3"
            size="sm"
          >
            <DollarSign className="h-3 w-3 mr-2 text-gray-500" />
            <span className="truncate max-w-[150px]">
              {formatAmountRange()}
            </span>
            <ChevronDown className="h-3 w-3 ml-2 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Montant</h4>
            <div className="grid gap-2">
              <div>
                <h5 className="text-xs text-gray-500 mb-1">Minimum</h5>
                <Input
                  type="number"
                  placeholder="Montant min..."
                  value={filters.amountRange?.min || ""}
                  onChange={(e) =>
                    handleAmountRangeChange(e.target.value, "min")
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <h5 className="text-xs text-gray-500 mb-1">Maximum</h5>
                <Input
                  type="number"
                  placeholder="Montant max..."
                  value={filters.amountRange?.max || ""}
                  onChange={(e) =>
                    handleAmountRangeChange(e.target.value, "max")
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ amountRange: undefined })}
              >
                Réinitialiser
              </Button>
              <Button size="sm" onClick={() => setIsAmountPopoverOpen(false)}>
                Appliquer
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Filtre par statut */}
      <div className="relative">
        <select
          value={filters.status || ""}
          onChange={(e) =>
            handleStatusChange(
              (e.target.value as OpportunityStatus) || undefined
            )
          }
          className="h-8 text-sm font-normal rounded-md border border-gray-300 px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Active</option>
          <option value="won">Gagnée</option>
          <option value="lost">Perdue</option>
        </select>
      </div>

      {/* Filtre par source */}
      <div className="relative flex items-center border border-gray-300 rounded-md px-2 h-8 w-32">
        <Tag className="h-3 w-3 text-gray-500 mr-1" />
        <input
          value={filters.source || ""}
          onChange={(e) => setFilters({ source: e.target.value })}
          placeholder="Source..."
          className="h-full w-full text-sm border-0 focus:outline-none focus:ring-0"
        />
      </div>

      {/* Options de tri */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-8 text-sm font-normal"
            size="sm"
          >
            {sortOption.direction === "asc" ? (
              <SortAsc className="h-3 w-3 mr-2 text-gray-500" />
            ) : (
              <SortDesc className="h-3 w-3 mr-2 text-gray-500" />
            )}
            <span>
              Trier par:{" "}
              {sortFields.find((f) => f.value === sortOption.field)?.label}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuLabel>Trier par</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortFields.map((field) => (
            <DropdownMenuItem
              key={field.value}
              onClick={() => handleSortFieldChange(field.value)}
              className="flex items-center"
            >
              {sortOption.field === field.value && (
                <Check className="h-3 w-3 mr-2 text-green-500" />
              )}
              <span
                className={
                  sortOption.field === field.value ? "font-medium" : ""
                }
              >
                {field.label}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleSortDirection}>
            {sortOption.direction === "asc" ? (
              <>
                <SortAsc className="h-3 w-3 mr-2 text-gray-500" />
                <span>Ordre croissant</span>
              </>
            ) : (
              <>
                <SortDesc className="h-3 w-3 mr-2 text-gray-500" />
                <span>Ordre décroissant</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bouton de réinitialisation */}
      <Button
        variant="ghost"
        className="h-8 p-2"
        size="sm"
        onClick={resetFilters}
        title="Réinitialiser les filtres"
      >
        <RefreshCcw className="h-3 w-3 text-gray-500" />
      </Button>
    </div>
  );
}
