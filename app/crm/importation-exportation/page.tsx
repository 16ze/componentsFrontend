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
  ContactImportExport,
  ContactField,
} from "@/components/crm/ContactImportExport/ContactImportExport";
import Link from "next/link";
import { ChevronLeft, Code, ExternalLink } from "lucide-react";

// Définition des champs pour l'exemple
const contactFields: ContactField[] = [
  { id: "firstName", label: "Prénom", required: true },
  { id: "lastName", label: "Nom", required: true },
  { id: "email", label: "Email", required: true, type: "email" },
  { id: "phone", label: "Téléphone", type: "phone" },
  { id: "company", label: "Entreprise" },
  { id: "position", label: "Poste" },
  {
    id: "source",
    label: "Source",
    type: "select",
    options: ["Site web", "Référence", "LinkedIn", "Autre"],
  },
  { id: "lastContact", label: "Dernier contact", type: "date" },
  {
    id: "status",
    label: "Statut",
    type: "select",
    options: ["Actif", "Inactif", "Prospect", "Client"],
  },
  { id: "score", label: "Score", type: "number" },
];

// Données d'exemple pour l'exportation
const sampleData = [
  {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    phone: "+33 6 12 34 56 78",
    company: "Société ABC",
    position: "Directeur Marketing",
    source: "LinkedIn",
    lastContact: new Date("2023-06-15"),
    status: "Client",
    score: 85,
  },
  {
    firstName: "Marie",
    lastName: "Lambert",
    email: "marie.lambert@example.com",
    phone: "+33 7 23 45 67 89",
    company: "Entreprise XYZ",
    position: "Responsable IT",
    source: "Site web",
    lastContact: new Date("2023-05-20"),
    status: "Prospect",
    score: 65,
  },
  {
    firstName: "Pierre",
    lastName: "Martin",
    email: "pierre.martin@example.com",
    phone: "+33 6 34 56 78 90",
    company: "Tech Solutions",
    position: "CEO",
    source: "Référence",
    lastContact: new Date("2023-07-05"),
    status: "Client",
    score: 92,
  },
  {
    firstName: "Sophie",
    lastName: "Dubois",
    email: "sophie.dubois@example.com",
    phone: "+33 7 45 67 89 01",
    company: "Agence Digitale",
    position: "Designer UX",
    source: "Site web",
    lastContact: new Date("2023-04-10"),
    status: "Inactif",
    score: 45,
  },
  {
    firstName: "Thomas",
    lastName: "Petit",
    email: "thomas.petit@example.com",
    phone: "+33 6 56 78 90 12",
    company: "Consulting Group",
    position: "Consultant Senior",
    source: "LinkedIn",
    lastContact: new Date("2023-06-22"),
    status: "Actif",
    score: 78,
  },
];

