import { Metadata } from "next";
import SubscriptionDashboard from "@/components/admin/subscriptions/SubscriptionDashboard";

export const metadata: Metadata = {
  title: "Gestion des Abonnements | Admin",
  description:
    "Tableau de bord administrateur pour la gestion des abonnements et des paiements.",
};

export default function AdminSubscriptionsPage() {
  return (
    <div className="container p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestion des Abonnements
        </h1>
        <p className="text-muted-foreground mt-2">
          Surveillez et gérez les abonnements, analysez les revenus et traitez
          les demandes spéciales
        </p>
      </div>

      <SubscriptionDashboard />
    </div>
  );
}
