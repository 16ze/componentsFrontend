import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  TrendingDown,
  TrendingUp,
  Users,
  CreditCard,
  Search,
  Download,
  MoreVertical,
  Calendar,
  PieChart,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

// Types pour les données du tableau de bord
interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  canceledSubscriptions: number;
  mrr: number;
  arr: number;
  mrrGrowth: number;
  activeRate: number;
  churnRate: number;
}

interface SubscriptionListItem {
  id: string;
  customerName: string;
  customerEmail: string;
  plan: string;
  status: "active" | "trialing" | "canceled" | "past_due" | "incomplete";
  startDate: string;
  endDate: string;
  amount: number;
  period: "monthly" | "yearly";
}

interface RevenueByPlan {
  planName: string;
  revenue: number;
  percentage: number;
  subscribers: number;
}

export default function SubscriptionDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionListItem[]>(
    []
  );
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlan[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionListItem | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Charger les données au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Simuler un appel API pour les métriques
        // En production, remplacez par un vrai appel API
        setTimeout(() => {
          setMetrics({
            totalSubscriptions: 156,
            activeSubscriptions: 124,
            trialingSubscriptions: 18,
            canceledSubscriptions: 14,
            mrr: 8365,
            arr: 100380,
            mrrGrowth: 5.2,
            activeRate: 79.5,
            churnRate: 3.8,
          });

          // Données fictives pour les abonnements
          setSubscriptions([
            {
              id: "sub_123456",
              customerName: "Jean Dupont",
              customerEmail: "jean.dupont@example.com",
              plan: "Pro",
              status: "active",
              startDate: "2023-09-15T10:00:00Z",
              endDate: "2023-10-15T10:00:00Z",
              amount: 79,
              period: "monthly",
            },
            {
              id: "sub_234567",
              customerName: "Marie Martin",
              customerEmail: "marie.martin@example.com",
              plan: "Enterprise",
              status: "active",
              startDate: "2023-08-05T14:30:00Z",
              endDate: "2024-08-05T14:30:00Z",
              amount: 1990,
              period: "yearly",
            },
            {
              id: "sub_345678",
              customerName: "Pierre Durand",
              customerEmail: "pierre.durand@example.com",
              plan: "Basic",
              status: "trialing",
              startDate: "2023-10-10T09:15:00Z",
              endDate: "2023-10-24T09:15:00Z",
              amount: 29,
              period: "monthly",
            },
            {
              id: "sub_456789",
              customerName: "Sophie Leroy",
              customerEmail: "sophie.leroy@example.com",
              plan: "Pro",
              status: "past_due",
              startDate: "2023-09-20T16:45:00Z",
              endDate: "2023-10-20T16:45:00Z",
              amount: 79,
              period: "monthly",
            },
            {
              id: "sub_567890",
              customerName: "Lucas Moreau",
              customerEmail: "lucas.moreau@example.com",
              plan: "Basic",
              status: "canceled",
              startDate: "2023-08-25T11:20:00Z",
              endDate: "2023-09-25T11:20:00Z",
              amount: 29,
              period: "monthly",
            },
            {
              id: "sub_678901",
              customerName: "Emma Bernard",
              customerEmail: "emma.bernard@example.com",
              plan: "Pro",
              status: "active",
              startDate: "2023-09-05T08:30:00Z",
              endDate: "2023-10-05T08:30:00Z",
              amount: 79,
              period: "monthly",
            },
          ]);

          // Données pour la répartition des revenus par plan
          setRevenueByPlan([
            {
              planName: "Basic",
              revenue: 1450,
              percentage: 17.3,
              subscribers: 50,
            },
            {
              planName: "Pro",
              revenue: 4661,
              percentage: 55.7,
              subscribers: 59,
            },
            {
              planName: "Enterprise",
              revenue: 2254,
              percentage: 27.0,
              subscribers: 11,
            },
          ]);

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
        setIsLoading(false);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données du tableau de bord.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  // Filtrer les abonnements selon les critères
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
    const matchesPlan = filterPlan === "all" || sub.plan === filterPlan;
    const matchesSearch =
      searchQuery === "" ||
      sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPlan && matchesSearch;
  });

  // Formatage de la date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  // Gestion des actions sur les abonnements
  const handleAction = (action: string, subscription: SubscriptionListItem) => {
    setSelectedSubscription(subscription);

    switch (action) {
      case "view":
        // Rediriger vers la page de détails
        console.log("Voir les détails de", subscription.id);
        break;
      case "edit":
        // Ouvrir le formulaire d'édition
        console.log("Modifier", subscription.id);
        break;
      case "cancel":
        // Ouvrir la boîte de dialogue de confirmation d'annulation
        setShowCancelDialog(true);
        break;
      default:
        break;
    }
  };

  // Annuler un abonnement
  const handleCancelSubscription = () => {
    if (!selectedSubscription) return;

    // Simuler l'annulation
    // En production, appel API réel
    setTimeout(() => {
      const updatedSubscriptions = subscriptions.map((sub) =>
        sub.id === selectedSubscription.id
          ? { ...sub, status: "canceled" as const }
          : sub
      );

      setSubscriptions(updatedSubscriptions);
      setShowCancelDialog(false);

      toast({
        title: "Abonnement annulé",
        description: `L'abonnement de ${selectedSubscription.customerName} a été annulé avec succès.`,
      });
    }, 800);
  };

  // Afficher le badge de statut approprié
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Actif</Badge>;
      case "trialing":
        return <Badge className="bg-blue-500">Essai</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">Annulé</Badge>;
      case "past_due":
        return <Badge className="bg-yellow-500">Paiement en retard</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Exporter les données
  const handleExport = () => {
    toast({
      title: "Export initié",
      description:
        "Les données d'abonnement sont en cours d'exportation. Vous recevrez un email lorsque le fichier sera prêt.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cartes de métriques */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenu mensuel récurrent
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.mrr.toLocaleString()}€
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.mrrGrowth > 0 ? (
                  <span className="flex items-center text-green-500">
                    <TrendingUp className="mr-1 h-3 w-3" /> +{metrics.mrrGrowth}
                    % par rapport au mois dernier
                  </span>
                ) : (
                  <span className="flex items-center text-red-500">
                    <TrendingDown className="mr-1 h-3 w-3" />{" "}
                    {metrics.mrrGrowth}% par rapport au mois dernier
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Abonnements actifs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.activeSubscriptions}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.activeRate}% du total des abonnements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taux de résiliation
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.churnRate}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.canceledSubscriptions} abonnements annulés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenu annuel prévu
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.arr.toLocaleString()}€
              </div>
              <p className="text-xs text-muted-foreground">
                Basé sur les abonnements actuels
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-3.5 w-3.5" />
                <span>Statut</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="trialing">En essai</SelectItem>
                <SelectItem value="past_due">Paiement en retard</SelectItem>
                <SelectItem value="canceled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-3.5 w-3.5" />
                <span>Plan</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Tableau des abonnements */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnements</CardTitle>
          <CardDescription>
            {filteredSubscriptions.length} abonnements trouvés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de début</TableHead>
                <TableHead>Date de fin</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {subscription.customerName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{subscription.plan}</TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>{formatDate(subscription.startDate)}</TableCell>
                    <TableCell>{formatDate(subscription.endDate)}</TableCell>
                    <TableCell className="text-right">
                      {subscription.amount}€/
                      {subscription.period === "monthly" ? "mois" : "an"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleAction("view", subscription)}
                          >
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction("edit", subscription)}
                          >
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {subscription.status !== "canceled" && (
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() =>
                                handleAction("cancel", subscription)
                              }
                            >
                              Annuler l'abonnement
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Aucun abonnement trouvé
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Distribution des revenus par plan */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des revenus par plan</CardTitle>
          <CardDescription>
            MRR total par plan pour le mois en cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueByPlan.map((plan) => (
              <div key={plan.planName} className="flex items-center">
                <div className="w-48">
                  <div className="font-medium">{plan.planName}</div>
                  <div className="text-xs text-muted-foreground">
                    {plan.subscribers} abonnés
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          plan.planName === "Basic"
                            ? "bg-blue-500"
                            : plan.planName === "Pro"
                            ? "bg-purple-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${plan.percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-24 text-sm">
                      {plan.revenue.toLocaleString()}€ (
                      {plan.percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialogue de confirmation d'annulation */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler l'abonnement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler l'abonnement de{" "}
              {selectedSubscription?.customerName} ? Cette action ne peut pas
              être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex items-center space-x-3 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">
              L'utilisateur perdra immédiatement l'accès aux fonctionnalités
              premium.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
