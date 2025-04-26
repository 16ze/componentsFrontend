import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/index";
import {
  BarChart as BarChartIcon,
  PieChart,
  LineChart,
  ArrowLeft,
  Download,
  RefreshCw,
  Users,
  TrendingUp,
  TrendingDown,
  Percent,
  UserCheck,
  Mail,
  Tag,
  Calendar,
  Activity,
  DollarSign,
  Target,
  Share2,
} from "lucide-react";
import useSegmentationStore from "@/stores/segmentationStore";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Line,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function SegmentDashboard() {
  const router = useRouter();
  const params = useParams();
  const segmentId = params?.id as string;

  const {
    getSegmentById,
    calculateSegmentAnalytics,
    segmentAnalytics,
    tags,
    getSegmentsByTag,
    getTagById,
  } = useSegmentationStore();

  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  // Récupérer le segment
  const segment = getSegmentById(segmentId);
  const analytics = segmentAnalytics[segmentId];

  // Charger les données
  useEffect(() => {
    if (segmentId && !analytics) {
      calculateSegmentAnalytics(segmentId);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [segmentId, analytics, calculateSegmentAnalytics]);

  // Obtenir les tags associés au segment
  const segmentTags = segment?.tags
    ? segment.tags.map((tagId) => getTagById(tagId)).filter(Boolean)
    : [];

  // Obtenir les segments similaires (qui partagent au moins un tag)
  const getSimilarSegments = () => {
    if (!segment?.tags || segment.tags.length === 0) return [];

    const similarSegmentIds = new Set<string>();

    segment.tags.forEach((tagId) => {
      const segmentsWithTag = getSegmentsByTag(tagId);
      segmentsWithTag.forEach((s) => {
        if (s.id !== segmentId) {
          similarSegmentIds.add(s.id);
        }
      });
    });

    return Array.from(similarSegmentIds)
      .map((id) => getSegmentById(id))
      .filter(Boolean);
  };

  const similarSegments = getSimilarSegments();

  if (!segment) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <h1 className="text-xl font-bold mb-4">Segment non trouvé</h1>
        <p className="text-muted-foreground mb-6">
          Le segment demandé n'existe pas ou a été supprimé.
        </p>
        <Button onClick={() => router.push("/segments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste des segments
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Non disponible";
    return format(new Date(dateString), "dd MMMM yyyy à HH:mm", { locale: fr });
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("fr-FR").format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  // Refresh analytics
  const handleRefreshAnalytics = () => {
    setIsLoading(true);
    calculateSegmentAnalytics(segmentId);
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Couleurs pour les graphiques
  const colors = {
    primary: "#3b82f6",
    secondary: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#6366f1",
    success: "#22c55e",
  };

  // Données simulées pour les graphiques
  const getChartData = () => {
    const months = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];

    const now = new Date();
    const currentMonth = now.getMonth();

    // Générer des données pour les 12 derniers mois
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = (currentMonth - 11 + i + 12) % 12;
      return {
        month: months[monthIndex],
        count: Math.round(100 + Math.random() * 500),
        growth: Math.round(-10 + Math.random() * 20),
        revenue: Math.round(1000 + Math.random() * 5000),
      };
    });

    return last12Months;
  };

  // Données de distribution par catégorie
  const getDistributionData = () => [
    { name: "Nouveaux", value: 30, color: colors.primary },
    { name: "Actifs", value: 45, color: colors.success },
    { name: "En risque", value: 15, color: colors.warning },
    { name: "Inactifs", value: 10, color: colors.error },
  ];

  // Données des métriques clés
  const getKpiData = () => {
    // Si nous avons des analytiques réelles, les utiliser
    if (analytics && analytics.kpis) {
      return {
        totalMembers: analytics.kpis.memberCount || 0,
        growthRate: analytics.kpis.growthRate || 0,
        activeMembers: analytics.kpis.activeMembers || 0,
        conversionRate: analytics.kpis.conversionRate || 0,
        averageRevenue: analytics.kpis.averageRevenue || 0,
      };
    }

    // Sinon, retourner des données simulées
    return {
      totalMembers: 1245,
      growthRate: 8.5,
      activeMembers: 876,
      conversionRate: 23.4,
      averageRevenue: 742,
    };
  };

  const chartData = getChartData();
  const distributionData = getDistributionData();
  const kpiData = getKpiData();

  const renderKpiCard = (
    title: string,
    value: number | string,
    change: number,
    icon: React.ReactNode,
    suffix: string = ""
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline mt-1">
              <h3 className="text-2xl font-bold">
                {value}
                {suffix && <span className="text-sm ml-1">{suffix}</span>}
              </h3>
              <span
                className={`ml-2 flex items-center text-sm font-medium ${
                  change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(change)}%
              </span>
            </div>
          </div>
          <div className="rounded-full bg-primary/10 p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/segments")}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{segment.name}</h1>

            <div className="ml-3 flex space-x-1">
              {segmentTags.map((tag) => (
                <Badge
                  key={tag?.id}
                  variant="outline"
                  style={{
                    backgroundColor: `${tag?.color}20`,
                    borderColor: tag?.color,
                    color: tag?.color,
                  }}
                >
                  {tag?.name}
                </Badge>
              ))}
            </div>
          </div>
          <p className="text-muted-foreground">
            {segment.description || "Aucune description"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Select
            value={timeRange}
            onValueChange={(value: "7d" | "30d" | "90d" | "1y") =>
              setTimeRange(value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefreshAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => router.push(`/segments/edit/${segmentId}`)}>
            Modifier le segment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKpiCard(
          "Total Membres",
          kpiData.totalMembers,
          kpiData.growthRate,
          <Users className="h-5 w-5 text-primary" />
        )}
        {renderKpiCard(
          "Taux de Croissance",
          kpiData.growthRate,
          2.3,
          <TrendingUp className="h-5 w-5 text-primary" />,
          "%"
        )}
        {renderKpiCard(
          "Membres Actifs",
          kpiData.activeMembers,
          -1.8,
          <Activity className="h-5 w-5 text-primary" />
        )}
        {renderKpiCard(
          "Valeur Moyenne",
          kpiData.averageRevenue,
          12.5,
          <DollarSign className="h-5 w-5 text-primary" />,
          "€"
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="demographics">Démographie</TabsTrigger>
          <TabsTrigger value="behavior">Comportement</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Évolution des membres</CardTitle>
                <CardDescription>
                  Évolution du nombre de membres dans le temps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={colors.primary}
                        activeDot={{ r: 8 }}
                        name="Membres"
                      />
                      <Line
                        type="monotone"
                        dataKey="growth"
                        stroke={colors.secondary}
                        name="Croissance (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
                <CardDescription>
                  Répartition des membres par statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          percent,
                          name,
                        }) => {
                          const radius =
                            innerRadius + (outerRadius - innerRadius) * 1.1;
                          const x =
                            cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                          const y =
                            cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                          return (
                            <text
                              x={x}
                              y={y}
                              fill="#888"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              fontSize={12}
                            >
                              {`${name} (${(percent * 100).toFixed(0)}%)`}
                            </text>
                          );
                        }}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance par Canal</CardTitle>
                <CardDescription>
                  Répartition des membres par canal d'acquisition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Organique",
                          value: 400,
                          color: colors.primary,
                        },
                        { name: "Social", value: 300, color: colors.secondary },
                        { name: "Email", value: 200, color: colors.info },
                        {
                          name: "Référents",
                          value: 150,
                          color: colors.warning,
                        },
                        { name: "Direct", value: 100, color: colors.error },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Membres">
                        {[
                          {
                            name: "Organique",
                            value: 400,
                            color: colors.primary,
                          },
                          {
                            name: "Social",
                            value: 300,
                            color: colors.secondary,
                          },
                          { name: "Email", value: 200, color: colors.info },
                          {
                            name: "Référents",
                            value: 150,
                            color: colors.warning,
                          },
                          { name: "Direct", value: 100, color: colors.error },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendances des Revenus</CardTitle>
                <CardDescription>
                  Évolution des revenus générés par les membres de ce segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={colors.success}
                        activeDot={{ r: 8 }}
                        name="Revenus (€)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Données Démographiques</CardTitle>
              <CardDescription>
                Répartition géographique et démographique des membres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Cartes et visualisations démographiques
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse Comportementale</CardTitle>
              <CardDescription>
                Comportement d'achat et d'engagement des membres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Graphiques d'analyse comportementale
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parcours de Conversion</CardTitle>
              <CardDescription>
                Taux de conversion et parcours d'achat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Entonnoirs de conversion et métriques
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prévisions</CardTitle>
              <CardDescription>
                Prévisions et recommandations basées sur l'IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-4">
                    Croissance Prévue
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Prochain mois</span>
                      <div className="flex items-center">
                        <span className="font-bold mr-2">+12%</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Prochain trimestre</span>
                      <div className="flex items-center">
                        <span className="font-bold mr-2">+28%</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Prochaine année</span>
                      <div className="flex items-center">
                        <span className="font-bold mr-2">+65%</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-4">Recommandations</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Target className="h-5 w-5 mr-2 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">
                          Cibler les clients inactifs
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Campagne de réengagement pour 122 clients inactifs
                          depuis 60 jours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Share2 className="h-5 w-5 mr-2 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Programme de parrainage</p>
                        <p className="text-sm text-muted-foreground">
                          Potentiel d'acquisition de 240 nouveaux clients
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Informations sur le segment</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Créé le</dt>
              <dd>{formatDate(segment.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dernière modification</dt>
              <dd>{formatDate(segment.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dernier calcul</dt>
              <dd>{formatDate(segment.lastCalculatedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Type de segment</dt>
              <dd>
                {segment.type === "dynamic"
                  ? "Dynamique"
                  : segment.type === "static"
                  ? "Statique"
                  : "Mixte"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
