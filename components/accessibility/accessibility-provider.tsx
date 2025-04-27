"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTranslations } from "next-intl";

interface AccessibilityContextType {
  // Préférences de taille de texte
  textSize: number;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  resetTextSize: () => void;

  // Préférences de contraste
  highContrast: boolean;
  toggleHighContrast: () => void;

  // Mode simplifié
  simplifiedMode: boolean;
  toggleSimplifiedMode: () => void;

  // Préférence de mouvement réduit
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Stocker les préférences dans localStorage pour les conserver entre les sessions
  const [textSize, setTextSize] = useLocalStorage(
    "accessibility-text-size",
    100
  );
  const [highContrast, setHighContrast] = useLocalStorage(
    "accessibility-high-contrast",
    false
  );
  const [simplifiedMode, setSimplifiedMode] = useLocalStorage(
    "accessibility-simplified-mode",
    false
  );
  const [reducedMotion, setReducedMotion] = useLocalStorage(
    "accessibility-reduced-motion",
    false
  );

  // Détecter les préférences de mouvement réduit du système
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setReducedMotion(true);
    }
  }, [setReducedMotion]);

  // Appliquer les styles CSS basés sur les préférences
  useEffect(() => {
    // Taille du texte
    document.documentElement.style.setProperty(
      "--text-size-factor",
      `${textSize / 100}`
    );

    // Contraste élevé
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Mode simplifié
    if (simplifiedMode) {
      document.documentElement.classList.add("simplified-mode");
    } else {
      document.documentElement.classList.remove("simplified-mode");
    }

    // Mouvement réduit
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
  }, [textSize, highContrast, simplifiedMode, reducedMotion]);

  // Fonctions de gestion des préférences
  const increaseTextSize = () => {
    setTextSize(Math.min(textSize + 10, 150));
  };

  const decreaseTextSize = () => {
    setTextSize(Math.max(textSize - 10, 70));
  };

  const resetTextSize = () => {
    setTextSize(100);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const toggleSimplifiedMode = () => {
    setSimplifiedMode(!simplifiedMode);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
  };

  const value = {
    textSize,
    increaseTextSize,
    decreaseTextSize,
    resetTextSize,
    highContrast,
    toggleHighContrast,
    simplifiedMode,
    toggleSimplifiedMode,
    reducedMotion,
    toggleReducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
};
