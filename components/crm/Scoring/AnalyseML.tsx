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
import { useScoringStore } from "../../../stores/scoringStore";
import { Badge } from "../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Brain,
  Sparkles,
  TrendingUp,
  BarChart2,
  Award,
  RefreshCw,
} from "lucide-react";
import { Progress } from "../../../components/ui/progress";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryLabel,
} from "victory";

// Simulation de données pour l'analyse ML
interface AnalyseCritereMl {
  id: string;
  nom: string;
  importanceActuelle: number;
  importanceSuggeree: number;
  impact: number;
}

interface AnalyseRegleMl {
  regleId: string;
  regleNom: string;
  tauxConversionActuel: number;
  tauxConversionPredit: number;
  amelioration: number;
  criteres: AnalyseCritereMl[];
}

// Génération de données simulées
const genererAnalysesML = (regles: any[]): AnalyseRegleMl[] => {
  return regles
    .filter((r) => !r.estModele)
    .map((regle) => {
      const tauxConversionActuel = Math.random() * 15 + 5; // 5-20%
      const amelioration = Math.random() * 10 + 2; // 2-12%

      return {
        regleId: regle.id,
        regleNom: regle.nom,
        tauxConversionActuel,
        tauxConversionPredit: tauxConversionActuel + amelioration,
        amelioration,
        criteres: regle.criteres
          .map((critere) => {
            const importanceActuelle = critere.poids;
            const variation = (Math.random() * 2 - 1) * 1.5; // -1.5 à +1.5
            const importanceSuggeree = Math.max(
              0.5,
              Math.min(5, importanceActuelle + variation)
            );

            return {
              id: critere.id,
              nom: critere.nom,
              importanceActuelle,
              importanceSuggeree,
              impact:
                Math.abs(importanceSuggeree - importanceActuelle) *
                (importanceSuggeree > importanceActuelle ? 1 : -1),
            };
          })
          .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)),
      };
    });
};

