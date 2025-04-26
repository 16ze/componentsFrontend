import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { ClientFilters } from "./types";
import { CLIENT_STATUSES, CLIENT_SOURCES, ASSIGNED_USERS } from "./mock-data";

interface ClientsFiltersProps {
  filters: ClientFilters;
  setFilters: (filters: ClientFilters) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onResetFilters: () => void;
}

export function ClientsFilters({
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  onResetFilters,
}: ClientsFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.createdAfter
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(filters.createdBefore);

  // Gestion du changement de statut
  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatusFilters = [...(filters.status || [])];

    if (checked) {
      newStatusFilters.push(status as any);
    } else {
      const index = newStatusFilters.indexOf(status as any);
      if (index !== -1) {
        newStatusFilters.splice(index, 1);
      }
    }

    setFilters({
      ...filters,
      status: newStatusFilters.length > 0 ? newStatusFilters : undefined,
    });
  };

  // Gestion du changement de source
  const handleSourceChange = (source: string, checked: boolean) => {
    const newSourceFilters = [...(filters.source || [])];

    if (checked) {
      newSourceFilters.push(source as any);
    } else {
      const index = newSourceFilters.indexOf(source as any);
      if (index !== -1) {
        newSourceFilters.splice(index, 1);
      }
    }

    setFilters({
      ...filters,
      source: newSourceFilters.length > 0 ? newSourceFilters : undefined,
    });
  };

  // Gestion du changement d'assignation
  const handleAssignedToChange = (userId: string, checked: boolean) => {
    const newAssignedToFilters = [...(filters.assignedTo || [])];

    if (checked) {
      newAssignedToFilters.push(userId);
    } else {
      const index = newAssignedToFilters.indexOf(userId);
      if (index !== -1) {
        newAssignedToFilters.splice(index, 1);
      }
    }

    setFilters({
      ...filters,
      assignedTo:
        newAssignedToFilters.length > 0 ? newAssignedToFilters : undefined,
    });
  };

  // Appliquer les filtres de date
  const applyDateFilter = () => {
    setFilters({
      ...filters,
      createdAfter: dateFrom,
      createdBefore: dateTo,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Rechercher un client, une entreprise, un contact..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres avancés
        </Button>

        {(filters.status?.length ||
          filters.source?.length ||
          filters.assignedTo?.length ||
          filters.createdAfter ||
          filters.createdBefore ||
          filters.tags?.length) && (
          <Button
            variant="ghost"
            onClick={onResetFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border rounded-md bg-background">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Filtres par statut */}
                <div>
                  <h3 className="font-medium mb-3">Statut</h3>
                  <div className="space-y-2">
                    {CLIENT_STATUSES.map((status) => (
                      <div
                        key={status.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`status-${status.value}`}
                          checked={
                            filters.status?.includes(status.value) || false
                          }
                          onCheckedChange={(checked) =>
                            handleStatusChange(status.value, checked === true)
                          }
                        />
                        <Label htmlFor={`status-${status.value}`}>
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filtres par source */}
                <div>
                  <h3 className="font-medium mb-3">Source</h3>
                  <div className="space-y-2">
                    {CLIENT_SOURCES.map((source) => (
                      <div
                        key={source.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`source-${source.value}`}
                          checked={
                            filters.source?.includes(source.value) || false
                          }
                          onCheckedChange={(checked) =>
                            handleSourceChange(source.value, checked === true)
                          }
                        />
                        <Label htmlFor={`source-${source.value}`}>
                          {source.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filtres par assignation */}
                <div>
                  <h3 className="font-medium mb-3">Assigné à</h3>
                  <div className="space-y-2">
                    {ASSIGNED_USERS.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`assigned-${user.id}`}
                          checked={
                            filters.assignedTo?.includes(user.id) || false
                          }
                          onCheckedChange={(checked) =>
                            handleAssignedToChange(user.id, checked === true)
                          }
                        />
                        <Label htmlFor={`assigned-${user.id}`}>
                          {user.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filtres par date */}
              <div className="mt-6">
                <h3 className="font-medium mb-3">Date d'ajout</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-from">De</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[200px] justify-start text-left font-normal"
                          id="date-from"
                        >
                          {dateFrom ? (
                            format(dateFrom, "PPP", { locale: fr })
                          ) : (
                            <span className="text-muted-foreground">
                              Sélectionner une date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-to">À</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[200px] justify-start text-left font-normal"
                          id="date-to"
                        >
                          {dateTo ? (
                            format(dateTo, "PPP", { locale: fr })
                          ) : (
                            <span className="text-muted-foreground">
                              Sélectionner une date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="self-end">
                    <Button onClick={applyDateFilter}>Appliquer</Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
