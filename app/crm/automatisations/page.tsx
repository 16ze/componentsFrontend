import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  ChevronLeft,
  Code,
  ExternalLink,
  Plus,
  Play,
  User,
  Filter,
  Clock,
  Mail,
} from "lucide-react";
import {
  AutomationBuilder,
  AutomationNode,
} from "@/components/crm/AutomationBuilder/AutomationBuilder";
import { Edge } from "reactflow";

// Données de démonstration pour un workflow prédéfini
const demoWorkflow: { nodes: AutomationNode[]; edges: Edge[] } = {
  nodes: [
    {
      id: "contact-created-1",
      type: "trigger",
      position: { x: 100, y: 100 },
      data: {
        label: "Nouveau contact créé",
        description: "Déclenché quand un nouveau contact est ajouté au CRM",
        type: "trigger",
        icon: <User className="w-4 h-4" />,
        config: {
          name: "Déclencheur nouveau prospect",
          source: "website",
        },
      },
    },
    {
      id: "condition-property-1",
      type: "condition",
      position: { x: 100, y: 250 },
      data: {
        label: "Condition sur propriété",
        description: "Vérifier la valeur d'une propriété du contact",
        type: "condition",
        icon: <Filter className="w-4 h-4" />,
        config: {
          field: "segment",
          operator: "equals",
          value: "Prospect",
        },
      },
    },
    {
      id: "delay-fixed-1",
      type: "delay",
      position: { x: 100, y: 400 },
      data: {
        label: "Délai fixe",
        description: "Attendre un délai fixe avant de continuer",
        type: "delay",
        icon: <Clock className="w-4 h-4" />,
        config: {
          delayType: "days",
          value: "2",
        },
      },
    },
    {
      id: "send-email-1",
      type: "action",
      position: { x: 100, y: 550 },
      data: {
        label: "Envoyer un email",
        description: "Envoyer un email personnalisé au contact",
        type: "action",
        icon: <Mail className="w-4 h-4" />,
        config: {
          template: "follow-up",
          subject: "Suivi de votre intérêt pour nos services",
        },
      },
    },
  ],
  edges: [
    {
      id: "edge-1",
      source: "contact-created-1",
      target: "condition-property-1",
      animated: true,
      style: { strokeWidth: 2, stroke: "#64748b" },
    },
    {
      id: "edge-2",
      source: "condition-property-1",
      target: "delay-fixed-1",
      animated: true,
      style: { strokeWidth: 2, stroke: "#64748b" },
    },
    {
      id: "edge-3",
      source: "delay-fixed-1",
      target: "send-email-1",
      animated: true,
      style: { strokeWidth: 2, stroke: "#64748b" },
    },
  ],
};

// Liste des automatisations d'exemple
const automationTemplates = [
  {
    id: "welcome-sequence",
    title: "Séquence de bienvenue",
    description:
      "Envoi automatique d'emails de bienvenue espacés dans le temps",
    category: "Onboarding",
    stages: [
      "Nouveau contact",
      "Email 1",
      "Délai 3 jours",
      "Email 2",
      "Délai 5 jours",
      "Email 3",
    ],
  },
  {
    id: "lead-scoring",
    title: "Scoring de leads",
    description: "Attribution de points aux leads selon leurs interactions",
    category: "Qualification",
    stages: [
      "Visite page",
      "Téléchargement",
      "Formulaire",
      "Scoring",
      "Notification",
    ],
  },
  {
    id: "abandoned-cart",
    title: "Panier abandonné",
    description: "Relance automatique des clients ayant abandonné leur panier",
    category: "E-commerce",
    stages: [
      "Panier abandonné",
      "Délai 24h",
      "Email relance",
      "Délai 3 jours",
      "Offre spéciale",
    ],
  },
  {
    id: "deal-nurturing",
    title: "Nurturing d'opportunités",
    description: "Suivi automatisé des opportunités en fonction du pipeline",
    category: "Ventes",
    stages: [
      "Nouvelle opportunité",
      "Envoi documentation",
      "Notification commerciale",
      "Tâche de suivi",
    ],
  },
];

export default function AutomationsPage() {
  // Simulation d'une fonction pour sauvegarder un workflow
  const handleSaveWorkflow = (nodes: any, edges: any) => {
    console.log("Workflow sauvegardé:", { nodes, edges });
    // Ici vous implémenteriez la sauvegarde réelle vers votre backend
  };

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
          <h1 className="text-3xl font-bold">Automatisations</h1>
          <p className="text-muted-foreground">
            Créez et gérez vos workflows d'automatisation avec notre éditeur
            visuel
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link
              href="/crm/documentation/components/automation-builder"
              className="flex items-center"
            >
              <Code className="mr-2 h-4 w-4" />
              Documentation
            </Link>
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle automatisation
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder">
        <TabsList className="mb-6">
          <TabsTrigger value="builder">Éditeur de workflow</TabsTrigger>
          <TabsTrigger value="templates">Modèles prédéfinis</TabsTrigger>
          <TabsTrigger value="active">Automatisations actives</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Éditeur d'automatisation</CardTitle>
              <CardDescription>
                Créez un workflow personnalisé en glissant-déposant les éléments
                depuis la barre latérale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomationBuilder
                initialNodes={demoWorkflow.nodes}
                initialEdges={demoWorkflow.edges}
                onSave={handleSaveWorkflow}
              />
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              <p>
                Conseil: commencez par un déclencheur, puis ajoutez des
                conditions, délais et actions.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {automationTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {template.title}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {template.category}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center overflow-x-auto pb-2">
                    {template.stages.map((stage, index) => (
                      <div key={index} className="flex items-center">
                        <div className="bg-muted px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                          {stage}
                        </div>
                        {index < template.stages.length - 1 && (
                          <div className="w-4 h-px bg-muted-foreground/30 mx-1"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={`/crm/automatisations/templates/${template.id}`}
                    >
                      Détails
                    </Link>
                  </Button>
                  <Button size="sm">Utiliser ce modèle</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automatisations actives</CardTitle>
              <CardDescription>
                Workflows actuellement en cours d'exécution dans votre CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Nom
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Déclencheur
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Étapes
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 text-sm">
                        Séquence de bienvenue
                      </td>
                      <td className="px-4 py-3 text-sm">Nouveau contact</td>
                      <td className="px-4 py-3 text-sm">4 étapes</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">
                        Relance clients inactifs
                      </td>
                      <td className="px-4 py-3 text-sm">
                        30 jours sans activité
                      </td>
                      <td className="px-4 py-3 text-sm">3 étapes</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          En pause
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center py-8">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer une nouvelle automatisation
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
