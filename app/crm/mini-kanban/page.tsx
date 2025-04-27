import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MiniKanban,
  createMiniKanbanColumn,
  createMiniKanbanItem,
} from "@/components/crm/MiniKanban/MiniKanban";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Code, Copy, ExternalLink } from "lucide-react";

// Exemple de données pour le mini-kanban
const demoColumns = [
  createMiniKanbanColumn(
    "À faire",
    [
      createMiniKanbanItem("Contacter Jean Dupont", {
        description: "Appeler concernant le nouveau projet",
        priority: "high",
        assignedTo: { name: "Marie L.", initials: "ML" },
        tags: ["appel", "prospection"],
      }),
      createMiniKanbanItem("Envoyer proposition commerciale", {
        priority: "medium",
        assignedTo: { name: "Thomas D.", initials: "TD" },
        tags: ["devis"],
      }),
      createMiniKanbanItem("Préparer présentation", {
        description: "Slides pour la réunion de jeudi",
        priority: "low",
        assignedTo: { name: "Sarah B.", initials: "SB" },
      }),
    ],
    "#e11d48"
  ),

  createMiniKanbanColumn(
    "En cours",
    [
      createMiniKanbanItem("Négociation contrat Tech Solutions", {
        description: "Discuter des conditions financières",
        priority: "high",
        assignedTo: { name: "Pierre M.", initials: "PM" },
        tags: ["négociation", "important"],
      }),
      createMiniKanbanItem("Audit pour Société ABC", {
        priority: "medium",
        assignedTo: { name: "Julie R.", initials: "JR" },
      }),
    ],
    "#8b5cf6"
  ),

  createMiniKanbanColumn(
    "Terminé",
    [
      createMiniKanbanItem("Démo produit Entreprise XYZ", {
        priority: "medium",
        assignedTo: { name: "Camille D.", initials: "CD" },
        tags: ["démo"],
      }),
      createMiniKanbanItem("Formation équipe client", {
        description: "Session de formation sur l'outil",
        priority: "low",
        assignedTo: { name: "Lucas P.", initials: "LP" },
      }),
    ],
    "#10b981"
  ),
];

// Exemple de données pour la version simplifiée
const demoSimplifiedColumns = [
  createMiniKanbanColumn(
    "À faire",
    [
      createMiniKanbanItem("Appeler Jean Dupont"),
      createMiniKanbanItem("Envoyer proposition"),
      createMiniKanbanItem("Préparer docs"),
    ],
    "#e11d48"
  ),

  createMiniKanbanColumn(
    "En cours",
    [
      createMiniKanbanItem("Négociation contrat"),
      createMiniKanbanItem("Audit client"),
    ],
    "#8b5cf6"
  ),

  createMiniKanbanColumn(
    "Terminé",
    [
      createMiniKanbanItem("Démo produit"),
      createMiniKanbanItem("Formation client"),
    ],
    "#10b981"
  ),
];

export default function MiniKanbanPage() {
  const [standardColumns, setStandardColumns] = useState(demoColumns);
  const [simplifiedColumns, setSimplifiedColumns] = useState(
    demoSimplifiedColumns
  );
  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Link
          href="/crm"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au CRM
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mini-Kanban</h1>
          <p className="text-muted-foreground">
            Version simplifiée du tableau Kanban pour une intégration rapide
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link
              href="/crm/documentation/components/mini-kanban"
              className="flex items-center"
            >
              <Code className="mr-2 h-4 w-4" />
              Documentation
            </Link>
          </Button>
          <Button asChild>
            <Link href="/crm/kanban" className="flex items-center">
              <ExternalLink className="mr-2 h-4 w-4" />
              Version complète
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="standard">
        <TabsList className="mb-6">
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="simplified">Simplifié</TabsTrigger>
          <TabsTrigger value="integration">Intégration</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mini-Kanban - Version standard</CardTitle>
              <CardDescription>
                Tableau Kanban léger avec glisser-déposer et informations
                détaillées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MiniKanban
                columns={standardColumns}
                onChange={setStandardColumns}
                onItemClick={(item) => setSelectedItem(item)}
                onAddClick={(columnId) =>
                  console.log(`Ajouter à la colonne: ${columnId}`)
                }
              />

              {selectedItem && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-medium mb-2">Élément sélectionné:</h3>
                  <pre className="text-xs bg-background p-3 rounded overflow-auto">
                    {JSON.stringify(selectedItem, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simplified" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mini-Kanban - Version ultra-simplifiée</CardTitle>
              <CardDescription>
                Version minimaliste pour les interfaces compactes ou mobiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MiniKanban
                columns={simplifiedColumns}
                onChange={setSimplifiedColumns}
                onItemClick={(item) => setSelectedItem(item)}
                simplified={true}
                maxHeight="300px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intégration du composant</CardTitle>
              <CardDescription>
                Comment utiliser le Mini-Kanban dans votre application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Installation</h3>
                  <div className="bg-black text-white p-4 rounded-md font-mono text-sm mb-4 relative">
                    <div className="flex items-center justify-between">
                      <code>npm install @crm-components/mini-kanban</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 absolute right-2 top-2"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Utilisation basique
                  </h3>
                  <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-x-auto relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 absolute right-2 top-2"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <pre>{`import { MiniKanban, createMiniKanbanColumn, createMiniKanbanItem } from '@crm-components/mini-kanban';

// Définir les colonnes et les tâches
const columns = [
  createMiniKanbanColumn("À faire", [
    createMiniKanbanItem("Première tâche", { priority: "high" }),
    createMiniKanbanItem("Deuxième tâche", { priority: "medium" })
  ], "#e11d48"),
  createMiniKanbanColumn("En cours", [], "#8b5cf6"),
  createMiniKanbanColumn("Terminé", [], "#10b981")
];

// Composant avec Mini-Kanban
export default function MyKanbanBoard() {
  const [boardColumns, setBoardColumns] = useState(columns);
  
  return (
    <MiniKanban 
      columns={boardColumns}
      onChange={setBoardColumns}
      onItemClick={(item) => console.log('Item cliqué:', item)}
      onAddClick={(columnId) => console.log('Ajouter à la colonne:', columnId)}
    />
  );
}`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Options de personnalisation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">simplified</h4>
                      <p className="text-sm text-muted-foreground">
                        Mode simplifié sans description ni boutons
                        supplémentaires
                      </p>
                      <code className="text-xs bg-muted p-1 rounded mt-1">
                        simplified={"{true}"}
                      </code>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">maxHeight</h4>
                      <p className="text-sm text-muted-foreground">
                        Hauteur maximale du tableau avec défilement
                      </p>
                      <code className="text-xs bg-muted p-1 rounded mt-1">
                        maxHeight="300px"
                      </code>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">disableDragDrop</h4>
                      <p className="text-sm text-muted-foreground">
                        Désactiver la fonctionnalité de glisser-déposer
                      </p>
                      <code className="text-xs bg-muted p-1 rounded mt-1">
                        disableDragDrop={"{true}"}
                      </code>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">onItemClick</h4>
                      <p className="text-sm text-muted-foreground">
                        Callback lors du clic sur un élément
                      </p>
                      <code className="text-xs bg-muted p-1 rounded mt-1">
                        onItemClick={"{handleItemClick}"}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
