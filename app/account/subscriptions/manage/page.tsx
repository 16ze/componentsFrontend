import { Metadata } from "next";
import SubscriptionManagement from "@/components/subscription/SubscriptionManagement";

export const metadata: Metadata = {
  title: "Gérer mon abonnement | Mon Application SaaS",
  description:
    "Gérez votre abonnement, consultez vos factures et suivez votre utilisation.",
};

export default function ManageSubscriptionPage() {
  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gérer mon abonnement
        </h1>
        <p className="text-muted-foreground mt-2">
          Consultez les détails de votre abonnement, gérez vos paiements et
          suivez votre utilisation
        </p>
      </div>

      <SubscriptionManagement />
    </div>
  );
}
