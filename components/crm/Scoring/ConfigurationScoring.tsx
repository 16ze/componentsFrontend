"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { useScoringStore } from "../../../stores/scoringStore";
import { Badge } from "../../../components/ui/badge";
import {
  RegleScoring,
  CritereScoring,
  CritereDemographique,
  CritereComportemental,
  ActionScoring,
  StatutQualification,
} from "../../../lib/types/scoring";
import {
  PlusCircle,
  Trash2,
  Edit,
  Copy,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { v4 as uuidv4 } from "uuid";

export default function ConfigurationScoring() {
  const {
    regles,
    regleSelectionnee,
    selectionnerRegle,
    ajouterRegle,
    modifierRegle,
    supprimerRegle,
    dupliquerRegle,
    ajouterCritere,
    modifierCritere,
    supprimerCritere,
    ajouterAction,
    modifierAction,
    supprimerAction,
  } = useScoringStore();

  const [nouvelleRegle, setNouvelleRegle] = useState<Omit<RegleScoring, "id">>({
    nom: "",
    description: "",
    criteres: [],
    seuils: {
      froid: 0,
      tiede: 30,
      chaud: 60,
      qualifie: 80,
    },
    actions: [],
    estModele: false,
  });

  const [regleEditMode, setRegleEditMode] = useState(false);
  const [regleEditId, setRegleEditId] = useState<string | null>(null);
  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [nouvelleCritereType, setNouvelleCritereType] = useState<
    "demographique" | "comportemental"
  >("demographique");

  const regleActuelle = regles.find((r) => r.id === regleSelectionnee);

  const handleAjouterRegle = () => {
    const id = ajouterRegle(nouvelleRegle);
    selectionnerRegle(id);
    setNouvelleRegle({
      nom: "",
      description: "",
      criteres: [],
      seuils: {
        froid: 0,
        tiede: 30,
        chaud: 60,
        qualifie: 80,
      },
      actions: [],
      estModele: false,
    });
    setDialogOuvert(false);
  };

  const handleEditerRegle = (regle: RegleScoring) => {
    setRegleEditMode(true);
    setRegleEditId(regle.id);
    setNouvelleRegle({
      nom: regle.nom,
      description: regle.description,
      criteres: regle.criteres,
      seuils: regle.seuils,
      actions: regle.actions,
      estModele: regle.estModele,
      secteurActivite: regle.secteurActivite,
    });
    setDialogOuvert(true);
  };

  const handleSauvegarderEdition = () => {
    if (regleEditId) {
      modifierRegle(regleEditId, nouvelleRegle);
      setRegleEditMode(false);
      setRegleEditId(null);
      setDialogOuvert(false);
    }
  };

  const handleDupliquerRegle = (id: string) => {
    const nouvelId = dupliquerRegle(id);
    selectionnerRegle(nouvelId);
  };

  const handleSupprimerRegle = (id: string) => {
    supprimerRegle(id);
    if (regleSelectionnee === id) {
      selectionnerRegle(null);
    }
  };

  // Rendu des règles de scoring
  const renderRegles = () => {
    if (regles.filter((r) => !r.estModele).length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            Aucune règle de scoring personnalisée.
          </p>
          <Button onClick={() => setDialogOuvert(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer une règle
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {regles
          .filter((r) => !r.estModele)
          .map((regle) => (
            <Card
              key={regle.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                regleSelectionnee === regle.id ? "border-primary" : ""
              }`}
              onClick={() => selectionnerRegle(regle.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{regle.nom}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditerRegle(regle);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDupliquerRegle(regle.id);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSupprimerRegle(regle.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{regle.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-2">
                  {regle.secteurActivite && (
                    <Badge variant="outline">{regle.secteurActivite}</Badge>
                  )}
                  <Badge>{regle.criteres.length} critères</Badge>
                  <Badge>{regle.actions.length} actions</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Froid</div>
                    <div className="text-sm font-medium">
                      {regle.seuils.froid}-{regle.seuils.tiede}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Tiède</div>
                    <div className="text-sm font-medium">
                      {regle.seuils.tiede}-{regle.seuils.chaud}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Chaud</div>
                    <div className="text-sm font-medium">
                      {regle.seuils.chaud}-{regle.seuils.qualifie}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Qualifié</div>
                    <div className="text-sm font-medium">
                      {regle.seuils.qualifie}+
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    );
  };

  // Détails de la règle sélectionnée
  const renderDetailsRegle = () => {
    if (!regleActuelle) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            Sélectionnez une règle pour voir ses détails
          </p>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{regleActuelle.nom}</CardTitle>
          <CardDescription>{regleActuelle.description}</CardDescription>
          {regleActuelle.secteurActivite && (
            <Badge variant="outline" className="mt-2">
              {regleActuelle.secteurActivite}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="criteres">
            <TabsList className="mb-4">
              <TabsTrigger value="criteres">Critères de scoring</TabsTrigger>
              <TabsTrigger value="seuils">Seuils de qualification</TabsTrigger>
              <TabsTrigger value="actions">Actions automatiques</TabsTrigger>
            </TabsList>

            <TabsContent value="criteres">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Critères ({regleActuelle.criteres.length})
                  </h3>
                  <Button onClick={() => {}}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un critère
                  </Button>
                </div>

                {regleActuelle.criteres.length === 0 ? (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Aucun critère défini</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {regleActuelle.criteres.map((critere) => (
                      <Card key={critere.id}>
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                {critere.nom}
                              </CardTitle>
                              <CardDescription>
                                {critere.description}
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="grid grid-cols-2 gap-4">
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
                              <Badge variant="outline">
                                {critere.categorie}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">
                                Pondération
                              </span>
                              <span className="font-medium">
                                x{critere.poids}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">
                                Statut
                              </span>
                              <Badge
                                variant={
                                  critere.actif ? "success" : "destructive"
                                }
                              >
                                {critere.actif ? "Actif" : "Inactif"}
                              </Badge>
                            </div>
                          </div>

                          {critere.type === "demographique" && (
                            <div className="mt-4">
                              <span className="text-xs text-gray-500 block mb-2">
                                Valeurs
                              </span>
                              <div className="space-y-1 max-h-40 overflow-y-auto">
                                {(critere as CritereDemographique).valeurs.map(
                                  (valeur, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                    >
                                      <span>{valeur.valeur}</span>
                                      <Badge>{valeur.points} pts</Badge>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {critere.type === "comportemental" && (
                            <div className="mt-4 space-y-3">
                              <div>
                                <span className="text-xs text-gray-500 block">
                                  Points
                                </span>
                                <Badge>
                                  {(critere as CritereComportemental).points}{" "}
                                  pts
                                </Badge>
                              </div>

                              {(critere as CritereComportemental).decroissance
                                ?.active && (
                                <div>
                                  <span className="text-xs text-gray-500 block">
                                    Décroissance
                                  </span>
                                  <div className="text-sm">
                                    {
                                      (critere as CritereComportemental)
                                        .decroissance?.pourcentage
                                    }
                                    % tous les{" "}
                                    {
                                      (critere as CritereComportemental)
                                        .decroissance?.periodeJours
                                    }{" "}
                                    jours
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="seuils">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Seuils de qualification</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seuil-froid">Froid (début)</Label>
                    <Input
                      id="seuil-froid"
                      type="number"
                      value={regleActuelle.seuils.froid}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seuil-tiede">Tiède (début)</Label>
                    <Input
                      id="seuil-tiede"
                      type="number"
                      value={regleActuelle.seuils.tiede}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        modifierRegle(regleActuelle.id, {
                          seuils: {
                            ...regleActuelle.seuils,
                            tiede: value,
                          },
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seuil-chaud">Chaud (début)</Label>
                    <Input
                      id="seuil-chaud"
                      type="number"
                      value={regleActuelle.seuils.chaud}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        modifierRegle(regleActuelle.id, {
                          seuils: {
                            ...regleActuelle.seuils,
                            chaud: value,
                          },
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seuil-qualifie">Qualifié (début)</Label>
                    <Input
                      id="seuil-qualifie"
                      type="number"
                      value={regleActuelle.seuils.qualifie}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        modifierRegle(regleActuelle.id, {
                          seuils: {
                            ...regleActuelle.seuils,
                            qualifie: value,
                          },
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Actions automatiques ({regleActuelle.actions.length})
                  </h3>
                  <Button onClick={() => {}}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une action
                  </Button>
                </div>

                {regleActuelle.actions.length === 0 ? (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Aucune action définie</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {regleActuelle.actions.map((action) => (
                      <Card key={action.id}>
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">
                              {action.nom}
                            </CardTitle>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription>
                            {action.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs text-gray-500 block">
                                Déclencheur
                              </span>
                              <Badge>
                                {action.declencheur.type === "score_depasse" &&
                                  "Score dépassé"}
                                {action.declencheur.type === "score_change" &&
                                  "Score modifié"}
                                {action.declencheur.type === "statut_change" &&
                                  "Statut modifié"}
                              </Badge>
                              {action.declencheur.type === "score_depasse" &&
                                action.declencheur.valeur && (
                                  <div className="mt-1">
                                    Seuil: {action.declencheur.valeur}
                                  </div>
                                )}
                              {action.declencheur.type === "statut_change" && (
                                <div className="mt-1">
                                  De: {action.declencheur.de} → Vers:{" "}
                                  {action.declencheur.vers}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">
                                Action
                              </span>
                              <Badge variant="secondary">
                                {action.action.type === "notification" &&
                                  "Notification"}
                                {action.action.type === "email" && "Email"}
                                {action.action.type === "assignation" &&
                                  "Assignation"}
                                {action.action.type === "tache" && "Tâche"}
                              </Badge>
                              {action.action.destinataire && (
                                <div className="mt-1">
                                  Dest.: {action.action.destinataire}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Règles de scoring</h2>
          <Button onClick={() => setDialogOuvert(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle règle
          </Button>
        </div>

        {renderRegles()}

        <Dialog open={dialogOuvert} onOpenChange={setDialogOuvert}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {regleEditMode
                  ? "Modifier la règle"
                  : "Nouvelle règle de scoring"}
              </DialogTitle>
              <DialogDescription>
                {regleEditMode
                  ? "Modifiez les propriétés de la règle de scoring existante."
                  : "Créez une nouvelle règle de scoring pour évaluer vos leads."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={nouvelleRegle.nom}
                  onChange={(e) =>
                    setNouvelleRegle({ ...nouvelleRegle, nom: e.target.value })
                  }
                  placeholder="Ex: Scoring B2B Tech"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={nouvelleRegle.description}
                  onChange={(e) =>
                    setNouvelleRegle({
                      ...nouvelleRegle,
                      description: e.target.value,
                    })
                  }
                  placeholder="Ex: Règle de scoring pour les leads du secteur technologique B2B"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secteur">Secteur d'activité (optionnel)</Label>
                <Input
                  id="secteur"
                  value={nouvelleRegle.secteurActivite || ""}
                  onChange={(e) =>
                    setNouvelleRegle({
                      ...nouvelleRegle,
                      secteurActivite: e.target.value,
                    })
                  }
                  placeholder="Ex: Technologie, Santé, Finance..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOuvert(false);
                  if (regleEditMode) {
                    setRegleEditMode(false);
                    setRegleEditId(null);
                  }
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={
                  regleEditMode ? handleSauvegarderEdition : handleAjouterRegle
                }
              >
                {regleEditMode ? "Sauvegarder" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="md:col-span-2">
        <h2 className="text-xl font-bold mb-4">Détails de la règle</h2>
        {renderDetailsRegle()}
      </div>
    </div>
  );
}
