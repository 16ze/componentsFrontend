import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/index";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Users,
  Filter,
  ListFilter,
  ChevronRight,
  Calculator,
} from "lucide-react";
import useSegmentationStore from "@/stores/segmentationStore";
import {
  Segment,
  SegmentType,
  ConditionGroup,
  Condition,
  ConditionField,
  OperatorType,
  LogicalOperator,
  Tag,
} from "@/components/crm/Segmentation/types";

interface SegmentBuilderProps {
  editMode?: boolean;
  segmentId?: string;
  onClose?: () => void;
}

export default function SegmentBuilder({
  editMode = false,
  segmentId,
  onClose,
}: SegmentBuilderProps) {
  const {
    addSegment,
    updateSegment,
    getSegmentById,
    calculateSegment,
    tags,
    createEmptyConditionGroup,
  } = useSegmentationStore();

  // État initial du segment
  const initialSegment: Segment = {
    id: "",
    name: "",
    description: "",
    type: SegmentType.DYNAMIC,
    rootGroup: createEmptyConditionGroup(),
    staticMembers: [],
    excludedMembers: [],
    tags: [],
    createdAt: "",
    updatedAt: "",
    createdBy: "",
  };

  // Récupérer le segment existant si en mode édition
  const existingSegment =
    editMode && segmentId ? getSegmentById(segmentId) : null;

  // État du segment en cours d'édition
  const [segment, setSegment] = useState<Segment>(
    existingSegment || initialSegment
  );
  const [activeTab, setActiveTab] = useState<string>("definition");

  // État pour gérer les opérations sur les conditions
  const [newConditionField, setNewConditionField] = useState<
    ConditionField | string
  >(ConditionField.NAME);
  const [newConditionOperator, setNewConditionOperator] =
    useState<OperatorType>(OperatorType.EQUALS);
  const [newConditionValue, setNewConditionValue] = useState<string>("");
  const [groupOperator, setGroupOperator] = useState<LogicalOperator>(
    existingSegment?.rootGroup?.operator || LogicalOperator.AND
  );

  // Mises à jour des données du segment lorsque le segment existant change
  useEffect(() => {
    if (existingSegment) {
      setSegment(existingSegment);
      setGroupOperator(
        existingSegment.rootGroup?.operator || LogicalOperator.AND
      );
    }
  }, [existingSegment]);

  // Modifier le type de segment
  const handleTypeChange = (type: SegmentType) => {
    setSegment((prev) => ({ ...prev, type }));
  };

  // Mettre à jour l'opérateur du groupe racine
  const handleGroupOperatorChange = (operator: LogicalOperator) => {
    setGroupOperator(operator);
    setSegment((prev) => ({
      ...prev,
      rootGroup: {
        ...prev.rootGroup!,
        operator,
      },
    }));
  };

  // Ajouter une condition au groupe racine
  const handleAddCondition = () => {
    if (
      !newConditionValue.trim() &&
      !["IS_SET", "IS_NOT_SET"].includes(newConditionOperator)
    ) {
      return; // Ne pas ajouter une condition vide
    }

    const newCondition: Condition = {
      id: `cond-${Date.now()}`,
      field: newConditionField,
      operator: newConditionOperator,
      value: newConditionValue,
    };

    setSegment((prev) => ({
      ...prev,
      rootGroup: {
        ...prev.rootGroup!,
        conditions: [...(prev.rootGroup?.conditions || []), newCondition],
      },
    }));

    // Réinitialiser les champs
    setNewConditionValue("");
  };

  // Supprimer une condition du groupe racine
  const handleRemoveCondition = (conditionId: string) => {
    setSegment((prev) => ({
      ...prev,
      rootGroup: {
        ...prev.rootGroup!,
        conditions: prev.rootGroup!.conditions.filter(
          (c) => c.id !== conditionId
        ),
      },
    }));
  };

  // Gérer les tags associés au segment
  const handleTagToggle = (tagId: string) => {
    setSegment((prev) => {
      const currentTags = prev.tags || [];
      const updatedTags = currentTags.includes(tagId)
        ? currentTags.filter((id) => id !== tagId)
        : [...currentTags, tagId];

      return {
        ...prev,
        tags: updatedTags,
      };
    });
  };

  // Sauvegarder le segment
  const handleSaveSegment = () => {
    if (!segment.name.trim()) {
      alert("Veuillez saisir un nom pour le segment.");
      return;
    }

    if (editMode && segmentId) {
      updateSegment(segmentId, {
        name: segment.name,
        description: segment.description,
        type: segment.type,
        rootGroup: segment.rootGroup,
        tags: segment.tags,
      });
    } else {
      addSegment({
        name: segment.name,
        description: segment.description,
        type: segment.type,
        rootGroup: segment.rootGroup,
        tags: segment.tags,
        staticMembers: [],
        excludedMembers: [],
      });
    }

    if (onClose) onClose();
  };

  // Calculer les résultats du segment
  const handleCalculate = () => {
    if (editMode && segmentId) {
      calculateSegment(segmentId);
    }
  };

  // Obtenir les opérateurs disponibles pour un champ donné
  const getOperatorsForField = (
    field: ConditionField | string
  ): OperatorType[] => {
    const textOperators = [
      OperatorType.EQUALS,
      OperatorType.NOT_EQUALS,
      OperatorType.CONTAINS,
      OperatorType.NOT_CONTAINS,
      OperatorType.STARTS_WITH,
      OperatorType.ENDS_WITH,
      OperatorType.IS_SET,
      OperatorType.IS_NOT_SET,
    ];

    const numberOperators = [
      OperatorType.EQUALS,
      OperatorType.NOT_EQUALS,
      OperatorType.GREATER_THAN,
      OperatorType.LESS_THAN,
      OperatorType.BETWEEN,
      OperatorType.IS_SET,
      OperatorType.IS_NOT_SET,
    ];

    const dateOperators = [
      OperatorType.EQUALS,
      OperatorType.NOT_EQUALS,
      OperatorType.GREATER_THAN, // = Après
      OperatorType.LESS_THAN, // = Avant
      OperatorType.BETWEEN,
      OperatorType.IS_SET,
      OperatorType.IS_NOT_SET,
    ];

    // Classification des champs selon leur type
    const numberFields = [
      ConditionField.VISITS_COUNT,
      ConditionField.TOTAL_REVENUE,
      ConditionField.AVERAGE_ORDER,
      ConditionField.PURCHASE_COUNT,
      ConditionField.LIFETIME_VALUE,
    ];

    const dateFields = [
      ConditionField.LAST_ACTIVITY,
      ConditionField.CREATED_AT,
      ConditionField.UPDATED_AT,
      ConditionField.LAST_PURCHASE,
    ];

    if (numberFields.includes(field as ConditionField)) {
      return numberOperators;
    } else if (dateFields.includes(field as ConditionField)) {
      return dateOperators;
    }
    return textOperators;
  };

  // Formater l'affichage des champs
  const getFieldDisplay = (field: ConditionField | string): string => {
    const fieldMap: Record<string, string> = {
      [ConditionField.NAME]: "Nom",
      [ConditionField.EMAIL]: "Email",
      [ConditionField.PHONE]: "Téléphone",
      [ConditionField.COMPANY]: "Entreprise",
      [ConditionField.LAST_ACTIVITY]: "Dernière activité",
      [ConditionField.CREATED_AT]: "Date de création",
      [ConditionField.UPDATED_AT]: "Date de mise à jour",
      [ConditionField.VISITS_COUNT]: "Nombre de visites",
      [ConditionField.TOTAL_REVENUE]: "Revenu total",
      [ConditionField.AVERAGE_ORDER]: "Commande moyenne",
      [ConditionField.PURCHASE_COUNT]: "Nombre d'achats",
      [ConditionField.LAST_PURCHASE]: "Dernier achat",
      [ConditionField.LIFETIME_VALUE]: "Valeur à vie",
      [ConditionField.COUNTRY]: "Pays",
      [ConditionField.CITY]: "Ville",
      [ConditionField.REGION]: "Région",
      [ConditionField.POSTAL_CODE]: "Code postal",
      [ConditionField.SOURCE]: "Source",
      [ConditionField.CAMPAIGN]: "Campagne",
      [ConditionField.REFERRER]: "Référent",
      [ConditionField.CUSTOM]: "Personnalisé",
    };

    return fieldMap[field] || field;
  };

  // Formater l'affichage des opérateurs
  const getOperatorDisplay = (operator: OperatorType): string => {
    const operatorMap: Record<string, string> = {
      [OperatorType.EQUALS]: "Égal à",
      [OperatorType.NOT_EQUALS]: "Différent de",
      [OperatorType.CONTAINS]: "Contient",
      [OperatorType.NOT_CONTAINS]: "Ne contient pas",
      [OperatorType.GREATER_THAN]: "Supérieur à",
      [OperatorType.LESS_THAN]: "Inférieur à",
      [OperatorType.BETWEEN]: "Entre",
      [OperatorType.IN_LIST]: "Dans la liste",
      [OperatorType.NOT_IN_LIST]: "Pas dans la liste",
      [OperatorType.IS_SET]: "Est défini",
      [OperatorType.IS_NOT_SET]: "N'est pas défini",
      [OperatorType.STARTS_WITH]: "Commence par",
      [OperatorType.ENDS_WITH]: "Finit par",
    };

    return operatorMap[operator] || operator;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">
            {editMode ? "Modifier le segment" : "Créer un segment"}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSaveSegment}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="definition">Définition</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="preview" onClick={handleCalculate}>
            Aperçu
          </TabsTrigger>
        </TabsList>

        {/* Onglet définition */}
        <TabsContent value="definition">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Définissez les propriétés principales de votre segment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="segment-name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="segment-name"
                  value={segment.name}
                  onChange={(e) =>
                    setSegment({ ...segment, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Ex: Clients premium"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label
                  htmlFor="segment-description"
                  className="text-right pt-2"
                >
                  Description
                </Label>
                <Input
                  id="segment-description"
                  value={segment.description || ""}
                  onChange={(e) =>
                    setSegment({ ...segment, description: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Ex: Clients ayant dépensé plus de 1000€ dans les 6 derniers mois"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Type de segment</Label>
                <div className="col-span-3">
                  <RadioGroup
                    value={segment.type}
                    onValueChange={(value) =>
                      handleTypeChange(value as SegmentType)
                    }
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={SegmentType.DYNAMIC}
                        id="dynamic"
                      />
                      <Label htmlFor="dynamic">
                        Dynamique{" "}
                        <span className="text-sm text-muted-foreground">
                          (Basé sur des conditions)
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={SegmentType.STATIC} id="static" />
                      <Label htmlFor="static">
                        Statique{" "}
                        <span className="text-sm text-muted-foreground">
                          (Liste définie manuellement)
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={SegmentType.MIXED} id="mixed" />
                      <Label htmlFor="mixed">
                        Mixte{" "}
                        <span className="text-sm text-muted-foreground">
                          (Dynamique + exclusions manuelles)
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet conditions */}
        <TabsContent value="conditions">
          <Card>
            <CardHeader>
              <CardTitle>Critères de segmentation</CardTitle>
              <CardDescription>
                Définissez les conditions qui déterminent quels clients font
                partie de ce segment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Opérateur de groupe */}
              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-center space-x-4">
                  <Label>Combiner les conditions avec :</Label>
                  <RadioGroup
                    value={groupOperator}
                    onValueChange={(value) =>
                      handleGroupOperatorChange(value as LogicalOperator)
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={LogicalOperator.AND} id="and" />
                      <Label htmlFor="and">ET (toutes les conditions)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={LogicalOperator.OR} id="or" />
                      <Label htmlFor="or">OU (au moins une condition)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Liste des conditions */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Conditions actuelles</h3>
                {segment.rootGroup?.conditions.length === 0 ? (
                  <div className="bg-muted/50 p-6 rounded-md text-center">
                    <ListFilter className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Aucune condition. Ajoutez des conditions ci-dessous pour
                      définir ce segment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {segment.rootGroup?.conditions.map((condition) => (
                      <div
                        key={condition.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="text-sm">
                            <span className="font-medium">
                              {getFieldDisplay(condition.field)}
                            </span>{" "}
                            <span>
                              {getOperatorDisplay(condition.operator)}
                            </span>{" "}
                            {!["IS_SET", "IS_NOT_SET"].includes(
                              condition.operator
                            ) && (
                              <span className="font-medium">
                                {condition.value}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCondition(condition.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ajout de condition */}
              <div className="bg-muted/30 p-4 rounded-md mt-4">
                <h3 className="text-sm font-medium mb-3">
                  Ajouter une condition
                </h3>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4">
                    <Label htmlFor="field" className="mb-1 block text-xs">
                      Champ
                    </Label>
                    <Select
                      value={newConditionField}
                      onValueChange={(value) => {
                        setNewConditionField(value as ConditionField);
                        // Réinitialiser l'opérateur selon le type de champ
                        setNewConditionOperator(
                          getOperatorsForField(value as ConditionField)[0]
                        );
                      }}
                    >
                      <optgroup label="Informations de base">
                        <option value={ConditionField.NAME}>Nom</option>
                        <option value={ConditionField.EMAIL}>Email</option>
                        <option value={ConditionField.PHONE}>Téléphone</option>
                        <option value={ConditionField.COMPANY}>
                          Entreprise
                        </option>
                      </optgroup>
                      <optgroup label="Comportement">
                        <option value={ConditionField.LAST_ACTIVITY}>
                          Dernière activité
                        </option>
                        <option value={ConditionField.CREATED_AT}>
                          Date de création
                        </option>
                        <option value={ConditionField.UPDATED_AT}>
                          Date de mise à jour
                        </option>
                        <option value={ConditionField.VISITS_COUNT}>
                          Nombre de visites
                        </option>
                      </optgroup>
                      <optgroup label="Valeur">
                        <option value={ConditionField.TOTAL_REVENUE}>
                          Revenu total
                        </option>
                        <option value={ConditionField.AVERAGE_ORDER}>
                          Commande moyenne
                        </option>
                        <option value={ConditionField.PURCHASE_COUNT}>
                          Nombre d'achats
                        </option>
                        <option value={ConditionField.LAST_PURCHASE}>
                          Dernier achat
                        </option>
                        <option value={ConditionField.LIFETIME_VALUE}>
                          Valeur à vie
                        </option>
                      </optgroup>
                      <optgroup label="Géographie">
                        <option value={ConditionField.COUNTRY}>Pays</option>
                        <option value={ConditionField.CITY}>Ville</option>
                        <option value={ConditionField.REGION}>Région</option>
                        <option value={ConditionField.POSTAL_CODE}>
                          Code postal
                        </option>
                      </optgroup>
                      <optgroup label="Source">
                        <option value={ConditionField.SOURCE}>Source</option>
                        <option value={ConditionField.CAMPAIGN}>
                          Campagne
                        </option>
                        <option value={ConditionField.REFERRER}>
                          Référent
                        </option>
                      </optgroup>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Label htmlFor="operator" className="mb-1 block text-xs">
                      Opérateur
                    </Label>
                    <Select
                      value={newConditionOperator}
                      onValueChange={(value) =>
                        setNewConditionOperator(value as OperatorType)
                      }
                    >
                      {getOperatorsForField(newConditionField).map((op) => (
                        <option key={op} value={op}>
                          {getOperatorDisplay(op)}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="col-span-4">
                    <Label htmlFor="value" className="mb-1 block text-xs">
                      Valeur
                    </Label>
                    <Input
                      value={newConditionValue}
                      onChange={(e) => setNewConditionValue(e.target.value)}
                      disabled={["IS_SET", "IS_NOT_SET"].includes(
                        newConditionOperator
                      )}
                      placeholder={
                        ["IS_SET", "IS_NOT_SET"].includes(newConditionOperator)
                          ? "Non requis"
                          : "Valeur"
                      }
                    />
                  </div>

                  <div className="col-span-1 flex items-end">
                    <Button
                      onClick={handleAddCondition}
                      className="w-full"
                      disabled={
                        !newConditionValue.trim() &&
                        !["IS_SET", "IS_NOT_SET"].includes(newConditionOperator)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet tags */}
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Tags associés</CardTitle>
              <CardDescription>
                Associez des tags à ce segment pour une meilleure organisation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`flex items-center p-3 rounded-md border ${
                      segment.tags?.includes(tag.id)
                        ? "border-primary bg-primary/10"
                        : "border-muted"
                    }`}
                  >
                    <Switch
                      checked={segment.tags?.includes(tag.id) || false}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                      className="mr-2"
                    />
                    <Label
                      className="flex items-center cursor-pointer"
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      <div
                        className={`w-3 h-3 rounded-full mr-2`}
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet aperçu */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du segment</CardTitle>
              <CardDescription>
                Visualisez les clients qui correspondent à vos critères.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editMode && segmentId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="text-lg font-medium">
                        Clients correspondants
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCalculate}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Recalculer
                    </Button>
                  </div>

                  <div className="bg-muted p-8 rounded-md flex flex-col items-center justify-center">
                    <p className="text-center text-muted-foreground mb-4">
                      Pour visualiser les clients de ce segment, veuillez
                      d'abord enregistrer vos modifications.
                    </p>
                    <Button onClick={handleSaveSegment}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer et visualiser
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted p-8 rounded-md flex flex-col items-center justify-center">
                  <p className="text-center text-muted-foreground mb-4">
                    Pour visualiser les clients de ce segment, veuillez d'abord
                    l'enregistrer.
                  </p>
                  <Button onClick={handleSaveSegment}>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer le segment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
