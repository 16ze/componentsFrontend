"use client";

import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  Tabs,
  Tab,
  TextField,
  Grid,
  Switch,
  Button,
} from "@mui/material";
import {
  CalendarDays,
  Mail,
  Users,
  FileText,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { IntegrationStatus } from "./types";
import { id } from "date-fns/locale";

interface MicrosoftIntegrationProps {
  clientId?: string;
  redirectUri?: string;
  tenantId?: string;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRefreshToken?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MicrosoftIntegration: React.FC<MicrosoftIntegrationProps> = ({
  clientId = "",
  redirectUri = "",
  tenantId = "",
  isConnected = false,
  onConnect = () => {},
  onDisconnect = () => {},
  onRefreshToken = () => {},
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [syncEmails, setSyncEmails] = useState(true);
  const [syncCalendar, setSyncCalendar] = useState(true);
  const [syncContacts, setSyncContacts] = useState(true);
  const [syncDocuments, setSyncDocuments] = useState(false);

  const [formClientId, setFormClientId] = useState(clientId);
  const [formRedirectUri, setFormRedirectUri] = useState(redirectUri);
  const [formTenantId, setFormTenantId] = useState(tenantId);

  const handleConnect = () => {
    // Ici, dans une implémentation réelle, nous enverrions les paramètres
    // et redirigerions vers OAuth de Microsoft
    onConnect();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Paper elevation={2} sx={{ maxWidth: "800px", mx: "auto", p: 0 }}>
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            Intégration Microsoft 365
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Synchronisez vos emails, calendrier, contacts et documents avec
            Microsoft 365
          </Typography>
        </Box>
        <Chip
          label={isConnected ? "Connecté" : "Déconnecté"}
          color={isConnected ? "success" : "default"}
        />
      </Box>

      <Divider />

      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="integration tabs"
          >
            <Tab
              label="Configuration"
              id="integration-tab-0"
              aria-controls="integration-tabpanel-0"
            />
            <Tab
              label="Permissions"
              id="integration-tab-1"
              aria-controls="integration-tabpanel-1"
            />
            <Tab
              label="Synchronisation"
              id="integration-tab-2"
              aria-controls="integration-tabpanel-2"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                id="client-id"
                label="ID Client (Application ID)"
                placeholder="Entrez votre ID Client Microsoft"
                fullWidth
                margin="normal"
                value={formClientId}
                onChange={(e) => setFormClientId(e.target.value)}
                disabled={isConnected}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="tenant-id"
                label="ID Tenant"
                placeholder="Entrez votre ID Tenant Microsoft (facultatif)"
                fullWidth
                margin="normal"
                value={formTenantId}
                onChange={(e) => setFormTenantId(e.target.value)}
                disabled={isConnected}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="redirect-uri"
                label="URI de redirection"
                placeholder="https://votreapp.com/auth/callback"
                fullWidth
                margin="normal"
                value={formRedirectUri}
                onChange={(e) => setFormRedirectUri(e.target.value)}
                disabled={isConnected}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ "& > :not(style)": { mb: 2 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Mail size={20} />
                <Typography>Emails (Outlook)</Typography>
              </Box>
              <Switch
                checked={syncEmails}
                onChange={(e) => setSyncEmails(e.target.checked)}
                disabled={!isConnected}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarDays size={20} />
                <Typography>Calendrier</Typography>
              </Box>
              <Switch
                checked={syncCalendar}
                onChange={(e) => setSyncCalendar(e.target.checked)}
                disabled={!isConnected}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Users size={20} />
                <Typography>Contacts</Typography>
              </Box>
              <Switch
                checked={syncContacts}
                onChange={(e) => setSyncContacts(e.target.checked)}
                disabled={!isConnected}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FileText size={20} />
                <Typography>Documents (OneDrive)</Typography>
              </Box>
              <Switch
                checked={syncDocuments}
                onChange={(e) => setSyncDocuments(e.target.checked)}
                disabled={!isConnected}
              />
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ "& > :not(style)": { mb: 3 } }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle1">
                  Dernière synchronisation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isConnected ? "Aujourd'hui à 14:30" : "Non disponible"}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                disabled={!isConnected}
                onClick={onRefreshToken}
                startIcon={<RefreshCw />}
              >
                Synchroniser maintenant
              </Button>
            </Paper>

            <Box sx={{ "& > :not(style)": { mb: 1 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Check color="success" />
                <Typography variant="body2">125 emails synchronisés</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Check color="success" />
                <Typography variant="body2">
                  15 événements calendrier synchronisés
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Check color="success" />
                <Typography variant="body2">
                  48 contacts synchronisés
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <X color="error" />
                <Typography variant="body2">
                  Synchronisation OneDrive désactivée
                </Typography>
              </Box>
            </Box>
          </Box>
        </TabPanel>
      </Box>

      <Divider />

      <Box sx={{ display: "flex", justifyContent: "space-between", p: 3 }}>
        <Button
          variant="outlined"
          onClick={isConnected ? onDisconnect : () => {}}
        >
          {isConnected ? "Déconnecter" : "Annuler"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={isConnected ? onRefreshToken : handleConnect}
        >
          {isConnected ? "Actualiser le jeton" : "Se connecter à Microsoft 365"}
        </Button>
      </Box>
    </Paper>
  );
};

export default MicrosoftIntegration;
