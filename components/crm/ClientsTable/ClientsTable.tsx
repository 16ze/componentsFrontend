import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
} from "@tanstack/react-table";
import {
  Download,
  Settings,
  List,
  LayoutGrid,
  MoreHorizontal,
  ChevronDown,
  Check,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { StatusBadge } from "./StatusBadge";
import { ClientsFilters } from "./ClientsFilters";
import { ClientCard } from "./ClientCard";
import { MOCK_CLIENTS, DEFAULT_COLUMNS } from "./mock-data";
import {
  Client,
  ClientFilters as ClientFiltersType,
  ExportFormat,
  ColumnConfig,
  UserPreferences,
} from "./types";
import {
  filterClients,
  searchClients,
  formatClientForTable,
  exportClientsData,
} from "./utils";

// Hook pour gérer les préférences utilisateur avec localStorage
function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    "crm-clients-preferences",
    {
      viewMode: "table",
      columnsConfig: DEFAULT_COLUMNS,
      itemsPerPage: 10,
      defaultSortColumn: "lastActivity",
      defaultSortDirection: "desc",
    }
  );

  return {
    preferences,
    setPreferences,
  };
}

export function ClientsTable() {
  // États pour les données et préférences
  const { preferences, setPreferences } = useUserPreferences();
  const [viewMode, setViewMode] = useState<"table" | "card">(
    preferences.viewMode
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ClientFiltersType>({});
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: preferences.defaultSortColumn || "lastActivity",
      desc: preferences.defaultSortDirection === "desc",
    },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    preferences.columnsConfig.reduce(
      (acc, column) => ({ ...acc, [column.id]: column.visible }),
      {}
    )
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Appliquer les changements de préférences
  useEffect(() => {
    setPreferences({
      ...preferences,
      viewMode,
    });
  }, [viewMode, setPreferences, preferences]);

  // Filtrer et rechercher les clients
  const filteredClients = useMemo(() => {
    let filtered = filterClients(MOCK_CLIENTS, filters);
    filtered = searchClients(filtered, searchQuery);
    return filtered;
  }, [MOCK_CLIENTS, filters, searchQuery]);

  // Formater les données pour le tableau
  const tableData = useMemo(() => {
    return filteredClients.map(formatClientForTable);
  }, [filteredClients]);

  // Définition des colonnes
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Nom</span>
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "company",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Entreprise</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "contactEmail",
        header: "Email",
        cell: ({ row }) => (
          <a
            href={`mailto:${row.original.contactEmail}`}
            className="text-blue-600 hover:underline"
          >
            {row.original.contactEmail}
          </a>
        ),
      },
      {
        accessorKey: "contactPhone",
        header: "Téléphone",
        cell: ({ row }) => (
          <a
            href={`tel:${row.original.contactPhone}`}
            className="text-blue-600 hover:underline"
          >
            {row.original.contactPhone}
          </a>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Statut</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "value",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Valeur</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.formattedValue}</div>
        ),
      },
      {
        accessorKey: "lastActivity",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Dernière Activité</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.formattedLastActivity}</div>,
      },
      {
        accessorKey: "source",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Source</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "assignedUserName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Assigné à</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Date d'ajout</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.original.formattedCreatedAt}</div>,
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.map((tag: string) => (
              <div
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs"
              >
                {tag}
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => console.log("Éditer", row.original.id)}
              >
                Éditer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setClientToDelete(row.original.rawData);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                Supprimer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => console.log("Voir détails", row.original.id)}
              >
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => console.log("Changer statut", row.original.id)}
              >
                Changer le statut
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  // Configuration de la table avec TanStack Table
  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    enableMultiSort: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: preferences.itemsPerPage,
      },
    },
  });

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  // Exporter les données
  const handleExport = (format: ExportFormat) => {
    exportClientsData(filteredClients, format);
  };

  // Supprimer un client
  const handleDeleteClient = () => {
    console.log("Supprimer client:", clientToDelete?.id);
    // En production, appeler l'API pour supprimer le client
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients et Prospects</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden md:flex"
            onClick={() => console.log("Ajouter client")}
          >
            Ajouter un client
          </Button>
        </div>
      </div>

      <ClientsFilters
        filters={filters}
        setFilters={setFilters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onResetFilters={resetFilters}
      />

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="hidden md:flex"
            >
              <List className="h-4 w-4 mr-2" />
              Tableau
            </Button>
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("card")}
              className="hidden md:flex"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cartes
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden md:inline">Exporter</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Colonnes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {table
                  .getAllColumns()
                  .filter((column) => column.id !== "actions")
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => {
                          column.toggleVisibility(!!value);
                          // Mettre à jour les préférences utilisateur
                          const updatedColumnsConfig =
                            preferences.columnsConfig.map((col) => {
                              if (col.id === column.id) {
                                return { ...col, visible: !!value };
                              }
                              return col;
                            });
                          setPreferences({
                            ...preferences,
                            columnsConfig: updatedColumnsConfig,
                          });
                        }}
                      >
                        {column.id === "contactEmail"
                          ? "Email"
                          : column.id === "contactPhone"
                          ? "Téléphone"
                          : column.id === "assignedUserName"
                          ? "Assigné à"
                          : column.id === "formattedLastActivity"
                          ? "Dernière Activité"
                          : column.id === "formattedCreatedAt"
                          ? "Date d'ajout"
                          : column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="text-muted-foreground">Aucun client trouvé</div>
            <Button variant="link" className="mt-2" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <>
            {viewMode === "table" ? (
              // Vue Tableau
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {table.getRowModel().rows.map((row) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            ) : (
              // Vue Carte
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {table.getRowModel().rows.map((row) => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ClientCard client={row.original.rawData} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="flex-1 text-sm text-muted-foreground">
                Affichage de{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                à{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  filteredClients.length
                )}{" "}
                sur {filteredClients.length} entrées
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Lignes par page</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-[70px]"
                      >
                        {table.getState().pagination.pageSize}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                        <DropdownMenuItem
                          key={pageSize}
                          onClick={() => {
                            table.setPageSize(pageSize);
                            setPreferences({
                              ...preferences,
                              itemsPerPage: pageSize,
                            });
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              table.getState().pagination.pageSize === pageSize
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {pageSize}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le client{" "}
              <span className="font-medium">{clientToDelete?.name}</span> ?{" "}
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
