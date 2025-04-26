import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  AttachFile as AttachmentIcon,
  Template as TemplateIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatListBulleted as ListBulletedIcon,
  FormatListNumbered as ListNumberedIcon,
  InsertLink as LinkIcon,
  Image as ImageIcon,
  FormatQuote as QuoteIcon,
  Code as CodeIcon,
  Lightbulb as TipIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import { v4 as uuidv4 } from "uuid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { fr } from "date-fns/locale";
import { addHours } from "date-fns";

import { useCommunicationStore } from "../../../stores/communicationStore";
import {
  Communication,
  CommunicationType,
  CommunicationStatus,
  CommunicationFolder,
  CommunicationPriority,
  EmailTemplate,
  DynamicVariable,
} from "./types";

// Composant d'éditeur WYSIWYG simplifié
// Dans une implémentation réelle, nous utiliserions une bibliothèque comme react-quill, tiptap ou slate
const WysiwygEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Paper
        variant="outlined"
        sx={{ p: 1, mb: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}
      >
        <Tooltip title="Gras">
          <IconButton size="small">
            <BoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italique">
          <IconButton size="small">
            <ItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Souligné">
          <IconButton size="small">
            <UnderlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Liste à puces">
          <IconButton size="small">
            <ListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Liste numérotée">
          <IconButton size="small">
            <ListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Insérer un lien">
          <IconButton size="small">
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Insérer une image">
          <IconButton size="small">
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Citation">
          <IconButton size="small">
            <QuoteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Code">
          <IconButton size="small">
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>
      <TextField
        multiline
        rows={12}
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Composez votre message ici..."
        variant="outlined"
      />
    </Box>
  );
};

// Composant pour choisir un modèle d'email
const TemplateSelector = ({
  templates,
  onSelect,
}: {
  templates: EmailTemplate[];
  onSelect: (template: EmailTemplate) => void;
}) => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={9}>
          <Autocomplete
            options={templates}
            getOptionLabel={(option) => option.nom}
            groupBy={(option) => option.categorie}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choisir un modèle"
                fullWidth
                variant="outlined"
              />
            )}
            value={selectedTemplate}
            onChange={(_, newValue) => setSelectedTemplate(newValue)}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body1">{option.nom}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.sujet}
                  </Typography>
                </Box>
              </li>
            )}
          />
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSelect}
            disabled={!selectedTemplate}
          >
            Utiliser ce modèle
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

