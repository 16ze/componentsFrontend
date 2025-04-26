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
import { useScoringStore } from "../../../stores/scoringStore";
import { Badge } from "../../../components/ui/badge";
import { ModeleTestAB } from "../../../lib/types/scoring";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import {
  PlusCircle,
  BarChart2,
  Beaker,
  Trash2,
  Play,
  Pause,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from "victory";

export default function TestABScoring() {
  const { regles, modeles, creerTestAB, terminerTestAB } = useScoringStore();

  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [detailsOuverts, setDetailsOuverts] = useState<string | null>(null);

  const [nouveauTest, setNouveauTest] = useState<Omit<ModeleTestAB, "id">>({
    nom: "",
    regleId: "",
    dateDebut: new Date(),
    population: 0,
    conversions: 0,
    actif: true,
  });

  const handleCreerTest = () => {
    creerTestAB({
      ...nouveauTest,
      dateDebut: new Date(),
    });
    setDialogOuvert(false);
    setNouveauTest({
      nom: "",
      regleId: "",
      dateDebut: new Date(),
      population: 0,
      conversions: 0,
      actif: true,
    });
  };

  const handleTerminerTest = (id: string) => {
    terminerTestAB(id);
  };

  // Fonction pour générer des données de simulation pour les tests A/B
  const genererDonneesTestAB = (modeleId: string) => {
    const jours = 14; // Deux semaines
    const donnees = [];
    let population = 10;
    let conversions = 0;

    for (let i = 0; i < jours; i++) {
      // Simuler une augmentation progressive des conversions
      population += Math.floor(Math.random() * 5) + 1;
      const nouvellesConversions = Math.floor(Math.random() * 3);
      conversions += nouvellesConversions;

      donnees.push({
        date: addDays(new Date(), -jours + i),
        population,
        conversions,
        tauxConversion: (conversions / population) * 100,
      });
    }

    return donnees;
  };

  const donneesTests = modeles.map((modele) => {
    const donnees = genererDonneesTestAB(modele.id);
    const dernierJour = donnees[donnees.length - 1];

    return {
      ...modele,
      donnees,
      tauxConversion: dernierJour.tauxConversion,
      totalPopulation: dernierJour.population,
      totalConversions: dernierJour.conversions,
    };
  });

  // Graphique de comparaison entre modèles
  const donneesComparaison = donneesTests.map((test) => ({
    x: test.nom,
    y: test.tauxConversion,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            Tests A/B des Modèles de Scoring
          </h2>
          <p className="text-gray-500">
            Expérimentez et optimisez vos modèles de scoring
          </p>
        </div>
        <Button onClick={() => setDialogOuvert(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau Test A/B
        </Button>
      </div>

      {/* Graphique de comparaison global */}
      {donneesTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2" />
              Comparaison des Modèles
            </CardTitle>
            <CardDescription>
              Taux de conversion par modèle de scoring
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              padding={{ top: 20, bottom: 60, left: 60, right: 20 }}
            >
              <VictoryAxis
                tickLabelComponent={<VictoryAxis.Tick angle={-45} />}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${t.toFixed(1)}%`}
              />
              <VictoryBar
                data={donneesComparaison}
                style={{
                  data: { fill: "#3b82f6", width: 30 },
                }}
                labels={({ datum }) => `${datum.y.toFixed(1)}%`}
              />
            </VictoryChart>
          </CardContent>
        </Card>
      )}

      {/* Liste des tests A/B */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {donneesTests.length === 0 ? (
          <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
            <Beaker className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 mb-4">Aucun test A/B en cours.</p>
            <Button onClick={() => setDialogOuvert(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer un test A/B
            </Button>
          </div>
        ) : (
          donneesTests.map((test) => (
            <Card
              key={test.id}
              className={`border-l-4 ${
                test.actif ? "border-l-green-500" : "border-l-gray-300"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{test.nom}</CardTitle>
                    <CardDescription>
                      {test.actif
                        ? `Démarré le ${format(
                            new Date(test.dateDebut),
                            "dd/MM/yyyy"
                          )}`
                        : `Du ${format(
                            new Date(test.dateDebut),
                            "dd/MM/yyyy"
                          )} au ${format(
                            new Date(test.dateFin || new Date()),
                            "dd/MM/yyyy"
                          )}`}
                    </CardDescription>
                  </div>
                  <Badge variant={test.actif ? "default" : "outline"}>
                    {test.actif ? "Actif" : "Terminé"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Population</div>
                    <div className="text-xl font-bold">
                      {test.totalPopulation}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Conversions</div>
                    <div className="text-xl font-bold text-green-500">
                      {test.totalConversions}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Taux</div>
                    <div className="text-xl font-bold">
                      {test.tauxConversion.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">
                    {regles.find((r) => r.id === test.regleId)?.nom ||
                      "Modèle inconnu"}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button
                  variant="ghost"
                  onClick={() => setDetailsOuverts(test.id)}
                >
                  Voir détails
                </Button>
                {test.actif && (
                  <Button
                    variant="outline"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleTerminerTest(test.id)}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Arrêter
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Dialogue pour créer un nouveau test */}
      <Dialog open={dialogOuvert} onOpenChange={setDialogOuvert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau test A/B</DialogTitle>
            <DialogDescription>
              Comparez l'efficacité de différents modèles de scoring pour
              optimiser vos conversions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom-test">Nom du test</Label>
              <Input
                id="nom-test"
                value={nouveauTest.nom}
                onChange={(e) =>
                  setNouveauTest({ ...nouveauTest, nom: e.target.value })
                }
                placeholder="Ex: Test modèle Tech vs E-commerce"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regle-test">Modèle de scoring à tester</Label>
              <Select
                value={nouveauTest.regleId}
                onValueChange={(value) =>
                  setNouveauTest({ ...nouveauTest, regleId: value })
                }
              >
                <SelectTrigger id="regle-test">
                  <SelectValue placeholder="Sélectionnez un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {regles.map((regle) => (
                    <SelectItem key={regle.id} value={regle.id}>
                      {regle.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="actif-test"
                checked={nouveauTest.actif}
                onCheckedChange={(checked) =>
                  setNouveauTest({ ...nouveauTest, actif: checked })
                }
              />
              <Label htmlFor="actif-test">Démarrer immédiatement</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOuvert(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreerTest}
              disabled={!nouveauTest.nom || !nouveauTest.regleId}
            >
              <Play className="h-4 w-4 mr-1" />
              Démarrer le test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour voir les détails d'un test */}
      <Dialog
        open={detailsOuverts !== null}
        onOpenChange={() => setDetailsOuverts(null)}
      >
        <DialogContent className="max-w-3xl">
          {detailsOuverts && (
            <>
              {(() => {
                const test = donneesTests.find((t) => t.id === detailsOuverts);
                if (!test) return null;

                const regle = regles.find((r) => r.id === test.regleId);

                return (
                  <>
                    <DialogHeader>
                      <DialogTitle>{test.nom}</DialogTitle>
                      <DialogDescription>
                        {test.actif
                          ? `Test en cours depuis le ${format(
                              new Date(test.dateDebut),
                              "dd/MM/yyyy"
                            )}`
                          : `Test terminé (du ${format(
                              new Date(test.dateDebut),
                              "dd/MM/yyyy"
                            )} au ${format(
                              new Date(test.dateFin || new Date()),
                              "dd/MM/yyyy"
                            )})`}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="flex gap-2">
                        <Badge variant={test.actif ? "default" : "outline"}>
                          {test.actif ? "Actif" : "Terminé"}
                        </Badge>
                        {regle && (
                          <Badge variant="outline">Modèle: {regle.nom}</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Population
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">
                              {test.totalPopulation}
                            </div>
                            <div className="text-sm text-gray-500">leads</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Conversions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-green-500">
                              {test.totalConversions}
                            </div>
                            <div className="text-sm text-gray-500">
                              leads convertis
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Taux de Conversion
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">
                              {test.tauxConversion.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">
                              efficacité
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Évolution des performances</CardTitle>
                          <CardDescription>
                            Progression du taux de conversion au fil du temps
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                          <VictoryChart
                            theme={VictoryTheme.material}
                            padding={{
                              top: 20,
                              bottom: 40,
                              left: 60,
                              right: 20,
                            }}
                          >
                            <VictoryAxis
                              tickFormat={(t) => {
                                const date = new Date(t);
                                return `${date.getDate()}/${
                                  date.getMonth() + 1
                                }`;
                              }}
                            />
                            <VictoryAxis
                              dependentAxis
                              tickFormat={(t) => `${t.toFixed(1)}%`}
                            />
                            <VictoryBar
                              data={test.donnees.map((d) => ({
                                x: d.date,
                                y: d.tauxConversion,
                              }))}
                              style={{
                                data: { fill: "#3b82f6" },
                              }}
                            />
                          </VictoryChart>
                        </CardContent>
                      </Card>
                    </div>

                    <DialogFooter>
                      {test.actif ? (
                        <Button
                          variant="outline"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            handleTerminerTest(test.id);
                            setDetailsOuverts(null);
                          }}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Arrêter le test
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setDetailsOuverts(null)}
                        >
                          Fermer
                        </Button>
                      )}
                    </DialogFooter>
                  </>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
