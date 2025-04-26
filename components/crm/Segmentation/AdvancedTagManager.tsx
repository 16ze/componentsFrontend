import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/index";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Tag as TagIcon,
  ChevronRight,
  FolderTree,
  Users,
  Lock,
  Unlock,
  Copy,
  MoreHorizontal,
  ChevronDown,
  BarChart2,
  Eye,
  EyeOff,
  Filter,
  ArrowUpDown,
  CheckCircle,
  Circle,
} from "lucide-react";
import useSegmentationStore from "@/stores/segmentationStore";
import {
  Tag,
  TagType,
  TagColor,
  TagPermissions,
  TagFilters,
} from "@/components/crm/Segmentation/types";
import { HexColorPicker } from "react-colorful";

export default function AdvancedTagManager() {
  const {
    tags,
    addTag,
    updateTag,
    deleteTag,
    getChildTags,
    tagStats,
    calculateTagStats,
    tagFilters,
    updateTagFilters,
    resetTagFilters,
  } = useSegmentationStore();

  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"hierarchical" | "flat">(
    "hierarchical"
  );
  const [expandedTags, setExpandedTags] = useState<string[]>([]);

  // États pour la création/édition de tags
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    color: TagColor | string;
    type: TagType;
    parentId?: string | null;
    permissions: TagPermissions;
  }>({
    name: "",
    description: "",
    color: TagColor.BLUE,
    type: TagType.USER,
    parentId: null,
    permissions: {
      canEdit: [],
      canDelete: [],
      canAssign: [],
      isPublic: true,
    },
  });

  // Gestion des filtres
  const handleFilterChange = (filterName: keyof TagFilters, value: any) => {
    updateTagFilters({ [filterName]: value });
  };

  // Filtrer les tags selon les filtres actuels
  const getFilteredTags = () => {
    let filteredList = tags;

    // Filtrer par recherche
    if (tagFilters.search) {
      filteredList = filteredList.filter(
        (tag) =>
          tag.name.toLowerCase().includes(tagFilters.search.toLowerCase()) ||
          tag.description
            ?.toLowerCase()
            .includes(tagFilters.search.toLowerCase())
      );
    }

    // Filtrer par couleurs
    if (tagFilters.colors && tagFilters.colors.length > 0) {
      filteredList = filteredList.filter((tag) =>
        tagFilters.colors.includes(tag.color)
      );
    }

    // Filtrer par types
    if (tagFilters.types && tagFilters.types.length > 0) {
      filteredList = filteredList.filter((tag) =>
        tagFilters.types.includes(tag.type)
      );
    }

    // Filtrer par créateur
    if (tagFilters.createdBy && tagFilters.createdBy.length > 0) {
      filteredList = filteredList.filter((tag) =>
        tagFilters.createdBy?.includes(tag.createdBy)
      );
    }

    // En mode hiérarchique, seulement retourner les tags du niveau actuel
    if (viewMode === "hierarchical" && !tagFilters.search) {
      filteredList = getChildTags(selectedParentId);
    }

    // Trier les résultats
    filteredList = [...filteredList].sort((a, b) => {
      if (tagFilters.sortBy === "name") {
        return tagFilters.sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (tagFilters.sortBy === "createdAt") {
        return tagFilters.sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (tagFilters.sortBy === "usage") {
        const usageA = tagStats[a.id]?.usageCount || 0;
        const usageB = tagStats[b.id]?.usageCount || 0;
        return tagFilters.sortOrder === "asc"
          ? usageA - usageB
          : usageB - usageA;
      }
      return 0;
    });

    return filteredList;
  };

  const filteredTags = getFilteredTags();

  // Chemin actuel dans la hiérarchie des tags
  const getTagPath = () => {
    if (!selectedParentId) return [];

    const path: Tag[] = [];
    let currentId = selectedParentId;

    while (currentId) {
      const parent = tags.find((t) => t.id === currentId);
      if (parent) {
        path.unshift(parent);
        currentId = parent.parentId || null;
      } else {
        break;
      }
    }

    return path;
  };

  const tagPath = getTagPath();

  // Calculer les stats pour tous les tags
  useEffect(() => {
    tags.forEach((tag) => {
      if (!tagStats[tag.id]) {
        calculateTagStats(tag.id);
      }
    });
  }, [tags, tagStats, calculateTagStats]);

  // Gestion de l'édition d'un tag
  const handleEditTag = (tag: Tag) => {
    setFormData({
      name: tag.name,
      description: tag.description || "",
      color: tag.color,
      type: tag.type,
      parentId: tag.parentId,
      permissions: tag.permissions || {
        canEdit: [],
        canDelete: [],
        canAssign: [],
        isPublic: true,
      },
    });
    setActiveTagId(tag.id);
    setIsEditDialogOpen(true);
  };

  // Gestion de la suppression d'un tag
  const handleDeleteTag = (tag: Tag) => {
    setActiveTagId(tag.id);
    setIsDeleteDialogOpen(true);
  };

  // Sauvegarde de la création d'un tag
  const handleSaveNewTag = () => {
    addTag({
      name: formData.name,
      description: formData.description || undefined,
      color: formData.color as TagColor,
      type: formData.type,
      parentId: formData.parentId || undefined,
      permissions: formData.permissions,
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };

  // Sauvegarde de l'édition d'un tag
  const handleSaveEditTag = () => {
    if (activeTagId) {
      updateTag(activeTagId, {
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color as TagColor,
        type: formData.type,
        parentId: formData.parentId || undefined,
        permissions: formData.permissions,
      });
    }
    setIsEditDialogOpen(false);
    resetForm();
  };

  // Confirmation de suppression d'un tag
  const confirmDeleteTag = () => {
    if (activeTagId) {
      deleteTag(activeTagId);
    }
    setIsDeleteDialogOpen(false);
    setActiveTagId(null);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: TagColor.BLUE,
      type: TagType.USER,
      parentId: selectedParentId,
      permissions: {
        canEdit: [],
        canDelete: [],
        canAssign: [],
        isPublic: true,
      },
    });
    setActiveTagId(null);
  };

  // Formatage de la couleur pour l'affichage
  const getColorDisplay = (color: TagColor | string) => {
    if (typeof color === "string" && color.startsWith("#")) {
      return (
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color }}
        ></div>
      );
    }

    const colorClasses: Record<TagColor, string> = {
      [TagColor.RED]: "bg-red-500",
      [TagColor.ORANGE]: "bg-orange-500",
      [TagColor.YELLOW]: "bg-yellow-500",
      [TagColor.GREEN]: "bg-green-500",
      [TagColor.BLUE]: "bg-blue-500",
      [TagColor.INDIGO]: "bg-indigo-500",
      [TagColor.PURPLE]: "bg-purple-500",
      [TagColor.PINK]: "bg-pink-500",
      [TagColor.GRAY]: "bg-gray-500",
    };

    return (
      <div
        className={`w-4 h-4 rounded-full ${
          colorClasses[color as TagColor] || "bg-gray-500"
        }`}
      ></div>
    );
  };

  // Navigation dans la hiérarchie
  const navigateTo = (tagId: string | null) => {
    setSelectedParentId(tagId);
  };

  // Création d'un nouveau tag
  const handleCreateTag = () => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      parentId: selectedParentId,
    }));
    setIsCreateDialogOpen(true);
  };

  // Gestion des tags étendus en vue hiérarchique plate
  const toggleExpandTag = (tagId: string) => {
    setExpandedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Vérifier si un tag a des enfants
  const hasChildren = (tagId: string) => {
    return tags.some((tag) => tag.parentId === tagId);
  };

  // Récupérer le nombre d'utilisations d'un tag
  const getTagUsageCount = (tagId: string) => {
    return tagStats[tagId]?.usageCount || 0;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestionnaire de Tags</CardTitle>
            <CardDescription>
              Gérez les tags du CRM avec hiérarchie et personnalisation
            </CardDescription>
          </div>
          <Button onClick={handleCreateTag} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Tag
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtres et contrôles */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un tag..."
                className="pl-8"
                value={tagFilters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <Select
              value={viewMode}
              onValueChange={(value) =>
                setViewMode(value as "hierarchical" | "flat")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hierarchical">Hiérarchique</SelectItem>
                <SelectItem value="flat">Liste plate</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => resetTagFilters()}
              size="sm"
            >
              Réinitialiser
            </Button>
          </div>

          {/* Filtres avancés */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="flex items-center cursor-pointer"
              onClick={() => {
                // Ouvrir un menu pour filtrer par couleur
              }}
            >
              <Filter className="mr-1 h-3 w-3" />
              <span>Couleur</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center cursor-pointer"
              onClick={() => {
                // Ouvrir un menu pour filtrer par type
              }}
            >
              <Filter className="mr-1 h-3 w-3" />
              <span>Type</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center cursor-pointer"
              onClick={() => {
                // Ouvrir un menu pour trier
              }}
            >
              <ArrowUpDown className="mr-1 h-3 w-3" />
              <span>Trier par {tagFilters.sortBy}</span>
            </Badge>
          </div>
        </div>

        {/* Fil d'Ariane pour la navigation hiérarchique */}
        {viewMode === "hierarchical" && (
          <div className="flex items-center mb-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo(null)}
              className="p-0 h-auto font-medium"
            >
              Racine
            </Button>
            {tagPath.map((tag, index) => (
              <React.Fragment key={tag.id}>
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigateTo(index === tagPath.length - 1 ? tag.id : tag.id)
                  }
                  className={`p-0 h-auto font-medium ${
                    index === tagPath.length - 1
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {tag.name}
                </Button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Table des tags */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nom</TableHead>
              <TableHead>Couleur</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Utilisations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTags.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Aucun tag trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {viewMode === "flat" && hasChildren(tag.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 mr-1 h-5 w-5"
                          onClick={() => toggleExpandTag(tag.id)}
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${
                              expandedTags.includes(tag.id) ? "rotate-90" : ""
                            }`}
                          />
                        </Button>
                      )}
                      <div>
                        <span className="flex items-center">
                          {tag.name}
                          {tag.type === TagType.SYSTEM && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Lock className="ml-1 h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Tag système</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </span>
                        {tag.description && (
                          <p className="text-xs text-muted-foreground">
                            {tag.description.substring(0, 60)}
                            {tag.description.length > 60 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getColorDisplay(tag.color)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tag.type === TagType.SYSTEM ? "secondary" : "default"
                      }
                      className="capitalize"
                    >
                      {tag.type === TagType.SYSTEM ? "Système" : "Utilisateur"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getTagUsageCount(tag.id)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center space-x-1">
                      {viewMode === "hierarchical" && hasChildren(tag.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateTo(tag.id)}
                          className="h-8 w-8 p-0"
                        >
                          <FolderTree className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTag(tag)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag)}
                        className="h-8 w-8 p-0"
                        disabled={tag.type === TagType.SYSTEM}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigateTo(tag.id)}>
                            <FolderTree className="mr-2 h-4 w-4" />
                            <span>Voir les sous-tags</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // Ajouter au segment actif
                            }}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            <span>Voir les clients</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => calculateTagStats(tag.id)}
                          >
                            <BarChart2 className="mr-2 h-4 w-4" />
                            <span>Rafraîchir les statistiques</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Dialogues */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Créer un nouveau tag</DialogTitle>
            <DialogDescription>
              Définissez les propriétés du nouveau tag.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as TagType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TagType.USER}>Utilisateur</SelectItem>
                    <SelectItem value={TagType.SYSTEM}>Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full px-3 py-2 flex items-center justify-between rounded-md border border-input bg-background text-sm"
                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                  >
                    <div className="flex items-center">
                      {getColorDisplay(formData.color)}
                      <span className="ml-2 capitalize">
                        {typeof formData.color === "string" &&
                        formData.color.startsWith("#")
                          ? formData.color
                          : formData.color}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  {isColorPickerOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-4">
                      <div className="mb-4">
                        <HexColorPicker
                          color={
                            typeof formData.color === "string" &&
                            formData.color.startsWith("#")
                              ? formData.color
                              : "#1E40AF" // Couleur par défaut
                          }
                          onChange={(color) =>
                            setFormData({ ...formData, color })
                          }
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.values(TagColor).map((color) => (
                          <button
                            key={color}
                            type="button"
                            className="w-6 h-6 rounded-full cursor-pointer"
                            onClick={() => {
                              setFormData({ ...formData, color });
                              setIsColorPickerOpen(false);
                            }}
                          >
                            {getColorDisplay(color)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">Parent</Label>
              <Select
                value={formData.parentId || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parentId: value === "" ? null : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un parent (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun (racine)</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Permissions</span>
                <Switch
                  checked={formData.permissions.isPublic}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions,
                        isPublic: checked,
                      },
                    })
                  }
                />
                <span className="text-sm text-muted-foreground ml-2">
                  {formData.permissions.isPublic ? "Public" : "Restreint"}
                </span>
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveNewTag}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le tag</DialogTitle>
            <DialogDescription>
              Modifiez les propriétés du tag.
            </DialogDescription>
          </DialogHeader>
          {/* Même contenu que pour la création */}
          <div className="space-y-4 py-4">
            {/* ... Répéter les mêmes champs que pour la création ... */}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveEditTag}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le tag</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce tag ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTag}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
