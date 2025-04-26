import { KanbanColumn, Opportunity, StageType } from "./types";

// Données factices pour les assignés
const assignees = [
  { id: "user1", name: "Thomas Dubois", avatar: "/avatars/thomas.jpg" },
  { id: "user2", name: "Sophie Martin", avatar: "/avatars/sophie.jpg" },
  { id: "user3", name: "Lucas Bernard", avatar: "/avatars/lucas.jpg" },
  { id: "user4", name: "Emma Leroy", avatar: "/avatars/emma.jpg" },
];

// Sources d'opportunités
const sources = [
  "Site web",
  "Référence",
  "Appel entrant",
  "LinkedIn",
  "Salon professionnel",
  "Partenaire",
];

// Noms de clients factices
const clients = [
  "Entreprise ABC",
  "Tech Innov",
  "Solutions Globales",
  "Digital Partners",
  "Groupe Médiateur",
  "Industrie Moderne",
  "Start-up Express",
  "Services Connectés",
  "MegaCorp",
  "Consulting Pro",
  "Média Connect",
  "Finance Plus",
];

// Titres d'opportunités factices
const opportunityTitles = [
  "Refonte de site e-commerce",
  "Développement application mobile",
  "Migration cloud",
  "Intégration CRM",
  "Automatisation marketing",
  "Développement logiciel sur mesure",
  "Infrastructure réseau",
  "Service de consultation IT",
  "Formation équipe marketing",
  "Audit de sécurité",
  "Optimisation SEO",
  "Support technique",
];

// Notes factices
const notes = [
  "Le client cherche à améliorer sa présence en ligne et à augmenter ses ventes.",
  "Prospect intéressé par notre offre premium, mais le budget reste à discuter.",
  "Un concurrent propose une solution similaire, nous devons mettre en avant nos avantages.",
  "Le client souhaite une mise en place rapide avant la fin du trimestre.",
  "Première discussion très positive, équipe technique à impliquer pour les détails.",
  "Le client a des besoins spécifiques concernant l'intégration avec ses systèmes existants.",
  undefined,
];

// Fonction pour générer une date aléatoire dans les prochains mois
const getRandomFutureDate = (maxMonths = 6) => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(
    today.getDate() + Math.floor(Math.random() * maxMonths * 30)
  );
  return futureDate;
};

// Fonction pour générer une date passée aléatoire dans les derniers mois
const getRandomPastDate = (maxMonths = 3) => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(
    today.getDate() - Math.floor(Math.random() * maxMonths * 30)
  );
  return pastDate;
};

// Fonction pour générer un ID unique
const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Fonction pour générer une opportunité aléatoire
const generateRandomOpportunity = (stage: StageType): Opportunity => {
  const createdAt = getRandomPastDate();
  const updatedAt = new Date(
    createdAt.getTime() +
      Math.random() * (new Date().getTime() - createdAt.getTime())
  );
  const expectedCloseDate = getRandomFutureDate();

  // Probabilité basée sur l'étape
  let probability: number;
  switch (stage) {
    case StageType.PROSPECTION:
      probability = Math.floor(Math.random() * 20) + 5; // 5-25%
      break;
    case StageType.QUALIFICATION:
      probability = Math.floor(Math.random() * 20) + 25; // 25-45%
      break;
    case StageType.PROPOSITION:
      probability = Math.floor(Math.random() * 20) + 45; // 45-65%
      break;
    case StageType.NEGOCIATION:
      probability = Math.floor(Math.random() * 20) + 65; // 65-85%
      break;
    case StageType.CLOTURE:
      probability = Math.floor(Math.random() * 15) + 85; // 85-100%
      break;
    default:
      probability = 50;
  }

  // Génération aléatoire de l'état "bloqué" ou "en retard"
  const isStuck = Math.random() < 0.2; // 20% de chance d'être bloqué
  const isDelayed = !isStuck && Math.random() < 0.3; // 30% de chance d'être en retard (si pas déjà bloqué)

  return {
    id: generateId(),
    title:
      opportunityTitles[Math.floor(Math.random() * opportunityTitles.length)],
    clientName: clients[Math.floor(Math.random() * clients.length)],
    amount: Math.floor(Math.random() * 95000) + 5000, // 5000-100000€
    probability,
    expectedCloseDate,
    assignedTo: assignees[Math.floor(Math.random() * assignees.length)],
    stage,
    status:
      Math.random() < 0.8 ? "active" : Math.random() < 0.5 ? "won" : "lost",
    source: sources[Math.floor(Math.random() * sources.length)],
    createdAt,
    updatedAt,
    lastActivity: updatedAt,
    notes: notes[Math.floor(Math.random() * notes.length)],
    isStuck,
    isDelayed,
  };
};

// Fonction principale pour générer des données de démonstration
export const generateDemoData = (): KanbanColumn[] => {
  // Les colonnes par défaut
  const columns: KanbanColumn[] = [
    {
      id: "1",
      title: "Prospection",
      type: StageType.PROSPECTION,
      opportunities: [],
      color: "#3498db",
    },
    {
      id: "2",
      title: "Qualification",
      type: StageType.QUALIFICATION,
      opportunities: [],
      color: "#9b59b6",
    },
    {
      id: "3",
      title: "Proposition",
      type: StageType.PROPOSITION,
      opportunities: [],
      color: "#f39c12",
    },
    {
      id: "4",
      title: "Négociation",
      type: StageType.NEGOCIATION,
      opportunities: [],
      color: "#e74c3c",
    },
    {
      id: "5",
      title: "Clôture",
      type: StageType.CLOTURE,
      opportunities: [],
      color: "#2ecc71",
    },
  ];

  // Ajouter des opportunités aléatoires à chaque colonne
  columns.forEach((column) => {
    const count = Math.floor(Math.random() * 5) + 2; // 2-6 opportunités par colonne
    for (let i = 0; i < count; i++) {
      column.opportunities.push(generateRandomOpportunity(column.type));
    }
  });

  return columns;
};
