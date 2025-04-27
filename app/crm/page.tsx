import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Book,
  BookMarked,
  FileSpreadsheet,
  Filter,
  Kanban,
  Mail,
  RefreshCw,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";

export default function CRMPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord CRM</h1>
          <p className="text-muted-foreground">
            Gérez vos contacts, opportunités et automatisations depuis une
            interface centralisée
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/crm/documentation">
              <Book className="w-4 h-4 mr-2" />
              Documentation
            </Link>
          </Button>
          <Button asChild>
            <Link href="/crm/clients/new">
              <UserPlus className="w-4 h-4 mr-2" />
              Nouveau contact
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="modules">
        <TabsList className="mb-6">
          <TabsTrigger value="modules">Modules CRM</TabsTrigger>
          <TabsTrigger value="getting-started">Démarrage rapide</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Composants essentiels */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Gestion des contacts
                  </CardTitle>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <CardDescription>
                  Base de contacts simplifiée avec importation/exportation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/crm/clients"
                    className="text-sm text-primary hover:underline"
                  >
                    Liste des contacts
                  </Link>
                  <Link
                    href="/crm/importation-exportation"
                    className="text-sm text-primary hover:underline"
                  >
                    Import/Export CSV et Excel
                  </Link>
                  <Link
                    href="/crm/segmentation"
                    className="text-sm text-primary hover:underline"
                  >
                    Segmentation et filtres
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pipeline de vente</CardTitle>
                  <Kanban className="w-5 h-5 text-primary" />
                </div>
                <CardDescription>
                  Suivi visuel de vos opportunités commerciales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/crm/kanban"
                    className="text-sm text-primary hover:underline"
                  >
                    Tableau Kanban complet
                  </Link>
                  <Link
                    href="/crm/mini-kanban"
                    className="text-sm text-primary hover:underline"
                  >
                    Mini-Kanban simplifié
                  </Link>
                  <Link
                    href="/crm/pipelines"
                    className="text-sm text-primary hover:underline"
                  >
                    Configuration des pipelines
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Automatisations</CardTitle>
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <CardDescription>
                  Workflows et séquences automatisées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/crm/automatisations"
                    className="text-sm text-primary hover:underline"
                  >
                    Éditeur de workflow
                  </Link>
                  <Link
                    href="/crm/sequences-email"
                    className="text-sm text-primary hover:underline"
                  >
                    Séquences d'emails
                  </Link>
                  <Link
                    href="/crm/regles"
                    className="text-sm text-primary hover:underline"
                  >
                    Règles d'automatisation
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Reporting</CardTitle>
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <CardDescription>
                  Tableaux de bord et rapports configurables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/crm/reporting/dashboard"
                    className="text-sm text-primary hover:underline"
                  >
                    Tableau de bord simplifié
                  </Link>
                  <Link
                    href="/crm/reporting/rapports"
                    className="text-sm text-primary hover:underline"
                  >
                    Rapports personnalisés
                  </Link>
                  <Link
                    href="/crm/reporting/previsions"
                    className="text-sm text-primary hover:underline"
                  >
                    Prévisions de vente
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Intégrations</CardTitle>
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <CardDescription>
                  Connecteurs avec outils externes et API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/crm/integrations/email"
                    className="text-sm text-primary hover:underline"
                  >
                    Synchronisation Gmail/Outlook
                  </Link>
                  <Link
                    href="/crm/documentation/api"
                    className="text-sm text-primary hover:underline"
                  >
                    API REST avec exemples
                  </Link>
                  <Link
                    href="/crm/integrations/webhooks"
                    className="text-sm text-primary hover:underline"
                  >
                    Configuration webhooks
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Documentation</CardTitle>
                  <BookMarked className="w-5 h-5 text-primary" />
                </div>
                <CardDescription>
                  Guides d'utilisation et de développement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/crm/documentation/guides/contacts"
                    className="text-sm text-primary hover:underline"
                  >
                    Guide gestion des contacts
                  </Link>
                  <Link
                    href="/crm/documentation/integration/basic"
                    className="text-sm text-primary hover:underline"
                  >
                    Exemple d'intégration basique
                  </Link>
                  <Link
                    href="/crm/documentation/patterns/state-management"
                    className="text-sm text-primary hover:underline"
                  >
                    Patrons d'implémentation
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="getting-started">
          <Card>
            <CardHeader>
              <CardTitle>Démarrage rapide avec le CRM</CardTitle>
              <CardDescription>
                Commencez à utiliser le CRM en quelques étapes simples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Importez vos contacts</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ajoutez vos contacts existants depuis un fichier CSV ou
                      Excel
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/crm/importation-exportation">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Importer des contacts
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">
                      Personnalisez votre pipeline
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Adaptez le tableau Kanban à votre processus de vente
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/crm/mini-kanban">
                        <Kanban className="w-4 h-4 mr-2" />
                        Configurer le Kanban
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">
                      Créez votre première automatisation
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Mettez en place une séquence d'emails automatisée
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/crm/automatisations">
                        <Mail className="w-4 h-4 mr-2" />
                        Créer une automatisation
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Segmentez vos contacts</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Créez des segments basés sur les caractéristiques de vos
                      contacts
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/crm/segmentation">
                        <Filter className="w-4 h-4 mr-2" />
                        Créer des segments
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/crm/documentation/guides/contacts" className="block">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>Guide de gestion des contacts</CardTitle>
                  <CardDescription>
                    Apprenez à gérer efficacement votre base de contacts clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Ce guide couvre:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Import/export de contacts</li>
                      <li>Segmentation automatique</li>
                      <li>Historique des interactions</li>
                      <li>Synchronisation avec Gmail/Outlook</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/crm/documentation/guides/pipeline" className="block">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>Guide du pipeline de vente</CardTitle>
                  <CardDescription>
                    Configuration et gestion de votre pipeline commercial
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Ce guide couvre:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Configuration des étapes de vente</li>
                      <li>Gestion des opportunités</li>
                      <li>Personnalisation du tableau Kanban</li>
                      <li>Suivi des performances</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/crm/documentation/guides/automation" className="block">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>Guide des automatisations</CardTitle>
                  <CardDescription>
                    Mise en place des règles d'automatisation et workflows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Ce guide couvre:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Création de workflows visuels</li>
                      <li>Séquences d'emails automatisées</li>
                      <li>Règles basées sur les événements</li>
                      <li>Attribution de tâches automatique</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/crm/documentation/guides/reporting" className="block">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>Guide de reporting</CardTitle>
                  <CardDescription>
                    Création et configuration des rapports personnalisés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Ce guide couvre:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Tableaux de bord personnalisables</li>
                      <li>Rapports avec filtres avancés</li>
                      <li>Prévisions de vente</li>
                      <li>Exports programmés</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
