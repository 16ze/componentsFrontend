import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "@/components/ui";
import {
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Clock,
  Tag,
  Filter,
  AlertTriangle,
  CheckCircle,
  CalendarClock,
} from "lucide-react";
import useSegmentationStore from "@/stores/segmentationStore";
import { AutoTagRule, TagType } from "@/components/crm/Segmentation/types";
import AdvancedConditionBuilder from "./AdvancedConditionBuilder";

export default function AutoTagRules() {
  const {
    autoTagRules,
    addAutoTagRule,
    updateAutoTagRule,
    deleteAutoTagRule,
    toggleAutoTagRule,
    runAutoTagRule,
    tags,
    createEmptyConditionGroup,
  } = useSegmentationStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Formulaire pour la création/édition de règle
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    tagId: string;
    isActive: boolean;
    rootGroup: any;
    priority: number;
    applyToExisting: boolean;
    schedule: {
      frequency: "realtime" | "hourly" | "daily" | "weekly";
      lastDay?: number;
      time?: string;
    };
  }>({
    name: "",
    description: "",
    tagId: "",
    isActive: true,
    rootGroup: createEmptyConditionGroup(),
    priority: 1,
    applyToExisting: true,
    schedule: {
      frequency: "daily",
      time: "00:00",
    },
  });

  // Filtrer les règles selon la recherche
  const filteredRules = autoTagRules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Récupérer le tag associé à une règle
  const getTagById = (tagId: string) => {
    return tags.find((tag) => tag.id === tagId);
  };

  // Formater la date du dernier lancement
  const formatLastRun = (lastRunAt?: string) => {
    if (!lastRunAt) return "Jamais exécuté";

    const date = new Date(lastRunAt);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtenir la couleur d'un tag
  const getTagColor = (tagId: string) => {
    const tag = getTagById(tagId);
    if (!tag) return "bg-gray-500";

    const colorMap: Record<string, string> = {
      red: "bg-red-500",
      orange: "bg-orange-500",
      yellow: "bg-yellow-500",
      green: "bg-green-500",
      blue: "bg-blue-500",
      indigo: "bg-indigo-500",
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      gray: "bg-gray-500",
    };

    if (tag.color.startsWith("#")) {
      return `bg-[${tag.color}]`;
    }

    return colorMap[tag.color.toLowerCase()] || "bg-gray-500";
  };

  // Gérer la création d'une nouvelle règle
  const handleCreateRule = () => {
    setFormData({
      name: "",
      description: "",
      tagId: "",
      isActive: true,
      rootGroup: createEmptyConditionGroup(),
      priority: 1,
      applyToExisting: true,
      schedule: {
        frequency: "daily",
        time: "00:00",
      },
    });
    setIsCreateDialogOpen(true);
  };

  // Gérer l'édition d'une règle existante
  const handleEditRule = (ruleId: string) => {
    const rule = autoTagRules.find((r) => r.id === ruleId);
    if (!rule) return;

    setFormData({
      name: rule.name,
      description: rule.description || "",
      tagId: rule.tagId,
      isActive: rule.isActive,
      rootGroup: rule.rootGroup,
      priority: rule.priority || 1,
      applyToExisting: rule.applyToExisting || true,
      schedule: rule.schedule || {
        frequency: "daily",
        time: "00:00",
      },
    });
    setSelectedRuleId(ruleId);
    setIsEditDialogOpen(true);
  };

  // Gérer la suppression d'une règle
  const handleDeleteRule = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setIsDeleteDialogOpen(true);
  };

  // Sauvegarder une nouvelle règle
  const handleSaveNewRule = () => {
    addAutoTagRule({
      name: formData.name,
      description: formData.description,
      tagId: formData.tagId,
      isActive: formData.isActive,
      rootGroup: formData.rootGroup,
      priority: formData.priority,
      applyToExisting: formData.applyToExisting,
      schedule: formData.schedule,
    });
    setIsCreateDialogOpen(false);
  };

  // Mettre à jour une règle existante
  const handleUpdateRule = () => {
    if (!selectedRuleId) return;

    updateAutoTagRule(selectedRuleId, {
      name: formData.name,
      description: formData.description,
      tagId: formData.tagId,
      isActive: formData.isActive,
      rootGroup: formData.rootGroup,
      priority: formData.priority,
      applyToExisting: formData.applyToExisting,
      schedule: formData.schedule,
    });
    setIsEditDialogOpen(false);
  };

  // Confirmer la suppression d'une règle
  const confirmDeleteRule = () => {
    if (selectedRuleId) {
      deleteAutoTagRule(selectedRuleId);
      setIsDeleteDialogOpen(false);
      setSelectedRuleId(null);
    }
  };

  // Basculer l'état actif/inactif d'une règle
  const handleToggleRule = (ruleId: string) => {
    toggleAutoTagRule(ruleId);
  };

  // Exécuter manuellement une règle
  const handleRunRule = (ruleId: string) => {
    runAutoTagRule(ruleId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Règles d'Auto-Tagging</CardTitle>
            <CardDescription>
              Créez des règles automatiques pour appliquer des tags à vos
              clients
            </CardDescription>
          </div>
          <Button onClick={handleCreateRule}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Règle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Rechercher des règles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">État</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Fréquence</TableHead>
                <TableHead>Dernière exécution</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Aucune règle trouvée. Créez votre première règle
                    d'auto-tagging.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="flex justify-center">
                        <Badge
                          variant={rule.isActive ? "default" : "outline"}
                          className={`${
                            rule.isActive
                              ? "bg-green-500"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {rule.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{rule.name}</div>
                      {rule.description && (
                        <div className="text-xs text-muted-foreground">
                          {rule.description.substring(0, 60)}
                          {rule.description.length > 60 && "..."}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {rule.tagId && (
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${getTagColor(
                              rule.tagId
                            )}`}
                          ></div>
                          <span>
                            {getTagById(rule.tagId)?.name || "Tag inconnu"}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="capitalize">
                          {rule.schedule?.frequency === "realtime"
                            ? "Temps réel"
                            : rule.schedule?.frequency === "hourly"
                            ? "Horaire"
                            : rule.schedule?.frequency === "daily"
                            ? "Quotidien"
                            : rule.schedule?.frequency === "weekly"
                            ? "Hebdomadaire"
                            : "Programmé"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatLastRun(rule.lastRunAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRule(rule.id)}
                          className="h-8 w-8 p-0"
                        >
                          {rule.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunRule(rule.id)}
                          className="h-8 w-8 p-0"
                          disabled={!rule.isActive}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRule(rule.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Dialog pour créer une nouvelle règle */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Créer une règle d'auto-tagging</DialogTitle>
            <DialogDescription>
              Définissez les conditions qui déclencheront l'application
              automatique d'un tag
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Nom de la règle</Label>
                <Input
                  id="rule-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Clients VIP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-select">Tag à appliquer</Label>
                <Select
                  value={formData.tagId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tagId: value })
                  }
                >
                  <SelectTrigger id="tag-select">
                    <SelectValue placeholder="Sélectionner un tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${getTagColor(
                              tag.id
                            )}`}
                          ></div>
                          <span>{tag.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">Description</Label>
              <Input
                id="rule-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description de la règle (optionnel)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-priority">Priorité</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: parseInt(value) })
                }
              >
                <SelectTrigger id="rule-priority">
                  <SelectValue placeholder="Sélectionner une priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Haute</SelectItem>
                  <SelectItem value="2">Moyenne</SelectItem>
                  <SelectItem value="3">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-frequency">Fréquence d'exécution</Label>
                <Select
                  value={formData.schedule.frequency}
                  onValueChange={(value: any) =>
                    setFormData({
                      ...formData,
                      schedule: {
                        ...formData.schedule,
                        frequency: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="rule-frequency">
                    <SelectValue placeholder="Sélectionner une fréquence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Temps réel</SelectItem>
                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                    <SelectItem value="daily">Quotidienne</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-time">Heure d'exécution</Label>
                <Input
                  id="rule-time"
                  type="time"
                  value={formData.schedule.time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schedule: {
                        ...formData.schedule,
                        time: e.target.value,
                      },
                    })
                  }
                  disabled={formData.schedule.frequency === "realtime"}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="apply-existing"
                checked={formData.applyToExisting}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, applyToExisting: checked })
                }
              />
              <Label htmlFor="apply-existing">
                Appliquer aux clients existants
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Conditions</Label>
              <div className="border rounded-md p-4">
                <AdvancedConditionBuilder
                  rootGroup={formData.rootGroup}
                  onChange={(rootGroup) =>
                    setFormData({ ...formData, rootGroup })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveNewRule}>Créer la règle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier une règle existante */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Modifier la règle d'auto-tagging</DialogTitle>
            <DialogDescription>
              Modifiez les conditions qui déclencheront l'application
              automatique d'un tag
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Nom de la règle</Label>
                <Input
                  id="rule-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Clients VIP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-select">Tag à appliquer</Label>
                <Select
                  value={formData.tagId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tagId: value })
                  }
                >
                  <SelectTrigger id="tag-select">
                    <SelectValue placeholder="Sélectionner un tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${getTagColor(
                              tag.id
                            )}`}
                          ></div>
                          <span>{tag.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">Description</Label>
              <Input
                id="rule-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description de la règle (optionnel)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-priority">Priorité</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: parseInt(value) })
                }
              >
                <SelectTrigger id="rule-priority">
                  <SelectValue placeholder="Sélectionner une priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Haute</SelectItem>
                  <SelectItem value="2">Moyenne</SelectItem>
                  <SelectItem value="3">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-frequency">Fréquence d'exécution</Label>
                <Select
                  value={formData.schedule.frequency}
                  onValueChange={(value: any) =>
                    setFormData({
                      ...formData,
                      schedule: {
                        ...formData.schedule,
                        frequency: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="rule-frequency">
                    <SelectValue placeholder="Sélectionner une fréquence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Temps réel</SelectItem>
                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                    <SelectItem value="daily">Quotidienne</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-time">Heure d'exécution</Label>
                <Input
                  id="rule-time"
                  type="time"
                  value={formData.schedule.time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schedule: {
                        ...formData.schedule,
                        time: e.target.value,
                      },
                    })
                  }
                  disabled={formData.schedule.frequency === "realtime"}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="apply-existing"
                checked={formData.applyToExisting}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, applyToExisting: checked })
                }
              />
              <Label htmlFor="apply-existing">
                Appliquer aux clients existants
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Conditions</Label>
              <div className="border rounded-md p-4">
                <AdvancedConditionBuilder
                  rootGroup={formData.rootGroup}
                  onChange={(rootGroup) =>
                    setFormData({ ...formData, rootGroup })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateRule}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour confirmer la suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la règle</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette règle d'auto-tagging ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              <p>
                La suppression de cette règle n'affectera pas les tags déjà
                appliqués.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRule}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
