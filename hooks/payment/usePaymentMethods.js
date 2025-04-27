"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook pour la gestion des méthodes de paiement enregistrées
 * @param {Object} options - Options de configuration
 * @param {string} options.customerId - ID du client
 * @param {string} options.gateway - Passerelle de paiement (stripe, paypal, etc.)
 * @returns {Object} Méthodes de paiement et fonctions de gestion
 */
export function usePaymentMethods(options = {}) {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethodId, setSelectedMethodId] = useState(null);

  /**
   * Charge les méthodes de paiement sauvegardées
   * @returns {Promise<Array>} Méthodes de paiement
   */
  const fetchMethods = useCallback(async () => {
    if (!options.customerId) {
      setMethods([]);
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        customerId: options.customerId,
        gateway: options.gateway || "stripe",
      });

      const response = await fetch(
        `/api/payments/methods?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des méthodes de paiement"
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error?.message ||
            "Erreur lors de la récupération des méthodes de paiement"
        );
      }

      setMethods(data.paymentMethods || []);

      // Sélectionner la méthode par défaut si elle existe
      const defaultMethod = data.paymentMethods?.find(
        (method) => method.isDefault
      );
      if (defaultMethod) {
        setSelectedMethodId(defaultMethod.id);
      }

      return data.paymentMethods;
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [options.customerId, options.gateway]);

  /**
   * Supprime une méthode de paiement
   * @param {string} methodId - ID de la méthode à supprimer
   * @returns {Promise<boolean>} Succès de la suppression
   */
  const deleteMethod = useCallback(
    async (methodId) => {
      if (!methodId || !options.customerId) {
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/payments/methods", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            methodId,
            customerId: options.customerId,
            gateway: options.gateway || "stripe",
          }),
        });

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la suppression de la méthode de paiement"
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error?.message ||
              "Erreur lors de la suppression de la méthode de paiement"
          );
        }

        // Mettre à jour la liste des méthodes
        setMethods(methods.filter((method) => method.id !== methodId));

        // Si la méthode supprimée était sélectionnée, désélectionner
        if (selectedMethodId === methodId) {
          setSelectedMethodId(null);
        }

        return true;
      } catch (err) {
        setError(err.message || "Une erreur est survenue");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [methods, selectedMethodId, options.customerId, options.gateway]
  );

  /**
   * Définit une méthode de paiement comme méthode par défaut
   * @param {string} methodId - ID de la méthode à définir par défaut
   * @returns {Promise<boolean>} Succès de l'opération
   */
  const setDefaultMethod = useCallback(
    async (methodId) => {
      if (!methodId || !options.customerId) {
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/payments/methods/default", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            methodId,
            customerId: options.customerId,
            gateway: options.gateway || "stripe",
          }),
        });

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la configuration de la méthode par défaut"
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error?.message ||
              "Erreur lors de la configuration de la méthode par défaut"
          );
        }

        // Mettre à jour l'état isDefault de toutes les méthodes
        setMethods(
          methods.map((method) => ({
            ...method,
            isDefault: method.id === methodId,
          }))
        );

        // Sélectionner la méthode par défaut
        setSelectedMethodId(methodId);

        return true;
      } catch (err) {
        setError(err.message || "Une erreur est survenue");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [methods, options.customerId, options.gateway]
  );

  /**
   * Sélectionne une méthode de paiement pour utilisation
   * @param {string} methodId - ID de la méthode à sélectionner
   */
  const selectMethod = useCallback((methodId) => {
    setSelectedMethodId(methodId);
  }, []);

  /**
   * Retourne la méthode de paiement actuellement sélectionnée
   * @returns {Object|null} Méthode sélectionnée ou null
   */
  const getSelectedMethod = useCallback(() => {
    return methods.find((method) => method.id === selectedMethodId) || null;
  }, [methods, selectedMethodId]);

  // Charger les méthodes au montage du composant
  useEffect(() => {
    if (options.customerId) {
      fetchMethods();
    }
  }, [options.customerId, fetchMethods]);

  return {
    methods,
    isLoading,
    error,
    selectedMethodId,
    fetchMethods,
    deleteMethod,
    setDefaultMethod,
    selectMethod,
    getSelectedMethod,
  };
}
