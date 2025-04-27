import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { v4 as uuidv4 } from "uuid";

// Types pour le mini-kanban
export type MiniKanbanItem = {
  id: string;
  title: string;
  description?: string;
  assignedTo?: {
    name: string;
    avatarUrl?: string;
    initials: string;
  };
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
  tags?: string[];
};

export type MiniKanbanColumn = {
  id: string;
  title: string;
  items: MiniKanbanItem[];
  color?: string;
};

export type MiniKanbanProps = {
  columns: MiniKanbanColumn[];
  onChange?: (columns: MiniKanbanColumn[]) => void;
  onItemClick?: (item: MiniKanbanItem) => void;
  onAddClick?: (columnId: string) => void;
  isLoading?: boolean;
  maxHeight?: string | number;
  disableDragDrop?: boolean;
  simplified?: boolean;
};

export function MiniKanban({
  columns: initialColumns,
  onChange,
  onItemClick,
  onAddClick,
  isLoading = false,
  maxHeight = "500px",
  disableDragDrop = false,
  simplified = false,
}: MiniKanbanProps) {
  const [columns, setColumns] = useState<MiniKanbanColumn[]>(initialColumns);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Si déplacé dans la même colonne
    if (source.droppableId === destination.droppableId) {
      const column = columns.find((col) => col.id === source.droppableId);
      if (!column) return;

      const newItems = [...column.items];
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);

      const newColumns = columns.map((col) => {
        if (col.id === source.droppableId) {
          return { ...col, items: newItems };
        }
        return col;
      });

      setColumns(newColumns);
      onChange?.(newColumns);
    } else {
      // Si déplacé vers une autre colonne
      const sourceColumn = columns.find((col) => col.id === source.droppableId);
      const destColumn = columns.find(
        (col) => col.id === destination.droppableId
      );

      if (!sourceColumn || !destColumn) return;

      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];

      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      const newColumns = columns.map((col) => {
        if (col.id === source.droppableId) {
          return { ...col, items: sourceItems };
        }
        if (col.id === destination.droppableId) {
          return { ...col, items: destItems };
        }
        return col;
      });

      setColumns(newColumns);
      onChange?.(newColumns);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getPriorityColor = (priority?: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ maxHeight }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-72">
            <Card>
              <CardHeader className="p-3 pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium flex items-center">
                    {column.color && (
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: column.color }}
                      ></div>
                    )}
                    {column.title}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({column.items.length})
                    </span>
                  </CardTitle>
                  {!simplified && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onAddClick?.(column.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-3">
                <Droppable
                  droppableId={column.id}
                  isDropDisabled={disableDragDrop}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 min-h-[100px]"
                    >
                      {column.items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                          isDragDisabled={disableDragDrop}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border rounded-md p-2 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => onItemClick?.(item)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-sm line-clamp-2">
                                  {item.title}
                                </h3>
                                {!simplified && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 -mr-1 -mt-1"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>

                              {item.description && !simplified && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {item.description}
                                </p>
                              )}

                              <div className="flex justify-between items-center">
                                <div className="flex gap-1 flex-wrap">
                                  {item.priority && (
                                    <Badge
                                      variant="outline"
                                      className={`${getPriorityColor(
                                        item.priority
                                      )} text-xs`}
                                    >
                                      {item.priority}
                                    </Badge>
                                  )}

                                  {item.tags &&
                                    !simplified &&
                                    item.tags.slice(0, 2).map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                </div>

                                {item.assignedTo && (
                                  <Avatar className="h-6 w-6">
                                    {item.assignedTo.avatarUrl ? (
                                      <img
                                        src={item.assignedTo.avatarUrl}
                                        alt={item.assignedTo.name}
                                      />
                                    ) : (
                                      <AvatarFallback className="text-xs">
                                        {item.assignedTo.initials}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}

// Fonctions utilitaires pour la création rapide d'un mini kanban
export const createMiniKanbanColumn = (
  title: string,
  items: MiniKanbanItem[] = [],
  color?: string
): MiniKanbanColumn => ({
  id: uuidv4(),
  title,
  items,
  color,
});

export const createMiniKanbanItem = (
  title: string,
  options: Partial<MiniKanbanItem> = {}
): MiniKanbanItem => ({
  id: uuidv4(),
  title,
  ...options,
});
