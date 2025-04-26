import React from "react";
import AdvancedTagManager from "@/components/crm/Segmentation/AdvancedTagManager";
import AdvancedSegmentBuilder from "@/components/crm/Segmentation/AdvancedSegmentBuilder";
import SegmentDashboard from "@/components/crm/Segmentation/SegmentDashboard";
import AutoTagRules from "@/components/crm/Segmentation/AutoTagRules";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { SegmentList } from "@/components/crm/Segmentation/SegmentList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";

export default function SegmentationPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Segmentation Client Avancée</h1>
        <p className="text-muted-foreground">
          Gérez, analysez et exploitez vos segments clients pour des campagnes
          ciblées
        </p>
      </div>

      <Tabs defaultValue="segments" className="space-y-4">
        <TabsList className="grid grid-cols-5 lg:w-[750px]">
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="rules">Auto-Tagging</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segments Clients</CardTitle>
              <CardDescription>
                Gérez et visualisez vos segments de clients basés sur divers
                critères
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SegmentList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <AdvancedTagManager />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <AutoTagRules />
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <AdvancedSegmentBuilder />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Par défaut, nous montrons le tableau de bord du premier segment
              Dans une vraie application, nous récupérerions le segment actif/sélectionné */}
          <Card>
            <CardHeader>
              <CardTitle>Sélection du Segment</CardTitle>
              <CardDescription>
                Veuillez sélectionner un segment dans l'onglet Segments
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Aucun segment sélectionné. Veuillez choisir un segment pour voir
                son tableau de bord.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
