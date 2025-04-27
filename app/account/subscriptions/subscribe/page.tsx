import { Metadata } from "next";
import SubscriptionForm from "@/components/subscription/SubscriptionForm";

export const metadata: Metadata = {
  title: "Souscrire à un abonnement | Mon Application SaaS",
  description:
    "Souscrivez à un plan et commencez à profiter de toutes les fonctionnalités.",
};

export default function SubscribePage({
  searchParams,
}: {
  searchParams: { planId?: string };
}) {
  const planId = searchParams.planId;

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Souscrire à un abonnement
        </h1>
        <p className="text-muted-foreground mt-2">
          Choisissez votre plan et configurez vos préférences de paiement
        </p>
      </div>

      <SubscriptionForm initialPlanId={planId} />
    </div>
  );
}
