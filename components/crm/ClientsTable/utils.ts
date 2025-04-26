import {
  Client,
  ClientStatus,
  ClientFilters,
  Contact,
  ExportFormat,
} from "./types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ASSIGNED_USERS } from "./mock-data";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Fonction pour obtenir le contact principal d'un client
export function getPrimaryContact(client: Client): Contact | undefined {
  return client.contacts.find((contact) => contact.type === "primary");
}

// Fonction pour obtenir la couleur du statut
export function getStatusColor(status: ClientStatus): string {
  switch (status) {
    case "lead":
      return "bg-blue-100 text-blue-800";
    case "prospect":
      return "bg-purple-100 text-purple-800";
    case "client":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-amber-100 text-amber-800";
    case "archived":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Obtenir le nom de l'utilisateur assigné
export function getAssignedUserName(userId: string | undefined): string {
  if (!userId) return "Non assigné";
  const user = ASSIGNED_USERS.find((u) => u.id === userId);
  return user ? user.name : "Inconnu";
}

// Formater la valeur du client
export function formatClientValue(value: number): string {
  return formatCurrency(value);
}

// Fonction pour formater la date de dernière activité
export function formatLastActivity(date: Date): string {
  return formatDate(date);
}

// Filtres
export function filterClients(
  clients: Client[],
  filters: ClientFilters
): Client[] {
  return clients.filter((client) => {
    // Filtre par statut
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(client.status)) {
        return false;
      }
    }

    // Filtre par source
    if (filters.source && filters.source.length > 0) {
      if (!filters.source.includes(client.source)) {
        return false;
      }
    }

    // Filtre par assignation
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      if (
        !client.assignedTo ||
        !filters.assignedTo.includes(client.assignedTo)
      ) {
        return false;
      }
    }

    // Filtre par date de création (après)
    if (filters.createdAfter) {
      if (client.createdAt < filters.createdAfter) {
        return false;
      }
    }

    // Filtre par date de création (avant)
    if (filters.createdBefore) {
      if (client.createdAt > filters.createdBefore) {
        return false;
      }
    }

    // Filtre par tags
    if (filters.tags && filters.tags.length > 0) {
      const hasAnyTag = filters.tags.some((tag) => client.tags.includes(tag));
      if (!hasAnyTag) {
        return false;
      }
    }

    return true;
  });
}

// Fonction de recherche
export function searchClients(
  clients: Client[],
  searchQuery: string
): Client[] {
  if (!searchQuery || searchQuery.trim() === "") {
    return clients;
  }

  const query = searchQuery.toLowerCase().trim();

  return clients.filter((client) => {
    // Recherche dans le nom du client
    if (client.name.toLowerCase().includes(query)) {
      return true;
    }

    // Recherche dans le nom de l'entreprise
    if (client.company.toLowerCase().includes(query)) {
      return true;
    }

    // Recherche dans les contacts
    const contactMatch = client.contacts.some(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        (contact.phone && contact.phone.includes(query))
    );
    if (contactMatch) {
      return true;
    }

    // Recherche dans les tags
    const tagMatch = client.tags.some((tag) =>
      tag.toLowerCase().includes(query)
    );
    if (tagMatch) {
      return true;
    }

    // Recherche dans les notes
    if (client.notes && client.notes.toLowerCase().includes(query)) {
      return true;
    }

    return false;
  });
}

// Fonction pour exporter des données
export function exportClientsData(
  clients: Client[],
  format: ExportFormat
): void {
  // Préparer les données pour l'export
  const data = clients.map((client) => {
    const primaryContact = getPrimaryContact(client);
    return {
      Nom: client.name,
      Entreprise: client.company,
      "Email principal": primaryContact?.email || "",
      "Téléphone principal": primaryContact?.phone || "",
      Statut: client.status,
      Valeur: client.value,
      Source: client.source,
      Tags: client.tags.join(", "),
      "Assigné à": getAssignedUserName(client.assignedTo),
      "Dernière activité": formatDate(client.lastActivity),
      "Date d'ajout": formatDate(client.createdAt),
      Notes: client.notes || "",
    };
  });

  switch (format) {
    case "excel":
      exportToExcel(data, "clients-export");
      break;
    case "csv":
      exportToCsv(data, "clients-export");
      break;
    case "pdf":
      exportToPdf(data, "clients-export");
      break;
  }
}

// Export Excel
function exportToExcel(data: any[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

  // Conversion en binaire
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveExcelFile(excelBuffer, `${filename}.xlsx`);
}

function saveExcelFile(buffer: any, filename: string): void {
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  saveAs(blob, filename);
}

// Export CSV
function exportToCsv(data: any[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
}

// Export PDF (ici simplifié - en production, il faudrait utiliser une bibliothèque PDF complète)
function exportToPdf(data: any[], filename: string): void {
  // Simuler l'export PDF
  // En production, utiliser jsPDF ou une autre bibliothèque PDF
  console.log("Export PDF demandé pour", data.length, "clients");
  alert(
    "Fonctionnalité d'export PDF à implémenter avec jsPDF ou une API de génération PDF"
  );
}

// Fonction pour formatter les données à afficher dans le tableau
export function formatClientForTable(client: Client) {
  const primaryContact = getPrimaryContact(client);

  return {
    id: client.id,
    name: client.name,
    company: client.company,
    contactEmail: primaryContact?.email || "",
    contactPhone: primaryContact?.phone || "",
    status: client.status,
    value: client.value,
    formattedValue: formatClientValue(client.value),
    source: client.source,
    tags: client.tags,
    assignedTo: client.assignedTo,
    assignedUserName: getAssignedUserName(client.assignedTo),
    lastActivity: client.lastActivity,
    formattedLastActivity: formatLastActivity(client.lastActivity),
    createdAt: client.createdAt,
    formattedCreatedAt: formatDate(client.createdAt),
    contacts: client.contacts,
    primaryContact: primaryContact,
    hasSecondaryContacts:
      client.contacts.filter((c) => c.type === "secondary").length > 0,
    rawData: client, // Données complètes pour les actions
  };
}
