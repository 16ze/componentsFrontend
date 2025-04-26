import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Textarea,
  Switch,
} from "@/components/ui/index";
import {
  Save,
  ArrowLeft,
  Users,
  Calculator,
  RefreshCw,
  Clock,
  Star,
  TagIcon,
  Filter,
  FileCode,
  BarChart2,
  LayoutDashboard,
  Building,
  Activity,
} from "lucide-react";
import useSegmentationStore from "@/stores/segmentationStore";
import {
  Segment,
  SegmentType,
  ConditionGroup,
  LogicalOperator,
  SegmentVisibility,
} from "@/components/crm/Segmentation/types";
import AdvancedConditionBuilder from "./AdvancedConditionBuilder";

interface AdvancedSegmentBuilderProps {
  editMode?: boolean;
  segmentId?: string;
  onClose?: () => void;
  onSave?: (segment: Segment) => void;
}

export default function AdvancedSegmentBuilder({
  editMode = false,
  segmentId,
  onClose,
  onSave,
}: AdvancedSegmentBuilderProps) {
  const {
    addSegment,
    updateSegment,
    getSegmentById,
    segments,
    tags,
    calculateSegment,
    calculateSegmentAnalytics,
    createEmptyConditionGroup,
    cacheSegmentResults,
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
    visibility: SegmentVisibility.ORGANIZATION,
    refreshRate: "daily",
  };

  // Récupérer le segment existant si en mode édition
  const existingSegment =
    editMode && segmentId ? getSegmentById(segmentId) : null;

  // État du segment en cours d'édition
  const [segment, setSegment] = useState<Segment>(
    existingSegment || initialSegment
  );
  const [activeTab, setActiveTab] = useState<string>("definition");
  const [isCalculating, setIsCalculating] = useState(false);
  const [previewMembers, setPreviewMembers] = useState<any[]>([]);
  const [industryTemplates, setIndustryTemplates] = useState<string[]>([
    "E-commerce",
    "SaaS",
    "Finance",
    "Santé",
    "Éducation",
    "Immobilier",
  ]);

  // Mises à jour des données du segment lorsque le segment existant change
  useEffect(() => {
    if (existingSegment) {
      setSegment(existingSegment);
    }
  }, [existingSegment]);

  // Modifier le type de segment
  const handleTypeChange = (type: SegmentType) => {
    setSegment((prev) => ({ ...prev, type }));
  };

  // Mettre à jour le groupe racine de conditions
  const handleUpdateRootGroup = (rootGroup: ConditionGroup) => {
    setSegment((prev) => ({ ...prev, rootGroup }));
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
        visibility: segment.visibility,
        refreshRate: segment.refreshRate,
        isStarred: segment.isStarred,
        kpis: segment.kpis,
      });
    } else {
      const newSegment = addSegment({
        name: segment.name,
        description: segment.description,
        type: segment.type,
        rootGroup: segment.rootGroup,
        tags: segment.tags,
        visibility: segment.visibility,
        refreshRate: segment.refreshRate,
        isStarred: segment.isStarred,
        kpis: segment.kpis,
      });

      if (onSave) {
        onSave(newSegment);
      }
    }

    if (onClose) {
      onClose();
    }
  };

  // Calculer l'aperçu du segment
  const handleCalculatePreview = async () => {
    setIsCalculating(true);

    // Simulation d'une opération asynchrone
    setTimeout(() => {
      // Simuler un calcul de segment pour aperçu
      const mockClients = Array.from({ length: 20 }, (_, i) => ({
        id: `client-${i}`,
        name: `Client ${i}`,
        email: `client${i}@example.com`,
        company: `Company ${Math.floor(i / 3)}`,
        country: ["France", "Belgique", "Suisse", "Canada"][i % 4],
        lastActivity: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        totalRevenue: Math.floor(Math.random() * 10000),
      }));

      setPreviewMembers(mockClients);
      setIsCalculating(false);

      // Dans un cas réel, nous utiliserions calculateSegment ici
      if (editMode && segmentId) {
        calculateSegment(segmentId);
        calculateSegmentAnalytics(segmentId);
      }
    }, 1500);
  };

  // Charger un modèle par industrie
  const handleLoadIndustryTemplate = (industry: string) => {
    // Simuler le chargement d'un modèle prédéfini
    let template: Partial<Segment> = {
      name: `Segment ${industry}`,
      description: `Segment basé sur le modèle ${industry}`,
      type: SegmentType.DYNAMIC,
      industryType: industry,
    };

    // Créer différents modèles selon l'industrie
    const rootGroup = createEmptyConditionGroup();

    if (industry === "E-commerce") {
      template.kpis = [
        "conversion_rate",
        "average_order_value",
        "cart_abandonment",
      ];
      rootGroup.conditions = [
        {
          id: `cond-${Date.now()}-1`,
          field: "total_revenue",
          operator: "greater_than",
          value: "500",
        },
        {
          id: `cond-${Date.now()}-2`,
          field: "purchase_count",
          operator: "greater_than",
          value: "1",
        },
      ];
    } else if (industry === "SaaS") {
      template.kpis = ["mrr", "churn_rate", "user_engagement"];
      rootGroup.conditions = [
        {
          id: `cond-${Date.now()}-1`,
          field: "recurring_revenue",
          operator: "greater_than",
          value: "100",
        },
      ];
    }

    template.rootGroup = rootGroup;

    setSegment((prev) => ({
      ...prev,
      ...template,
    }));
  };

  // Gérer les KPIs sélectionnés
  const handleKpiToggle = (kpi: string) => {
    setSegment((prev) => {
      const currentKpis = prev.kpis || [];
      const updatedKpis = currentKpis.includes(kpi)
        ? currentKpis.filter((id) => id !== kpi)
        : [...currentKpis, kpi];

      return {
        ...prev,
        kpis: updatedKpis,
      };
    });
  };

  // Obtenir la liste des KPIs disponibles
  const availableKpis = [
    { id: "acquisition_cost", name: "Coût d'acquisition" },
    { id: "lifetime_value", name: "Valeur vie client" },
    { id: "conversion_rate", name: "Taux de conversion" },
    { id: "churn_rate", name: "Taux d'attrition" },
    { id: "average_order_value", name: "Valeur panier moyen" },
    { id: "engagement_score", name: "Score d'engagement" },
    { id: "mrr", name: "Revenu mensuel récurrent" },
    { id: "nps", name: "Net Promoter Score" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {editMode ? "Modifier le segment" : "Créer un nouveau segment"}
            </CardTitle>
            <CardDescription>
              Définissez des critères pour segmenter vos clients
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            )}
            <Button onClick={handleSaveSegment}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="definition">Définition</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="preview">Aperçu</TabsTrigger>
            <TabsTrigger value="templates">Modèles</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="definition" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="segment-name">Nom du segment</Label>
                <Input
                  id="segment-name"
                  value={segment.name}
                  onChange={(e) =>
                    setSegment({ ...segment, name: e.target.value })
                  }
                  placeholder="Ex: Clients premium actifs"
                />
              </div>
              <div>
                <Label htmlFor="segment-description">Description</Label>
                <Textarea
                  id="segment-description"
                  value={segment.description || ""}
                  onChange={(e) =>
                    setSegment({ ...segment, description: e.target.value })
                  }
                  placeholder="Décrivez l'objectif et les critères de ce segment"
                />
              </div>

              <div>
                <Label className="mb-2 block">Type de segment</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(SegmentType).map((type) => (
                    <Badge
                      key={type}
                      variant={segment.type === type ? "default" : "outline"}
                      className="px-3 py-2 cursor-pointer"
                      onClick={() => handleTypeChange(type)}
                    >
                      {type === SegmentType.DYNAMIC && (
                        <Filter className="mr-1 h-4 w-4" />
                      )}
                      {type === SegmentType.STATIC && (
                        <Users className="mr-1 h-4 w-4" />
                      )}
                      {type === SegmentType.MIXED && (
                        <FileCode className="mr-1 h-4 w-4" />
                      )}
                      {type === SegmentType.PREDICTIVE && (
                        <Activity className="mr-1 h-4 w-4" />
                      )}
                      {type === SegmentType.BEHAVIORAL && (
                        <BarChart2 className="mr-1 h-4 w-4" />
                      )}
                      {getSegmentTypeLabel(type)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Tags associés</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={
                        segment.tags?.includes(tag.id) ? "default" : "outline"
                      }
                      className="px-3 py-1 cursor-pointer"
                      onClick={() => handleTagToggle(tag.id)}
                      style={{
                        backgroundColor: segment.tags?.includes(tag.id)
                          ? getTagColor(tag.color)
                          : "transparent",
                        color: segment.tags?.includes(tag.id)
                          ? getContrastColor(getTagColor(tag.color))
                          : undefined,
                        borderColor: getTagColor(tag.color),
                      }}
                    >
                      <TagIcon className="mr-1 h-3 w-3" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="starred"
                    checked={segment.isStarred || false}
                    onCheckedChange={(checked) =>
                      setSegment({ ...segment, isStarred: checked })
                    }
                  />
                  <Label htmlFor="starred" className="cursor-pointer">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Marquer comme favori
                    </div>
                  </Label>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">KPIs à suivre</Label>
                <div className="flex flex-wrap gap-2">
                  {availableKpis.map((kpi) => (
                    <Badge
                      key={kpi.id}
                      variant={
                        segment.kpis?.includes(kpi.id) ? "default" : "outline"
                      }
                      className="px-3 py-1 cursor-pointer"
                      onClick={() => handleKpiToggle(kpi.id)}
                    >
                      <BarChart2 className="mr-1 h-3 w-3" />
                      {kpi.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            {segment.type === SegmentType.STATIC ? (
              <div className="p-6 border rounded-md">
                <p className="text-center text-muted-foreground">
                  Les segments statiques sont basés sur une liste manuelle de
                  clients plutôt que sur des règles.
                </p>
              </div>
            ) : (
              <AdvancedConditionBuilder
                rootGroup={segment.rootGroup || createEmptyConditionGroup()}
                onChange={handleUpdateRootGroup}
              />
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Aperçu des membres</h3>
              <Button onClick={handleCalculatePreview} disabled={isCalculating}>
                {isCalculating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Calcul en cours...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculer l'aperçu
                  </>
                )}
              </Button>
            </div>

            {previewMembers.length > 0 ? (
              <div className="border rounded-md">
                <div className="grid grid-cols-3 gap-4 p-4 font-medium border-b">
                  <div>Nom</div>
                  <div>Email</div>
                  <div>Entreprise</div>
                </div>
                <div className="divide-y">
                  {previewMembers.slice(0, 5).map((client) => (
                    <div
                      key={client.id}
                      className="grid grid-cols-3 gap-4 p-4 hover:bg-muted/50"
                    >
                      <div>{client.name}</div>
                      <div>{client.email}</div>
                      <div>{client.company}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-muted/20 text-center">
                  {previewMembers.length > 5 ? (
                    <p className="text-sm text-muted-foreground">
                      {previewMembers.length - 5} autres membres dans ce segment
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {previewMembers.length} membres au total dans ce segment
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 border rounded-md text-center text-muted-foreground">
                {isCalculating ? (
                  <p>Calcul en cours...</p>
                ) : (
                  <p>
                    Cliquez sur "Calculer l'aperçu" pour voir les membres de ce
                    segment
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <h3 className="text-lg font-medium mb-4">
              Modèles de segment par industrie
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industryTemplates.map((industry) => (
                <Card
                  key={industry}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      {industry}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Modèle optimisé pour l'industrie {industry}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => handleLoadIndustryTemplate(industry)}
                    >
                      Utiliser ce modèle
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Visibilité</h3>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Niveau de visibilité</Label>
                  <Select
                    value={segment.visibility || SegmentVisibility.ORGANIZATION}
                    onValueChange={(value) =>
                      setSegment({
                        ...segment,
                        visibility: value as SegmentVisibility,
                      })
                    }
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue placeholder="Sélectionner la visibilité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SegmentVisibility.PRIVATE}>
                        Privé (uniquement moi)
                      </SelectItem>
                      <SelectItem value={SegmentVisibility.TEAM}>
                        Équipe
                      </SelectItem>
                      <SelectItem value={SegmentVisibility.ORGANIZATION}>
                        Organisation
                      </SelectItem>
                      <SelectItem value={SegmentVisibility.PUBLIC}>
                        Public
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Mise à jour</h3>
                <div className="space-y-2">
                  <Label htmlFor="refresh-rate">Fréquence de mise à jour</Label>
                  <Select
                    value={segment.refreshRate || "daily"}
                    onValueChange={(value) =>
                      setSegment({
                        ...segment,
                        refreshRate: value as
                          | "realtime"
                          | "hourly"
                          | "daily"
                          | "weekly"
                          | "manual",
                      })
                    }
                  >
                    <SelectTrigger id="refresh-rate">
                      <SelectValue placeholder="Sélectionner la fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Temps réel</SelectItem>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="manual">Manuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Tableau de bord</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="dashboard"
                    checked={!!segment.kpis?.length}
                    onCheckedChange={(checked) =>
                      setSegment({
                        ...segment,
                        kpis: checked
                          ? ["conversion_rate", "lifetime_value"]
                          : [],
                      })
                    }
                  />
                  <Label htmlFor="dashboard">
                    <div className="flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      Créer un tableau de bord spécifique pour ce segment
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        )}
        <Button onClick={handleSaveSegment}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
}

// Fonction utilitaire pour obtenir le libellé d'un type de segment
function getSegmentTypeLabel(type: SegmentType): string {
  switch (type) {
    case SegmentType.DYNAMIC:
      return "Dynamique";
    case SegmentType.STATIC:
      return "Statique";
    case SegmentType.MIXED:
      return "Mixte";
    case SegmentType.PREDICTIVE:
      return "Prédictif";
    case SegmentType.BEHAVIORAL:
      return "Comportemental";
    default:
      return type;
  }
}

// Fonction utilitaire pour obtenir la couleur d'un tag
function getTagColor(color: string): string {
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
}

// Fonction utilitaire pour déterminer la couleur du texte (blanc ou noir) selon la couleur de fond
function getContrastColor(hexColor: string): string {
  // Convertir le code hexadécimal en RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);

  // Calculer la luminosité perçue (formule standard)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Retourner noir ou blanc selon la luminosité
  return yiq >= 128 ? "#000000" : "#ffffff";
}
