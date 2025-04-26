import React from "react";
import { cn } from "@/lib/utils";
import { ClientStatus } from "./types";
import { getStatusColor } from "./utils";

interface StatusBadgeProps {
  status: ClientStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusColors = getStatusColor(status);

  // Traduire le statut pour l'affichage
  const statusLabels: Record<ClientStatus, string> = {
    lead: "Lead",
    prospect: "Prospect",
    client: "Client",
    inactive: "Inactif",
    archived: "Archivé",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusColors,
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
