import { NextResponse } from "next/server";
import { Plan } from "@/stores/subscriptionStore";

// Plans d'abonnement fictifs
const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Pour les petites équipes et les startups",
    monthlyPrice: 29,
    yearlyPrice: 290,
    popularPlan: false,
    trialDays: 14,
    features: [
      {
        id: "feature1",
        name: "Jusqu'à 5 utilisateurs",
        description: "Ajoutez jusqu'à 5 membres d'équipe",
        included: true,
      },
      {
        id: "feature2",
        name: "5 GB de stockage",
        description: "Stockage de fichiers et documents",
        included: true,
      },
      {
        id: "feature3",
        name: "10 projets",
        description: "Nombre maximal de projets",
        included: true,
      },
      {
        id: "feature4",
        name: "Intégrations basiques",
        description: "Connectez vos outils essentiels",
        included: true,
      },
      {
        id: "feature5",
        name: "Support par email",
        description: "Réponse sous 48h",
        included: true,
      },
      {
        id: "feature6",
        name: "API avancée",
        description: "Accès complet à notre API",
        included: false,
      },
      {
        id: "feature7",
        name: "Support prioritaire",
        description: "Réponse sous 24h",
        included: false,
      },
      {
        id: "feature8",
        name: "Analyses avancées",
        description: "Tableaux de bord détaillés",
        included: false,
      },
    ],
    limits: {
      maxUsers: 5,
      maxStorage: 5,
      maxProjects: 10,
      maxApiCalls: 1000,
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pour les équipes en croissance",
    monthlyPrice: 79,
    yearlyPrice: 790,
    popularPlan: true,
    trialDays: 14,
    features: [
      {
        id: "feature1",
        name: "Jusqu'à 20 utilisateurs",
        description: "Ajoutez jusqu'à 20 membres d'équipe",
        included: true,
      },
      {
        id: "feature2",
        name: "20 GB de stockage",
        description: "Stockage de fichiers et documents",
        included: true,
      },
      {
        id: "feature3",
        name: "50 projets",
        description: "Nombre maximal de projets",
        included: true,
      },
      {
        id: "feature4",
        name: "Intégrations avancées",
        description: "Connectez tous vos outils",
        included: true,
      },
      {
        id: "feature5",
        name: "Support par email",
        description: "Réponse sous 24h",
        included: true,
      },
      {
        id: "feature6",
        name: "API avancée",
        description: "Accès complet à notre API",
        included: true,
      },
      {
        id: "feature7",
        name: "Support prioritaire",
        description: "Réponse sous 24h",
        included: true,
      },
      {
        id: "feature8",
        name: "Analyses avancées",
        description: "Tableaux de bord détaillés",
        included: false,
      },
    ],
    limits: {
      maxUsers: 20,
      maxStorage: 20,
      maxProjects: 50,
      maxApiCalls: 10000,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Pour les grandes organisations",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    popularPlan: false,
    features: [
      {
        id: "feature1",
        name: "Utilisateurs illimités",
        description: "Aucune limite sur le nombre d'utilisateurs",
        included: true,
      },
      {
        id: "feature2",
        name: "100 GB de stockage",
        description: "Stockage de fichiers et documents",
        included: true,
      },
      {
        id: "feature3",
        name: "Projets illimités",
        description: "Aucune limite sur le nombre de projets",
        included: true,
      },
      {
        id: "feature4",
        name: "Intégrations personnalisées",
        description: "Solutions sur mesure",
        included: true,
      },
      {
        id: "feature5",
        name: "Support par email",
        description: "Réponse sous 4h",
        included: true,
      },
      {
        id: "feature6",
        name: "API avancée",
        description: "Accès complet à notre API",
        included: true,
      },
      {
        id: "feature7",
        name: "Support dédié",
        description: "Manager de compte dédié",
        included: true,
      },
      {
        id: "feature8",
        name: "Analyses avancées",
        description: "Tableaux de bord détaillés",
        included: true,
      },
    ],
    limits: {
      maxUsers: Infinity,
      maxStorage: 100,
      maxProjects: Infinity,
      maxApiCalls: Infinity,
    },
  },
];

export async function GET() {
  // Normalement, vous récupéreriez ces données depuis votre base de données
  return NextResponse.json(plans);
}
