"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  format,
  subDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  BarChart3,
  Calendar as CalendarIcon,
  PieChart as PieChartIcon,
  ArrowUpRight,
  Users,
  Clock,
  Calendar as CalIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Sonner, toast } from "sonner";

// Simulated data - in a real app, this would come from an API call
const bookingData = [
  { date: "2025-04-20", type: "consultation", count: 5, revenue: 250 },
  { date: "2025-04-21", type: "discovery", count: 3, revenue: 90 },
  { date: "2025-04-22", type: "followup", count: 7, revenue: 210 },
  { date: "2025-04-23", type: "consultation", count: 4, revenue: 200 },
  { date: "2025-04-24", type: "discovery", count: 6, revenue: 180 },
  { date: "2025-04-25", type: "followup", count: 3, revenue: 90 },
  { date: "2025-04-26", type: "consultation", count: 8, revenue: 400 },
];

const appointmentTypes = [
  { id: "discovery", name: "Découverte", color: "#3b82f6" },
  { id: "consultation", name: "Consultation", color: "#10b981" },
  { id: "followup", name: "Suivi", color: "#8b5cf6" },
];

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    conversionRate: 0,
    averageDuration: 0,
  });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Colors based on theme
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const textColor = isDark ? "#f8fafc" : "#1e293b";

  // Chart customization
  const chartConfig = {
    axisColor,
    gridColor,
    tooltipStyle: {
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      color: textColor,
    },
  };

  // Calculate filtered data based on date range
  const getFilteredData = () => {
    let startDate;

    switch (dateRange) {
      case "week":
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case "month":
        startDate = startOfMonth(new Date());
        break;
      case "custom":
        // For custom, we just use the selected date
        return bookingData.filter(
          (item) => item.date === format(selectedDate, "yyyy-MM-dd")
        );
      default:
        startDate = subDays(new Date(), 7);
    }

    return bookingData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  };

  // Calculate metrics from filtered data
  useEffect(() => {
    const filtered = getFilteredData();

    const totalBookings = filtered.reduce((sum, item) => sum + item.count, 0);
    const totalRevenue = filtered.reduce((sum, item) => sum + item.revenue, 0);

    // Simulated metrics
    const conversionRate =
      totalBookings > 0
        ? (totalBookings / (totalBookings * 1.5)).toFixed(2) * 100
        : 0;
    const averageDuration =
      filtered.length > 0
        ? Math.round(
            filtered.reduce((sum, item) => {
              // Simulated duration based on type
              let duration = 30; // default
              if (item.type === "consultation") duration = 60;
              if (item.type === "followup") duration = 45;
              return sum + duration * item.count;
            }, 0) / totalBookings
          )
        : 0;

    setMetrics({
      totalBookings,
      totalRevenue,
      conversionRate,
      averageDuration,
    });
  }, [dateRange, selectedDate]);

  // Distribution by appointment type for pie chart
  const getTypeDistribution = () => {
    const filtered = getFilteredData();
    const distribution = appointmentTypes.map((type) => {
      const typeData = filtered.filter((item) => item.type === type.id);
      const count = typeData.reduce((sum, item) => sum + item.count, 0);
      return {
        name: type.name,
        value: count,
        color: type.color,
      };
    });

    return distribution;
  };

  // Get daily booking counts for bar chart
  const getDailyBookings = () => {
    const filtered = getFilteredData();

    // Group by date
    const dailyData = {};
    filtered.forEach((item) => {
      if (!dailyData[item.date]) {
        dailyData[item.date] = { date: item.date, total: 0 };
      }
      dailyData[item.date].total += item.count;
      dailyData[item.date][item.type] = item.count;
    });

    return Object.values(dailyData).map((day) => ({
      ...day,
      date: format(new Date(day.date), "dd/MM"),
    }));
  };

  // Handle export data
  const handleExport = () => {
    toast.success("Export des données en cours...");
    // Simulating export functionality
    setTimeout(() => {
      toast.success("Données exportées avec succès!");
    }, 1500);
  };

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de vos réservations et performances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <div className="relative">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </div>
          )}

          <Button variant="outline" onClick={handleExport}>
            Exporter
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total des Réservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{metrics.totalBookings}</div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <Users className="h-4 w-4 text-green-600 dark:text-green-300" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span>+12% depuis la période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{metrics.totalRevenue} €</div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span>+8% depuis la période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {metrics.conversionRate}%
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                <PieChartIcon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span>+2% depuis la période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Durée Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {metrics.averageDuration} min
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span>Stable depuis la période précédente</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Réservations par Jour</CardTitle>
            <CardDescription>
              Distribution des réservations pour la période sélectionnée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDailyBookings()}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartConfig.gridColor}
                />
                <XAxis dataKey="date" stroke={chartConfig.axisColor} />
                <YAxis stroke={chartConfig.axisColor} />
                <Tooltip
                  contentStyle={chartConfig.tooltipStyle}
                  cursor={{
                    fill: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                {appointmentTypes.map((type) => (
                  <Bar
                    key={type.id}
                    dataKey={type.id}
                    name={type.name}
                    fill={type.color}
                    stackId="a"
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution par Type</CardTitle>
            <CardDescription>
              Répartition des rendez-vous par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full max-w-xs">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getTypeDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {getTypeDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} réservations`, "Nombre"]}
                    contentStyle={chartConfig.tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-wrap justify-center gap-4 w-full">
              {appointmentTypes.map((type) => (
                <div key={type.id} className="flex items-center">
                  <div
                    className="w-3 h-3 mr-2 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-sm">{type.name}</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>

      <Sonner position="bottom-right" />
    </div>
  );
}
