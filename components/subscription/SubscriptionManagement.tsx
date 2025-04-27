import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSubscriptionStore, Plan } from "@/stores/subscriptionStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export default function SubscriptionManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    plans,
    fetchPlans,
    currentSubscription,
    fetchCurrentSubscription,
    invoices,
    fetchInvoices,
    usageMetrics,
    fetchUsageMetrics,
    isLoading,
    cancelSubscription,
    changePlan,
  } = useSubscriptionStore();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
    fetchInvoices();
    fetchUsageMetrics();
  }, [fetchPlans, fetchCurrentSubscription, fetchInvoices, fetchUsageMetrics]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentSubscription) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="mb-4">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aucun abonnement actif</h3>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas d'abonnement actif pour le moment.
          </p>
          <Button onClick={() => router.push("/account/subscriptions")}>
            Voir les plans disponibles
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = plans.find((p) => p.id === currentSubscription.planId);

  const handleUpgrade = () => {
    router.push("/account/subscriptions/change-plan");
  };

  const handleCancel = async () => {
    setIsCancelling(true);

    const success = await cancelSubscription(cancelImmediately);

    if (success) {
      setShowCancelDialog(false);
      toast({
        title: "Abonnement annulé",
        description: cancelImmediately
          ? "Votre abonnement a été annulé immédiatement."
          : "Votre abonnement sera annulé à la fin de la période de facturation.",
      });
    }

    setIsCancelling(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

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

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-8 grid w-full grid-cols-3 md:w-auto">
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="invoices">Factures</TabsTrigger>
        <TabsTrigger value="usage">Utilisation</TabsTrigger>
      </TabsList>

      {/* Onglet Aperçu */}
      <TabsContent value="overview">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'abonnement</CardTitle>
              <CardDescription>
                Informations sur votre plan actuel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">
                    {currentPlan?.name || "Plan inconnu"}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentPlan?.description}
                  </p>
                </div>
                {getStatusBadge(currentSubscription.status)}
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Prix</span>
                  <span className="font-medium">
                    {currentSubscription.period === "monthly"
                      ? `${currentPlan?.monthlyPrice || "--"}€ / mois`
                      : `${currentPlan?.yearlyPrice || "--"}€ / an`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Début de période
                  </span>
                  <span className="font-medium">
                    {formatDate(currentSubscription.currentPeriodStart)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fin de période</span>
                  <span className="font-medium">
                    {formatDate(currentSubscription.currentPeriodEnd)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Mode de facturation
                  </span>
                  <span className="font-medium">
                    {currentSubscription.period === "monthly"
                      ? "Mensuel"
                      : "Annuel"}
                  </span>
                </div>

                {currentSubscription.cancellationDate && (
                  <div className="flex justify-between items-center text-red-500">
                    <span>Annulation prévue le</span>
                    <span className="font-medium">
                      {formatDate(currentSubscription.cancellationDate)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                className="w-full"
                variant="outline"
                onClick={handleUpgrade}
              >
                Changer de plan
              </Button>

              {currentSubscription.status !== "canceled" && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Annuler l'abonnement
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limites et utilisations</CardTitle>
              <CardDescription>Votre consommation actuelle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {usageMetrics && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Utilisateurs</span>
                      <span className="text-sm text-muted-foreground">
                        {usageMetrics.users.current} /{" "}
                        {usageMetrics.users.limit === Infinity
                          ? "Illimité"
                          : usageMetrics.users.limit}
                      </span>
                    </div>
                    <Progress
                      value={
                        usageMetrics.users.limit === Infinity
                          ? 50
                          : (usageMetrics.users.current /
                              usageMetrics.users.limit) *
                            100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Stockage</span>
                      <span className="text-sm text-muted-foreground">
                        {usageMetrics.storage.current} GB /{" "}
                        {usageMetrics.storage.limit} GB
                      </span>
                    </div>
                    <Progress
                      value={
                        (usageMetrics.storage.current /
                          usageMetrics.storage.limit) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Projets</span>
                      <span className="text-sm text-muted-foreground">
                        {usageMetrics.projects.current} /{" "}
                        {usageMetrics.projects.limit === Infinity
                          ? "Illimité"
                          : usageMetrics.projects.limit}
                      </span>
                    </div>
                    <Progress
                      value={
                        usageMetrics.projects.limit === Infinity
                          ? 50
                          : (usageMetrics.projects.current /
                              usageMetrics.projects.limit) *
                            100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Appels API</span>
                      <span className="text-sm text-muted-foreground">
                        {usageMetrics.apiCalls.current.toLocaleString()} /{" "}
                        {usageMetrics.apiCalls.limit === Infinity
                          ? "Illimité"
                          : usageMetrics.apiCalls.limit.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        usageMetrics.apiCalls.limit === Infinity
                          ? 50
                          : (usageMetrics.apiCalls.current /
                              usageMetrics.apiCalls.limit) *
                            100
                      }
                      className="h-2"
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/account/subscriptions/usage")}
              >
                Voir les détails d'utilisation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>

      {/* Onglet Factures */}
      <TabsContent value="invoices">
        <Card>
          <CardHeader>
            <CardTitle>Historique de facturation</CardTitle>
            <CardDescription>Vos factures et paiements</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">N° Facture</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Montant</th>
                      <th className="text-left py-3 px-4">Statut</th>
                      <th className="text-right py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{invoice.number}</td>
                        <td className="py-3 px-4">
                          {formatDate(invoice.date)}
                        </td>
                        <td className="py-3 px-4">{invoice.amount}€</td>
                        <td className="py-3 px-4">
                          {invoice.status === "paid" && (
                            <Badge className="bg-green-500">Payée</Badge>
                          )}
                          {invoice.status === "pending" && (
                            <Badge className="bg-yellow-500">En attente</Badge>
                          )}
                          {invoice.status === "failed" && (
                            <Badge className="bg-red-500">Échec</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button size="sm" variant="ghost" asChild>
                            <a
                              href={invoice.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </a>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">
                  Aucune facture disponible
                </h3>
                <p className="text-muted-foreground mt-2">
                  Votre historique de facturation apparaîtra ici une fois que
                  vous aurez été facturé.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Onglet Utilisation */}
      <TabsContent value="usage">
        <Card>
          <CardHeader>
            <CardTitle>Métriques d'utilisation</CardTitle>
            <CardDescription>
              Votre consommation par rapport aux limites de votre plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usageMetrics ? (
              <div className="space-y-6">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Utilisateurs</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Utilisateurs actifs</span>
                      <span className="font-medium">
                        {usageMetrics.users.current} /{" "}
                        {usageMetrics.users.limit === Infinity
                          ? "Illimité"
                          : usageMetrics.users.limit}
                      </span>
                    </div>
                    <Progress
                      value={
                        usageMetrics.users.limit === Infinity
                          ? 50
                          : (usageMetrics.users.current /
                              usageMetrics.users.limit) *
                            100
                      }
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {usageMetrics.users.limit === Infinity
                        ? "Vous pouvez ajouter un nombre illimité d'utilisateurs avec votre plan actuel."
                        : usageMetrics.users.current >=
                          usageMetrics.users.limit * 0.8
                        ? `Vous approchez de votre limite d'utilisateurs. Envisagez de passer à un plan supérieur.`
                        : `Vous pouvez encore ajouter ${
                            usageMetrics.users.limit -
                            usageMetrics.users.current
                          } utilisateurs supplémentaires.`}
                    </p>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Stockage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Espace utilisé</span>
                      <span className="font-medium">
                        {usageMetrics.storage.current} GB /{" "}
                        {usageMetrics.storage.limit} GB
                      </span>
                    </div>
                    <Progress
                      value={
                        (usageMetrics.storage.current /
                          usageMetrics.storage.limit) *
                        100
                      }
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {usageMetrics.storage.current >=
                      usageMetrics.storage.limit * 0.8
                        ? `Vous approchez de votre limite de stockage. Envisagez de passer à un plan supérieur ou de supprimer des fichiers inutilisés.`
                        : `Vous disposez encore de ${(
                            usageMetrics.storage.limit -
                            usageMetrics.storage.current
                          ).toFixed(1)} GB d'espace disponible.`}
                    </p>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Projets</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Projets actifs</span>
                      <span className="font-medium">
                        {usageMetrics.projects.current} /{" "}
                        {usageMetrics.projects.limit === Infinity
                          ? "Illimité"
                          : usageMetrics.projects.limit}
                      </span>
                    </div>
                    <Progress
                      value={
                        usageMetrics.projects.limit === Infinity
                          ? 50
                          : (usageMetrics.projects.current /
                              usageMetrics.projects.limit) *
                            100
                      }
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {usageMetrics.projects.limit === Infinity
                        ? "Vous pouvez créer un nombre illimité de projets avec votre plan actuel."
                        : usageMetrics.projects.current >=
                          usageMetrics.projects.limit * 0.8
                        ? `Vous approchez de votre limite de projets. Envisagez de passer à un plan supérieur.`
                        : `Vous pouvez encore créer ${
                            usageMetrics.projects.limit -
                            usageMetrics.projects.current
                          } projets supplémentaires.`}
                    </p>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">API</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Appels API ce mois-ci</span>
                      <span className="font-medium">
                        {usageMetrics.apiCalls.current.toLocaleString()} /{" "}
                        {usageMetrics.apiCalls.limit === Infinity
                          ? "Illimité"
                          : usageMetrics.apiCalls.limit.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        usageMetrics.apiCalls.limit === Infinity
                          ? 50
                          : (usageMetrics.apiCalls.current /
                              usageMetrics.apiCalls.limit) *
                            100
                      }
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {usageMetrics.apiCalls.limit === Infinity
                        ? "Vous disposez d'un nombre illimité d'appels API avec votre plan actuel."
                        : usageMetrics.apiCalls.current >=
                          usageMetrics.apiCalls.limit * 0.8
                        ? `Vous approchez de votre limite d'appels API. Envisagez de passer à un plan supérieur.`
                        : `Il vous reste ${(
                            usageMetrics.apiCalls.limit -
                            usageMetrics.apiCalls.current
                          ).toLocaleString()} appels API pour ce mois.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-yellow-500" />
                <h3 className="mt-4 text-lg font-medium">
                  Données non disponibles
                </h3>
                <p className="text-muted-foreground mt-2">
                  Nous ne pouvons pas récupérer vos données d'utilisation pour
                  le moment.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {currentPlan && (
              <div className="w-full">
                <p className="mb-4 text-center text-muted-foreground">
                  Besoin de plus de ressources? Passez à un forfait supérieur
                  pour augmenter vos limites.
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={handleUpgrade} className="gap-2">
                    <ArrowUpCircle className="h-4 w-4" /> Mettre à niveau
                  </Button>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Dialogue de confirmation d'annulation */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'annulation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler votre abonnement ? Cette action
              entraînera la perte d'accès à certaines fonctionnalités premium.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-start space-x-4">
              <div
                className={`mt-0.5 ${
                  cancelImmediately ? "text-red-500" : "text-green-500"
                }`}
              >
                {cancelImmediately ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h4 className="font-medium">Option recommandée</h4>
                <p className="text-sm text-muted-foreground">
                  Annuler à la fin de votre période de facturation actuelle (
                  {formatDate(currentSubscription.currentPeriodEnd)}). Vous
                  conserverez l'accès jusqu'à cette date.
                </p>
                <Button
                  variant="ghost"
                  className="mt-2"
                  onClick={() => setCancelImmediately(false)}
                >
                  Sélectionner
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div
                className={`mt-0.5 ${
                  cancelImmediately ? "text-green-500" : "text-muted-foreground"
                }`}
              >
                {cancelImmediately ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h4 className="font-medium">Annulation immédiate</h4>
                <p className="text-sm text-muted-foreground">
                  Annuler immédiatement. Vous perdrez l'accès aux
                  fonctionnalités premium dès maintenant et aucun remboursement
                  ne sera effectué.
                </p>
                <Button
                  variant="ghost"
                  className="mt-2"
                  onClick={() => setCancelImmediately(true)}
                >
                  Sélectionner
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling
                ? "Traitement en cours..."
                : "Confirmer l'annulation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
