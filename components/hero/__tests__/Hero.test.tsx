import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Hero } from "../Hero";

// Mock des modules nécessaires
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  useAnimation: () => ({ start: jest.fn() }),
}));

jest.mock("react-intersection-observer", () => ({
  useInView: () => [null, true],
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe("Hero Component", () => {
  const mockProps = {
    title: "Titre Hero Test",
    subtitle: "Sous-titre de test",
    description: "Description de test pour le hero",
    ctaButtons: [
      {
        label: "En savoir plus",
        href: "/apropos",
        trackingId: "hero-cta-1",
      },
    ],
  };

  beforeEach(() => {
    // Espionner console.log pour vérifier le tracking
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("affiche correctement le titre, sous-titre et description", () => {
    render(<Hero variant="image" {...mockProps} />);

    expect(screen.getByText("Titre Hero Test")).toBeInTheDocument();
    expect(screen.getByText("Sous-titre de test")).toBeInTheDocument();
    expect(
      screen.getByText("Description de test pour le hero")
    ).toBeInTheDocument();
  });

  it("affiche correctement les boutons CTA", () => {
    render(<Hero variant="image" {...mockProps} />);

    const ctaButton = screen.getByText("En savoir plus");
    expect(ctaButton).toBeInTheDocument();
  });

  it("enregistre le tracking lors du clic sur un CTA", async () => {
    const user = userEvent.setup();
    render(<Hero variant="image" {...mockProps} />);

    const ctaButton = screen.getByText("En savoir plus");
    await user.click(ctaButton);

    expect(console.log).toHaveBeenCalledWith("Conversion tracked: hero-cta-1");
  });

  it("applique correctement l'alignement du texte", () => {
    render(<Hero variant="image" {...mockProps} textAlignment="left" />);

    // Vérifier que la classe d'alignement à gauche est appliquée
    const heroContainer = screen
      .getByText("Titre Hero Test")
      .closest("div")?.parentElement;
    expect(heroContainer).toHaveClass("items-start");
    expect(heroContainer).toHaveClass("text-left");
  });
});
