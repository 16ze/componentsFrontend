"use client";

import { useState, useEffect } from "react";

/**
 * Hook personnalisé pour gérer l'état dans localStorage
 * @param {string} key - Clé pour stocker/récupérer la valeur dans localStorage
 * @param {any} initialValue - Valeur initiale si aucune valeur n'est trouvée dans localStorage
 * @returns {[any, Function]} - Un tuple contenant la valeur et une fonction pour la mettre à jour
 */
export function useLocalStorage(key, initialValue) {
  // État pour stocker la valeur actuelle
  const [storedValue, setStoredValue] = useState(() => {
    // Pour éviter les erreurs côté serveur avec Next.js
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Récupérer la valeur stockée ou utiliser la valeur initiale
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de ${key} depuis localStorage:`,
        error
      );
      return initialValue;
    }
  });

  // Fonction pour mettre à jour la valeur dans l'état et localStorage
  const setValue = (value) => {
    try {
      // Permettre à la valeur d'être une fonction comme setState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Mettre à jour l'état React
      setStoredValue(valueToStore);

      // Mettre à jour localStorage (seulement côté client)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Déclencher un événement personnalisé pour synchroniser entre onglets/fenêtres
        window.dispatchEvent(new Event("storage-update"));
      }
    } catch (error) {
      console.error(
        `Erreur lors de la sauvegarde de ${key} dans localStorage:`,
        error
      );
    }
  };

  // Écouter les changements de localStorage dans d'autres onglets/fenêtres
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Gestionnaire pour l'événement storage
    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          const newValue = event.newValue
            ? JSON.parse(event.newValue)
            : initialValue;
          if (storedValue !== newValue) {
            setStoredValue(newValue);
          }
        } catch (error) {
          console.error(
            `Erreur lors de la synchronisation de ${key} depuis localStorage:`,
            error
          );
        }
      }
    };

    // Gestionnaire pour l'événement personnalisé
    const handleCustomEvent = () => {
      try {
        const item = window.localStorage.getItem(key);
        const newValue = item ? JSON.parse(item) : initialValue;
        if (JSON.stringify(storedValue) !== JSON.stringify(newValue)) {
          setStoredValue(newValue);
        }
      } catch (error) {
        console.error(
          `Erreur lors de la synchronisation de ${key} depuis localStorage:`,
          error
        );
      }
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storage-update", handleCustomEvent);

    // Nettoyer les écouteurs d'événements lors du démontage
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage-update", handleCustomEvent);
    };
  }, [key, storedValue, initialValue]);

  return [storedValue, setValue];
}
