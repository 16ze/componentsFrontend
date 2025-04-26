import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Chip,
  Badge,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon,
  Notifications as NotificationIcon,
  Chat as ChatIcon,
  AttachFile as AttachmentIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Communication, CommunicationType, CommunicationStatus } from "./types";

interface CommunicationListProps {
  communications: Communication[];
  selectedId?: string;
  onCommunicationClick: (communication: Communication) => void;
}

const CommunicationList: React.FC<CommunicationListProps> = ({
  communications,
  selectedId,
  onCommunicationClick,
}) => {
  // Fonction pour obtenir l'icône correspondant au type de communication
  const getIconByType = (type: CommunicationType) => {
    switch (type) {
      case CommunicationType.EMAIL:
        return <EmailIcon />;
      case CommunicationType.SMS:
        return <SmsIcon />;
      case CommunicationType.APPEL:
        return <PhoneIcon />;
      case CommunicationType.MESSAGE_INTERNE:
        return <ChatIcon />;
      case CommunicationType.NOTIFICATION:
        return <NotificationIcon />;
      default:
        return <EmailIcon />;
    }
  };

  // Fonction pour formater la date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateObj = new Date(date);

    if (dateObj >= today) {
      // Aujourd'hui : afficher l'heure
      return format(dateObj, "HH:mm", { locale: fr });
    } else if (dateObj >= new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)) {
      // Dans les 7 derniers jours : afficher le jour
      return format(dateObj, "EEEE", { locale: fr });
    } else {
      // Plus ancien : afficher la date complète
      return format(dateObj, "dd MMM yyyy", { locale: fr });
    }
  };

  // Fonction pour tronquer le texte
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const toggleImportant = (
    e: React.MouseEvent,
    communication: Communication
  ) => {
    e.stopPropagation();
    // Ici, implémenter la logique pour marquer comme important
    console.log("Marquer comme important:", communication.id);
  };

  return (
    <List sx={{ width: "100%", p: 0 }}>
      {communications.map((communication) => {
        const isUnread =
          communication.statut === CommunicationStatus.RECUE &&
          (!communication.tracking?.ouvert || false);

        return (
          <ListItem
            key={communication.id}
            alignItems="flex-start"
            sx={{
              cursor: "pointer",
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor:
                selectedId === communication.id
                  ? "action.selected"
                  : isUnread
                  ? "action.hover"
                  : "background.paper",
              "&:hover": {
                backgroundColor: "action.hover",
              },
              py: 1,
            }}
            onClick={() => onCommunicationClick(communication)}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor:
                    communication.type === CommunicationType.EMAIL
                      ? "primary.main"
                      : communication.type === CommunicationType.SMS
                      ? "success.main"
                      : communication.type === CommunicationType.APPEL
                      ? "warning.main"
                      : "info.main",
                }}
              >
                {getIconByType(communication.type)}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight={isUnread ? "bold" : "normal"}
                    noWrap
                    sx={{ maxWidth: "70%" }}
                  >
                    {communication.type === CommunicationType.EMAIL
                      ? communication.sujet
                      : communication.expediteur.nom}
                  </Typography>

                  {/* Actions rapides */}
                  <Box>
                    <Tooltip
                      title={
                        communication.estImportant
                          ? "Retirer des favoris"
                          : "Marquer comme important"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => toggleImportant(e, communication)}
                      >
                        {communication.estImportant ? (
                          <StarIcon fontSize="small" color="warning" />
                        ) : (
                          <StarBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              }
              secondary={
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    {/* Expéditeur ou destinataire principal */}
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ maxWidth: "70%" }}
                      noWrap
                    >
                      {communication.type === CommunicationType.EMAIL
                        ? communication.expediteur.nom
                        : communication.destinataires.length > 0
                        ? communication.destinataires[0].nom
                        : ""}
                    </Typography>

                    {/* Date */}
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(
                        communication.dateEnvoi || communication.dateCreation
                      )}
                    </Typography>
                  </Box>

                  {/* Aperçu du contenu */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                    noWrap
                  >
                    {truncateText(communication.contenuTexte, 100)}
                  </Typography>

                  {/* Badges et indicateurs */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {/* Statut */}
                    {communication.statut ===
                      CommunicationStatus.PROGRAMMEE && (
                      <Chip
                        label="Programmé"
                        size="small"
                        color="info"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}

                    {/* Indicateur de pièce jointe */}
                    {communication.pieceJointes &&
                      communication.pieceJointes.length > 0 && (
                        <Badge
                          badgeContent={communication.pieceJointes.length}
                          color="default"
                          sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem" } }}
                        >
                          <AttachmentIcon fontSize="small" />
                        </Badge>
                      )}

                    {/* Tracking */}
                    {communication.tracking?.ouvert && (
                      <Tooltip title="Lu">
                        <Chip
                          label="Lu"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      </Tooltip>
                    )}

                    {communication.tracking?.repondu && (
                      <Tooltip title="Répondu">
                        <Chip
                          label="Répondu"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      </Tooltip>
                    )}

                    {/* Tags éventuels (limités à 1 ou 2) */}
                    {communication.tags &&
                      communication.tags
                        .slice(0, 1)
                        .map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                        ))}

                    {/* Indicateur de plus de tags */}
                    {communication.tags && communication.tags.length > 1 && (
                      <Tooltip
                        title={communication.tags.slice(1).join(", ")}
                        arrow
                      >
                        <Chip
                          label={`+${communication.tags.length - 1}`}
                          size="small"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default CommunicationList;
