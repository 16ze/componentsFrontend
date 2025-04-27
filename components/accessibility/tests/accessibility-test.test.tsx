import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AccessibilityTestPage } from "../accessibility-test-page";

// Mock du useAccessibility hook
jest.mock("../accessibility-provider", () => ({
  useAccessibility: () => ({
    textSize: 100,
    increaseTextSize: jest.fn(),
    decreaseTextSize: jest.fn(),
    resetTextSize: jest.fn(),
    highContrast: false,
    toggleHighContrast: jest.fn(),
    simplifiedMode: false,
    toggleSimplifiedMode: jest.fn(),
    reducedMotion: false,
    toggleReducedMotion: jest.fn(),
  }),
}));

// Mock du LanguageSwitcher component
jest.mock("../language-switcher", () => ({
  LanguageSwitcher: () => (
    <div data-testid="language-switcher">Language Switcher</div>
  ),
}));

describe("Tests d'accessibilité", () => {
  it("La page de test d'accessibilité ne doit pas avoir de violations d'accessibilité", async () => {
    const { container } = render(<AccessibilityTestPage />);

    // Vérifier que les composants clés sont rendus
    expect(screen.getByText("common.welcome")).toBeInTheDocument();
    expect(
      screen.getByText("accessibility.accessibilitySettings")
    ).toBeInTheDocument();
    expect(screen.getByTestId("language-switcher")).toBeInTheDocument();

    // Exécuter les tests d'accessibilité avec axe
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Les éléments interactifs doivent être accessibles au clavier", () => {
    render(<AccessibilityTestPage />);

    // Vérifier que les boutons sont focusables
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);

    buttons.forEach((button) => {
      expect(button).toHaveFocus();
      expect(button).not.toHaveAttribute("tabindex", "-1");
    });
  });

  it("Les composants doivent utiliser des attributs ARIA appropriés", () => {
    render(<AccessibilityTestPage />);

    // Vérifier les attributs ARIA
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      // Les liens devraient avoir soit un texte visible, soit un aria-label
      const hasVisibleText = link.textContent && link.textContent.trim() !== "";
      const hasAriaLabel = link.hasAttribute("aria-label");

      expect(hasVisibleText || hasAriaLabel).toBe(true);
    });
  });
});
