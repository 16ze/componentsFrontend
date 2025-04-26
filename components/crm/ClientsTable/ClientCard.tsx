import React from "react";
import { MoreHorizontal, Mail, Phone, Calendar, User, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Client } from "./types";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";
import { getPrimaryContact, getAssignedUserName } from "./utils";

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  const primaryContact = getPrimaryContact(client);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
              {getInitials(client.name)}
            </div>
            <div>
              <CardTitle className="text-lg">{client.name}</CardTitle>
              <CardDescription>{client.company}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={client.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="-mr-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => console.log("Éditer", client.id)}
                >
                  Éditer
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => console.log("Supprimer", client.id)}
                  className="text-red-600"
                >
                  Supprimer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => console.log("Voir détails", client.id)}
                >
                  Voir les détails
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          {primaryContact && (
            <>
              <div className="flex gap-2 items-center text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${primaryContact.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {primaryContact.email}
                </a>
              </div>
              {primaryContact.phone && (
                <div className="flex gap-2 items-center text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${primaryContact.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {primaryContact.phone}
                  </a>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between text-sm">
            <div className="flex gap-2 items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Dernière activité: {formatDate(client.lastActivity)}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex gap-2 items-center">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Assigné à: {getAssignedUserName(client.assignedTo)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex flex-col items-start">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm font-semibold">
            {formatCurrency(client.value)}
          </div>
          <div className="flex flex-wrap gap-1">
            {client.tags.slice(0, 2).map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </div>
            ))}
            {client.tags.length > 2 && (
              <div className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                +{client.tags.length - 2}
              </div>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
