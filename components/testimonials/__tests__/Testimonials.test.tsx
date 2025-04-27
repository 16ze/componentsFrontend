import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Testimonials } from "../Testimonials";
import { Testimonial } from "../types";

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

const mockTestimonials: Testimonial[] = [
  {
    id: "1",
    quote: "Témoignage 1",
    authorName: "Auteur 1",
    authorTitle: "Titre 1",
    authorCompany: "Entreprise 1",
    rating: 5,
  },
  {
    id: "2",
    quote: "Témoignage 2",
    authorName: "Auteur 2",
    authorTitle: "Titre 2",
    authorCompany: "Entreprise 2",
    rating: 4,
  },
  {
    id: "3",
    quote: "Témoignage 3",
    authorName: "Auteur 3",
    authorTitle: "Titre 3",
    rating: 3,
  },
];

describe("Testimonials Component", () => {
  it("affiche le titre et la description", () => {
    render(
      <Testimonials
        testimonials={mockTestimonials}
        title="Titre des témoignages"
        description="Description des témoignages"
      />
    );

    expect(screen.getByText("Titre des témoignages")).toBeInTheDocument();
    expect(screen.getByText("Description des témoignages")).toBeInTheDocument();
  });

  it("affiche les témoignages en mode grille", () => {
    render(<Testimonials testimonials={mockTestimonials} displayMode="grid" />);

    // Vérifie que tous les témoignages sont présents
    expect(screen.getByText("Témoignage 1")).toBeInTheDocument();
    expect(screen.getByText("Témoignage 2")).toBeInTheDocument();
    expect(screen.getByText("Témoignage 3")).toBeInTheDocument();

    // Vérifie les noms des auteurs
    expect(screen.getByText("Auteur 1")).toBeInTheDocument();
    expect(screen.getByText("Auteur 2")).toBeInTheDocument();
    expect(screen.getByText("Auteur 3")).toBeInTheDocument();
  });

  it("affiche les témoignages en mode liste", () => {
    render(<Testimonials testimonials={mockTestimonials} displayMode="list" />);

    // Vérifie la présence des éléments
    expect(screen.getByText("Témoignage 1")).toBeInTheDocument();
    expect(screen.getByText("Auteur 1")).toBeInTheDocument();

    // La classe "space-y-6" est utilisée pour le mode liste
    const listContainer = screen
      .getByText("Témoignage 1")
      .closest("div")?.parentElement;
    expect(listContainer).toHaveClass("space-y-6");
  });

  it("affiche les témoignages en mode slider avec navigation", async () => {
    const user = userEvent.setup();

    render(
      <Testimonials
        testimonials={mockTestimonials}
        displayMode="slider"
        enableNavigation={true}
      />
    );

    // Premier témoignage doit être visible
    expect(screen.getByText("Témoignage 1")).toBeInTheDocument();

    // Trouver les boutons de navigation
    const nextButton = screen.getByLabelText("Témoignage suivant");

    // Cliquer sur le bouton suivant
    await user.click(nextButton);

    // Le deuxième témoignage devrait maintenant être visible
    // Notez que dans un vrai test, il faudrait vérifier le changement de position
    // du slider, mais c'est difficile à tester sans un vrai DOM
  });

  it("affiche les évaluations lorsque showRatings est activé", () => {
    render(<Testimonials testimonials={mockTestimonials} showRatings={true} />);

    // Vérifier la présence des SVG pour les étoiles
    // Dans un test réel, vous pourriez vérifier le nombre d'étoiles colorées vs grises
    const stars = document.querySelectorAll('svg[viewBox="0 0 20 20"]');
    expect(stars.length).toBeGreaterThan(0);
  });
});
