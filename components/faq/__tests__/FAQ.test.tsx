import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQ } from "../FAQ";
import { FAQItem, FAQCategory } from "../types";

// Mock des modules nécessaires
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockFAQItems: FAQItem[] = [
  {
    id: "1",
    question: "Comment puis-je créer un compte ?",
    answer:
      'Pour créer un compte, cliquez sur le bouton "S\'inscrire" en haut à droite.',
    category: "Compte",
  },
  {
    id: "2",
    question: "Comment réinitialiser mon mot de passe ?",
    answer:
      'Vous pouvez réinitialiser votre mot de passe en cliquant sur "Mot de passe oublié" sur la page de connexion.',
    category: "Compte",
  },
  {
    id: "3",
    question: "Quels modes de paiement acceptez-vous ?",
    answer: "Nous acceptons les cartes Visa, Mastercard, et PayPal.",
    category: "Paiement",
  },
  {
    id: "4",
    question: "Combien de temps pour la livraison ?",
    answer: "La livraison prend généralement entre 3 et 5 jours ouvrables.",
    category: "Expédition",
  },
];

const mockCategories: FAQCategory[] = [
  {
    id: "all",
    name: "Toutes",
    items: mockFAQItems,
  },
  {
    id: "compte",
    name: "Compte",
    description: "Questions liées à la gestion de votre compte",
    items: mockFAQItems.filter((item) => item.category === "Compte"),
  },
  {
    id: "paiement",
    name: "Paiement",
    items: mockFAQItems.filter((item) => item.category === "Paiement"),
  },
  {
    id: "expedition",
    name: "Expédition",
    items: mockFAQItems.filter((item) => item.category === "Expédition"),
  },
];

describe("FAQ Component", () => {
  it("affiche le titre et la description", () => {
    render(
      <FAQ
        items={mockFAQItems}
        title="FAQ Test"
        description="Description de test"
      />
    );

    expect(screen.getByText("FAQ Test")).toBeInTheDocument();
    expect(screen.getByText("Description de test")).toBeInTheDocument();
  });

  it("affiche toutes les questions", () => {
    render(<FAQ items={mockFAQItems} />);

    mockFAQItems.forEach((item) => {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    });
  });

  it("ouvre et ferme un accordéon au clic", async () => {
    const user = userEvent.setup();
    render(<FAQ items={mockFAQItems} accordionType="single" />);

    // Initialement, toutes les réponses sont cachées
    expect(
      screen.queryByText(
        'Pour créer un compte, cliquez sur le bouton "S\'inscrire" en haut à droite.'
      )
    ).not.toBeVisible();

    // Cliquer pour ouvrir le premier accordéon
    await user.click(screen.getByText("Comment puis-je créer un compte ?"));

    // La réponse devrait maintenant être visible
    expect(
      screen.getByText(
        'Pour créer un compte, cliquez sur le bouton "S\'inscrire" en haut à droite.'
      )
    ).toBeVisible();

    // Cliquer pour fermer l'accordéon
    await user.click(screen.getByText("Comment puis-je créer un compte ?"));

    // La réponse devrait à nouveau être cachée
    expect(
      screen.queryByText(
        'Pour créer un compte, cliquez sur le bouton "S\'inscrire" en haut à droite.'
      )
    ).not.toBeVisible();
  });

  it("filtre les questions selon la recherche", async () => {
    const user = userEvent.setup();
    render(<FAQ items={mockFAQItems} />);

    // Toutes les questions sont visibles initialement
    mockFAQItems.forEach((item) => {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    });

    // Rechercher "mot de passe"
    const searchInput = screen.getByPlaceholderText(
      "Rechercher une question..."
    );
    await user.type(searchInput, "mot de passe");

    // Seule la question sur le mot de passe devrait être visible
    expect(
      screen.getByText("Comment réinitialiser mon mot de passe ?")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Comment puis-je créer un compte ?")
    ).not.toBeInTheDocument();
  });

  it("affiche les onglets de catégorie correctement", () => {
    render(
      <FAQ
        items={mockFAQItems}
        categories={mockCategories}
        useCategoryTabs={true}
      />
    );

    // Vérifier que tous les onglets de catégorie sont affichés
    expect(screen.getByText("Toutes")).toBeInTheDocument();
    expect(screen.getByText("Compte")).toBeInTheDocument();
    expect(screen.getByText("Paiement")).toBeInTheDocument();
    expect(screen.getByText("Expédition")).toBeInTheDocument();
  });
});
