import {
  ClientWithDetails,
  Activity,
  Opportunity,
  Document,
  Note,
  TeamMember,
  ClientScore,
  Address,
  ClientMetrics,
  ChangeHistory,
} from "./types";

import { MOCK_CLIENTS } from "../ClientsTable/mock-data";

// Liste des utilisateurs pour les mentions et les assignations
export const USERS = [
  {
    id: "user-001",
    name: "Alexandre Martin",
    email: "alexandre@example.com",
    avatar: "/avatars/alexandre.jpg",
    role: "Commercial",
  },
  {
    id: "user-002",
    name: "Camille Dubois",
    email: "camille@example.com",
    avatar: "/avatars/camille.jpg",
    role: "Responsable Comptes",
  },
  {
    id: "user-003",
    name: "Maxime Leroy",
    email: "maxime@example.com",
    avatar: "/avatars/maxime.jpg",
    role: "Support Client",
  },
  {
    id: "user-004",
    name: "Sophie Moreau",
    email: "sophie@example.com",
    avatar: "/avatars/sophie.jpg",
    role: "Directrice Commerciale",
  },
  {
    id: "user-005",
    name: "Thomas Bernard",
    email: "thomas@example.com",
    avatar: "/avatars/thomas.jpg",
    role: "Administrateur",
  },
];

// Équipe assignée au client
const teamMembers: TeamMember[] = [
  {
    id: "team-001",
    name: "Alexandre Martin",
    email: "alexandre@example.com",
    phone: "06 12 34 56 78",
    role: "Commercial principal",
    avatar: "/avatars/alexandre.jpg",
    isMain: true,
  },
  {
    id: "team-002",
    name: "Sophie Moreau",
    email: "sophie@example.com",
    phone: "06 98 76 54 32",
    role: "Directrice Commerciale",
    avatar: "/avatars/sophie.jpg",
    isMain: false,
  },
  {
    id: "team-003",
    name: "Maxime Leroy",
    email: "maxime@example.com",
    phone: "07 11 22 33 44",
    role: "Support Client",
    avatar: "/avatars/maxime.jpg",
    isMain: false,
  },
];

// Adresse avec coordonnées pour la carte
const address: Address = {
  street: "123 Avenue des Champs-Élysées",
  city: "Paris",
  postalCode: "75008",
  country: "France",
  latitude: 48.8707,
  longitude: 2.3075,
};

// Score client
const clientScore: ClientScore = {
  level: "high",
  value: 85,
  lastUpdated: new Date("2023-09-15"),
};

// Métriques client
const clientMetrics: ClientMetrics = {
  totalValue: 245000,
  totalOpportunities: 8,
  wonOpportunities: 5,
  lostOpportunities: 2,
  conversionRate: 71.4,
  averageDealSize: 49000,
  averageSalesCycle: 45,
  lastActivityDate: new Date("2023-10-25"),
};

// Activités
const activities: Activity[] = [
  {
    id: "activity-001",
    type: "call",
    title: "Appel de suivi",
    description: "Appel pour discuter des besoins en logiciel de gestion",
    date: new Date("2023-10-25T14:30:00"),
    duration: 25,
    createdBy: "user-001",
    clientId: "client-001",
    contactId: "contact-001",
    completed: true,
    result: "Client intéressé par une démonstration",
  },
  {
    id: "activity-002",
    type: "meeting",
    title: "Réunion de présentation",
    description: "Présentation de notre solution complète",
    date: new Date("2023-10-18T10:00:00"),
    duration: 60,
    createdBy: "user-001",
    clientId: "client-001",
    contactId: "contact-001",
    relatedOpportunityId: "opportunity-001",
    completed: true,
    result: "Proposition commerciale à envoyer",
  },
  {
    id: "activity-003",
    type: "email",
    title: "Envoi de documentation",
    description: "Documentation technique et brochure commerciale",
    date: new Date("2023-10-15T09:45:00"),
    createdBy: "user-001",
    clientId: "client-001",
    contactId: "contact-002",
    completed: true,
  },
  {
    id: "activity-004",
    type: "meeting",
    title: "Démonstration produit",
    description: "Démonstration de notre solution avec l'équipe technique",
    date: new Date("2023-11-05T15:00:00"),
    duration: 90,
    createdBy: "user-003",
    clientId: "client-001",
    contactId: "contact-001",
    relatedOpportunityId: "opportunity-001",
    completed: false,
  },
  {
    id: "activity-005",
    type: "task",
    title: "Préparation proposition commerciale",
    description: "Rédiger une proposition détaillée avec tarifs personnalisés",
    date: new Date("2023-10-30T11:00:00"),
    createdBy: "user-001",
    clientId: "client-001",
    relatedOpportunityId: "opportunity-001",
    completed: true,
  },
];

// Opportunités
const opportunities: Opportunity[] = [
  {
    id: "opportunity-001",
    clientId: "client-001",
    title: "Implémentation solution CRM",
    value: 75000,
    status: "negotiation",
    createdAt: new Date("2023-10-01"),
    updatedAt: new Date("2023-10-20"),
    expectedCloseDate: new Date("2023-11-30"),
    probability: 80,
    assignedTo: "user-001",
    products: ["CRM Pro", "Module Analytics", "Support Premium"],
    notes: "Client très intéressé, négociation sur le prix du support",
  },
  {
    id: "opportunity-002",
    clientId: "client-001",
    title: "Formation équipe commerciale",
    value: 15000,
    status: "proposal",
    createdAt: new Date("2023-10-15"),
    updatedAt: new Date("2023-10-18"),
    expectedCloseDate: new Date("2023-12-15"),
    probability: 60,
    assignedTo: "user-002",
    products: ["Formation Avancée", "Coaching Commercial"],
    notes: "En attente de validation budgétaire",
  },
  {
    id: "opportunity-003",
    clientId: "client-001",
    title: "Maintenance annuelle",
    value: 25000,
    status: "won",
    createdAt: new Date("2023-09-01"),
    updatedAt: new Date("2023-09-15"),
    expectedCloseDate: new Date("2023-09-30"),
    probability: 100,
    assignedTo: "user-001",
    products: ["Support Technique", "Mises à jour"],
    notes: "Contrat signé pour un an, renouvellement automatique",
  },
];

