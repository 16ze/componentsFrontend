import {
  Activity,
  Opportunity,
  Document,
  Note,
  OpportunityStatus,
  ActivityType,
  ScoreLevel,
  ClientScore,
  ClientMetrics,
} from "./types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { USERS } from "./mock-data";

// Obtenir la couleur du score client
export function getScoreColor(level: ScoreLevel): string {
  switch (level) {
    case "low":
      return "text-destructive";
    case "medium":
      return "text-warning";
    case "high":
      return "text-success";
    case "excellent":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
}

// Traduire le niveau de score
export function getScoreLabel(level: ScoreLevel): string {
  switch (level) {
    case "low":
      return "Faible potentiel";
    case "medium":
      return "Potentiel moyen";
    case "high":
      return "Haut potentiel";
    case "excellent":
      return "Client premium";
    default:
      return "Non évalué";
  }
}

// Obtenir la couleur du statut d'opportunité
export function getOpportunityStatusColor(status: OpportunityStatus): string {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "qualified":
      return "bg-cyan-100 text-cyan-800";
    case "proposal":
      return "bg-amber-100 text-amber-800";
    case "negotiation":
      return "bg-orange-100 text-orange-800";
    case "won":
      return "bg-green-100 text-green-800";
    case "lost":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Traduire le statut d'opportunité
export function getOpportunityStatusLabel(status: OpportunityStatus): string {
  const labels: Record<OpportunityStatus, string> = {
    new: "Nouveau",
    qualified: "Qualifié",
    proposal: "Proposition",
    negotiation: "Négociation",
    won: "Gagné",
    lost: "Perdu",
  };
  return labels[status];
}

// Obtenir l'icône et la couleur du type d'activité
export function getActivityTypeInfo(type: ActivityType): {
  icon: string;
  color: string;
} {
  switch (type) {
    case "call":
      return { icon: "phone", color: "text-blue-500" };
    case "email":
      return { icon: "mail", color: "text-purple-500" };
    case "meeting":
      return { icon: "users", color: "text-green-500" };
    case "note":
      return { icon: "clipboard", color: "text-amber-500" };
    case "task":
      return { icon: "check-square", color: "text-gray-500" };
    default:
      return { icon: "activity", color: "text-gray-500" };
  }
}

// Traduire le type d'activité
export function getActivityTypeLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    call: "Appel",
    email: "Email",
    meeting: "Réunion",
    note: "Note",
    task: "Tâche",
  };
  return labels[type];
}

// Formater la taille de fichier
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Obtenir l'icône pour un type de document
export function getDocumentIcon(mimeType: string): string {
  if (mimeType.includes("pdf")) {
    return "file-text";
  } else if (mimeType.includes("word") || mimeType.includes("document")) {
    return "file-text";
  } else if (mimeType.includes("excel") || mimeType.includes("sheet")) {
    return "file-spreadsheet";
  } else if (mimeType.includes("image")) {
    return "image";
  } else if (mimeType.includes("video")) {
    return "video";
  } else if (mimeType.includes("audio")) {
    return "music";
  } else if (mimeType.includes("zip") || mimeType.includes("compressed")) {
    return "archive";
  } else {
    return "file";
  }
}

// Formater le contenu d'une note avec les mentions
export function formatNoteWithMentions(
  content: string,
  mentions?: string[]
): JSX.Element[] {
  if (!mentions || mentions.length === 0) {
    return [<span key="content">{content}</span>];
  }

  const parts: JSX.Element[] = [];
  let lastIndex = 0;

  // Recherche des mentions dans le texte (format @username)
  const mentionRegex = /@([a-zA-Z0-9]+)/g;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1];
    const user = USERS.find((u) => {
      const nameParts = u.name.split(" ");
      return nameParts.some(
        (part) => part.toLowerCase() === username.toLowerCase()
      );
    });

    if (user && mentions.includes(user.id)) {
      // Ajouter le texte avant la mention
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Ajouter la mention mise en évidence
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="bg-blue-100 text-blue-800 font-medium rounded px-1"
        >
          @{username}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }
  }

  // Ajouter le reste du texte après la dernière mention
  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>
    );
  }

  return parts;
}

// Formater une date relative (il y a X jours, aujourd'hui, etc.)
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Aujourd'hui";
  } else if (diffDays === 1) {
    return now > date ? "Hier" : "Demain";
  } else if (diffDays < 7) {
    return now > date ? `Il y a ${diffDays} jours` : `Dans ${diffDays} jours`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return now > date
      ? `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`
      : `Dans ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  } else {
    return formatDate(date);
  }
}

// Générer des métriques clés pour le client
export function generateClientMetrics(
  opportunities: Opportunity[]
): ClientMetrics {
  // Compteurs
  const totalOpportunities = opportunities.length;
  const wonOpportunities = opportunities.filter(
    (o) => o.status === "won"
  ).length;
  const lostOpportunities = opportunities.filter(
    (o) => o.status === "lost"
  ).length;

  // Valeurs
  const totalValue = opportunities.reduce((acc, curr) => acc + curr.value, 0);
  const wonValue = opportunities
    .filter((o) => o.status === "won")
    .reduce((acc, curr) => acc + curr.value, 0);

  // Taux de conversion
  const completedOpportunities = wonOpportunities + lostOpportunities;
  const conversionRate =
    completedOpportunities > 0
      ? (wonOpportunities / completedOpportunities) * 100
      : 0;

  // Taille moyenne des affaires
  const averageDealSize =
    wonOpportunities > 0
      ? wonValue / wonOpportunities
      : totalOpportunities > 0
      ? totalValue / totalOpportunities
      : 0;

  // Cycle de vente moyen (jours entre création et clôture)
  let totalDays = 0;
  let countWithDates = 0;

  opportunities
    .filter((o) => o.status === "won" || o.status === "lost")
    .forEach((o) => {
      const days = Math.floor(
        (o.updatedAt.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (days > 0) {
        totalDays += days;
        countWithDates++;
      }
    });

  const averageSalesCycle = countWithDates > 0 ? totalDays / countWithDates : 0;

  // Trouver la dernière activité
  const lastActivityDate = opportunities
    .flatMap((o) => o.activities || [])
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.date;

  return {
    totalValue,
    totalOpportunities,
    wonOpportunities,
    lostOpportunities,
    conversionRate: parseFloat(conversionRate.toFixed(1)),
    averageDealSize: Math.round(averageDealSize),
    averageSalesCycle: Math.round(averageSalesCycle),
    lastActivityDate,
  };
}

// Générer l'URL de partage de l'adresse Google Maps
export function generateGoogleMapsUrl(
  street: string,
  city: string,
  postalCode: string,
  country: string
): string {
  const address = encodeURIComponent(
    `${street}, ${postalCode} ${city}, ${country}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${address}`;
}

// Rechercher dans les activités, notes, opportunités
export function searchClientData(
  query: string,
  activities: Activity[],
  notes: Note[],
  opportunities: Opportunity[]
): { activities: Activity[]; notes: Note[]; opportunities: Opportunity[] } {
  const lowerQuery = query.toLowerCase();

  const filteredActivities = activities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(lowerQuery) ||
      activity.description.toLowerCase().includes(lowerQuery)
  );

  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(lowerQuery)
  );

  const filteredOpportunities = opportunities.filter(
    (opportunity) =>
      opportunity.title.toLowerCase().includes(lowerQuery) ||
      (opportunity.notes &&
        opportunity.notes.toLowerCase().includes(lowerQuery))
  );

  return {
    activities: filteredActivities,
    notes: filteredNotes,
    opportunities: filteredOpportunities,
  };
}
