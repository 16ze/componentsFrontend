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
import { Automation, IntegrationStatus } from "./types";
import { Search, Play, Pause, Settings } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Données fictives pour démonstration
const demoAutomations: Automation[] = [
  {
    id: "1",
    nom: "Synchronisation quotidienne des contacts",
    description:
      "Importe les nouveaux contacts depuis le CRM vers la base de données locale",
    active: true,
    trigger: {
      type: "schedule",
      configuration: { frequency: "daily", time: "02:00" },
    },
    actions: [
      {
        type: "sync_contacts",
        configuration: { source: "crm", destination: "local_db" },
      },
    ],
    dateCreation: "2023-05-10T09:00:00Z",
    dateMiseAJour: "2023-06-15T14:30:00Z",
    derniereExecution: {
      date: "2023-06-25T02:00:00Z",
      statut: "success",
      message: "Synchronisation réussie - 15 contacts importés",
    },
  },
  {
    id: "2",
    nom: "Notification de nouvelles opportunités",
    description:
      "Envoie une notification quand une nouvelle opportunité est créée",
    active: true,
    trigger: {
      type: "event",
      configuration: { event: "opportunity_created" },
    },
    actions: [
      {
        type: "send_notification",
        configuration: { channel: "email", recipients: ["sales@example.com"] },
      },
    ],
    dateCreation: "2023-04-20T10:15:00Z",
    dateMiseAJour: "2023-04-20T10:15:00Z",
    derniereExecution: {
      date: "2023-06-24T16:45:00Z",
      statut: "success",
      message: "Notification envoyée",
    },
  },
  {
    id: "3",
    nom: "Mise à jour automatique des prix",
    description:
      "Met à jour les prix des produits en fonction des taux de change",
    active: false,
    trigger: {
      type: "schedule",
      configuration: { frequency: "weekly", day: "monday", time: "06:00" },
    },
    actions: [
      {
        type: "update_prices",
        configuration: { currency: "EUR", adjustment: "exchange_rate" },
      },
    ],
    dateCreation: "2023-03-05T08:30:00Z",
    dateMiseAJour: "2023-05-12T11:20:00Z",
    derniereExecution: {
      date: "2023-05-12T11:20:00Z",
      statut: "error",
      message: "Erreur API taux de change",
    },
  },
  {
    id: "4",
    nom: "Webhook commandes e-commerce",
    description:
      "Intégration avec la plateforme e-commerce pour les nouvelles commandes",
    active: true,
    trigger: {
      type: "webhook",
      configuration: {
        endpoint: "/api/webhooks/ecommerce",
        secret: "sha256_hash",
      },
    },
    actions: [
      {
        type: "create_order",
        configuration: { target: "erp", mapping: "standard" },
      },
    ],
    dateCreation: "2023-02-18T13:40:00Z",
    dateMiseAJour: "2023-06-10T09:15:00Z",
    derniereExecution: {
      date: "2023-06-26T10:30:00Z",
      statut: "success",
      message: "Commande #12345 créée",
    },
  },
];

export default function AutomationList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Filtrage des automatisations
  const filteredAutomations = useMemo(() => {
    return demoAutomations.filter((automation) => {
      // Filtre de recherche
      const matchesSearch =
        searchTerm === "" ||
        automation.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        automation.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par statut
      const matchesStatus =
        statusFilter === "" ||
        (statusFilter === "active" && automation.active) ||
        (statusFilter === "inactive" && !automation.active);

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Fonction pour formatter les dates
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy à HH:mm", { locale: fr });
  };

  // Affichage du type de déclencheur
  const getTriggerTypeDisplay = (triggerType: string) => {
    switch (triggerType) {
      case "schedule":
        return "Planifié";
      case "event":
        return "Événement";
      case "webhook":
        return "Webhook";
      case "manual":
        return "Manuel";
      default:
        return triggerType;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Automatisations</h1>
        <Button>Nouvelle Automatisation</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Recherche */}
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Rechercher une automatisation..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtre par statut */}
        <div className="flex">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des automatisations */}
      {filteredAutomations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Aucune automatisation trouvée</p>
          <Button>Créer une automatisation</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAutomations.map((automation) => (
            <Card
              key={automation.id}
              className={`transition-all hover:shadow-md ${
                !automation.active ? "opacity-70" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{automation.nom}</CardTitle>
                    <CardDescription>{automation.description}</CardDescription>
                  </div>
                  <Badge variant={automation.active ? "success" : "secondary"}>
                    {automation.active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Type:</span>
                  <span className="text-sm">
                    {getTriggerTypeDisplay(automation.trigger.type)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Actions:</span>
                  <span className="text-sm">{automation.actions.length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Créée le:</span>
                  <span className="text-sm">
                    {formatDate(automation.dateCreation)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col">
                {automation.derniereExecution ? (
                  <div className="w-full mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Dernière exécution:</span>
                      <Badge
                        variant={
                          automation.derniereExecution.statut === "success"
                            ? "success"
                            : automation.derniereExecution.statut === "warning"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {automation.derniereExecution.statut}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {automation.derniereExecution.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(automation.derniereExecution.date)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-2">Jamais exécuté</p>
                )}

                <div className="flex justify-between w-full pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-1/2 mr-1">
                    <Settings className="h-4 w-4 mr-1" />
                    Configurer
                  </Button>
                  {automation.active ? (
                    <Button variant="outline" size="sm" className="w-1/2 ml-1">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="w-1/2 ml-1">
                      <Play className="h-4 w-4 mr-1" />
                      Activer
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
