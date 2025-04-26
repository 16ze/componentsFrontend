import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Fonction pour récupérer la valeur du localStorage
  const readValue = (): T => {
    // SSR check
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Parse la valeur stockée si elle existe, sinon retourne la valeur initiale
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(
        `Erreur lors de la lecture de ${key} depuis localStorage:`,
        error
      );
      return initialValue;
    }
  };

  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Fonction pour définir une nouvelle valeur dans le localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permet de passer une fonction comme pour useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Sauvegarde dans l'état
      setStoredValue(valueToStore);

      // Sauvegarde dans localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Déclenche un événement pour indiquer que le localStorage a changé
        // Utile pour la synchronisation entre onglets
        window.dispatchEvent(new Event("local-storage"));
      }
    } catch (error) {
      console.warn(
        `Erreur lors de la sauvegarde de ${key} dans localStorage:`,
        error
      );
    }
  };

  // Synchronise avec localStorage quand la clé change
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Écouter les changements de localStorage (pour la synchronisation entre onglets)
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // Écouter l'événement storage
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    // Nettoyage
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue] as const;
}
