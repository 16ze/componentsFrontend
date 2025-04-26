import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Grid,
  Link,
} from "@mui/material";
import {
  Reply as ReplyIcon,
  ReplyAll as ReplyAllIcon,
  Forward as ForwardIcon,
  DeleteOutline as DeleteIcon,
  ArchiveOutlined as ArchiveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  AttachFile as AttachmentIcon,
  Event as CalendarIcon,
  Print as PrintIcon,
  MoreVert as MoreIcon,
  OpenInNew as OpenIcon,
  VisibilityOutlined as ViewIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Communication, CommunicationType, CommunicationStatus } from "./types";
import { useCommunicationStore } from "../../../stores/communicationStore";

interface CommunicationDetailProps {
  communication: Communication;
  onReply: (communication: Communication) => void;
}

const CommunicationDetail: React.FC<CommunicationDetailProps> = ({
  communication,
  onReply,
}) => {
  const { updateCommunication, moveToDossier, deleteCommunication } =
    useCommunicationStore();

  // Fonction pour formater la date
  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, "EEEE d MMMM yyyy à HH:mm", { locale: fr });
  };

  // Fonction pour marquer comme important
  const toggleImportant = () => {
    updateCommunication({
      ...communication,
      estImportant: !communication.estImportant,
    });
  };

  // Fonction pour archiver
  const handleArchive = () => {
    moveToDossier(communication.id, "Archives");
  };

  // Fonction pour supprimer
  const handleDelete = () => {
    moveToDossier(communication.id, "Corbeille");
  };

  // Formater les destinataires pour l'affichage
  const formatRecipients = () => {
    const toRecipients = communication.destinataires
      .filter((d) => d.type === "to")
      .map((d) => d.nom)
      .join(", ");

    const ccRecipients = communication.destinataires
      .filter((d) => d.type === "cc")
      .map((d) => d.nom)
      .join(", ");

    const bccRecipients = communication.destinataires
      .filter((d) => d.type === "bcc")
      .map((d) => d.nom)
      .join(", ");

    return (
      <>
        <Typography variant="body2">
          <strong>À : </strong> {toRecipients || "Aucun destinataire"}
        </Typography>

        {ccRecipients && (
          <Typography variant="body2">
            <strong>Cc : </strong> {ccRecipients}
          </Typography>
        )}

        {bccRecipients && (
          <Typography variant="body2">
            <strong>Cci : </strong> {bccRecipients}
          </Typography>
        )}
      </>
    );
  };

  // Rendu des pièces jointes
  const renderAttachments = () => {
    if (
      !communication.pieceJointes ||
      communication.pieceJointes.length === 0
    ) {
      return null;
    }

    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Pièces jointes ({communication.pieceJointes.length})
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {communication.pieceJointes.map((attachment) => (
            <Chip
              key={attachment.id}
              icon={<AttachmentIcon />}
              label={attachment.nom}
              variant="outlined"
              onClick={() => window.open(attachment.url, "_blank")}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  // Rendu des informations de tracking pour les emails
  const renderTracking = () => {
    if (
      communication.type !== CommunicationType.EMAIL ||
      !communication.tracking
    ) {
      return null;
    }

    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Suivi
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ViewIcon
                fontSize="small"
                color={communication.tracking.ouvert ? "success" : "disabled"}
                sx={{ mr: 1 }}
              />
              <Typography variant="body2">
                {communication.tracking.ouvert
                  ? `Ouvert le ${formatDate(
                      communication.tracking.dateOuverture
                    )}`
                  : "Non ouvert"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LinkIcon
                fontSize="small"
                color={
                  communication.tracking.clics &&
                  communication.tracking.clics.length > 0
                    ? "success"
                    : "disabled"
                }
                sx={{ mr: 1 }}
              />
              <Typography variant="body2">
                {communication.tracking.clics &&
                communication.tracking.clics.length > 0
                  ? `${communication.tracking.clics.reduce(
                      (acc, clic) => acc + clic.nombreClics,
                      0
                    )} clics`
                  : "Aucun clic"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ReplyIcon
                fontSize="small"
                color={communication.tracking.repondu ? "success" : "disabled"}
                sx={{ mr: 1 }}
              />
              <Typography variant="body2">
                {communication.tracking.repondu
                  ? `Réponse le ${formatDate(
                      communication.tracking.dateReponse
                    )}`
                  : "Pas de réponse"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            {communication.tracking.clics &&
              communication.tracking.clics.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Liens cliqués :
                  </Typography>
                  {communication.tracking.clics.map((clic, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <Chip
                        size="small"
                        label={`${clic.nombreClics} clics`}
                        sx={{ mr: 1, fontSize: "0.7rem" }}
                      />
                      <Link
                        href={clic.url}
                        target="_blank"
                        sx={{
                          fontSize: "0.8rem",
                          maxWidth: "250px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "inline-block",
                        }}
                      >
                        {clic.url}
                      </Link>
                    </Box>
                  ))}
                </Box>
              )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* En-tête du message */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={
              communication.expediteur.id
                ? `/api/users/${communication.expediteur.id}/avatar`
                : undefined
            }
            sx={{ width: 50, height: 50, mr: 2 }}
          >
            {communication.expediteur.nom.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{communication.expediteur.nom}</Typography>
            <Typography variant="body2" color="text.secondary">
              {communication.expediteur.email}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Tooltip
            title={
              communication.estImportant
                ? "Retirer des favoris"
                : "Marquer comme important"
            }
          >
            <IconButton onClick={toggleImportant}>
              {communication.estImportant ? (
                <StarIcon color="warning" />
              ) : (
                <StarBorderIcon />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Archiver">
            <IconButton onClick={handleArchive}>
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Sujet */}
      {communication.sujet && (
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          {communication.sujet}
        </Typography>
      )}

      {/* Métadonnées */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {formatDate(communication.dateEnvoi || communication.dateCreation)}
          </Typography>
        </Box>
        {communication.type === CommunicationType.EMAIL && (
          <Chip
            label={
              communication.statut === CommunicationStatus.PROGRAMMEE
                ? `Programmé pour ${formatDate(communication.dateProgrammee)}`
                : communication.statut
            }
            size="small"
            color={
              communication.statut === CommunicationStatus.ENVOYEE
                ? "success"
                : communication.statut === CommunicationStatus.PROGRAMMEE
                ? "info"
                : communication.statut === CommunicationStatus.ECHEC
                ? "error"
                : "default"
            }
          />
        )}
      </Box>

      {/* Destinataires */}
      <Box sx={{ mb: 2 }}>{formatRecipients()}</Box>

      {communication.client && (
        <Chip
          label={`Client: ${communication.client.nom}`}
          size="small"
          sx={{ mr: 1, mb: 2 }}
        />
      )}

      {communication.opportunite && (
        <Chip
          label={`Opportunité: ${communication.opportunite.nom}`}
          size="small"
          sx={{ mb: 2 }}
        />
      )}

      {/* Pièces jointes */}
      {renderAttachments()}

      <Divider sx={{ my: 2 }} />

      {/* Corps du message */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {communication.contenuHtml ? (
          <Box
            dangerouslySetInnerHTML={{ __html: communication.contenuHtml }}
            sx={{
              "& a": { color: "primary.main" },
              "& img": { maxWidth: "100%" },
            }}
          />
        ) : (
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {communication.contenuTexte}
          </Typography>
        )}
      </Box>

      {/* Suivi des emails */}
      {renderTracking()}

      {/* Actions de réponse */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          gap: 1,
          mt: 3,
          pt: 2,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          startIcon={<ReplyIcon />}
          variant="contained"
          onClick={() => onReply(communication)}
        >
          Répondre
        </Button>
        <Button
          startIcon={<ReplyAllIcon />}
          variant="outlined"
          onClick={() => onReply(communication)}
        >
          Répondre à tous
        </Button>
        <Button
          startIcon={<ForwardIcon />}
          variant="outlined"
          onClick={() => onReply(communication)}
        >
          Transférer
        </Button>
        <IconButton>
          <PrintIcon />
        </IconButton>
        <IconButton>
          <CalendarIcon />
        </IconButton>
        <IconButton>
          <MoreIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default CommunicationDetail;
