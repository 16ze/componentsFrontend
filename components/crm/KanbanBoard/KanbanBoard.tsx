import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanFilters } from "./KanbanFilters";
import { useKanbanStore } from "../../../stores/kanbanStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Pour la démonstration, créons des données factices à utiliser
import { generateDemoData } from "./demoData";

export function KanbanBoard() {
  const {
    columns,
    moveOpportunity,
    focusedStage,
    selectedOpportunity,
    selectOpportunity,
    setColumns,
  } = useKanbanStore();

  // État pour les colonnes visibles en fonction du mode focus
  const [visibleColumns, setVisibleColumns] = useState(columns);

  // Initialiser avec des données de démonstration
  useEffect(() => {
    if (columns.every((column) => column.opportunities.length === 0)) {
      const demoData = generateDemoData();
      setColumns(demoData);
    }
  }, [columns, setColumns]);

  // Mettre à jour les colonnes visibles lorsque le mode focus change
  useEffect(() => {
    if (focusedStage) {
      setVisibleColumns(
        columns.filter((column) => column.type === focusedStage)
      );
    } else {
      setVisibleColumns(columns);
    }
  }, [columns, focusedStage]);

  // Gérer l'événement de fin de glisser-déposer
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Abandonner si pas de destination ou si la destination est la même que la source
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Déplacer l'opportunité
    moveOpportunity(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
  };

  return (
    <div className="flex flex-col h-full">
      <KanbanFilters />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4">
            <AnimatePresence>
              {visibleColumns.map((column) => (
                <motion.div
                  key={column.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <KanbanColumn
                    column={column}
                    isFocused={focusedStage === column.type}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </DragDropContext>

      {/* Modale détaillée de l'opportunité */}
      <Dialog
        open={selectedOpportunity !== null}
        onOpenChange={(open) => !open && selectOpportunity(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl">
                    {selectedOpportunity.title}
                  </DialogTitle>
                  <button
                    onClick={() => selectOpportunity(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                  >
                    <X size={18} />
                  </button>
                </div>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Détails de l'opportunité
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">
                        {selectedOpportunity.clientName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Montant</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(selectedOpportunity.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Probabilité</p>
                      <div className="flex items-center">
                        <div className="w-full h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className={`h-full rounded-full ${
                              selectedOpportunity.probability < 25
                                ? "bg-red-500"
                                : selectedOpportunity.probability < 50
                                ? "bg-orange-500"
                                : selectedOpportunity.probability < 75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${selectedOpportunity.probability}%`,
                            }}
                          ></div>
                        </div>
                        <span>{selectedOpportunity.probability}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Date de clôture estimée
                      </p>
                      <p className="font-medium">
                        {selectedOpportunity.expectedCloseDate.toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Informations complémentaires
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Assigné à</p>
                      <p className="font-medium">
                        {selectedOpportunity.assignedTo.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Source</p>
                      <p className="font-medium">
                        {selectedOpportunity.source}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <p className="font-medium">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            selectedOpportunity.status === "won"
                              ? "bg-green-100 text-green-800"
                              : selectedOpportunity.status === "lost"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {selectedOpportunity.status === "won"
                            ? "Gagnée"
                            : selectedOpportunity.status === "lost"
                            ? "Perdue"
                            : "Active"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Étape</p>
                      <p className="font-medium">{selectedOpportunity.stage}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOpportunity.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">
                    {selectedOpportunity.notes}
                  </p>
                </div>
              )}

              <div className="mt-6 text-xs text-gray-400">
                <p>
                  Créée le:{" "}
                  {selectedOpportunity.createdAt.toLocaleDateString("fr-FR")} •
                  Dernière mise à jour:{" "}
                  {selectedOpportunity.updatedAt.toLocaleDateString("fr-FR")}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
