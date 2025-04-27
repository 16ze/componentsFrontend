"use client";

import React from "react";
import PaymentMethodsDemo from "../../components/payment/PaymentMethodsDemo";

export default function PaymentDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Démonstration des méthodes de paiement
      </h1>
      <PaymentMethodsDemo />
    </div>
  );
}
