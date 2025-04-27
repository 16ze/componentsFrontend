import { NextResponse } from "next/server";
import { Subscription } from "@/stores/subscriptionStore";

export async function GET() {
  // Normalement, vous récupéreriez ces données depuis votre base de données
  // Exemple de données d'abonnement fictives

  const subscription: Subscription = {
    id: "sub_1234567890",
    planId: "pro",
    status: "active",
    currentPeriodStart: new Date(
      Date.now() - 15 * 24 * 60 * 60 * 1000
    ).toISOString(), // 15 jours avant
    currentPeriodEnd: new Date(
      Date.now() + 15 * 24 * 60 * 60 * 1000
    ).toISOString(), // 15 jours après
    period: "monthly",
    paymentMethodId: "pm_1234567890",
  };

  return NextResponse.json(subscription);
}
