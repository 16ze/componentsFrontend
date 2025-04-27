import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

// Configuration globale pour Jest
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mocks pour les API du navigateur qui ne sont pas disponibles dans l'environnement de test
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Configuration pour les tests d'accessibilité avec jest-axe
expect.extend(toHaveNoViolations);

// Mock pour next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock pour next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key, options) => {
    if (key === "common.itemCount") {
      const count = options?.count || 0;
      if (count === 0) return "No items";
      if (count === 1) return "One item";
      return `${count} items`;
    }
    return key;
  },
  useFormatter: () => ({
    dateTime: (date) => new Date(date).toLocaleDateString("en-US"),
    number: (num, options) => {
      if (options?.style === "currency") {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: options.currency || "USD",
        }).format(num);
      }
      return num.toString();
    },
  }),
  useLocale: () => "en",
  useNow: () => new Date("2023-01-01"),
}));

// Suppression des avertissements console lors des tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18./.test(
        args[0]
      ) ||
      /Warning: The current testing environment is not configured to support act/.test(
        args[0]
      )
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    if (
      /Warning: React does not recognize the.*prop on a DOM element/.test(
        args[0]
      ) ||
      /Warning: The tag <.*> is unrecognized in this browser/.test(args[0])
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
