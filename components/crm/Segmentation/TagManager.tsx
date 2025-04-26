import React, { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Textarea,
} from "@/components/ui/index";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Tag as TagIcon,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import useSegmentationStore from "@/stores/segmentationStore";
import { Tag, TagType, TagColor } from "@/components/crm/Segmentation/types";

export default function TagManager() {
  const {
    tags,
    addTag,
    updateTag,
    deleteTag,
    getChildTags,
    tagStats,
    calculateTagStats,
  } = useSegmentationStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // États pour la création/édition de tags
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    color: TagColor;
    type: TagType;
    parentId?: string | null;
  }>({
    name: "",
    description: "",
    color: TagColor.BLUE,
    type: TagType.USER,
    parentId: null,
  });

  // Filtrer les tags selon la recherche et la hiérarchie actuelle
  const filteredTags = getChildTags(selectedParentId).filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Gestion de l'édition d'un tag
  const handleEditTag = (tag: Tag) => {
    setFormData({
      name: tag.name,
      description: tag.description || "",
      color: tag.color,
      type: tag.type,
      parentId: tag.parentId,
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
      color: formData.color,
      type: formData.type,
      parentId: formData.parentId || undefined,
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
        color: formData.color,
        type: formData.type,
        parentId: formData.parentId || undefined,
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
    });
    setActiveTagId(null);
  };

  // Formatage de la couleur pour l'affichage
  const getColorDisplay = (color: TagColor) => {
    const colorClasses = {
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
      <div className={`w-4 h-4 rounded-full ${colorClasses[color]}`}></div>
    );
  };

  // Navigation dans la hiérarchie
  const navigateTo = (tagId: string | null) => {
    setSelectedParentId(tagId);
    setSearchTerm("");
  };

  // Préparer les données pour le formulaire de création
  const handleCreateTag = () => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      parentId: selectedParentId,
    }));
    setIsCreateDialogOpen(true);
  };

  // Obtenir les statistiques d'utilisation d'un tag
  const getTagUsageCount = (tagId: string) => {
    if (!tagStats[tagId]) {
      calculateTagStats(tagId);
      return 0;
    }
    return tagStats[tagId].usageCount;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Tags</h1>
        <Button onClick={handleCreateTag}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau Tag
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bibliothèque de Tags</CardTitle>
          <CardDescription>
            Organisez et gérez les tags pour la classification de vos clients.
          </CardDescription>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              {tagPath.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigateTo(
                        tagPath.length > 1
                          ? tagPath[tagPath.length - 2].id
                          : null
                      )
                    }
                  >
                    <FolderTree className="h-4 w-4 mr-2" />
                    Niveau supérieur
                  </Button>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateTo(null)}
                    >
                      Racine
                    </Button>
                    {tagPath.map((tag, index) => (
                      <React.Fragment key={tag.id}>
                        <ChevronRight className="h-4 w-4" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateTo(tag.id)}
                        >
                          {tag.name}
                        </Button>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )}
              {tagPath.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  <FolderTree className="h-4 w-4 inline mr-1" />
                  Niveau racine
                </div>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher un tag..."
                className="pl-8 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Nom</TableHead>
                <TableHead className="w-1/12">Couleur</TableHead>
                <TableHead className="w-1/12">Type</TableHead>
                <TableHead className="w-1/4">Description</TableHead>
                <TableHead className="w-1/6">Utilisation</TableHead>
                <TableHead className="w-1/6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <TagIcon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Aucun tag trouvé dans ce niveau
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateTag}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Créer un tag
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <TagIcon className="h-4 w-4 mr-2" />
                        <div>
                          <span>{tag.name}</span>
                          {getChildTags(tag.id).length > 0 && (
                            <div>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-xs text-blue-500"
                                onClick={() => navigateTo(tag.id)}
                              >
                                Voir les sous-tags (
                                {getChildTags(tag.id).length})
                              </Button>
                            </div>
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
                      >
                        {tag.type === TagType.SYSTEM
                          ? "Système"
                          : "Utilisateur"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="truncate max-w-xs"
                        title={tag.description || ""}
                      >
                        {tag.description || "-"}
                      </div>
                    </TableCell>
                    <TableCell>{getTagUsageCount(tag.id)} clients</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTag(tag)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTag(tag)}
                          disabled={
                            tag.type === TagType.SYSTEM ||
                            getChildTags(tag.id).length > 0
                          }
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
        </CardContent>
      </Card>

      {/* Dialog de création de tag */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau tag</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau tag pour catégoriser vos clients.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Couleur
              </Label>
              <Select
                value={formData.color}
                onValueChange={(value) =>
                  setFormData({ ...formData, color: value as TagColor })
                }
                className="col-span-3"
              >
                <option value={TagColor.RED}>Rouge</option>
                <option value={TagColor.ORANGE}>Orange</option>
                <option value={TagColor.YELLOW}>Jaune</option>
                <option value={TagColor.GREEN}>Vert</option>
                <option value={TagColor.BLUE}>Bleu</option>
                <option value={TagColor.INDIGO}>Indigo</option>
                <option value={TagColor.PURPLE}>Violet</option>
                <option value={TagColor.PINK}>Rose</option>
                <option value={TagColor.GRAY}>Gris</option>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as TagType })
                }
                className="col-span-3"
              >
                <option value={TagType.USER}>Utilisateur</option>
                {/* Option système généralement réservée aux admins */}
                <option value={TagType.SYSTEM}>Système</option>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parentTag" className="text-right">
                Tag parent
              </Label>
              <Select
                value={formData.parentId || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value || null })
                }
                className="col-span-3"
              >
                <option value="">Aucun (niveau racine)</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveNewTag}
              disabled={!formData.name.trim()}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition de tag */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le tag</DialogTitle>
            <DialogDescription>
              Modifiez les détails du tag sélectionné.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-color" className="text-right">
                Couleur
              </Label>
              <Select
                value={formData.color}
                onValueChange={(value) =>
                  setFormData({ ...formData, color: value as TagColor })
                }
                className="col-span-3"
              >
                <option value={TagColor.RED}>Rouge</option>
                <option value={TagColor.ORANGE}>Orange</option>
                <option value={TagColor.YELLOW}>Jaune</option>
                <option value={TagColor.GREEN}>Vert</option>
                <option value={TagColor.BLUE}>Bleu</option>
                <option value={TagColor.INDIGO}>Indigo</option>
                <option value={TagColor.PURPLE}>Violet</option>
                <option value={TagColor.PINK}>Rose</option>
                <option value={TagColor.GRAY}>Gris</option>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as TagType })
                }
                className="col-span-3"
              >
                <option value={TagType.USER}>Utilisateur</option>
                <option value={TagType.SYSTEM}>Système</option>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-parentTag" className="text-right">
                Tag parent
              </Label>
              <Select
                value={formData.parentId || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value || null })
                }
                className="col-span-3"
              >
                <option value="">Aucun (niveau racine)</option>
                {tags
                  .filter((tag) => tag.id !== activeTagId) // Exclure le tag actuel
                  .map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveEditTag}
              disabled={!formData.name.trim()}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce tag ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteTag}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
