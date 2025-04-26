import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Draggable } from "react-beautiful-dnd";
import { Opportunity } from "./types";
import { useKanbanStore } from "../../../stores/kanbanStore";
import {
  Calendar,
  DollarSign,
  BarChart2,
  Clock,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
}

export function OpportunityCard({ opportunity, index }: OpportunityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { updateOpportunityStage, updateOpportunityStatus, selectOpportunity } =
    useKanbanStore();

  // Format montant
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(opportunity.amount);

  // Format date de clôture prévue
  const formattedDate = format(opportunity.expectedCloseDate, "dd MMM yyyy", {
    locale: fr,
  });

  // Temps écoulé depuis la dernière mise à jour
  const lastUpdateTime = formatDistanceToNow(opportunity.updatedAt, {
    addSuffix: true,
    locale: fr,
  });

  // Détermine la couleur de la barre de probabilité
  const getProbabilityColor = (probability: number) => {
    if (probability < 25) return "bg-red-500";
    if (probability < 50) return "bg-orange-500";
    if (probability < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Obtenir les couleurs d'état
  const getStatusColors = () => {
    switch (opportunity.status) {
      case "won":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          badge: "bg-green-500",
        };
      case "lost":
        return { bg: "bg-red-100", text: "text-red-800", badge: "bg-red-500" };
      default:
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          badge: "bg-blue-500",
        };
    }
  };

  const statusColors = getStatusColors();

  return (
    <Draggable draggableId={opportunity.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-3 rounded-md shadow-sm border border-slate-200 ${
            snapshot.isDragging ? "shadow-lg opacity-90" : ""
          } ${statusColors.bg}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => selectOpportunity(opportunity.id)}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} rotate(2deg)`
              : provided.draggableProps.style?.transform,
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className={`font-semibold text-sm ${statusColors.text}`}>
                {opportunity.title}
              </h3>
              <p className="text-xs text-gray-600">{opportunity.clientName}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() =>
                    updateOpportunityStatus(opportunity.id, "active")
                  }
                >
                  Marquer comme active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateOpportunityStatus(opportunity.id, "won")}
                >
                  Marquer comme gagnée
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateOpportunityStatus(opportunity.id, "lost")
                  }
                >
                  Marquer comme perdue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-3 flex items-center">
            <DollarSign size={16} className="mr-1 text-gray-500" />
            <span className="text-sm font-medium">{formattedAmount}</span>
          </div>

          <div className="flex items-center mb-3">
            <div className="flex-1 pr-2">
              <div className="flex items-center mb-1">
                <BarChart2 size={14} className="mr-1 text-gray-500" />
                <span className="text-xs text-gray-600">Probabilité</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProbabilityColor(
                    opportunity.probability
                  )}`}
                  style={{ width: `${opportunity.probability}%` }}
                ></div>
              </div>
              <div className="text-xs text-right mt-1">
                {opportunity.probability}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1 text-gray-500" />
              <span className="text-xs text-gray-600">{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Avatar className="h-6 w-6">
                <AvatarImage src={opportunity.assignedTo.avatar} />
                <AvatarFallback className="text-xs">
                  {opportunity.assignedTo.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {(opportunity.isDelayed || opportunity.isStuck) && (
            <div className="mt-2">
              {opportunity.isDelayed && (
                <Badge
                  variant="outline"
                  className="mr-1 bg-amber-100 text-amber-800 border-amber-300"
                >
                  <Clock size={12} className="mr-1" /> En retard
                </Badge>
              )}
              {opportunity.isStuck && (
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 border-red-300"
                >
                  <AlertCircle size={12} className="mr-1" /> Bloquée
                </Badge>
              )}
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              <Clock size={12} className="inline mr-1" />
              {lastUpdateTime}
            </span>
            <Badge className={statusColors.badge}>
              {opportunity.status === "won"
                ? "Gagnée"
                : opportunity.status === "lost"
                ? "Perdue"
                : "Active"}
            </Badge>
          </div>
        </motion.div>
      )}
    </Draggable>
  );
}
