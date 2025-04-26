import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  useTheme,
  Badge,
} from "@mui/material";
import {
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon,
  Notifications as NotificationIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  Drafts as DraftsIcon,
  Archive as ArchiveIcon,
  DeleteOutline as TrashIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

import { useCommunicationStore } from "../../../stores/communicationStore";
import {
  Communication,
  CommunicationType,
  CommunicationStatus,
  CommunicationFolder,
  CommunicationFilters,
} from "./types";

import CommunicationList from "./CommunicationList";
import CommunicationDetail from "./CommunicationDetail";
import CommunicationComposer from "./CommunicationComposer";
import CommunicationFiltersPanel from "./CommunicationFiltersPanel";
import EmptyState from "../../ui/EmptyState";

interface CommunicationManagerProps {
  clientId?: string;
  opportuniteId?: string;
}

const CommunicationManager: React.FC<CommunicationManagerProps> = ({
  clientId,
  opportuniteId,
}) => {
  const theme = useTheme();
  const {
    communications,
    selectedCommunication,
    currentFolder,
    filters,
    selectCommunication,
    setCurrentFolder,
    setFilters,
    getCommunications,
    getUnreadCount,
  } = useCommunicationStore();

  const [filteredCommunications, setFilteredCommunications] = useState<
    Communication[]
  >([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CommunicationType | "all">("all");
  const [replyTo, setReplyTo] = useState<Communication | null>(null);

  // Initialiser les filtres avec le client et l'opportunité si fournis
  useEffect(() => {
    if (clientId || opportuniteId) {
      setFilters({
        clientId,
        opportuniteId,
      });
    }
  }, [clientId, opportuniteId, setFilters]);

  // Filtrer les communications en fonction des filtres actifs
  useEffect(() => {
    const currentFilters: CommunicationFilters = {
      ...filters,
      dossier: currentFolder,
      type: activeTab !== "all" ? [activeTab] : undefined,
    };

    const filtered = getCommunications(currentFilters);
    setFilteredCommunications(filtered);
  }, [communications, filters, currentFolder, activeTab, getCommunications]);

  const handleFolderChange = (folder: CommunicationFolder) => {
    setCurrentFolder(folder);
    selectCommunication(null);
  };

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: CommunicationType | "all"
  ) => {
    setActiveTab(newValue);
    selectCommunication(null);
  };

  const handleCommunicationClick = (communication: Communication) => {
    selectCommunication(communication.id);
  };

  const handleNewCommunication = () => {
    setReplyTo(null);
    setIsComposerOpen(true);
  };

  const handleReply = (communication: Communication) => {
    setReplyTo(communication);
    setIsComposerOpen(true);
  };

  const handleCloseComposer = () => {
    setIsComposerOpen(false);
    setReplyTo(null);
  };

  const handleFilterToggle = () => {
    setIsFiltersPanelOpen(!isFiltersPanelOpen);
  };

  // Rendu des dossiers dans la barre latérale
  const renderFolders = () => {
    const folders = [
      {
        key: CommunicationFolder.BOITE_RECEPTION,
        label: "Boîte de réception",
        icon: <InboxIcon />,
        unreadCount: getUnreadCount(CommunicationFolder.BOITE_RECEPTION),
      },
      {
        key: CommunicationFolder.ENVOYES,
        label: "Envoyés",
        icon: <SendIcon />,
        unreadCount: 0,
      },
      {
        key: CommunicationFolder.BROUILLONS,
        label: "Brouillons",
        icon: <DraftsIcon />,
        unreadCount: 0,
      },
      {
        key: CommunicationFolder.ARCHIVES,
        label: "Archives",
        icon: <ArchiveIcon />,
        unreadCount: 0,
      },
      {
        key: CommunicationFolder.CORBEILLE,
        label: "Corbeille",
        icon: <TrashIcon />,
        unreadCount: 0,
      },
    ];

    return (
      <Box
        sx={{
          width: 250,
          borderRight: 1,
          borderColor: "divider",
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewCommunication}
          fullWidth
          sx={{ mb: 3 }}
        >
          Nouveau message
        </Button>

        <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
          {folders.map((folder) => (
            <Button
              key={folder.key}
              sx={{
                justifyContent: "flex-start",
                px: 2,
                py: 1,
                mb: 1,
                width: "100%",
                color:
                  currentFolder === folder.key
                    ? "primary.main"
                    : "text.primary",
                backgroundColor:
                  currentFolder === folder.key
                    ? "action.selected"
                    : "transparent",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              startIcon={folder.icon}
              onClick={() => handleFolderChange(folder.key)}
            >
              {folder.unreadCount > 0 ? (
                <Badge badgeContent={folder.unreadCount} color="primary">
                  {folder.label}
                </Badge>
              ) : (
                folder.label
              )}
            </Button>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 120px)",
        overflow: "hidden",
      }}
    >
      {/* Barre latérale avec les dossiers */}
      {renderFolders()}

      {/* Contenu principal */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" component="h2">
            {/* Titre du dossier actif */}
            {Object.values(CommunicationFolder).find(
              (folder) => folder === currentFolder
            )}
          </Typography>

          <Box>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterToggle}
              sx={{ mr: 1 }}
            >
              Filtres
            </Button>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={() => {}}
            >
              Rechercher
            </Button>
          </Box>
        </Box>

        {/* Onglets de filtrage par type */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<span />} label="Tous" value="all" />
            <Tab
              icon={<EmailIcon />}
              label="Email"
              value={CommunicationType.EMAIL}
            />
            <Tab icon={<SmsIcon />} label="SMS" value={CommunicationType.SMS} />
            <Tab
              icon={<PhoneIcon />}
              label="Appel"
              value={CommunicationType.APPEL}
            />
            <Tab
              icon={<NotificationIcon />}
              label="Notifications"
              value={CommunicationType.NOTIFICATION}
            />
          </Tabs>
        </Box>

        {/* Panneau de filtres (conditionnellement affiché) */}
        {isFiltersPanelOpen && (
          <CommunicationFiltersPanel
            filters={filters}
            onFilterChange={(newFilters) => setFilters(newFilters)}
            onClose={() => setIsFiltersPanelOpen(false)}
          />
        )}

        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            overflow: "hidden",
          }}
        >
          {/* Liste des communications */}
          <Box
            sx={{
              width: 350,
              borderRight: 1,
              borderColor: "divider",
              overflow: "auto",
            }}
          >
            {filteredCommunications.length > 0 ? (
              <CommunicationList
                communications={filteredCommunications}
                selectedId={selectedCommunication?.id}
                onCommunicationClick={handleCommunicationClick}
              />
            ) : (
              <EmptyState
                icon={<InboxIcon sx={{ fontSize: 48 }} />}
                title="Aucun message"
                message="Il n'y a aucun message correspondant à vos critères."
              />
            )}
          </Box>

          {/* Détail d'une communication ou état vide */}
          <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
            {selectedCommunication ? (
              <CommunicationDetail
                communication={selectedCommunication}
                onReply={handleReply}
              />
            ) : (
              <EmptyState
                icon={<EmailIcon sx={{ fontSize: 48 }} />}
                title="Sélectionnez un message"
                message="Veuillez sélectionner un message dans la liste pour afficher son contenu."
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Compositeur de messages (modal) */}
      {isComposerOpen && (
        <CommunicationComposer
          open={isComposerOpen}
          onClose={handleCloseComposer}
          replyTo={replyTo}
          clientId={clientId}
          opportuniteId={opportuniteId}
        />
      )}
    </Box>
  );
};

export default CommunicationManager;
