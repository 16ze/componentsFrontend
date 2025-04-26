"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useScoringStore } from "../../../stores/scoringStore";
import { RegleScoring } from "../../../lib/types/scoring";
import { Copy, Info } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";

export default function ModelesScoring() {
  const {
    regles,
    dupliquerRegle,
    selectionnerRegle,
    chargerModelesPredefinies,
  } = useScoringStore();

  const [detailsModele, setDetailsModele] = useState<RegleScoring | null>(null);
  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [secteurFiltre, setSecteurFiltre] = useState<string | null>(null);

  // Récupérer tous les modèles prédéfinis
  const modelesPredefinies = regles.filter((r) => r.estModele);

  // Récupérer tous les secteurs uniques
  const secteurs = Array.from(
    new Set(modelesPredefinies.map((m) => m.secteurActivite || "Autre"))
  );

  const handleDupliquerModele = (id: string) => {
    const nouvelId = dupliquerRegle(id);
    selectionnerRegle(nouvelId);
  };

  const handleAfficherDetails = (modele: RegleScoring) => {
    setDetailsModele(modele);
    setDialogOuvert(true);
  };

  const modelesFiltres = secteurFiltre
    ? modelesPredefinies.filter(
        (m) => (m.secteurActivite || "Autre") === secteurFiltre
      )
    : modelesPredefinies;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Modèles Prédéfinis par Secteur</h2>
        <Button onClick={chargerModelesPredefinies}>
          Recharger les modèles
        </Button>
      </div>

      <Tabs defaultValue="tous" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tous" onClick={() => setSecteurFiltre(null)}>
            Tous les secteurs
          </TabsTrigger>
          {secteurs.map((secteur) => (
            <TabsTrigger
              key={secteur}
              value={secteur}
              onClick={() => setSecteurFiltre(secteur)}
            >
              {secteur}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={secteurFiltre || "tous"}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelesFiltres.map((modele) => (
              <Card
                key={modele.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{modele.nom}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAfficherDetails(modele)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDupliquerModele(modele.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {modele.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    {modele.secteurActivite && (
                      <Badge variant="outline">{modele.secteurActivite}</Badge>
                    )}
                    <Badge>{modele.criteres.length} critères</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Froid</div>
                      <div className="text-sm font-medium">
                        {modele.seuils.froid}-{modele.seuils.tiede}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Tiède</div>
                      <div className="text-sm font-medium">
                        {modele.seuils.tiede}-{modele.seuils.chaud}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Chaud</div>
                      <div className="text-sm font-medium">
                        {modele.seuils.chaud}-{modele.seuils.qualifie}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Qualifié</div>
                      <div className="text-sm font-medium">
                        {modele.seuils.qualifie}+
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full mt-4"
                    onClick={() => handleDupliquerModele(modele.id)}
                  >
                    Dupliquer ce modèle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOuvert} onOpenChange={setDialogOuvert}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{detailsModele?.nom}</DialogTitle>
            <DialogDescription>{detailsModele?.description}</DialogDescription>
          </DialogHeader>

          {detailsModele && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {detailsModele.secteurActivite && (
                  <Badge variant="outline" className="text-sm">
                    {detailsModele.secteurActivite}
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">
                  Critères de scoring
                </h3>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {detailsModele.criteres.map((critere) => (
                    <Card key={critere.id} className="shadow-sm">
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">
                          {critere.nom}
                        </CardTitle>
                        <CardDescription>{critere.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Type
                            </span>
                            <Badge
                              variant={
                                critere.type === "demographique"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {critere.type === "demographique"
                                ? "Démographique"
                                : "Comportemental"}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Catégorie
                            </span>
                            <Badge variant="outline">{critere.categorie}</Badge>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Pondération
                            </span>
                            <span className="font-medium">
                              x{critere.poids}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">
                  Seuils de qualification
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <div className="text-sm font-medium mb-1">Froid</div>
                    <div className="text-base">
                      {detailsModele.seuils.froid} -{" "}
                      {detailsModele.seuils.tiede - 1}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-center">
                    <div className="text-sm font-medium mb-1">Tiède</div>
                    <div className="text-base">
                      {detailsModele.seuils.tiede} -{" "}
                      {detailsModele.seuils.chaud - 1}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded text-center">
                    <div className="text-sm font-medium mb-1">Chaud</div>
                    <div className="text-base">
                      {detailsModele.seuils.chaud} -{" "}
                      {detailsModele.seuils.qualifie - 1}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded text-center">
                    <div className="text-sm font-medium mb-1">Qualifié</div>
                    <div className="text-base">
                      {detailsModele.seuils.qualifie}+
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleDupliquerModele(detailsModele.id)}
                className="w-full"
              >
                Dupliquer ce modèle
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
