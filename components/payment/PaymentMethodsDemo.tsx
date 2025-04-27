"use client";

import React, { useState } from "react";
import SavedPaymentMethods, { PaymentMethod } from "./SavedPaymentMethods";

const demoPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    brand: "visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2025,
    name: "Carte Visa personnelle",
    isDefault: true,
  },
  {
    id: "2",
    brand: "mastercard",
    last4: "8888",
    expiryMonth: 6,
    expiryYear: 2024,
    name: "Carte Mastercard professionnelle",
    isDefault: false,
  },
  {
    id: "3",
    brand: "amex",
    last4: "1234",
    expiryMonth: 3,
    expiryYear: 2026,
    name: "American Express",
    isDefault: false,
  },
];

export default function PaymentMethodsDemo() {
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(demoPaymentMethods);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPaymentMethod = (id: string) => {
    setSelectedPaymentMethodId(id);
    console.log("Méthode de paiement sélectionnée:", id);
  };

  const handleDeletePaymentMethod = async (id: string): Promise<void> => {
    setIsLoading(true);

    // Simulation d'un appel API asynchrone
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          setPaymentMethods((prevMethods) =>
            prevMethods.filter((method) => method.id !== id)
          );
          if (selectedPaymentMethodId === id) {
            setSelectedPaymentMethodId(null);
          }
          resolve();
        } catch (error) {
          reject(
            new Error("Échec de la suppression de la méthode de paiement")
          );
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    });
  };

  const handleSetDefaultPaymentMethod = async (id: string): Promise<void> => {
    setIsLoading(true);

    // Simulation d'un appel API asynchrone
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          setPaymentMethods((prevMethods) =>
            prevMethods.map((method) => ({
              ...method,
              isDefault: method.id === id,
            }))
          );
          resolve();
        } catch (error) {
          reject(new Error("Échec de la définition de la méthode par défaut"));
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    });
  };

  const handleAddPaymentMethod = () => {
    alert(
      "Cette fonction ouvrirait normalement un formulaire d'ajout de carte bancaire"
    );

    setIsLoading(true);

    setTimeout(() => {
      const newId = (
        Math.max(...paymentMethods.map((m) => parseInt(m.id))) + 1
      ).toString();
      const brands = ["visa", "mastercard", "amex"];
      const randomBrand = brands[Math.floor(Math.random() * brands.length)];

      const newMethod: PaymentMethod = {
        id: newId,
        brand: randomBrand,
        last4: Math.floor(1000 + Math.random() * 9000).toString(),
        expiryMonth: Math.floor(1 + Math.random() * 12),
        expiryYear: 2024 + Math.floor(Math.random() * 5),
        name: `Nouvelle carte ${randomBrand}`,
        isDefault: false,
      };

      setPaymentMethods((prevMethods) => [...prevMethods, newMethod]);
      setIsLoading(false);
    }, 1500);
  };

  const testLoadingState = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  const testEmptyState = () => {
    setPaymentMethods([]);
    setSelectedPaymentMethodId(null);
  };

  const resetDemo = () => {
    setPaymentMethods(demoPaymentMethods);
    setSelectedPaymentMethodId(null);
    setIsLoading(false);
  };

  const selectedMethod = paymentMethods.find(
    (method) => method.id === selectedPaymentMethodId
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">
          Gestion des méthodes de paiement
        </h2>
        <SavedPaymentMethods
          paymentMethods={paymentMethods}
          onSelect={handleSelectPaymentMethod}
          onDelete={handleDeletePaymentMethod}
          onSetDefault={handleSetDefaultPaymentMethod}
          isLoading={isLoading}
          selectedPaymentMethodId={selectedPaymentMethodId}
          onAddNewMethod={handleAddPaymentMethod}
        />
      </div>

      <div className="p-6 bg-white rounded-lg shadow space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Contrôles de démonstration
          </h2>
          <div className="space-y-3">
            <button
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              onClick={handleAddPaymentMethod}
              disabled={isLoading}
            >
              Ajouter une méthode de paiement
            </button>
            <button
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
              onClick={testLoadingState}
              disabled={isLoading}
            >
              Tester l'état de chargement
            </button>
            <button
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
              onClick={testEmptyState}
            >
              Tester l'état vide
            </button>
            <button
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
              onClick={resetDemo}
            >
              Réinitialiser la démo
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Méthode de paiement sélectionnée
          </h2>
          {selectedMethod ? (
            <div className="p-4 border border-gray-200 rounded">
              <p>
                <span className="font-semibold">Marque:</span>{" "}
                {selectedMethod.brand}
              </p>
              <p>
                <span className="font-semibold">Numéro:</span> **** **** ****{" "}
                {selectedMethod.last4}
              </p>
              <p>
                <span className="font-semibold">Expiration:</span>{" "}
                {selectedMethod.expiryMonth}/{selectedMethod.expiryYear}
              </p>
              <p>
                <span className="font-semibold">Nom:</span>{" "}
                {selectedMethod.name}
              </p>
              <p>
                <span className="font-semibold">Par défaut:</span>{" "}
                {selectedMethod.isDefault ? "Oui" : "Non"}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">
              Aucune méthode de paiement sélectionnée
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
