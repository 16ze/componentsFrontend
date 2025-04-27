import { NextResponse } from "next/server";
import { Invoice } from "@/stores/subscriptionStore";

export async function GET() {
  // Normalement, vous récupéreriez ces données depuis votre base de données ou API de paiement

  // Exemple de factures fictives
  const invoices: Invoice[] = [
    {
      id: "in_1234567890",
      number: "INV-2023-001",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 79,
      status: "paid",
      pdfUrl: "/api/invoices/in_1234567890/pdf",
    },
    {
      id: "in_0987654321",
      number: "INV-2023-002",
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 79,
      status: "paid",
      pdfUrl: "/api/invoices/in_0987654321/pdf",
    },
    {
      id: "in_1122334455",
      number: "INV-2023-003",
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 79,
      status: "paid",
      pdfUrl: "/api/invoices/in_1122334455/pdf",
    },
  ];

  return NextResponse.json(invoices);
}
