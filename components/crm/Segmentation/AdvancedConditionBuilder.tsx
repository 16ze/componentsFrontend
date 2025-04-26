import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Badge,
} from "@/components/ui/index";
import {
  Plus,
  Trash2,
  ChevronsRight,
  MoveVertical,
  Calendar,
  Tag as TagIcon,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import useSegmentationStore from "@/stores/segmentationStore";
import {
  ConditionGroup,
  Condition,
  ConditionField,
  OperatorType,
  LogicalOperator,
  FieldType,
  TagType,
} from "@/components/crm/Segmentation/types";

interface AdvancedConditionBuilderProps {
  rootGroup: ConditionGroup;
  onChange: (group: ConditionGroup) => void;
  maxNestingLevel?: number;
}

export default function AdvancedConditionBuilder({
  rootGroup,
  onChange,
  maxNestingLevel = 3,
}: AdvancedConditionBuilderProps) {
  const { tags } = useSegmentationStore();

  // Fonction récursive pour rendre un groupe de conditions
  const renderConditionGroup = (
    group: ConditionGroup,
    level: number,
    path: string = "root"
  ) => {
    const handleAddCondition = () => {
      const newCondition: Condition = {
        id: `cond-${Date.now()}`,
        field: ConditionField.NAME,
        operator: OperatorType.EQUALS,
        value: "",
      };

      const updatedGroup = updateNestedGroup(rootGroup, path, {
        ...group,
        conditions: [...group.conditions, newCondition],
      });
      onChange(updatedGroup);
    };

    const handleAddGroup = () => {
      if (level >= maxNestingLevel) return;

      const newGroup: ConditionGroup = {
        id: `group-${Date.now()}`,
        operator: LogicalOperator.AND,
        conditions: [],
      };

      const updatedGroup = updateNestedGroup(rootGroup, path, {
        ...group,
        groups: [...(group.groups || []), newGroup],
      });
      onChange(updatedGroup);
    };

    const handleOperatorChange = (operator: LogicalOperator) => {
      const updatedGroup = updateNestedGroup(rootGroup, path, {
        ...group,
        operator,
      });
      onChange(updatedGroup);
    };

    const handleRemoveGroup = () => {
      if (path === "root") return;

      const parentPath = path.split(".").slice(0, -1).join(".");
      const groupIndex = parseInt(path.split(".").pop() || "0");

      const parentGroup = getNestedGroup(rootGroup, parentPath);
      if (!parentGroup || !parentGroup.groups) return;

      const updatedGroups = [...parentGroup.groups];
      updatedGroups.splice(groupIndex, 1);

      const updatedParent = {
        ...parentGroup,
        groups: updatedGroups,
      };

      const updatedRoot = updateNestedGroup(
        rootGroup,
        parentPath,
        updatedParent
      );
      onChange(updatedRoot);
    };

    return (
      <Card className={`w-full mb-4 ${level > 0 ? "border-dashed" : ""}`}>
        {level > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
            <div className="flex items-center">
              <MoveVertical className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Groupe de conditions</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveGroup}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <CardHeader className={level > 0 ? "pt-2" : ""}>
          <CardTitle className="text-base flex items-center">
            <RadioGroup
              value={group.operator}
              onValueChange={(value) =>
                handleOperatorChange(value as LogicalOperator)
              }
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={LogicalOperator.AND}
                  id={`and-${path}`}
                />
                <Label htmlFor={`and-${path}`}>TOUS (ET)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={LogicalOperator.OR} id={`or-${path}`} />
                <Label htmlFor={`or-${path}`}>AU MOINS UN (OU)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={LogicalOperator.NOT}
                  id={`not-${path}`}
                />
                <Label htmlFor={`not-${path}`}>AUCUN (NON)</Label>
              </div>
            </RadioGroup>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Conditions du groupe */}
          {group.conditions.map((condition, index) => (
            <div
              key={condition.id}
              className="flex items-start space-x-2 p-2 rounded-md border"
            >
              <ConditionEditor
                condition={condition}
                onChange={(updatedCondition) => {
                  const updatedConditions = [...group.conditions];
                  updatedConditions[index] = updatedCondition;
                  const updatedGroup = updateNestedGroup(rootGroup, path, {
                    ...group,
                    conditions: updatedConditions,
                  });
                  onChange(updatedGroup);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const updatedConditions = [...group.conditions];
                  updatedConditions.splice(index, 1);
                  const updatedGroup = updateNestedGroup(rootGroup, path, {
                    ...group,
                    conditions: updatedConditions,
                  });
                  onChange(updatedGroup);
                }}
                className="h-8 w-8 p-0 mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Sous-groupes */}
          {group.groups?.map((subGroup, index) => (
            <div
              key={subGroup.id}
              className="ml-4 pl-4 border-l-2 border-dashed"
            >
              {renderConditionGroup(
                subGroup,
                level + 1,
                `${path}.groups.${index}`
              )}
            </div>
          ))}

          {/* Actions du groupe */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCondition}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter une condition
            </Button>
            {level < maxNestingLevel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddGroup}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un groupe
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Composant pour éditer une condition individuelle
  const ConditionEditor = ({
    condition,
    onChange,
  }: {
    condition: Condition;
    onChange: (condition: Condition) => void;
  }) => {
    return (
      <div className="flex flex-1 flex-wrap gap-2">
        <div className="min-w-[200px]">
          <Select
            value={condition.field}
            onValueChange={(value) => {
              const updatedCondition = {
                ...condition,
                field: value as ConditionField,
              };
              onChange(updatedCondition);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Champ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ConditionField.NAME}>Nom</SelectItem>
              <SelectItem value={ConditionField.EMAIL}>Email</SelectItem>
              <SelectItem value={ConditionField.PHONE}>Téléphone</SelectItem>
              <SelectItem value={ConditionField.COMPANY}>Entreprise</SelectItem>
              <SelectItem value={ConditionField.LAST_ACTIVITY}>
                Dernière activité
              </SelectItem>
              <SelectItem value={ConditionField.CREATED_AT}>
                Date de création
              </SelectItem>
              <SelectItem value={ConditionField.TOTAL_REVENUE}>
                Revenu total
              </SelectItem>
              <SelectItem value={ConditionField.COUNTRY}>Pays</SelectItem>
              <SelectItem value={ConditionField.CITY}>Ville</SelectItem>
              <SelectItem value={ConditionField.SOURCE}>Source</SelectItem>
              <SelectItem value={ConditionField.TAGS}>Tags</SelectItem>
              <SelectItem value={ConditionField.ENGAGEMENT_SCORE}>
                Score d'engagement
              </SelectItem>
              <SelectItem value={ConditionField.RECURRING_REVENUE}>
                Revenu récurrent
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[200px]">
          <Select
            value={condition.operator}
            onValueChange={(value) => {
              const updatedCondition = {
                ...condition,
                operator: value as OperatorType,
              };
              onChange(updatedCondition);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Opérateur" />
            </SelectTrigger>
            <SelectContent>
              {getOperatorsForField(condition.field).map((op) => (
                <SelectItem key={op} value={op}>
                  {getOperatorDisplay(op)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          {renderValueInput(condition, onChange)}
        </div>
      </div>
    );
  };

  // Rendu du champ de valeur en fonction du type de champ et de l'opérateur
  const renderValueInput = (
    condition: Condition,
    onChange: (condition: Condition) => void
  ) => {
    const { field, operator } = condition;

    // Ne pas afficher de champ de valeur pour certains opérateurs
    if (
      operator === OperatorType.IS_SET ||
      operator === OperatorType.IS_NOT_SET
    ) {
      return <Badge>Pas de valeur requise</Badge>;
    }

    // Champ date
    if (
      field === ConditionField.CREATED_AT ||
      field === ConditionField.LAST_ACTIVITY ||
      field === ConditionField.LAST_PURCHASE ||
      operator === OperatorType.BEFORE ||
      operator === OperatorType.AFTER
    ) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {condition.value ? (
                format(new Date(condition.value), "PP", { locale: fr })
              ) : (
                <span>Sélectionner une date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={condition.value ? new Date(condition.value) : undefined}
              onSelect={(date) => {
                onChange({
                  ...condition,
                  value: date ? date.toISOString() : "",
                });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    }

    // Champ numérique
    if (
      field === ConditionField.TOTAL_REVENUE ||
      field === ConditionField.AVERAGE_ORDER ||
      field === ConditionField.LIFETIME_VALUE ||
      field === ConditionField.RECURRING_REVENUE ||
      field === ConditionField.ENGAGEMENT_SCORE
    ) {
      return (
        <Input
          type="number"
          value={condition.value || ""}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder="Entrez une valeur numérique"
        />
      );
    }

    // Champ Tags
    if (field === ConditionField.TAGS) {
      return (
        <Select
          value={condition.value || ""}
          onValueChange={(value) => onChange({ ...condition, value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un tag" />
          </SelectTrigger>
          <SelectContent>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                <div className="flex items-center">
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{
                      backgroundColor: getTagColor(tag.color),
                    }}
                  />
                  {tag.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Champ texte par défaut
    return (
      <Input
        value={condition.value || ""}
        onChange={(e) => onChange({ ...condition, value: e.target.value })}
        placeholder="Entrez une valeur"
      />
    );
  };

  // Obtenir les opérateurs valides pour un champ donné
  const getOperatorsForField = (
    field: ConditionField | string
  ): OperatorType[] => {
    switch (field) {
      case ConditionField.NAME:
      case ConditionField.EMAIL:
      case ConditionField.COMPANY:
      case ConditionField.CITY:
      case ConditionField.COUNTRY:
      case ConditionField.SOURCE:
        return [
          OperatorType.EQUALS,
          OperatorType.NOT_EQUALS,
          OperatorType.CONTAINS,
          OperatorType.NOT_CONTAINS,
          OperatorType.STARTS_WITH,
          OperatorType.ENDS_WITH,
          OperatorType.IS_SET,
          OperatorType.IS_NOT_SET,
        ];
      case ConditionField.PHONE:
        return [
          OperatorType.EQUALS,
          OperatorType.NOT_EQUALS,
          OperatorType.CONTAINS,
          OperatorType.STARTS_WITH,
          OperatorType.IS_SET,
          OperatorType.IS_NOT_SET,
        ];
      case ConditionField.CREATED_AT:
      case ConditionField.LAST_ACTIVITY:
      case ConditionField.LAST_PURCHASE:
        return [
          OperatorType.BEFORE,
          OperatorType.AFTER,
          OperatorType.BETWEEN,
          OperatorType.WITHIN_TIMEFRAME,
        ];
      case ConditionField.TOTAL_REVENUE:
      case ConditionField.AVERAGE_ORDER:
      case ConditionField.PURCHASE_COUNT:
      case ConditionField.LIFETIME_VALUE:
      case ConditionField.VISITS_COUNT:
      case ConditionField.ENGAGEMENT_SCORE:
      case ConditionField.RECURRING_REVENUE:
        return [
          OperatorType.EQUALS,
          OperatorType.NOT_EQUALS,
          OperatorType.GREATER_THAN,
          OperatorType.LESS_THAN,
          OperatorType.BETWEEN,
        ];
      case ConditionField.TAGS:
        return [
          OperatorType.HAS_TAG,
          OperatorType.HAS_ANY_TAG_FROM,
          OperatorType.HAS_ALL_TAGS_FROM,
        ];
      default:
        return [
          OperatorType.EQUALS,
          OperatorType.NOT_EQUALS,
          OperatorType.CONTAINS,
          OperatorType.NOT_CONTAINS,
        ];
    }
  };

  // Affichage lisible des opérateurs
  const getOperatorDisplay = (operator: OperatorType): string => {
    switch (operator) {
      case OperatorType.EQUALS:
        return "Est égal à";
      case OperatorType.NOT_EQUALS:
        return "N'est pas égal à";
      case OperatorType.CONTAINS:
        return "Contient";
      case OperatorType.NOT_CONTAINS:
        return "Ne contient pas";
      case OperatorType.GREATER_THAN:
        return "Est supérieur à";
      case OperatorType.LESS_THAN:
        return "Est inférieur à";
      case OperatorType.BETWEEN:
        return "Est entre";
      case OperatorType.IN_LIST:
        return "Est dans la liste";
      case OperatorType.NOT_IN_LIST:
        return "N'est pas dans la liste";
      case OperatorType.IS_SET:
        return "Est défini";
      case OperatorType.IS_NOT_SET:
        return "N'est pas défini";
      case OperatorType.STARTS_WITH:
        return "Commence par";
      case OperatorType.ENDS_WITH:
        return "Termine par";
      case OperatorType.BEFORE:
        return "Avant le";
      case OperatorType.AFTER:
        return "Après le";
      case OperatorType.WITHIN_TIMEFRAME:
        return "Dans les derniers";
      case OperatorType.HAS_TAG:
        return "A le tag";
      case OperatorType.HAS_ANY_TAG_FROM:
        return "A au moins un des tags";
      case OperatorType.HAS_ALL_TAGS_FROM:
        return "A tous les tags";
      default:
        return operator;
    }
  };

  // Fonction pour obtenir la couleur d'un tag
  const getTagColor = (color: string): string => {
    // Vérifier si c'est une valeur hexadécimale
    if (color.startsWith("#")) {
      return color;
    }

    // Sinon, c'est une valeur du TagColor enum
    const colorMap: Record<string, string> = {
      red: "#ef4444",
      orange: "#f97316",
      yellow: "#eab308",
      green: "#22c55e",
      blue: "#3b82f6",
      indigo: "#6366f1",
      purple: "#a855f7",
      pink: "#ec4899",
      gray: "#6b7280",
    };

    return colorMap[color] || "#6b7280";
  };

  // Fonctions utilitaires pour modifier des objets imbriqués
  const getNestedGroup = (
    group: ConditionGroup,
    path: string
  ): ConditionGroup | null => {
    if (path === "root") return group;

    const parts = path.split(".");
    let current = group;

    for (let i = 1; i < parts.length; i += 2) {
      const type = parts[i];
      const index = parseInt(parts[i + 1]);

      if (type === "groups" && current.groups && current.groups[index]) {
        current = current.groups[index];
      } else {
        return null;
      }
    }

    return current;
  };

  const updateNestedGroup = (
    rootGroup: ConditionGroup,
    path: string,
    updatedGroup: ConditionGroup
  ): ConditionGroup => {
    if (path === "root") return updatedGroup;

    const parts = path.split(".");
    const result = { ...rootGroup };
    let current: any = result;

    for (let i = 1; i < parts.length - 2; i += 2) {
      const type = parts[i];
      const index = parseInt(parts[i + 1]);

      if (type === "groups") {
        current.groups = [...(current.groups || [])];
        current = current.groups[index];
      }
    }

    const lastType = parts[parts.length - 2];
    const lastIndex = parseInt(parts[parts.length - 1]);

    if (lastType === "groups") {
      current.groups = [...(current.groups || [])];
      current.groups[lastIndex] = updatedGroup;
    }

    return result;
  };

  return renderConditionGroup(rootGroup, 0);
}