export default function AnalyseML() {
  const { regles, entrainerModele, modifierCritere } = useScoringStore();
  const [regleActive, setRegleActive] = useState<string | null>(null);
  const [onglet, setOnglet] = useState("optimisations");
  const [entrainementEnCours, setEntrainementEnCours] = useState(false);
  const [progression, setProgression] = useState(0);

  // Initialiser avec la première règle si aucune n'est sélectionnée
  if (regles.length > 0 && !regleActive) {
    const reglesPersonnalisees = regles.filter((r) => !r.estModele);
    if (reglesPersonnalisees.length > 0) {
      setRegleActive(reglesPersonnalisees[0].id);
    }
  }

  const analyses = genererAnalysesML(regles);
  const analyseActive = analyses.find((a) => a.regleId === regleActive);

  const handleEntrainerModele = () => {
    if (!regleActive) return;

    setEntrainementEnCours(true);
    setProgression(0);

    // Simuler la progression de l'entraînement
    const interval = setInterval(() => {
      setProgression((prev) => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setEntrainementEnCours(false);
            entrainerModele(regleActive);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleAppliquerSuggestions = () => {
    if (!analyseActive || !regleActive) return;

    analyseActive.criteres.forEach((critere) => {
      modifierCritere(regleActive, critere.id, {
        poids: critere.importanceSuggeree,
      });
    });
  };

  if (regles.filter((r) => !r.estModele).length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <Brain className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500 mb-4">
          Aucune règle de scoring personnalisée disponible pour l'analyse ML.
        </p>
        <p className="text-gray-500">
          Créez d'abord des règles de scoring dans l'onglet Configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Analyse Prédictive ML</h2>
          <p className="text-gray-500">
            Optimisez vos modèles de scoring grâce à l'apprentissage automatique
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {regles
            .filter((r) => !r.estModele)
            .map((regle) => (
              <Badge
                key={regle.id}
                variant={regleActive === regle.id ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => setRegleActive(regle.id)}
              >
                {regle.nom}
              </Badge>
            ))}
        </div>
      </div>

      {!analyseActive ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            Sélectionnez une règle pour voir son analyse ML
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Taux de Conversion Actuel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analyseActive.tauxConversionActuel.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">
                  basé sur les données historiques
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Taux de Conversion Prédit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {analyseActive.tauxConversionPredit.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">
                  avec les optimisations suggérées
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Amélioration Potentielle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">
                  +{analyseActive.amelioration.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">
                  d'augmentation prévue
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={onglet} onValueChange={setOnglet} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="optimisations">
                Optimisations Suggérées
              </TabsTrigger>
              <TabsTrigger value="simulation">Simulation d'Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="optimisations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Optimisation des Pondérations des Critères
                  </CardTitle>
                  <CardDescription>
                    Suggestions de modifications des poids des critères pour
                    améliorer le taux de conversion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyseActive.criteres.map((critere) => (
                      <div key={critere.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{critere.nom}</h4>
                            <div className="text-sm text-gray-500">
                              Impact estimé:
                              <span
                                className={
                                  critere.impact > 0
                                    ? "text-green-500 ml-1"
                                    : "text-red-500 ml-1"
                                }
                              >
                                {critere.impact > 0 ? "+" : ""}
                                {critere.impact.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              critere.impact > 0 ? "success" : "destructive"
                            }
                            className="text-xs"
                          >
                            {critere.impact > 0 ? "Augmenter" : "Diminuer"}{" "}
                            l'importance
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Pondération actuelle
                            </div>
                            <div className="flex items-center">
                              <div className="font-medium">
                                {critere.importanceActuelle.toFixed(1)}
                              </div>
                              <div className="h-2 bg-gray-200 flex-grow ml-3 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gray-400"
                                  style={{
                                    width: `${
                                      (critere.importanceActuelle / 5) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Pondération suggérée
                            </div>
                            <div className="flex items-center">
                              <div className="font-medium">
                                {critere.importanceSuggeree.toFixed(1)}
                              </div>
                              <div className="h-2 bg-gray-200 flex-grow ml-3 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    critere.impact > 0
                                      ? "bg-green-400"
                                      : "bg-red-400"
                                  }`}
                                  style={{
                                    width: `${
                                      (critere.importanceSuggeree / 5) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleEntrainerModele}
                    disabled={entrainementEnCours}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Ré-analyser
                  </Button>

                  <Button
                    onClick={handleAppliquerSuggestions}
                    disabled={entrainementEnCours}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Appliquer les suggestions
                  </Button>
                </CardFooter>
              </Card>

              {entrainementEnCours && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Entraînement du modèle ML en cours
                    </CardTitle>
                    <CardDescription>
                      Analyse des données historiques pour optimiser les
                      recommandations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={progression} className="w-full h-2" />
                    <div className="text-sm text-gray-500 mt-2 text-center">
                      {progression < 100
                        ? `Progression: ${Math.round(progression)}%`
                        : "Analyse terminée!"}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="simulation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Simulation de Performance
                  </CardTitle>
                  <CardDescription>
                    Projection de l'impact des modifications suggérées sur le
                    taux de conversion
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <VictoryChart
                    theme={VictoryTheme.material}
                    padding={{ top: 20, bottom: 60, left: 70, right: 50 }}
                  >
                    <VictoryAxis
                      tickFormat={(t) => `Semaine ${t}`}
                      label="Période (semaines)"
                      tickValues={[1, 2, 3, 4, 5, 6, 7, 8]}
                      style={{
                        axisLabel: { padding: 35 },
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      tickFormat={(t) => `${t}%`}
                      label="Taux de Conversion"
                      style={{
                        axisLabel: { padding: 50 },
                      }}
                    />

                    {/* Courbe des performances actuelles */}
                    <VictoryLine
                      data={[
                        { x: 1, y: analyseActive.tauxConversionActuel },
                        { x: 2, y: analyseActive.tauxConversionActuel },
                        { x: 3, y: analyseActive.tauxConversionActuel },
                        { x: 4, y: analyseActive.tauxConversionActuel },
                        { x: 5, y: analyseActive.tauxConversionActuel },
                        { x: 6, y: analyseActive.tauxConversionActuel },
                        { x: 7, y: analyseActive.tauxConversionActuel },
                        { x: 8, y: analyseActive.tauxConversionActuel },
                      ]}
                      style={{
                        data: { stroke: "#94a3b8", strokeWidth: 2 },
                      }}
                    />

                    {/* Courbe des performances prédites */}
                    <VictoryLine
                      data={[
                        { x: 1, y: analyseActive.tauxConversionActuel },
                        {
                          x: 2,
                          y:
                            analyseActive.tauxConversionActuel +
                            analyseActive.amelioration * 0.2,
                        },
                        {
                          x: 3,
                          y:
                            analyseActive.tauxConversionActuel +
                            analyseActive.amelioration * 0.4,
                        },
                        {
                          x: 4,
                          y:
                            analyseActive.tauxConversionActuel +
                            analyseActive.amelioration * 0.6,
                        },
                        {
                          x: 5,
                          y:
                            analyseActive.tauxConversionActuel +
                            analyseActive.amelioration * 0.8,
                        },
                        {
                          x: 6,
                          y:
                            analyseActive.tauxConversionActuel +
                            analyseActive.amelioration * 0.9,
                        },
                        {
                          x: 7,
                          y:
                            analyseActive.tauxConversionActuel +
                            analyseActive.amelioration * 0.95,
                        },
                        { x: 8, y: analyseActive.tauxConversionPredit },
                      ]}
                      style={{
                        data: { stroke: "#3b82f6", strokeWidth: 3 },
                      }}
                    />

                    <VictoryScatter
                      data={[
                        {
                          x: 1,
                          y: analyseActive.tauxConversionActuel,
                          label: "Actuel",
                        },
                        {
                          x: 8,
                          y: analyseActive.tauxConversionPredit,
                          label: "Prédit",
                        },
                      ]}
                      size={7}
                      style={{
                        data: {
                          fill: ({ datum }) =>
                            datum.label === "Actuel" ? "#94a3b8" : "#3b82f6",
                        },
                      }}
                      labelComponent={
                        <VictoryLabel
                          dy={-15}
                          style={{
                            fontSize: 12,
                            fill: ({ datum }) =>
                              datum.label === "Actuel" ? "#94a3b8" : "#3b82f6",
                          }}
                        />
                      }
                    />
                  </VictoryChart>
                </CardContent>
                <CardFooter>
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-gray-400 rounded-full mr-2"></div>
                        <span className="text-sm">
                          Modèle actuel (
                          {analyseActive.tauxConversionActuel.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm">
                          Modèle optimisé (
                          {analyseActive.tauxConversionPredit.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="text-blue-700 font-medium">
                        Analyse d'impact
                      </p>
                      <p className="text-blue-600 mt-1">
                        D'après notre analyse, les modifications suggérées
                        pourraient augmenter votre taux de conversion de{" "}
                        <strong>
                          {analyseActive.amelioration.toFixed(1)}%
                        </strong>{" "}
                        sur une période de 8 semaines.
                      </p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
