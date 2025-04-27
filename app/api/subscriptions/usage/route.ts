import { NextResponse } from "next/server";
import { UsageMetrics } from "@/stores/subscriptionStore";

export async function GET() {
  // Normalement, vous récupéreriez ces données depuis votre base de données

  // Exemple de métriques d'utilisation fictives
  const usageMetrics: UsageMetrics = {
    users: {
      current: 12,
      limit: 20,
    },
    storage: {
      current: 8.5,
      limit: 20,
    },
    projects: {
      current: 18,
      limit: 50,
    },
    apiCalls: {
      current: 4230,
      limit: 10000,
    },
  };

  return NextResponse.json(usageMetrics);
}
