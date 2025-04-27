import { Metadata } from "next";
import PricingCards from "@/components/subscription/PricingCards";
import FeaturesComparison from "@/components/subscription/FeaturesComparison";
import SubscriptionHeader from "@/components/subscription/SubscriptionHeader";

export const metadata: Metadata = {
  title: "Plans et Tarifs | Mon Application SaaS",
  description:
    "Découvrez nos différents plans d'abonnement et choisissez celui qui correspond le mieux à vos besoins.",
};

export default function SubscriptionsPage() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <SubscriptionHeader
        title="Choisissez le plan qui vous convient"
        description="Nous proposons des plans flexibles adaptés à tous les besoins. Tous les plans incluent une période d'essai de 14 jours sans engagement."
      />

      <PricingCards />

      <FeaturesComparison />
    </div>
  );
}
