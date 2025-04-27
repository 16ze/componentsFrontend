import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { useSubscriptionStore } from "@/stores/subscriptionStore";

export default function FeaturesComparison() {
  const { plans, isLoading, fetchPlans } = useSubscriptionStore();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  if (isLoading || plans.length === 0) {
    return null;
  }

  // Récupérer toutes les fonctionnalités uniques parmi tous les plans
  const allFeatures = plans.reduce((acc, plan) => {
    plan.features.forEach((feature) => {
      if (!acc.find((f) => f.id === feature.id)) {
        acc.push(feature);
      }
    });
    return acc;
  }, [] as { id: string; name: string; description: string; included: boolean }[]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Comparaison des fonctionnalités
        </h2>
        <p className="text-muted-foreground mt-2">
          Choisissez le plan qui répond à vos besoins
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-6 w-1/4">Fonctionnalité</th>
              {plans.map((plan) => (
                <th key={plan.id} className="text-center py-4 px-6">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature) => (
              <tr key={feature.id} className="border-b hover:bg-muted/50">
                <td className="py-4 px-6">
                  <div className="font-medium">{feature.name}</div>
                  {feature.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </div>
                  )}
                </td>
                {plans.map((plan) => {
                  const planFeature = plan.features.find(
                    (f) => f.id === feature.id
                  );
                  return (
                    <td
                      key={`${plan.id}-${feature.id}`}
                      className="text-center py-4 px-6"
                    >
                      {planFeature?.included ? (
                        <div className="flex justify-center">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <X className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Ligne des limites d'utilisation */}
            <tr className="border-b bg-muted/30">
              <td className="py-4 px-6 font-medium">Utilisateurs</td>
              {plans.map((plan) => (
                <td key={`${plan.id}-users`} className="text-center py-4 px-6">
                  {plan.limits.maxUsers === Infinity
                    ? "Illimité"
                    : plan.limits.maxUsers}
                </td>
              ))}
            </tr>
            <tr className="border-b bg-muted/30">
              <td className="py-4 px-6 font-medium">Stockage</td>
              {plans.map((plan) => (
                <td
                  key={`${plan.id}-storage`}
                  className="text-center py-4 px-6"
                >
                  {plan.limits.maxStorage} GB
                </td>
              ))}
            </tr>
            <tr className="border-b bg-muted/30">
              <td className="py-4 px-6 font-medium">Projets</td>
              {plans.map((plan) => (
                <td
                  key={`${plan.id}-projects`}
                  className="text-center py-4 px-6"
                >
                  {plan.limits.maxProjects === Infinity
                    ? "Illimité"
                    : plan.limits.maxProjects}
                </td>
              ))}
            </tr>
            <tr className="border-b bg-muted/30">
              <td className="py-4 px-6 font-medium">Appels API / mois</td>
              {plans.map((plan) => (
                <td key={`${plan.id}-api`} className="text-center py-4 px-6">
                  {plan.limits.maxApiCalls === Infinity
                    ? "Illimité"
                    : `${plan.limits.maxApiCalls.toLocaleString()}`}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
