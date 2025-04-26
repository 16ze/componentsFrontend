import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useCommunicationStore } from "../../../stores/communicationStore";
import {
  CommunicationType,
  EmailTemplateCategory,
  TrackingEventType,
  AnalyticsMetrics,
} from "./types";

// Couleurs pour les graphiques
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A569BD",
  "#F1C40F",
  "#3498DB",
  "#E74C3C",
];

interface CommunicationAnalyticsProps {
  clientId?: string;
  opportuniteId?: string;
  period?: "7d" | "30d" | "90d" | "year" | "all";
}

const CommunicationAnalytics: React.FC<CommunicationAnalyticsProps> = ({
  clientId,
  opportuniteId,
  period = "30d",
}) => {
  // Dans une application réelle, ces métriques viendraient d'un appel API
  // Ici nous simulons des données pour la démonstration
  const metriques: AnalyticsMetrics = {
    tauxOuverture: 0.68,
    tauxClics: 0.42,
    tauxReponses: 0.23,
    tauxRebonds: 0.05,
    tauxDesabonnement: 0.02,
    meilleursHoraires: [
      { jour: 1, heure: 10, tauxEngagement: 0.72 },
      { jour: 2, heure: 14, tauxEngagement: 0.68 },
      { jour: 3, heure: 9, tauxEngagement: 0.65 },
      { jour: 4, heure: 11, tauxEngagement: 0.7 },
      { jour: 5, heure: 15, tauxEngagement: 0.67 },
    ],
    meilleursTemplates: [
      {
        templateId: "template-1",
        templateNom: "Présentation initiale",
        tauxEngagement: 0.75,
        nombreEnvois: 145,
      },
      {
        templateId: "template-2",
        templateNom: "Suivi après réunion",
        tauxEngagement: 0.68,
        nombreEnvois: 98,
      },
      {
        templateId: "template-3",
        templateNom: "Proposition commerciale",
        tauxEngagement: 0.62,
        nombreEnvois: 76,
      },
      {
        templateId: "template-4",
        templateNom: "Relance",
        tauxEngagement: 0.58,
        nombreEnvois: 210,
      },
      {
        templateId: "template-5",
        templateNom: "Confirmation",
        tauxEngagement: 0.82,
        nombreEnvois: 67,
      },
    ],
  };

  const { templates, trackingEvents, communications } = useCommunicationStore();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(period);

  // Données simulées pour les graphiques
  const emailsParJour = [
    { jour: "Lundi", envoyés: 42, ouverts: 31, clics: 18 },
    { jour: "Mardi", envoyés: 38, ouverts: 28, clics: 15 },
    { jour: "Mercredi", envoyés: 45, ouverts: 32, clics: 20 },
    { jour: "Jeudi", envoyés: 37, ouverts: 24, clics: 13 },
    { jour: "Vendredi", envoyés: 30, ouverts: 21, clics: 11 },
    { jour: "Samedi", envoyés: 15, ouverts: 9, clics: 5 },
    { jour: "Dimanche", envoyés: 12, ouverts: 8, clics: 4 },
  ];

  const tauxEngagementParType = [
    { type: "Email", taux: 68 },
    { type: "SMS", taux: 85 },
    { type: "Appel", taux: 92 },
    { type: "Notification", taux: 73 },
  ];

  const tauxConversionParCategorie = [
    { categorie: "Prospection", taux: 12 },
    { categorie: "Qualification", taux: 18 },
    { categorie: "Proposition", taux: 25 },
    { categorie: "Négociation", taux: 38 },
    { categorie: "Clôture", taux: 45 },
    { categorie: "Suivi", taux: 32 },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setSelectedPeriod(event.target.value);
  };

  // Formater les pourcentages
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Formater les jours de la semaine
  const formatJour = (jour: number) => {
    const jours = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    return jours[jour];
  };

  // Formater les heures
  const formatHeure = (heure: number) => {
    return `${heure}h00`;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2">
          Analyse des Communications
        </Typography>

        <FormControl sx={{ width: 200 }}>
          <InputLabel id="period-select-label">Période</InputLabel>
          <Select
            labelId="period-select-label"
            id="period-select"
            value={selectedPeriod}
            label="Période"
            onChange={handlePeriodChange}
          >
            <MenuItem value="7d">7 derniers jours</MenuItem>
            <MenuItem value="30d">30 derniers jours</MenuItem>
            <MenuItem value="90d">90 derniers jours</MenuItem>
            <MenuItem value="year">Cette année</MenuItem>
            <MenuItem value="all">Toutes les données</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Métriques clés */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Taux d'ouverture
              </Typography>
              <Typography variant="h4" color="primary">
                {formatPercentage(metriques.tauxOuverture)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Taux de clics
              </Typography>
              <Typography variant="h4" color="primary">
                {formatPercentage(metriques.tauxClics)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Taux de réponses
              </Typography>
              <Typography variant="h4" color="primary">
                {formatPercentage(metriques.tauxReponses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Taux de rebonds
              </Typography>
              <Typography variant="h4" color="error">
                {formatPercentage(metriques.tauxRebonds)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Taux de désabonnement
              </Typography>
              <Typography variant="h4" color="error">
                {formatPercentage(metriques.tauxDesabonnement)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Onglets d'analyse */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Vue d'ensemble" />
          <Tab label="Engagement par modèle" />
          <Tab label="Optimisation horaire" />
          <Tab label="Performance des séquences" />
          <Tab label="Analyse par segment" />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Graphique des emails par jour */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Activité par jour de la semaine
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={emailsParJour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="jour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="envoyés" fill="#8884d8" name="Envoyés" />
                  <Bar dataKey="ouverts" fill="#82ca9d" name="Ouverts" />
                  <Bar dataKey="clics" fill="#ffc658" name="Clics" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Graphique des taux d'engagement par type */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Taux d'engagement par type
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={tauxEngagementParType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="taux"
                    nameKey="type"
                    label={(entry) => `${entry.type}: ${entry.taux}%`}
                  >
                    {tauxEngagementParType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Graphique des taux de conversion par catégorie */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Taux de conversion par étape de vente
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={tauxConversionParCategorie}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categorie" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="taux"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Taux de conversion"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Liste des meilleurs modèles */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance des modèles d'emails
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Grid
                  container
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    p: 1,
                    bgcolor: "background.default",
                  }}
                >
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Modèle</Typography>
                  </Grid>
                  <Grid item xs={2} align="center">
                    <Typography variant="subtitle2">Envois</Typography>
                  </Grid>
                  <Grid item xs={2} align="center">
                    <Typography variant="subtitle2">Ouvertures</Typography>
                  </Grid>
                  <Grid item xs={2} align="center">
                    <Typography variant="subtitle2">Clics</Typography>
                  </Grid>
                  <Grid item xs={2} align="center">
                    <Typography variant="subtitle2">
                      Taux d'engagement
                    </Typography>
                  </Grid>
                </Grid>
                <Divider />
                {metriques.meilleursTemplates.map((template, index) => (
                  <Box key={template.templateId}>
                    <Grid
                      container
                      sx={{ py: 1.5, ":hover": { bgcolor: "action.hover" } }}
                    >
                      <Grid item xs={4}>
                        <Typography variant="body2">
                          {template.templateNom}
                        </Typography>
                      </Grid>
                      <Grid item xs={2} align="center">
                        <Typography variant="body2">
                          {template.nombreEnvois}
                        </Typography>
                      </Grid>
                      <Grid item xs={2} align="center">
                        <Typography variant="body2">
                          {Math.round(
                            template.nombreEnvois * metriques.tauxOuverture
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={2} align="center">
                        <Typography variant="body2">
                          {Math.round(
                            template.nombreEnvois * metriques.tauxClics
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={2} align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              template.tauxEngagement > 0.7
                                ? "success.main"
                                : template.tauxEngagement > 0.5
                                ? "primary.main"
                                : "warning.main",
                            fontWeight: "bold",
                          }}
                        >
                          {formatPercentage(template.tauxEngagement)}
                        </Typography>
                      </Grid>
                    </Grid>
                    {index < metriques.meilleursTemplates.length - 1 && (
                      <Divider />
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Graphique des meilleurs horaires */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 500 }}>
              <Typography variant="h6" gutterBottom>
                Meilleurs moments pour l'envoi d'emails
              </Typography>
              <Box sx={{ mt: 2, mb: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Ce graphique montre les jours et horaires où les taux
                  d'engagement sont les plus élevés. Utilisez ces données pour
                  optimiser la planification de vos campagnes d'emails.
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={metriques.meilleursHoraires}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="jour"
                    tickFormatter={formatJour}
                    label={{
                      value: "Jour de la semaine",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Taux d'engagement",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${(value * 100).toFixed(1)}%`,
                      "Taux d'engagement",
                    ]}
                    labelFormatter={(jour) =>
                      `${formatJour(jour)} à ${formatHeure(
                        metriques.meilleursHoraires[jour].heure
                      )}`
                    }
                  />
                  <Bar
                    dataKey="tauxEngagement"
                    fill="#8884d8"
                    name="Taux d'engagement"
                  >
                    {metriques.meilleursHoraires.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recommandations pour l'optimisation des envois
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" paragraph>
                  Basé sur l'analyse de vos données, nous recommandons de
                  programmer vos envois principalement :
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body1">
                      Le <strong>mardi</strong> et le <strong>jeudi</strong>{" "}
                      entre <strong>10h et 11h</strong> pour les emails
                      professionnels
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      Le <strong>lundi</strong> entre <strong>9h et 10h</strong>{" "}
                      pour les rappels et suivis
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      Évitez les envois le <strong>vendredi après-midi</strong>{" "}
                      et le <strong>weekend</strong> qui montrent des taux
                      d'engagement plus faibles
                    </Typography>
                  </li>
                </ul>
                <Typography variant="body1" paragraph>
                  En activant l'option d'optimisation horaire pour vos envois
                  programmés, le système choisira automatiquement le meilleur
                  moment pour maximiser les chances d'ouverture et d'engagement.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">Analyse des séquences d'emails</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Cette fonctionnalité sera disponible prochainement.
          </Typography>
        </Box>
      )}

      {activeTab === 4 && (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">Analyse par segment client</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Cette fonctionnalité sera disponible prochainement.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CommunicationAnalytics;
