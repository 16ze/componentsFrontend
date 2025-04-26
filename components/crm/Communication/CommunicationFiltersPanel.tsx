import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { fr } from "date-fns/locale";

import {
  CommunicationFilters,
  CommunicationType,
  CommunicationStatus,
} from "./types";

interface CommunicationFiltersPanelProps {
  filters: CommunicationFilters;
  onFilterChange: (filters: CommunicationFilters) => void;
  onClose: () => void;
}

const CommunicationFiltersPanel: React.FC<CommunicationFiltersPanelProps> = ({
  filters,
  onFilterChange,
  onClose,
}) => {
  const [localFilters, setLocalFilters] =
    useState<CommunicationFilters>(filters);

  // Options de filtrage
  const typeOptions = [
    { value: CommunicationType.EMAIL, label: "Email" },
    { value: CommunicationType.SMS, label: "SMS" },
    { value: CommunicationType.APPEL, label: "Appel" },
    { value: CommunicationType.MESSAGE_INTERNE, label: "Message interne" },
    { value: CommunicationType.NOTIFICATION, label: "Notification" },
  ];

  const statusOptions = [
    { value: CommunicationStatus.BROUILLON, label: "Brouillon" },
    { value: CommunicationStatus.PROGRAMMEE, label: "Programmée" },
    { value: CommunicationStatus.ENVOYEE, label: "Envoyée" },
    { value: CommunicationStatus.ECHEC, label: "Échec" },
    { value: CommunicationStatus.EN_ATTENTE, label: "En attente" },
    { value: CommunicationStatus.RECUE, label: "Reçue" },
    { value: CommunicationStatus.ARCHIVEE, label: "Archivée" },
  ];

  // Simuler des données de clients et d'opportunités (en pratique, elles viendraient d'un store)
  const clientOptions = [
    { id: "client-1", nom: "Entreprise A" },
    { id: "client-2", nom: "Entreprise B" },
    { id: "client-3", nom: "Entreprise C" },
  ];

  const opportunityOptions = [
    { id: "opp-1", nom: "Projet X" },
    { id: "opp-2", nom: "Déploiement Y" },
    { id: "opp-3", nom: "Maintenance Z" },
  ];

  // Simuler des tags
  const availableTags = [
    "important",
    "urgent",
    "contrat",
    "prospect",
    "relance",
    "devis",
    "facture",
  ];

  // Gérer les changements de filtres
  const handleTypeChange = (types: CommunicationType[]) => {
    setLocalFilters((prev) => ({ ...prev, type: types }));
  };

  const handleStatusChange = (statuses: CommunicationStatus[]) => {
    setLocalFilters((prev) => ({ ...prev, statut: statuses }));
  };

  const handleClientChange = (clientId: string | null) => {
    setLocalFilters((prev) => ({ ...prev, clientId: clientId || undefined }));
  };

  const handleOpportunityChange = (opportunityId: string | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      opportuniteId: opportunityId || undefined,
    }));
  };

  const handleStartDateChange = (date: Date | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      periode: {
        ...prev.periode,
        debut: date || undefined,
      },
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      periode: {
        ...prev.periode,
        fin: date || undefined,
      },
    }));
  };

  const handleSearchChange = (text: string) => {
    setLocalFilters((prev) => ({ ...prev, contient: text || undefined }));
  };

  const handleTagsChange = (tags: string[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      tags: tags.length > 0 ? tags : undefined,
    }));
  };

  const handleCheckboxChange =
    (field: keyof CommunicationFilters) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLocalFilters((prev) => ({
        ...prev,
        [field]: event.target.checked,
      }));
    };

  // Appliquer les filtres
  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    const resetFilters: CommunicationFilters = {
      dossier: filters.dossier,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filtres</Typography>
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {/* Type de communication */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={typeOptions.map((option) => option.value)}
              getOptionLabel={(option) =>
                typeOptions.find((o) => o.value === option)?.label || ""
              }
              value={localFilters.type || []}
              onChange={(_, value) => handleTypeChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Type de communication"
                  variant="outlined"
                  fullWidth
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={typeOptions.find((o) => o.value === option)?.label}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />
          </Grid>

          {/* Statut */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={statusOptions.map((option) => option.value)}
              getOptionLabel={(option) =>
                statusOptions.find((o) => o.value === option)?.label || ""
              }
              value={localFilters.statut || []}
              onChange={(_, value) => handleStatusChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Statut"
                  variant="outlined"
                  fullWidth
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={statusOptions.find((o) => o.value === option)?.label}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />
          </Grid>

          {/* Client */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={clientOptions}
              getOptionLabel={(option) => option.nom}
              value={
                localFilters.clientId
                  ? clientOptions.find((c) => c.id === localFilters.clientId) ||
                    null
                  : null
              }
              onChange={(_, value) => handleClientChange(value?.id || null)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Client"
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Opportunité */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={opportunityOptions}
              getOptionLabel={(option) => option.nom}
              value={
                localFilters.opportuniteId
                  ? opportunityOptions.find(
                      (o) => o.id === localFilters.opportuniteId
                    ) || null
                  : null
              }
              onChange={(_, value) =>
                handleOpportunityChange(value?.id || null)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Opportunité"
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Période */}
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Date de début"
              value={localFilters.periode?.debut || null}
              onChange={handleStartDateChange}
              sx={{ width: "100%" }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Date de fin"
              value={localFilters.periode?.fin || null}
              onChange={handleEndDateChange}
              sx={{ width: "100%" }}
            />
          </Grid>

          {/* Recherche texte */}
          <Grid item xs={12}>
            <TextField
              label="Rechercher dans le contenu"
              fullWidth
              variant="outlined"
              value={localFilters.contient || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={availableTags}
              value={localFilters.tags || []}
              onChange={(_, value) => handleTagsChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  variant="outlined"
                  fullWidth
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />
          </Grid>

          {/* Options supplémentaires */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localFilters.nonLus || false}
                    onChange={handleCheckboxChange("nonLus")}
                  />
                }
                label="Non lus uniquement"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localFilters.avecPieceJointe || false}
                    onChange={handleCheckboxChange("avecPieceJointe")}
                  />
                }
                label="Avec pièce jointe"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localFilters.importants || false}
                    onChange={handleCheckboxChange("importants")}
                  />
                }
                label="Marqués comme importants"
              />
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
        >
          <Button variant="outlined" onClick={resetFilters}>
            Réinitialiser
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={applyFilters}
            startIcon={<FilterIcon />}
          >
            Appliquer les filtres
          </Button>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default CommunicationFiltersPanel;
