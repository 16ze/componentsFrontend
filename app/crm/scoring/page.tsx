"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { useScoringStore } from "../../../stores/scoringStore";
import ConfigurationScoring from "../../../components/crm/Scoring/ConfigurationScoring";
import ModelesScoring from "../../../components/crm/Scoring/ModelesScoring";
import TableauBordScoring from "../../../components/crm/Scoring/TableauBordScoring";
import TestABScoring from "../../../components/crm/Scoring/TestABScoring";
import AnalyseML from "../../../components/crm/Scoring/AnalyseML";

export default function ScoringPage() {
  const { regles, regleSelectionnee, selectionnerRegle } = useScoringStore();
  const [ongletActif, setOngletActif] = useState("configuration");

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Scoring des Leads</h1>

      <Tabs
        value={ongletActif}
        onValueChange={setOngletActif}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="modeles">Modèles Prédéfinis</TabsTrigger>
          <TabsTrigger value="tableau-bord">Tableau de Bord</TabsTrigger>
          <TabsTrigger value="test-ab">Tests A/B</TabsTrigger>
          <TabsTrigger value="ml">Analyse Prédictive</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration">
          <ConfigurationScoring />
        </TabsContent>

        <TabsContent value="modeles">
          <ModelesScoring />
        </TabsContent>

        <TabsContent value="tableau-bord">
          <TableauBordScoring />
        </TabsContent>

        <TabsContent value="test-ab">
          <TestABScoring />
        </TabsContent>

        <TabsContent value="ml">
          <AnalyseML />
        </TabsContent>
      </Tabs>
    </div>
  );
}