// Documents
const documents: Document[] = [
  {
    id: "document-001",
    clientId: "client-001",
    name: "Proposition commerciale CRM.pdf",
    type: "proposal",
    fileUrl: "/documents/proposition-crm.pdf",
    fileSize: 2540000,
    mimeType: "application/pdf",
    uploadedBy: "user-001",
    uploadedAt: new Date("2023-10-19"),
    lastModifiedAt: new Date("2023-10-22"),
    version: 2,
    relatedOpportunityId: "opportunity-001",
    previousVersions: [
      {
        id: "document-001-v1",
        clientId: "client-001",
        name: "Proposition commerciale CRM v1.pdf",
        type: "proposal",
        fileUrl: "/documents/proposition-crm-v1.pdf",
        fileSize: 2450000,
        mimeType: "application/pdf",
        uploadedBy: "user-001",
        uploadedAt: new Date("2023-10-19"),
        lastModifiedAt: new Date("2023-10-19"),
        version: 1,
        relatedOpportunityId: "opportunity-001",
      },
    ],
  },
  {
    id: "document-002",
    clientId: "client-001",
    name: "Contrat maintenance.docx",
    type: "contract",
    fileUrl: "/documents/contrat-maintenance.docx",
    fileSize: 1850000,
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    uploadedBy: "user-002",
    uploadedAt: new Date("2023-09-10"),
    lastModifiedAt: new Date("2023-09-15"),
    version: 1,
    relatedOpportunityId: "opportunity-003",
  },
  {
    id: "document-003",
    clientId: "client-001",
    name: "Facture 2023-09.pdf",
    type: "invoice",
    fileUrl: "/documents/facture-2023-09.pdf",
    fileSize: 1250000,
    mimeType: "application/pdf",
    uploadedBy: "user-002",
    uploadedAt: new Date("2023-09-30"),
    lastModifiedAt: new Date("2023-09-30"),
    version: 1,
    relatedOpportunityId: "opportunity-003",
  },
];

// Notes
const notes: Note[] = [
  {
    id: "note-001",
    clientId: "client-001",
    type: "meeting",
    content:
      "Réunion avec Jean Dupont. Points abordés:\n\n- Besoin d'une solution CRM intégrée\n- Équipe de 25 commerciaux à former\n- Budget alloué d'environ 100K€\n\nActions à suivre: préparer une démo personnalisée avec @Maxime Leroy",
    createdBy: "user-001",
    createdAt: new Date("2023-10-10"),
    updatedAt: new Date("2023-10-10"),
    mentions: ["user-003"],
  },
  {
    id: "note-002",
    clientId: "client-001",
    type: "call",
    content:
      "Appel avec Marie Lambert concernant le calendrier d'implémentation. Elle souhaite démarrer début décembre au plus tard. @Sophie Moreau merci de valider si c'est possible avec l'équipe technique.",
    createdBy: "user-001",
    createdAt: new Date("2023-10-17"),
    updatedAt: new Date("2023-10-18"),
    mentions: ["user-004"],
    relatedOpportunityId: "opportunity-001",
  },
  {
    id: "note-003",
    clientId: "client-001",
    type: "general",
    content:
      "Le client a signalé des problèmes avec leur système actuel et cherche une solution rapidement. Ils sont en train de comparer avec notre concurrent principal (SalesForcus). Nos points forts: tarification plus transparente et support local.",
    createdBy: "user-002",
    createdAt: new Date("2023-10-05"),
    updatedAt: new Date("2023-10-05"),
  },
];

// Historique des modifications
const changeHistory: ChangeHistory[] = [
  {
    id: "change-001",
    clientId: "client-001",
    changes: [
      {
        field: "phone",
        oldValue: "06 12 34 56 78",
        newValue: "06 12 34 56 79",
        changedAt: new Date("2023-10-15"),
        changedBy: "user-001",
      },
    ],
    changedAt: new Date("2023-10-15"),
    changedBy: "user-001",
  },
  {
    id: "change-002",
    clientId: "client-001",
    changes: [
      {
        field: "status",
        oldValue: "prospect",
        newValue: "client",
        changedAt: new Date("2023-09-15"),
        changedBy: "user-001",
      },
      {
        field: "assignedTo",
        oldValue: "user-002",
        newValue: "user-001",
        changedAt: new Date("2023-09-15"),
        changedBy: "user-001",
      },
    ],
    changedAt: new Date("2023-09-15"),
    changedBy: "user-001",
  },
];

// Client avec détails complets
export const CLIENT_WITH_DETAILS: ClientWithDetails = {
  ...MOCK_CLIENTS[0], // On utilise le premier client comme base
  score: clientScore,
  address,
  activities,
  opportunities,
  documents,
  notes,
  team: teamMembers,
  metrics: clientMetrics,
};

// Historique des modifications pour ce client
export const CLIENT_CHANGE_HISTORY = changeHistory;
