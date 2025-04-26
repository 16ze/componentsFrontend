import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/index";
import {
  PlusCircle,
  Search,
  Filter,
  MoreHorizontal,
  Tag,
  Users,
  Calendar,
  BarChart,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import useSegmentationStore from "@/stores/segmentationStore";
import { Segment, SegmentType } from "@/components/crm/Segmentation/types";

export default function SegmentList() {
  // États locaux pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("tous");
  const [view, setView] = useState<"list" | "grid">("list");

  // Récupérer les données du store
  const {
    segments,
    addSegment,
    deleteSegment,
    duplicateSegment,
    getRecentlyChangedSegments,
    selectedSegmentId,
    isSegmentBuilderOpen,
    segmentAnalytics,
  } = useSegmentationStore();

  // Filtrer les segments
  const filteredSegments = segments
    .filter(
      (segment) =>
        segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((segment) =>
      typeFilter === "tous" ? true : segment.type === typeFilter
    );

  // Récupérer les segments récemment modifiés
  const recentSegments = getRecentlyChangedSegments(5);

  // Gérer l'ouverture du builder de segment
  const handleCreateSegment = () => {
    // Cette fonction ouvrirait normalement le builder de segment
    console.log("Ouvrir le builder de segment");

    // Pour cet exemple, ajoutons simplement un segment générique
    addSegment({
      name: `Nouveau segment ${segments.length + 1}`,
      description: "Description du segment",
      type: SegmentType.DYNAMIC,
      tags: [],
      rootGroup: {
        id: "new-group",
        conditions: [],
        operator: "AND",
      },
      staticMembers: [],
      excludedMembers: [],
      isVisible: true,
      createdBy: "current-user",
      lastCalculatedAt: new Date().toISOString(),
    });
  };

  // Convertir l'horodatage en date formatée
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };

  // Obtenir le nombre d'éléments du segment
  const getMemberCount = (segmentId: string) => {
    const analytics = segmentAnalytics[segmentId];
    return analytics ? analytics.kpis?.memberCount || 0 : 0;
  };

  // Obtenir le statut du segment
  const getSegmentStatus = (segment: Segment) => {
    if (!segment.lastCalculatedAt) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          Non calculé
        </Badge>
      );
    }

    // Si calculé dans les dernières 24h
    const lastCalculated = new Date(segment.lastCalculatedAt).getTime();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    if (lastCalculated > oneDayAgo) {
      return (
        <Badge variant="success" className="bg-green-100 text-green-800">
          À jour
        </Badge>
      );
    }

    return (
      <Badge variant="warning" className="bg-amber-100 text-amber-800">
        À recalculer
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Segments et Tags</h1>
        <Button onClick={handleCreateSegment}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau segment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segments clients</CardTitle>
          <CardDescription>
            Consultez, créez et gérez les segments de clients pour vos campagnes
            et analyses.
          </CardDescription>

          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher un segment..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-[180px]">
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
                aria-label="Filtrer par type"
              >
                <option value="tous">Tous les types</option>
                <option value={SegmentType.DYNAMIC}>Dynamique</option>
                <option value={SegmentType.STATIC}>Statique</option>
                <option value={SegmentType.MIXED}>Mixte</option>
              </Select>
            </div>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>

            <div className="flex rounded-md border">
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setView("list")}
              >
                Liste
              </Button>
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setView("grid")}
              >
                Grille
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="tous">
            <TabsList>
              <TabsTrigger value="tous">Tous les segments</TabsTrigger>
              <TabsTrigger value="recents">Récemment modifiés</TabsTrigger>
              <TabsTrigger value="favoris">Favoris</TabsTrigger>
              <TabsTrigger value="modeles">Modèles</TabsTrigger>
            </TabsList>

            <TabsContent value="tous" className="mt-6">
              {view === "list" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Membres</TableHead>
                      <TableHead>Dernière modification</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSegments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Aucun segment trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSegments.map((segment) => (
                        <TableRow key={segment.id}>
                          <TableCell className="font-medium">
                            {segment.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {segment.type === SegmentType.DYNAMIC
                                ? "Dynamique"
                                : segment.type === SegmentType.STATIC
                                ? "Statique"
                                : "Mixte"}
                            </Badge>
                          </TableCell>
                          <TableCell>{getMemberCount(segment.id)}</TableCell>
                          <TableCell>{formatDate(segment.updatedAt)}</TableCell>
                          <TableCell>{getSegmentStatus(segment)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Cette fonction ouvrirait l'éditeur de segment
                                  console.log("Éditer le segment", segment.id);
                                }}
                              >
                                Éditer
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  // Cette fonction ouvrirait le menu d'options
                                  console.log("Menu pour segment", segment.id);
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {filteredSegments.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      Aucun segment trouvé
                    </div>
                  ) : (
                    filteredSegments.map((segment) => (
                      <Card key={segment.id} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-md">
                              {segment.name}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              {segment.type === SegmentType.DYNAMIC
                                ? "Dynamique"
                                : segment.type === SegmentType.STATIC
                                ? "Statique"
                                : "Mixte"}
                            </Badge>
                            {getSegmentStatus(segment)}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          {segment.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {segment.description}
                            </p>
                          )}
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{getMemberCount(segment.id)} membres</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{formatDate(segment.updatedAt)}</span>
                            </div>
                          </div>
                        </CardContent>
                        <div className="bg-muted/50 p-2 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Ouvrir l'éditeur de segment
                              console.log("Éditer le segment", segment.id);
                            }}
                          >
                            Éditer
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Ouvrir les analyses
                              console.log("Analyses du segment", segment.id);
                            }}
                          >
                            <BarChart className="h-4 w-4 mr-1" />
                            Analyser
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recents" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Membres</TableHead>
                    <TableHead>Dernière modification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSegments.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell className="font-medium">
                        {segment.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {segment.type === SegmentType.DYNAMIC
                            ? "Dynamique"
                            : segment.type === SegmentType.STATIC
                            ? "Statique"
                            : "Mixte"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getMemberCount(segment.id)}</TableCell>
                      <TableCell>{formatDate(segment.updatedAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Ouvrir l'éditeur de segment
                            console.log("Éditer le segment", segment.id);
                          }}
                        >
                          Éditer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="favoris" className="mt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucun segment favori</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Marquez des segments comme favoris pour les retrouver
                  facilement ici.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="modeles" className="mt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex flex-col items-center justify-center py-8">
                  <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Modèles de segments</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Utilisez les modèles pour créer rapidement des segments pour
                    différents cas d'usage.
                  </p>
                  <Button className="mt-4">Parcourir les modèles</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
