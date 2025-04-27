import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code,
  FileSpreadsheet,
  GitBranch,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function CRMDocumentation() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Documentation CRM</h1>

      <Tabs defaultValue="guides">
        <TabsList className="mb-6">
          <TabsTrigger value="guides">Guides de démarrage</TabsTrigger>
          <TabsTrigger value="integration">Exemples d'intégration</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="patterns">Patrons d'implémentation</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guideModules.map((module) => (
              <Card key={module.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {module.icon}
                    {module.title}
                  </CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={module.href}>
                    <Button variant="outline" className="w-full">
                      Commencer <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {integrationLevels.map((level) => (
              <Card key={level.title} className={level.className}>
                <CardHeader>
                  <CardTitle>{level.title}</CardTitle>
                  <CardDescription>{level.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={level.href}>
                    <Button variant={level.buttonVariant} className="w-full">
                      Voir l'exemple
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Guides d'intégration complets</CardTitle>
              <CardDescription>
                Découvrez comment intégrer nos composants CRM dans votre
                application existante
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrationGuides.map((guide) => (
                <Link key={guide.title} href={guide.href}>
                  <Button variant="outline" className="w-full justify-start">
                    {guide.icon}
                    <div className="ml-2 text-left">
                      <div className="font-semibold">{guide.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {guide.description}
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture">
          <Card>
            <CardHeader>
              <CardTitle>Architecture du système CRM</CardTitle>
              <CardDescription>
                Aperçu visuel des composants et de leur interaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-8 rounded-lg text-center">
                [Diagramme d'architecture à venir]
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline">Télécharger en PDF</Button>
                <Button variant="outline">Voir Mermaid Source</Button>
                <Button variant="outline">Exporter en PNG</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>Documentation API</CardTitle>
              <CardDescription>
                Explorez notre API REST avec des exemples interactifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Points de terminaison principaux
                </h3>
                <div className="space-y-2">
                  {apiEndpoints.map((endpoint) => (
                    <div key={endpoint.path} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${endpoint.methodColor}`}
                          >
                            {endpoint.method}
                          </span>
                          <code className="ml-2 font-mono">
                            {endpoint.path}
                          </code>
                        </div>
                        <Button variant="ghost" size="sm">
                          Essayer
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {endpoint.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline">Documentation API complète</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Patrons d'implémentation courants</CardTitle>
              <CardDescription>
                Solutions éprouvées pour les cas d'utilisation fréquents
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {implementationPatterns.map((pattern) => (
                <Card key={pattern.title}>
                  <CardHeader>
                    <CardTitle>{pattern.title}</CardTitle>
                    <CardDescription>{pattern.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={pattern.href}>Voir le code source</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const guideModules = [
  {
    title: "Gestion des contacts",
    description:
      "Apprendre à gérer efficacement votre base de contacts clients",
    href: "/crm/documentation/guides/contacts",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Pipeline de vente",
    description: "Configuration et gestion de votre pipeline commercial",
    href: "/crm/documentation/guides/pipeline",
    icon: <GitBranch className="h-4 w-4" />,
  },
  {
    title: "Tableaux de bord",
    description: "Création et personnalisation de vos tableaux de bord",
    href: "/crm/documentation/guides/dashboards",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    title: "Automatisations",
    description: "Mise en place des règles d'automatisation et workflows",
    href: "/crm/documentation/guides/automation",
    icon: <RefreshCw className="h-4 w-4" />,
  },
  {
    title: "Reporting",
    description: "Création et configuration des rapports personnalisés",
    href: "/crm/documentation/guides/reporting",
    icon: <FileSpreadsheet className="h-4 w-4" />,
  },
  {
    title: "Intégrations",
    description: "Connexion avec vos outils et services existants",
    href: "/crm/documentation/guides/integrations",
    icon: <Code className="h-4 w-4" />,
  },
];

const integrationLevels = [
  {
    title: "Intégration Basique",
    description: "Pour les projets simples avec fonctionnalités essentielles",
    href: "/crm/documentation/integration/basic",
    buttonVariant: "outline",
    className: "border-blue-200 bg-blue-50",
  },
  {
    title: "Intégration Médium",
    description: "Pour les entreprises en croissance avec besoins modérés",
    href: "/crm/documentation/integration/medium",
    buttonVariant: "secondary",
    className: "border-purple-200 bg-purple-50",
  },
  {
    title: "Intégration Avancée",
    description: "Pour les équipes avec besoins complexes et volume important",
    href: "/crm/documentation/integration/advanced",
    buttonVariant: "default",
    className: "border-green-200 bg-green-50",
  },
];

const integrationGuides = [
  {
    title: "Intégration avec React",
    description: "Utilisez nos composants dans votre application React",
    href: "/crm/documentation/integration/react",
    icon: <Code className="h-4 w-4" />,
  },
  {
    title: "Intégration avec Vue.js",
    description: "Adaptez nos composants pour Vue.js",
    href: "/crm/documentation/integration/vue",
    icon: <Code className="h-4 w-4" />,
  },
  {
    title: "Intégration Backend Node.js",
    description: "Connectez vos services backend à notre API",
    href: "/crm/documentation/integration/node",
    icon: <Code className="h-4 w-4" />,
  },
  {
    title: "Intégration Backend PHP",
    description: "Utilisez nos connecteurs avec PHP/Laravel",
    href: "/crm/documentation/integration/php",
    icon: <Code className="h-4 w-4" />,
  },
];

const apiEndpoints = [
  {
    method: "GET",
    path: "/api/crm/contacts",
    description: "Récupérer la liste des contacts avec pagination et filtrage",
    methodColor: "bg-blue-100 text-blue-800",
  },
  {
    method: "POST",
    path: "/api/crm/opportunities",
    description: "Créer une nouvelle opportunité de vente",
    methodColor: "bg-green-100 text-green-800",
  },
  {
    method: "PUT",
    path: "/api/crm/deals/:id",
    description: "Mettre à jour les détails d'une affaire existante",
    methodColor: "bg-amber-100 text-amber-800",
  },
  {
    method: "DELETE",
    path: "/api/crm/tasks/:id",
    description: "Supprimer une tâche spécifique",
    methodColor: "bg-red-100 text-red-800",
  },
];

const implementationPatterns = [
  {
    title: "Gestion d'état avec Zustand",
    description: "Implémentation optimale pour la gestion d'état de contacts",
    href: "/crm/documentation/patterns/state-management",
  },
  {
    title: "Architecture de données",
    description:
      "Structure de données recommandée pour les clients et opportunités",
    href: "/crm/documentation/patterns/data-architecture",
  },
  {
    title: "Filtrage et recherche",
    description: "Implémentation efficace de filtres et recherche avancée",
    href: "/crm/documentation/patterns/filters",
  },
  {
    title: "Import/Export de données",
    description: "Gestion des imports/exports CSV et Excel",
    href: "/crm/documentation/patterns/import-export",
  },
];
