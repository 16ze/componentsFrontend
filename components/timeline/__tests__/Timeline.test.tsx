import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timeline } from "../Timeline";
import { TimelineItem } from "../types";

// Mock des modules nécessaires
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

const mockTimelineItems: TimelineItem[] = [
  {
    id: "1",
    title: "Fondation de l'entreprise",
    date: "Janvier 2010",
    description: "Création de l'entreprise par les fondateurs.",
    media: {
      type: "image",
      url: "/images/fondation.jpg",
      caption: "Les fondateurs lors du lancement",
    },
    links: [
      {
        label: "En savoir plus",
        url: "/histoire/fondation",
      },
    ],
  },
  {
    id: "2",
    title: "Expansion internationale",
    date: "Mars 2015",
    description: "Ouverture des premiers bureaux internationaux.",
    highlighted: true,
  },
  {
    id: "3",
    title: "Lancement du produit phare",
    date: "Septembre 2018",
    description: "Lancement du produit qui a révolutionné le marché.",
  },
];

describe("Timeline Component", () => {
  it("affiche le titre et la description", () => {
    render(
      <Timeline
        items={mockTimelineItems}
        title="Notre histoire"
        description="Découvrez les moments clés de notre parcours"
      />
    );

    expect(screen.getByText("Notre histoire")).toBeInTheDocument();
    expect(
      screen.getByText("Découvrez les moments clés de notre parcours")
    ).toBeInTheDocument();
  });

  it("affiche tous les éléments de la timeline", () => {
    render(<Timeline items={mockTimelineItems} />);

    expect(screen.getByText("Fondation de l'entreprise")).toBeInTheDocument();
    expect(screen.getByText("Expansion internationale")).toBeInTheDocument();
    expect(screen.getByText("Lancement du produit phare")).toBeInTheDocument();

    expect(screen.getByText("Janvier 2010")).toBeInTheDocument();
    expect(screen.getByText("Mars 2015")).toBeInTheDocument();
    expect(screen.getByText("Septembre 2018")).toBeInTheDocument();
  });

  it("permet d'expandre et réduire les éléments", async () => {
    const user = userEvent.setup();
    render(<Timeline items={mockTimelineItems} enableExpandedView={true} />);

    // Au début les éléments devraient être réduits
    const expandButtons = screen.getAllByText("Lire plus");
    expect(expandButtons.length).toBe(3);

    // Cliquer pour expandre
    await user.click(expandButtons[0]);

    // Maintenant devrait avoir un bouton "Réduire"
    expect(screen.getByText("Réduire")).toBeInTheDocument();
    expect(screen.getAllByText("Lire plus").length).toBe(2);

    // Cliquer pour réduire
    await user.click(screen.getByText("Réduire"));

    // Tous les boutons devraient à nouveau être "Lire plus"
    expect(screen.queryByText("Réduire")).not.toBeInTheDocument();
    expect(screen.getAllByText("Lire plus").length).toBe(3);
  });

  it("affiche les liens appropriés", () => {
    render(<Timeline items={mockTimelineItems} />);

    const link = screen.getByText("En savoir plus");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/histoire/fondation");
  });

  it("affiche la timeline en mode horizontal quand spécifié", () => {
    render(<Timeline items={mockTimelineItems} orientation="horizontal" />);

    // Vérifier l'existence du conteneur horizontal avec scrolling
    const horizontalContainer = screen
      .getByText("Fondation de l'entreprise")
      .closest("section")
      ?.querySelector(".overflow-x-auto");

    expect(horizontalContainer).toBeInTheDocument();
  });
});
