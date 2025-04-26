import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  PhoneCall,
  Mail,
  Calendar,
  Star,
  Edit,
  MoreHorizontal,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { ClientWithDetails } from "./types";
import { getScoreColor, getScoreLabel } from "./utils";

interface ClientDetailsHeaderProps {
  client: ClientWithDetails;
  onEditClick: () => void;
}

export function ClientDetailsHeader({
  client,
  onEditClick,
}: ClientDetailsHeaderProps) {
  const scoreColor = getScoreColor(client.score.level);
  const scoreLabel = getScoreLabel(client.score.level);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden mb-6">
      <div className="flex flex-col md:flex-row p-6 gap-6">
        {/* Avatar column */}
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24">
            <AvatarImage src={client.avatar} alt={client.name} />
            <AvatarFallback className="text-xl">
              {client.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info column */}
        <div className="flex-grow space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={client.isActive ? "success" : "secondary"}>
                {client.isActive ? "Client actif" : "Inactif"}
              </Badge>
              <button
                onClick={onEditClick}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </button>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Plus d'options</span>
              </button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {client.company && (
              <div className="flex items-center mb-1">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>{client.company}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-y-1 sm:gap-x-6">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a href={`mailto:${client.email}`} className="hover:underline">
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div className="flex items-center">
                  <PhoneCall className="h-4 w-4 mr-2" />
                  <a href={`tel:${client.phone}`} className="hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  Client depuis{" "}
                  {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score column */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center px-6 py-4 border-t md:border-t-0 md:border-l">
          <div className="text-center">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Score client
            </div>
            <div
              className={`text-2xl font-bold flex items-center justify-center ${scoreColor}`}
            >
              {client.score.value}
              <Star className="h-5 w-5 ml-1 fill-current" />
            </div>
            <div className={`text-xs mt-1 ${scoreColor}`}>{scoreLabel}</div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Mis à jour le{" "}
            {new Date(client.score.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Navigation indication */}
      <div className="bg-muted/40 px-6 py-2 flex items-center text-sm">
        <a
          href="/crm/clients"
          className="text-muted-foreground hover:text-foreground"
        >
          Clients
        </a>
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
        <span className="font-medium">{client.name}</span>
      </div>
    </div>
  );
}