// Composant pour les variables dynamiques
const DynamicVariableEditor = ({
  variables,
  onApply,
}: {
  variables: DynamicVariable[];
  onApply: (code: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVariables = variables.filter(
    (variable) =>
      variable.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.categorie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categorizedVariables: Record<string, DynamicVariable[]> = {};
  filteredVariables.forEach((variable) => {
    if (!categorizedVariables[variable.categorie]) {
      categorizedVariables[variable.categorie] = [];
    }
    categorizedVariables[variable.categorie].push(variable);
  });

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label="Rechercher une variable"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
      />
      <Box sx={{ maxHeight: 300, overflow: "auto" }}>
        {Object.entries(categorizedVariables).map(([category, vars]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, textTransform: "capitalize" }}
            >
              {category}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {vars.map((variable) => (
                <Chip
                  key={variable.code}
                  label={variable.code}
                  title={variable.description}
                  onClick={() => onApply(variable.code)}
                  clickable
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface CommunicationComposerProps {
  open: boolean;
  onClose: () => void;
  replyTo?: Communication | null;
  clientId?: string;
  opportuniteId?: string;
}

const CommunicationComposer: React.FC<CommunicationComposerProps> = ({
  open,
  onClose,
  replyTo,
  clientId,
  opportuniteId,
}) => {
  const {
    addCommunication,
    sendCommunication,
    scheduleCommunication,
    templates,
  } = useCommunicationStore();

  const [type, setType] = useState<CommunicationType>(CommunicationType.EMAIL);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipients, setRecipients] = useState<
    Array<{ id: string; nom: string; type: "to" | "cc" | "bcc" }>
  >([]);
  const [priority, setPriority] = useState<CommunicationPriority>(
    CommunicationPriority.NORMALE
  );
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>(
    addHours(new Date(), 1)
  );
  const [optimizeTime, setOptimizeTime] = useState(false);
  const [attachments, setAttachments] = useState<
    Array<{
      id: string;
      nom: string;
      taille: number;
      type: string;
      url: string;
    }>
  >([]);
  const [activeTab, setActiveTab] = useState<
    "editor" | "variables" | "template"
  >("editor");

  // Référence à l'input de fichier
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Liste de tous les clients/contacts pour l'autocomplétion (simulée)
  const contactSuggestions = [
    { id: "contact-1", nom: "Jean Dupont", email: "jean.dupont@example.com" },
    { id: "contact-2", nom: "Marie Martin", email: "marie.martin@example.com" },
    {
      id: "contact-3",
      nom: "Pierre Durand",
      email: "pierre.durand@example.com",
    },
    // Dans une application réelle, ces données viendraient d'une API
  ];

  // Variables dynamiques disponibles
  const availableVariables: DynamicVariable[] = [
    {
      code: "client.prenom",
      description: "Prénom du client",
      valeurParDefaut: "Client",
      categorie: "client",
    },
    {
      code: "client.nom",
      description: "Nom de famille du client",
      valeurParDefaut: "Client",
      categorie: "client",
    },
    {
      code: "client.entreprise",
      description: "Entreprise du client",
      valeurParDefaut: "votre entreprise",
      categorie: "client",
    },
    {
      code: "client.email",
      description: "Email du client",
      valeurParDefaut: "client@example.com",
      categorie: "client",
    },
    {
      code: "opportunite.nom",
      description: "Nom de l'opportunité",
      valeurParDefaut: "l'opportunité",
      categorie: "opportunite",
    },
    {
      code: "opportunite.montant",
      description: "Montant de l'opportunité",
      valeurParDefaut: "0",
      categorie: "opportunite",
    },
    {
      code: "opportunite.stade",
      description: "Stade de l'opportunité",
      valeurParDefaut: "en cours",
      categorie: "opportunite",
    },
    {
      code: "utilisateur.nom",
      description: "Nom complet de l'utilisateur",
      valeurParDefaut: "Utilisateur",
      categorie: "utilisateur",
    },
    {
      code: "utilisateur.email",
      description: "Email de l'utilisateur",
      valeurParDefaut: "utilisateur@example.com",
      categorie: "utilisateur",
    },
    {
      code: "systeme.date",
      description: "Date actuelle",
      valeurParDefaut: new Date().toLocaleDateString(),
      categorie: "systeme",
    },
    // Plus de variables dans une application réelle
  ];

  // Initialiser le formulaire avec les données de réponse si disponibles
  useEffect(() => {
    if (replyTo) {
      setType(replyTo.type);

      // Préfixer le sujet avec Re: pour les réponses
      if (replyTo.sujet) {
        const subjectPrefix = "Re: ";
        setSubject(
          replyTo.sujet.startsWith(subjectPrefix)
            ? replyTo.sujet
            : subjectPrefix + replyTo.sujet
        );
      }

      // Ajouter l'expéditeur original comme destinataire
      setRecipients([
        {
          id: replyTo.expediteur.id,
          nom: replyTo.expediteur.nom,
          type: "to",
        },
      ]);

      // Préparer le contenu de la réponse
      const replyPrefix = `\n\n--- Message original ---\nDe: ${
        replyTo.expediteur.nom
      }\nDate: ${
        replyTo.dateEnvoi?.toLocaleString() ||
        replyTo.dateCreation.toLocaleString()
      }\nSujet: ${replyTo.sujet || ""}\n\n`;
      setContent(replyPrefix + replyTo.contenuTexte);
    } else if (clientId || opportuniteId) {
      // Pour un nouveau message avec client/opportunité spécifiés
      // Ajoutez ici la logique pour pré-remplir les destinataires en fonction du client
    }
  }, [replyTo, clientId, opportuniteId]);

  // Fonction pour gérer l'envoi du message
  const handleSend = async () => {
    const newCommunication: Communication = {
      id: uuidv4(),
      type,
      statut: isScheduled
        ? CommunicationStatus.PROGRAMMEE
        : CommunicationStatus.ENVOYEE,
      dossier: CommunicationFolder.ENVOYES,
      expediteur: {
        id: "current-user", // À remplacer par l'ID de l'utilisateur actuel
        nom: "Utilisateur Actuel", // À remplacer par le nom de l'utilisateur actuel
        email: "utilisateur@example.com", // À remplacer par l'email de l'utilisateur actuel
      },
      destinataires: recipients,
      sujet: subject,
      contenuTexte: content,
      contenuHtml: content, // Dans une implémentation réelle, convertir le contenu en HTML
      dateCreation: new Date(),
      dateModification: new Date(),
      dateProgrammee: isScheduled ? scheduledDate : undefined,
      priorite: priority,
      clientId,
      opportuniteId,
      pieceJointes: attachments,
      optimisationHoraire: optimizeTime,
    };

    if (isScheduled) {
      scheduleCommunication(newCommunication, scheduledDate);
    } else {
      await sendCommunication(newCommunication);
    }

    onClose();
  };

  // Fonction pour enregistrer comme brouillon
  const handleSaveDraft = () => {
    const draft: Communication = {
      id: uuidv4(),
      type,
      statut: CommunicationStatus.BROUILLON,
      dossier: CommunicationFolder.BROUILLONS,
      expediteur: {
        id: "current-user",
        nom: "Utilisateur Actuel",
        email: "utilisateur@example.com",
      },
      destinataires: recipients,
      sujet: subject,
      contenuTexte: content,
      contenuHtml: content,
      dateCreation: new Date(),
      dateModification: new Date(),
      priorite: priority,
      clientId,
      opportuniteId,
      pieceJointes: attachments,
    };

    addCommunication(draft);
    onClose();
  };

  // Fonction pour gérer l'upload de pièces jointes
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        id: uuidv4(),
        nom: file.name,
        taille: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // Dans une application réelle, uploader le fichier à un serveur
      }));

      setAttachments([...attachments, ...newAttachments]);
    }
  };

  // Fonction pour supprimer une pièce jointe
  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  // Fonction pour gérer l'insertion d'une variable
  const handleInsertVariable = (variableCode: string) => {
    setContent(content + `{{${variableCode}}}`);
    setActiveTab("editor");
  };

  // Fonction pour appliquer un modèle
  const handleApplyTemplate = (template: EmailTemplate) => {
    setSubject(template.sujet);
    setContent(template.contenuHtml);
    setActiveTab("editor");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {replyTo ? "Répondre" : "Nouveau message"}
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Type de communication */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="communication-type-label">Type</InputLabel>
            <Select
              labelId="communication-type-label"
              value={type}
              onChange={(e) => setType(e.target.value as CommunicationType)}
              label="Type"
            >
              <MenuItem value={CommunicationType.EMAIL}>Email</MenuItem>
              <MenuItem value={CommunicationType.SMS}>SMS</MenuItem>
              <MenuItem value={CommunicationType.APPEL}>Note d'appel</MenuItem>
              <MenuItem value={CommunicationType.MESSAGE_INTERNE}>
                Message interne
              </MenuItem>
            </Select>
          </FormControl>

          {/* Destinataires */}
          <Autocomplete
            multiple
            options={contactSuggestions}
            getOptionLabel={(option) =>
              `${option.nom} (${option.email || "Pas d'email"})`
            }
            renderInput={(params) => (
              <TextField {...params} label="Destinataires" variant="outlined" />
            )}
            value={contactSuggestions.filter((contact) =>
              recipients.some((r) => r.id === contact.id && r.type === "to")
            )}
            onChange={(_, newValue) => {
              // Garder les cc et bcc existants, remplacer les destinataires "to"
              const filtered = recipients.filter((r) => r.type !== "to");
              setRecipients([
                ...filtered,
                ...newValue.map((contact) => ({
                  id: contact.id,
                  nom: contact.nom,
                  type: "to" as const,
                })),
              ]);
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.nom}
                  {...getTagProps({ index })}
                  sx={{ mr: 0.5 }}
                />
              ))
            }
            sx={{ mb: 2 }}
          />

          {/* Boutons Cc et Cci */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button variant="outlined" size="small">
              Ajouter Cc
            </Button>
            <Button variant="outlined" size="small">
              Ajouter Cci
            </Button>
          </Box>

          {/* Sujet (seulement pour les emails) */}
          {type === CommunicationType.EMAIL && (
            <TextField
              fullWidth
              label="Sujet"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}

          {/* Priorité */}
          <FormControl sx={{ mb: 2, minWidth: 200 }}>
            <InputLabel id="priority-label">Priorité</InputLabel>
            <Select
              labelId="priority-label"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as CommunicationPriority)
              }
              label="Priorité"
            >
              <MenuItem value={CommunicationPriority.BASSE}>Basse</MenuItem>
              <MenuItem value={CommunicationPriority.NORMALE}>Normale</MenuItem>
              <MenuItem value={CommunicationPriority.HAUTE}>Haute</MenuItem>
              <MenuItem value={CommunicationPriority.URGENTE}>Urgente</MenuItem>
            </Select>
          </FormControl>

          {/* Onglets pour éditeur/variables/modèles */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Box sx={{ display: "flex" }}>
              <Button
                variant={activeTab === "editor" ? "contained" : "text"}
                onClick={() => setActiveTab("editor")}
                sx={{ mr: 1 }}
              >
                Éditeur
              </Button>
              <Button
                variant={activeTab === "variables" ? "contained" : "text"}
                onClick={() => setActiveTab("variables")}
                startIcon={<TipIcon />}
                sx={{ mr: 1 }}
              >
                Variables
              </Button>
              <Button
                variant={activeTab === "template" ? "contained" : "text"}
                onClick={() => setActiveTab("template")}
                startIcon={<TemplateIcon />}
              >
                Modèles
              </Button>
            </Box>
          </Box>

          {/* Contenu en fonction de l'onglet actif */}
          {activeTab === "editor" && (
            <WysiwygEditor value={content} onChange={setContent} />
          )}

          {activeTab === "variables" && (
            <DynamicVariableEditor
              variables={availableVariables}
              onApply={handleInsertVariable}
            />
          )}

          {activeTab === "template" && (
            <TemplateSelector
              templates={templates}
              onSelect={handleApplyTemplate}
            />
          )}

          {/* Pièces jointes */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" sx={{ mr: 2 }}>
                Pièces jointes ({attachments.length})
              </Typography>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
                multiple
              />
              <Button
                startIcon={<AttachmentIcon />}
                variant="outlined"
                size="small"
                onClick={() => fileInputRef.current?.click()}
              >
                Ajouter
              </Button>
            </Box>
            {attachments.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {attachments.map((attachment) => (
                  <Chip
                    key={attachment.id}
                    label={`${attachment.nom} (${Math.round(
                      attachment.taille / 1024
                    )} KB)`}
                    onDelete={() => handleRemoveAttachment(attachment.id)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Options d'envoi programmé */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                />
              }
              label="Programmer l'envoi"
            />
            {isScheduled && (
              <Box sx={{ mt: 1 }}>
                <DateTimePicker
                  label="Date et heure d'envoi"
                  value={scheduledDate}
                  onChange={(newValue) => {
                    if (newValue) setScheduledDate(newValue);
                  }}
                  sx={{ width: "100%" }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={optimizeTime}
                      onChange={(e) => setOptimizeTime(e.target.checked)}
                    />
                  }
                  label="Optimiser l'heure d'envoi (recommandé)"
                  sx={{ mt: 1 }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleSaveDraft} startIcon={<SaveIcon />}>
            Enregistrer comme brouillon
          </Button>
          {isScheduled ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSend}
              startIcon={<ScheduleIcon />}
              disabled={!subject || recipients.length === 0 || !content}
            >
              Programmer
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSend}
              startIcon={<SendIcon />}
              disabled={!subject || recipients.length === 0 || !content}
            >
              Envoyer
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CommunicationComposer;
