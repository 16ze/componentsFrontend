"use client";

import { useState, useCallback } from "react";
import { useEcommerceStore } from "@/stores/ecommerceStore";

/**
 * Hook pour la gestion des intentions de paiement
 * @param {Object} options - Options de configuration
 * @param {string} options.gateway - Passerelle de paiement à utiliser par défaut (stripe, paypal, etc.)
 * @param {boolean} options.shouldCreateCustomer - Indique si un client doit être créé chez le PSP
 * @returns {Object} Fonctions et état pour gérer les intentions de paiement
 */
export function usePaymentIntent(options = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Récupérer les données du panier depuis le store
  const {
    items,
    getTotal,
    getSubtotal,
    getTaxAmount,
    getShippingCost,
    orderId,
  } = useEcommerceStore();

  /**
   * Crée une intention de paiement
   * @param {Object} paymentData - Données du paiement
   * @param {string} paymentData.gateway - Passerelle de paiement (stripe, paypal, etc.)
   * @param {string} paymentData.currency - Devise (EUR, USD, etc.)
   * @param {Object} paymentData.customer - Informations client
   * @param {Object} paymentData.metadata - Métadonnées additionnelles
   * @returns {Promise<Object>} Intention de paiement
   */
  const createPaymentIntent = useCallback(
    async (paymentData = {}) => {
      try {
        setIsLoading(true);
        setError(null);

        // Assembler les données de la requête
        const requestData = {
          gateway: paymentData.gateway || options.gateway || "stripe",
          amount: Math.round(getTotal() * 100), // Convertir en centimes
          currency: paymentData.currency || "EUR",
          orderId: orderId || `ORD-${Date.now()}`,
          customer: paymentData.customer || {},
          items: items.map((item) => ({
            id: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          metadata: {
            subtotal: getSubtotal(),
            tax: getTaxAmount(),
            shipping: getShippingCost(),
            ...paymentData.metadata,
          },
          shouldCreateCustomer: options.shouldCreateCustomer || false,
        };

        // Appeler l'API pour créer l'intention de paiement
        const response = await fetch("/api/payments/intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              "Erreur lors de la création de l'intention de paiement"
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error?.message ||
              "Erreur lors de la création de l'intention de paiement"
          );
        }

        setPaymentIntent(data.paymentIntent);
        return data.paymentIntent;
      } catch (err) {
        setError(err.message || "Une erreur est survenue");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [
      getTotal,
      getSubtotal,
      getTaxAmount,
      getShippingCost,
      items,
      orderId,
      options,
    ]
  );

  /**
   * Confirme une intention de paiement
   * @param {Object} confirmData - Données de confirmation
   * @param {string} confirmData.intentId - ID de l'intention à confirmer
   * @param {string} confirmData.gateway - Passerelle de paiement
   * @param {Object} confirmData.paymentMethod - Méthode de paiement
   * @param {boolean} confirmData.saveMethod - Sauvegarder la méthode pour usage futur
   * @returns {Promise<Object>} Résultat de la confirmation
   */
  const confirmPaymentIntent = useCallback(
    async (confirmData) => {
      try {
        setIsConfirming(true);
        setError(null);

        const { intentId, gateway, paymentMethod, saveMethod } = confirmData;

        // Assembler les données de la requête
        const requestData = {
          intentId: intentId || paymentIntent?.id,
          gateway: gateway || options.gateway || "stripe",
          paymentMethod,
          saveMethod: saveMethod || false,
          orderId,
        };

        // Appeler l'API pour confirmer l'intention de paiement
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Erreur lors de la confirmation du paiement"
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error?.message || "Erreur lors de la confirmation du paiement"
          );
        }

        // Mettre à jour l'état avec le résultat
        return data;
      } catch (err) {
        setError(err.message || "Une erreur est survenue");
        return {
          success: false,
          error: {
            message:
              err.message ||
              "Une erreur est survenue lors de la confirmation du paiement",
          },
        };
      } finally {
        setIsConfirming(false);
      }
    },
    [paymentIntent, orderId, options]
  );

  /**
   * Vérifie l'état d'une intention de paiement
   * @param {string} intentId - ID de l'intention à vérifier
   * @returns {Promise<Object>} État actuel de l'intention
   */
  const checkPaymentStatus = useCallback(
    async (intentId) => {
      try {
        const response = await fetch(
          `/api/payments/intent/${intentId || paymentIntent?.id}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la vérification du paiement");
        }

        const data = await response.json();

        if (data.success) {
          setPaymentIntent(data.paymentIntent);
        }

        return data;
      } catch (err) {
        setError(err.message || "Une erreur est survenue");
        return {
          success: false,
          error: {
            message:
              err.message ||
              "Une erreur est survenue lors de la vérification du paiement",
          },
        };
      }
    },
    [paymentIntent]
  );

  /**
   * Réinitialise l'état du hook
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setIsConfirming(false);
    setError(null);
    setPaymentIntent(null);
  }, []);

  return {
    isLoading,
    isConfirming,
    error,
    paymentIntent,
    createPaymentIntent,
    confirmPaymentIntent,
    checkPaymentStatus,
    reset,
  };
}
