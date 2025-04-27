import { useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSubscriptionStore,
  PlanPeriod,
  Plan,
} from "@/stores/subscriptionStore";
import { useRouter } from "next/navigation";

export default function PricingCards() {
  const router = useRouter();
  const {
    plans,
    isLoading,
    fetchPlans,
    currentSubscription,
    fetchCurrentSubscription,
    selectedPeriod,
    setPeriodSelection,
  } = useSubscriptionStore();

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, [fetchPlans, fetchCurrentSubscription]);

  const changePeriod = (newPeriod: PlanPeriod) => {
    setPeriodSelection(newPeriod);
  };

  const handleSelectPlan = (plan: Plan) => {
    if (currentSubscription) {
      router.push(`/account/subscriptions/change-plan?planId=${plan.id}`);
    } else {
      router.push(`/account/subscriptions/subscribe?planId=${plan.id}`);
    }
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
      <Tabs
        defaultValue={selectedPeriod}
        className="w-full"
        onValueChange={(value) => changePeriod(value as PlanPeriod)}
      >
        <div className="flex justify-center">
          <TabsList className="grid w-64 grid-cols-2">
            <TabsTrigger value="monthly">Mensuel</TabsTrigger>
            <TabsTrigger value="yearly">Annuel</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                price={plan.monthlyPrice}
                period="monthly"
                currentPlanId={currentSubscription?.planId}
                onSelectPlan={() => handleSelectPlan(plan)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                price={plan.yearlyPrice}
                period="yearly"
                currentPlanId={currentSubscription?.planId}
                onSelectPlan={() => handleSelectPlan(plan)}
                discountPercent={Math.round(
                  100 - (plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100
                )}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PricingCardProps {
  plan: Plan;
  price: number;
  period: PlanPeriod;
  currentPlanId?: string;
  discountPercent?: number;
  onSelectPlan: () => void;
}

function PricingCard({
  plan,
  price,
  period,
  currentPlanId,
  discountPercent,
  onSelectPlan,
}: PricingCardProps) {
  const isCurrentPlan = currentPlanId === plan.id;

  return (
    <Card
      className={`flex flex-col ${
        plan.popularPlan ? "border-primary shadow-lg" : ""
      }`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription className="mt-1">
              {plan.description}
            </CardDescription>
          </div>
          {plan.popularPlan && <Badge>Populaire</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">{price}€</span>
            <span className="text-muted-foreground ml-1">
              /{period === "monthly" ? "mois" : "an"}
            </span>
          </div>
          {discountPercent && discountPercent > 0 && (
            <Badge variant="outline" className="mt-2 bg-green-50">
              Économisez {discountPercent}%
            </Badge>
          )}
          {plan.trialDays && (
            <p className="text-sm text-muted-foreground mt-2">
              Essai gratuit de {plan.trialDays} jours
            </p>
          )}
        </div>

        <div className="space-y-2">
          {plan.features.slice(0, 5).map((feature) => (
            <div key={feature.id} className="flex items-start">
              {feature.included ? (
                <Check className="h-4 w-4 mr-2 mt-1 text-green-500" />
              ) : (
                <div className="h-4 w-4 mr-2 mt-1 rounded-full border border-muted"></div>
              )}
              <span className={feature.included ? "" : "text-muted-foreground"}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={
            isCurrentPlan ? "outline" : plan.popularPlan ? "default" : "outline"
          }
          disabled={isCurrentPlan}
          onClick={onSelectPlan}
        >
          {isCurrentPlan ? "Plan actuel" : "Sélectionner"}
        </Button>
      </CardFooter>
    </Card>
  );
}
