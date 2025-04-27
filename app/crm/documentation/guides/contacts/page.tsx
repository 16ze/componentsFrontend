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
import { ChevronLeft, Copy, Play } from "lucide-react";
import Image from "next/image";

export default function ContactsGuide() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Link
          href="/crm/documentation"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à la documentation
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Guide de gestion des contacts</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Apprenez à gérer efficacement votre base de contacts clients avec notre
        module CRM.
      </p>

      <Tabs defaultValue="presentation">
        <TabsList className="mb-6">
          <TabsTrigger value="presentation">Présentation</TabsTrigger>
          <TabsTrigger value="integration">Intégration</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="examples">Exemples d'utilisation</TabsTrigger>
        </TabsList>

        <TabsContent value="presentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Présentation de la gestion des contacts</CardTitle>
              <CardDescription>
                Une vue d'ensemble des fonctionnalités et capacités du module
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted aspect-video rounded-lg flex items-center justify-center">
                [Vidéo de présentation du module]
              </div>

              <h3 className="text-lg font-semibold mt-4">
                Fonctionnalités clés
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestion simplifiée des contacts et entreprises</li>
                <li>
                  Import et export CSV/Excel avec correspondance de champs
                </li>
                <li>
                  Segmentation automatique basée sur des critères
                  personnalisables
                </li>
                <li>Historique complet des interactions avec chaque contact</li>
                <li>Synchronisation bidirectionnelle avec Gmail/Outlook</li>
                <li>Interface responsive adaptée aux mobiles et tablettes</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">
                Pourquoi utiliser notre gestionnaire de contacts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Simplicité</h4>
                  <p className="text-sm text-muted-foreground">
                    Interface intuitive nécessitant très peu de formation
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Gestion efficace de milliers de contacts sans ralentissement
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Flexibilité</h4>
                  <p className="text-sm text-muted-foreground">
                    Personnalisation complète adaptée à vos processus
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intégration du module de contacts</CardTitle>
              <CardDescription>
                Comment ajouter notre gestionnaire de contacts à votre
                application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">Installation</h3>
              <div className="bg-black text-white p-4 rounded-md font-mono text-sm mb-4">
                <div className="flex items-center justify-between">
                  <code>npm install @crm-components/contact-manager</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">
                Intégration basique
              </h3>
              <div className="bg-black text-white p-4 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                <div className="flex items-start justify-between">
                  <pre>{`import { ContactManager } from '@crm-components/contact-manager';

export default function MyContactsPage() {
  return (
    <ContactManager 
      apiEndpoint="/api/contacts"
      onContactSelect={(contact) => console.log('Contact sélectionné:', contact)}
    />
  );
}`}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 flex-shrink-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button asChild>
                  <Link href="/crm/documentation/integration/contacts">
                    Guide d'intégration complet
                    <Play className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du gestionnaire de contacts</CardTitle>
              <CardDescription>
                Personnalisation et configuration du module pour vos besoins
                spécifiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">
                Options de configuration
              </h3>

              <div className="border rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-2">Structure de données</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Définissez la structure de vos contacts avec des champs
                  personnalisés
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
                  <pre>{`// Exemple de configuration pour les champs personnalisés
{
  fields: [
    { id: 'firstName', label: 'Prénom', type: 'text', required: true },
    { id: 'lastName', label: 'Nom', type: 'text', required: true },
    { id: 'company', label: 'Entreprise', type: 'text', required: false },
    { id: 'sector', label: 'Secteur', type: 'select', 
      options: ['Technologie', 'Santé', 'Finance', 'Éducation'] },
    { id: 'budget', label: 'Budget', type: 'number', validation: { min: 0 } },
    { id: 'notes', label: 'Notes', type: 'textarea' }
  ]
}`}</pre>
                </div>
              </div>

              <div className="border rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-2">Intégrations</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Configurez les connexions avec des services externes
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <div className="mr-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      G
                    </div>
                    Configurer Google Contacts
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <div className="mr-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                      O
                    </div>
                    Configurer Microsoft Outlook
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Permissions et accès</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Définissez qui peut voir et modifier les différents contacts
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
                  <pre>{`// Configuration des permissions
{
  roles: {
    admin: { canCreate: true, canEdit: true, canDelete: true, canExport: true },
    manager: { canCreate: true, canEdit: true, canDelete: false, canExport: true },
    user: { canCreate: true, canEdit: ['ownedContacts'], canDelete: false, canExport: false }
  }
}`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exemples d'utilisation</CardTitle>
              <CardDescription>
                Cas d'utilisation concrets et exemples de code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Exemple 1: Liste de contacts filtrée
                  </h3>
                  <div className="bg-muted p-4 rounded-lg mb-2">
                    [Capture d'écran d'une liste de contacts filtrée]
                  </div>
                  <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>{`import { ContactList, useContactFilters } from '@crm-components/contact-manager';

export default function FilteredContacts() {
  const { filters, setFilter } = useContactFilters({
    defaultFilters: { status: 'active', sector: 'technology' }
  });
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setFilter('status', 'active')}>Actifs</Button>
        <Button onClick={() => setFilter('status', 'inactive')}>Inactifs</Button>
      </div>
      
      <ContactList 
        filters={filters}
        columns={['name', 'email', 'company', 'lastContact']}
        onContactClick={(contact) => handleContactSelect(contact)}
      />
    </div>
  );
}`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Exemple 2: Formulaire d'ajout de contact
                  </h3>
                  <div className="bg-muted p-4 rounded-lg mb-2">
                    [Capture d'écran d'un formulaire d'ajout de contact]
                  </div>
                  <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>{`import { ContactForm, useContactMutation } from '@crm-components/contact-manager';

export default function AddContactForm() {
  const { mutate: addContact, isLoading, error } = useContactMutation();
  
  const handleSubmit = (formData) => {
    addContact(formData, {
      onSuccess: () => {
        showNotification('Contact ajouté avec succès');
        router.push('/contacts');
      }
    });
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Ajouter un contact</h2>
      <ContactForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        customFields={[
          // Champs personnalisés supplémentaires
          { id: 'source', label: 'Source', type: 'select', 
            options: ['Site web', 'Référence', 'LinkedIn', 'Autre'] }
        ]}
      />
    </div>
  );
}`}</pre>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" asChild>
                  <Link href="/crm/documentation/examples">
                    Voir tous les exemples
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/crm/documentation/playground">
                    Essayer en direct
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
