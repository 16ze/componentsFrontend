import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button Component", () => {
  it("devrait rendre le texte du bouton correctement", () => {
    render(<Button>Cliquez-moi</Button>);
    expect(
      screen.getByRole("button", { name: /cliquez-moi/i })
    ).toBeInTheDocument();
  });

  it("devrait appliquer la classe de variante correcte", () => {
    const { rerender } = render(<Button variant="destructive">Bouton</Button>);

    let button = screen.getByRole("button", { name: /bouton/i });
    expect(button).toHaveClass("bg-destructive");

    rerender(<Button variant="outline">Bouton</Button>);
    button = screen.getByRole("button", { name: /bouton/i });
    expect(button).toHaveClass("border-input");
  });

  it("devrait appliquer la taille correcte", () => {
    const { rerender } = render(<Button size="sm">Petit</Button>);

    let button = screen.getByRole("button", { name: /petit/i });
    expect(button).toHaveClass("h-9");

    rerender(<Button size="lg">Grand</Button>);
    button = screen.getByRole("button", { name: /grand/i });
    expect(button).toHaveClass("h-11");
  });

  it("devrait être désactivé lorsque la prop disabled est true", () => {
    render(<Button disabled>Désactivé</Button>);

    const button = screen.getByRole("button", { name: /désactivé/i });
    expect(button).toBeDisabled();
  });

  it("devrait appeler le gestionnaire onClick lorsque cliqué", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Cliquer</Button>);

    const button = screen.getByRole("button", { name: /cliquer/i });
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
