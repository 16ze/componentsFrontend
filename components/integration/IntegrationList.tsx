"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Integration, IntegrationType, IntegrationStatus } from "./types";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Données fictives pour la démo
const demoIntegrations: Integration[] = [
  {
    id: "1",
    nom: "API CRM",
    description:
      "Intégration avec notre système CRM pour synchroniser les clients",
    type: IntegrationType.API,
    statut: IntegrationStatus.ACTIVE,
    configuration: { endpoint: "https://api.crm.example.com" },
    dateCreation: "2023-05-15T09:30:00Z",
    dateMiseAJour: "2023-06-20T14:45:00Z",
    derniereExecution: {
      date: "2023-06-20T14:45:00Z",
      statut: "success",
      message: "Synchronisation réussie",
    },
  },
  {
    id: "2",
    nom: "Webhook Paiements",
    description: "Réception des notifications de paiement",
    type: IntegrationType.WEBHOOK,
    statut: IntegrationStatus.ACTIVE,
    configuration: { secret: "wh_secret_key" },
    dateCreation: "2023-04-10T11:20:00Z",
    dateMiseAJour: "2023-06-18T08:15:00Z",
    derniereExecution: {
      date: "2023-06-18T08:15:00Z",
      statut: "success",
      message: "Webhook reçu et traité",
    },
  },
  {
    id: "3",
    nom: "Import Email",
    description: "Importation des emails clients pour analyse",
    type: IntegrationType.EMAIL,
    statut: IntegrationStatus.ERREUR,
    configuration: { mailbox: "support@example.com" },
    dateCreation: "2023-03-22T16:40:00Z",
    dateMiseAJour: "2023-06-19T09:50:00Z",
    derniereExecution: {
      date: "2023-06-19T09:50:00Z",
      statut: "error",
      message: "Échec de connexion au serveur mail",
    },
  },
  {
    id: "4",
    nom: "Base de données Legacy",
    description: "Synchronisation avec notre ancien système",
    type: IntegrationType.DATABASE,
    statut: IntegrationStatus.EN_ATTENTE,
    configuration: { host: "db.legacy.internal" },
    dateCreation: "2023-02-05T10:15:00Z",
    dateMiseAJour: "2023-06-15T13:20:00Z",
    derniereExecution: {
      date: "2023-06-15T13:20:00Z",
      statut: "warning",
      message: "Synchronisation partielle - 15 erreurs",
    },
  },
  {
    id: "5",
    nom: "Import Fichiers",
    description: "Importation automatique des fichiers CSV",
    type: IntegrationType.FILE,
    statut: IntegrationStatus.INACTIVE,
    configuration: { path: "/imports/csv" },
    dateCreation: "2023-01-18T13:25:00Z",
    dateMiseAJour: "2023-05-12T16:30:00Z",
    derniereExecution: null,
  },
];

export default function IntegrationList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Filtrer les intégrations
  const filteredIntegrations = useMemo(() => {
    return demoIntegrations.filter((integration) => {
      const matchesSearch =
        searchTerm === "" ||
        integration.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "" || integration.type === typeFilter;
      const matchesStatus =
        statusFilter === "" || integration.statut === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, typeFilter, statusFilter]);

  // Formater une date en format lisible
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy à HH:mm", { locale: fr });
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case IntegrationStatus.ACTIVE:
        return "bg-green-500";
      case IntegrationStatus.INACTIVE:
        return "bg-gray-500";
      case IntegrationStatus.EN_ATTENTE:
        return "bg-yellow-500";
      case IntegrationStatus.ERREUR:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Intégrations</h1>
        <Button variant="default">Nouvelle Intégration</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Rechercher une intégration..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type d'intégration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              {Object.values(IntegrationType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              {Object.values(IntegrationStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ").charAt(0).toUpperCase() +
                    status.replace("_", " ").slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredIntegrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Aucune intégration trouvée</p>
          <Button>Créer une intégration</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => (
            <Card
              key={integration.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/integrations/${integration.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{integration.nom}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(integration.statut)}>
                    {integration.statut
                      .replace("_", " ")
                      .charAt(0)
                      .toUpperCase() +
                      integration.statut.replace("_", " ").slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Type: </span>
                  <span className="text-sm">{integration.type}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Créée le: </span>
                  <span className="text-sm">
                    {formatDate(integration.dateCreation)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Mise à jour: </span>
                  <span className="text-sm">
                    {formatDate(integration.dateMiseAJour)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-gray-500">
                {integration.derniereExecution ? (
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Dernière exécution:</span>
                      <Badge
                        className={getStatusColor(
                          integration.derniereExecution
                            .statut as IntegrationStatus
                        )}
                      >
                        {integration.derniereExecution.statut
                          .charAt(0)
                          .toUpperCase() +
                          integration.derniereExecution.statut.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {integration.derniereExecution.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(integration.derniereExecution.date)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune exécution</p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
