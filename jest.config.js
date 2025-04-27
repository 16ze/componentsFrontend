const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Chemin vers votre application Next.js
  dir: "./",
});

// Configuration Jest personnalisée
const customJestConfig = {
  // Ajouter plus de configurations de configuration par la suite
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    // Gérer les alias de chemin dans tsconfig.json
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@/stores/(.*)$": "<rootDir>/stores/$1",
  },
  testEnvironment: "jest-environment-jsdom",
  collectCoverage: true,
  collectCoverageFrom: [
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "stores/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
};

// createJestConfig est exporté de cette façon pour s'assurer que next/jest peut
// charger la configuration Next.js qui est requise pour tester
module.exports = createJestConfig(customJestConfig);
