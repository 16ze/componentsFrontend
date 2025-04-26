"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useScoringStore } from "../../../stores/scoringStore";
import { RegleScoring, StatutQualification } from "../../../lib/types/scoring";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { BarChart, PieChart, HeatMap, LineChart } from "lucide-react";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryPie,
  VictoryLine,
  VictoryTheme,
  VictoryLabel,
  VictoryScatter,
} from "victory";

// Simulation de données pour le tableau de bord
interface LeadStatsSimulees {
  id: string;
  nom: string;
  score: number;
  statut: StatutQualification;
  evolutionScores: { date: Date; score: number }[];
  details: { critereId: string; points: number; nom: string }[];
}

// Couleurs par statut
const couleursStatut: Record<StatutQualification, string> = {
  froid: "#94a3b8",
  tiede: "#60a5fa",
  chaud: "#fb923c",
  qualifie: "#4ade80",
};

// Génération de données de test
const genererLeadsTest = (
  regleId: string,
  nombre: number = 50
): LeadStatsSimulees[] => {
  const leads: LeadStatsSimulees[] = [];

  for (let i = 0; i < nombre; i++) {
    const score = Math.floor(Math.random() * 100);
    let statut: StatutQualification = "froid";

    if (score >= 80) statut = "qualifie";
    else if (score >= 60) statut = "chaud";
    else if (score >= 30) statut = "tiede";

    // Génération des détails de score
    const details = [
      {
        critereId: "crit-1",
        points: Math.floor(Math.random() * 20),
        nom: "Industrie",
      },
      {
        critereId: "crit-2",
        points: Math.floor(Math.random() * 15),
        nom: "Taille entreprise",
      },
      {
        critereId: "crit-3",
        points: Math.floor(Math.random() * 25),
        nom: "Visite site web",
      },
      {
        critereId: "crit-4",
        points: Math.floor(Math.random() * 20),
        nom: "Téléchargement",
      },
      {
        critereId: "crit-5",
        points: Math.floor(Math.random() * 10),
        nom: "Webinar",
      },
    ];

    // Génération de l'évolution du score
    const evolutionScores = [];
    let scoreActuel = 0;

    for (let j = 0; j < 10; j++) {
      // Ajout aléatoire de points à chaque étape
      const ajout = Math.floor(Math.random() * 15);
      scoreActuel += ajout;
      if (scoreActuel > score) scoreActuel = score;

      evolutionScores.push({
        date: new Date(Date.now() - (10 - j) * 7 * 24 * 60 * 60 * 1000), // Remonte sur 10 semaines
        score: scoreActuel,
      });
    }

    leads.push({
      id: `lead-${i + 1}`,
      nom: `Lead ${i + 1}`,
      score,
      statut,
      evolutionScores,
      details,
    });
  }

  return leads;
};

