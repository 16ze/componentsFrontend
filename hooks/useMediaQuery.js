"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia === "undefined"
    ) {
      return;
    }

    const media = window.matchMedia(query);

    // Définir l'état initial
    setMatches(media.matches);

    // Définir un callback pour mettre à jour l'état
    const listener = () => setMatches(media.matches);

    // Écouter les changements
    media.addEventListener("change", listener);

    // Nettoyer l'écouteur
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