export default function ImportExportPage() {
  // Simulation d'une fonction d'import
  const handleImport = async (
    data: any[],
    mappings: Record<string, string>
  ) => {
    console.log("Données importées:", data);
    console.log("Mappages:", mappings);

    // Simuler un délai de traitement
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simuler une vérification des données
    const errors = [];
    for (const item of data) {
      // Vérifier email si mappé
      if (
        mappings.email &&
        (!item[mappings.email] || !item[mappings.email].includes("@"))
      ) {
        errors.push(
          `Email invalide pour une entrée: ${item[mappings.email] || "vide"}`
        );
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: `Erreurs dans les données: ${errors.slice(0, 3).join(", ")}${
          errors.length > 3 ? ` et ${errors.length - 3} autres` : ""
        }`,
      };
    }

    return {
      success: true,
      message: `${data.length} contacts importés avec succès`,
    };
  };

  // Simulation d'une fonction d'export
  const handleExport = async () => {
    // Simuler un délai de récupération des données
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Retourner les données d'exemple
    return sampleData;
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
          <h1 className="text-3xl font-bold">Importation & Exportation</h1>
          <p className="text-muted-foreground">
            Gestion des imports et exports de contacts avec mappage de champs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link
              href="/crm/documentation/components/import-export"
              className="flex items-center"
            >
              <Code className="mr-2 h-4 w-4" />
              Documentation
            </Link>
          </Button>
          <Button asChild>
            <Link href="/crm/clients" className="flex items-center">
              <ExternalLink className="mr-2 h-4 w-4" />
              Gestion des contacts
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="demo">
        <TabsList className="mb-6">
          <TabsTrigger value="demo">Démo</TabsTrigger>
          <TabsTrigger value="integration">Intégration</TabsTrigger>
          <TabsTrigger value="api">API du composant</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Démonstration du composant</CardTitle>
              <CardDescription>
                Testez les fonctionnalités d'importation et d'exportation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactImportExport
                fields={contactFields}
                onImport={handleImport}
                onExport={handleExport}
                exportFileName="demo-contacts-export.xlsx"
                sampleData={sampleData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intégration du composant</CardTitle>
              <CardDescription>
                Comment utiliser le composant dans votre application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Installation</h3>
                  <div className="bg-black text-white p-4 rounded-md font-mono text-sm mb-4">
                    <code>
                      npm install @crm-components/contact-import-export
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Utilisation basique
                  </h3>
                  <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>{`import { ContactImportExport } from '@crm-components/contact-import-export';

// Définition des champs
const fields = [
  { id: "firstName", label: "Prénom", required: true },
  { id: "lastName", label: "Nom", required: true },
  { id: "email", label: "Email", required: true, type: "email" },
  { id: "phone", label: "Téléphone", type: "phone" }
];

// Composant avec importation/exportation
export default function ContactsPage() {
  const handleImport = async (data, mappings) => {
    try {
      // Traiter les données importées
      await api.contacts.importBulk(data, mappings);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || "Erreur lors de l'import" 
      };
    }
  };
  
  const handleExport = async () => {
    // Récupérer les données à exporter
    const contacts = await api.contacts.getAll();
    return contacts;
  };
  
  return (
    <ContactImportExport 
      fields={fields}
      onImport={handleImport}
      onExport={handleExport}
      exportFileName="mes-contacts.xlsx"
    />
  );
}`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Cas d'utilisation avancés
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">
                          Import avec validation personnalisée
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">{`const validateContact = (contact) => {
  const errors = [];
  
  if (contact.email && !isValidEmail(contact.email)) {
    errors.push("Email invalide");
  }
  
  if (contact.phone && !isValidPhone(contact.phone)) {
    errors.push("Téléphone invalide");
  }
  
  return errors;
};

const handleImport = async (data, mappings) => {
  const processedData = data.map(item => {
    // Transformer les données selon le mapping
    const contact = {};
    Object.entries(mappings).forEach(([fieldId, headerName]) => {
      contact[fieldId] = item[headerName];
    });
    
    // Valider
    const errors = validateContact(contact);
    return { ...contact, _valid: errors.length === 0, _errors: errors };
  });
  
  // Filtrer les contacts valides
  const validContacts = processedData.filter(c => c._valid);
  
  if (validContacts.length < processedData.length) {
    return {
      success: false,
      message: \`\${processedData.length - validContacts.length} contacts avec erreurs\`
    };
  }
  
  // Importer les contacts valides
  await api.contacts.importBulk(validContacts);
  return { success: true };
};`}</pre>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">
                          Export avec filtres
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">{`const [filters, setFilters] = useState({
  status: "active",
  dateRange: { start: null, end: null }
});

const handleExport = async () => {
  // Récupérer les contacts filtrés
  const filteredContacts = await api.contacts.getAll({
    filters: filters
  });
  
  // Transformer les données si nécessaire
  return filteredContacts.map(contact => ({
    ...contact,
    fullName: \`\${contact.firstName} \${contact.lastName}\`,
    // Autres transformations...
  }));
};`}</pre>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API du composant</CardTitle>
              <CardDescription>
                Documentation des propriétés et hooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Propriétés</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Nom
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Requis
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">
                            fields
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            ContactField[]
                          </td>
                          <td className="px-4 py-3 text-sm">Oui</td>
                          <td className="px-4 py-3 text-sm">
                            Définition des champs de contacts
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">
                            onImport
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            Function
                          </td>
                          <td className="px-4 py-3 text-sm">Non</td>
                          <td className="px-4 py-3 text-sm">
                            Callback appelé lors de l'import
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">
                            onExport
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            Function
                          </td>
                          <td className="px-4 py-3 text-sm">Non</td>
                          <td className="px-4 py-3 text-sm">
                            Fonction pour récupérer les données à exporter
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">
                            exportFileName
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            string
                          </td>
                          <td className="px-4 py-3 text-sm">Non</td>
                          <td className="px-4 py-3 text-sm">
                            Nom du fichier d'export (défaut:
                            contacts-export.xlsx)
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">
                            sampleData
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">any[]</td>
                          <td className="px-4 py-3 text-sm">Non</td>
                          <td className="px-4 py-3 text-sm">
                            Données d'exemple pour l'export en mode démo
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">
                            isLoading
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            boolean
                          </td>
                          <td className="px-4 py-3 text-sm">Non</td>
                          <td className="px-4 py-3 text-sm">
                            État de chargement
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Type ContactField
                  </h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Propriété
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">id</td>
                          <td className="px-4 py-3 text-sm font-mono">
                            string
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Identifiant unique du champ
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">
                            label
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            string
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Libellé du champ affiché
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">
                            required
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            boolean
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Si le champ est obligatoire
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">
                            type
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            string
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Type de champ (text, email, phone, date, number,
                            select)
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium">
                            options
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            string[]
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Options pour les champs de type select
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