export default function TableauBordScoring() {
  const { regles } = useScoringStore();
  const [regleSelectionnee, setRegleSelectionnee] =
    useState<RegleScoring | null>(null);
  const [leads, setLeads] = useState<LeadStatsSimulees[]>([]);

  // Initialiser avec la première règle non-modèle (personnalisée)
  useEffect(() => {
    const reglesPersonnalisees = regles.filter((r) => !r.estModele);
    if (reglesPersonnalisees.length > 0 && !regleSelectionnee) {
      setRegleSelectionnee(reglesPersonnalisees[0]);
      setLeads(genererLeadsTest(reglesPersonnalisees[0].id));
    }
  }, [regles, regleSelectionnee]);

  const handleChangeRegle = (regle: RegleScoring) => {
    setRegleSelectionnee(regle);
    setLeads(genererLeadsTest(regle.id));
  };

  // Calcul des statistiques
  const nombreLeads = leads.length;
  const scoresMoyens = {
    global: Math.round(
      leads.reduce((sum, lead) => sum + lead.score, 0) / nombreLeads
    ),
    froid: Math.round(
      leads
        .filter((l) => l.statut === "froid")
        .reduce((sum, lead) => sum + lead.score, 0) /
        (leads.filter((l) => l.statut === "froid").length || 1)
    ),
    tiede: Math.round(
      leads
        .filter((l) => l.statut === "tiede")
        .reduce((sum, lead) => sum + lead.score, 0) /
        (leads.filter((l) => l.statut === "tiede").length || 1)
    ),
    chaud: Math.round(
      leads
        .filter((l) => l.statut === "chaud")
        .reduce((sum, lead) => sum + lead.score, 0) /
        (leads.filter((l) => l.statut === "chaud").length || 1)
    ),
    qualifie: Math.round(
      leads
        .filter((l) => l.statut === "qualifie")
        .reduce((sum, lead) => sum + lead.score, 0) /
        (leads.filter((l) => l.statut === "qualifie").length || 1)
    ),
  };

  const distributionStatuts = {
    froid: leads.filter((l) => l.statut === "froid").length,
    tiede: leads.filter((l) => l.statut === "tiede").length,
    chaud: leads.filter((l) => l.statut === "chaud").length,
    qualifie: leads.filter((l) => l.statut === "qualifie").length,
  };

  // Données pour le graphique d'évolution du score global
  const donneesEvolutionScore =
    leads.length > 0
      ? leads[0].evolutionScores.map((es, index) => {
          const scoreTotal = leads.reduce((sum, lead) => {
            return sum + (lead.evolutionScores[index]?.score || 0);
          }, 0);
          return {
            x: es.date,
            y: Math.round(scoreTotal / leads.length),
          };
        })
      : [];

  // Données pour le graphique de contribution des critères
  const donneesContributionCriteres =
    leads.length > 0
      ? leads[0].details.map((detail) => {
          const pointsTotaux = leads.reduce((sum, lead) => {
            const critere = lead.details.find(
              (d) => d.critereId === detail.critereId
            );
            return sum + (critere?.points || 0);
          }, 0);
          return {
            x: detail.nom,
            y: Math.round(pointsTotaux / leads.length),
          };
        })
      : [];

  // Données pour le graphique en camembert de distribution
  const donneesDistribution = [
    { x: "Froid", y: distributionStatuts.froid, color: couleursStatut.froid },
    { x: "Tiède", y: distributionStatuts.tiede, color: couleursStatut.tiede },
    { x: "Chaud", y: distributionStatuts.chaud, color: couleursStatut.chaud },
    {
      x: "Qualifié",
      y: distributionStatuts.qualifie,
      color: couleursStatut.qualifie,
    },
  ];

  if (!regleSelectionnee) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">
          Aucune règle de scoring disponible. Veuillez d'abord créer une règle
          de scoring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Tableau de Bord du Scoring</h2>
          <p className="text-gray-500">
            Visualisez la distribution et l'efficacité de votre scoring de leads
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {regles
            .filter((r) => !r.estModele)
            .map((regle) => (
              <Badge
                key={regle.id}
                variant={
                  regleSelectionnee?.id === regle.id ? "default" : "outline"
                }
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => handleChangeRegle(regle)}
              >
                {regle.nom}
              </Badge>
            ))}
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Score Moyen Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {scoresMoyens.global} / 100
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leads Qualifiés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {distributionStatuts.qualifie}
            </div>
            <div className="text-sm text-gray-500">
              {Math.round((distributionStatuts.qualifie / nombreLeads) * 100)}%
              du total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leads Chauds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {distributionStatuts.chaud}
            </div>
            <div className="text-sm text-gray-500">
              {Math.round((distributionStatuts.chaud / nombreLeads) * 100)}% du
              total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Potentiel d'Amélioration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {100 - scoresMoyens.global}%
            </div>
            <div className="text-sm text-gray-500">Marge de progression</div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Distribution des Statuts
            </CardTitle>
            <CardDescription>
              Répartition des leads par niveau de qualification
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <VictoryPie
              data={donneesDistribution}
              colorScale={donneesDistribution.map((d) => d.color)}
              innerRadius={70}
              labelRadius={90}
              style={{
                labels: { fill: "white", fontSize: 14, fontWeight: "bold" },
              }}
              labels={({ datum }) => `${datum.x}: ${datum.y}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Contribution par Critère
            </CardTitle>
            <CardDescription>
              Points moyens apportés par chaque critère
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              padding={{ top: 20, bottom: 60, left: 60, right: 20 }}
            >
              <VictoryAxis
                tickLabelComponent={
                  <VictoryLabel angle={-45} textAnchor="end" />
                }
              />
              <VictoryAxis dependentAxis tickFormat={(t) => `${t}pts`} />
              <VictoryBar
                data={donneesContributionCriteres}
                style={{
                  data: { fill: "#3b82f6" },
                }}
                labels={({ datum }) => `${datum.y}pts`}
              />
            </VictoryChart>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="h-5 w-5 mr-2" />
            Évolution du Score Moyen
          </CardTitle>
          <CardDescription>
            Progression du score moyen dans le temps
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <VictoryChart
            theme={VictoryTheme.material}
            padding={{ top: 20, bottom: 40, left: 60, right: 20 }}
          >
            <VictoryAxis
              tickFormat={(t) => {
                const date = new Date(t);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <VictoryAxis dependentAxis tickFormat={(t) => `${t}pts`} />
            <VictoryLine
              data={donneesEvolutionScore}
              style={{
                data: { stroke: "#3b82f6", strokeWidth: 3 },
              }}
            />
            <VictoryScatter
              data={donneesEvolutionScore}
              size={5}
              style={{
                data: { fill: "#3b82f6" },
              }}
            />
          </VictoryChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HeatMap className="h-5 w-5 mr-2" />
            Score Moyen par Segment
          </CardTitle>
          <CardDescription>
            Comparaison des scores moyens selon le statut de qualification
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-sm font-medium text-gray-600 mb-1">
                FROID
              </div>
              <div className="text-2xl font-bold">{scoresMoyens.froid}</div>
              <div className="text-xs text-gray-500 mt-1">points</div>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gray-400"
                  style={{ width: `${(scoresMoyens.froid / 100) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-sm font-medium text-blue-600 mb-1">
                TIÈDE
              </div>
              <div className="text-2xl font-bold">{scoresMoyens.tiede}</div>
              <div className="text-xs text-gray-500 mt-1">points</div>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-400"
                  style={{ width: `${(scoresMoyens.tiede / 100) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-sm font-medium text-orange-600 mb-1">
                CHAUD
              </div>
              <div className="text-2xl font-bold">{scoresMoyens.chaud}</div>
              <div className="text-xs text-gray-500 mt-1">points</div>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-orange-400"
                  style={{ width: `${(scoresMoyens.chaud / 100) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-sm font-medium text-green-600 mb-1">
                QUALIFIÉ
              </div>
              <div className="text-2xl font-bold">{scoresMoyens.qualifie}</div>
              <div className="text-xs text-gray-500 mt-1">points</div>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-green-400"
                  style={{ width: `${(scoresMoyens.qualifie / 100) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
