import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  RegleScoring,
  CritereScoring,
  CritereDemographique,
  CritereComportemental,
  HistoriqueScore,
  StatutQualification,
  ActionScoring,
  ModeleTestAB,
  AnalysePerformanceModele,
  DonneeEntrainement,
} from "../lib/types/scoring";

interface ScoringState {
  // Données principales
  regles: RegleScoring[];
  historique: HistoriqueScore[];
  modeles: ModeleTestAB[];
  analyses: AnalysePerformanceModele[];
  donneesEntrainement: DonneeEntrainement[];

  // État de l'UI
  regleSelectionnee: string | null;
  leadSelectionne: string | null;

  // Actions pour les règles
  ajouterRegle: (regle: Omit<RegleScoring, "id">) => string;
  modifierRegle: (id: string, updates: Partial<RegleScoring>) => void;
  supprimerRegle: (id: string) => void;
  dupliquerRegle: (id: string) => string;

  // Actions pour les critères
  ajouterCritere: (
    regleId: string,
    critere: Omit<CritereScoring, "id">
  ) => string;
  modifierCritere: (
    regleId: string,
    critereId: string,
    updates: Partial<CritereScoring>
  ) => void;
  supprimerCritere: (regleId: string, critereId: string) => void;

  // Actions pour les actions automatiques
  ajouterAction: (regleId: string, action: Omit<ActionScoring, "id">) => string;
  modifierAction: (
    regleId: string,
    actionId: string,
    updates: Partial<ActionScoring>
  ) => void;
  supprimerAction: (regleId: string, actionId: string) => void;

  // Actions pour les scores
  calculerScore: (leadId: string, regleId: string) => number;
  mettreAJourScoreLead: (leadId: string, regleId: string) => void;
  obtenirStatutLead: (leadId: string, regleId: string) => StatutQualification;

  // Actions pour le machine learning
  ajouterDonneeEntrainement: (donnee: Omit<DonneeEntrainement, "id">) => void;
  entrainerModele: (regleId: string) => void;

  // Actions pour les tests A/B
  creerTestAB: (test: Omit<ModeleTestAB, "id">) => string;
  terminerTestAB: (id: string) => void;

  // Sélecteurs
  selectionnerRegle: (id: string | null) => void;
  selectionnerLead: (id: string | null) => void;

  // Actions pour les modèles prédéfinis
  chargerModelesPredefinies: () => void;
}

// Modèles de scoring prédéfinis par secteur d'activité
const modelesPredefinisParSecteur: RegleScoring[] = [
  {
    id: "modele-tech",
    nom: "Modèle Tech B2B",
    description:
      "Modèle de scoring pour les entreprises du secteur technologique B2B",
    criteres: [
      {
        id: "tech-industrie",
        nom: "Industrie",
        description: "Type d'industrie du lead",
        type: "demographique",
        categorie: "industrie",
        poids: 2,
        actif: true,
        valeurs: [
          { valeur: "Logiciel", points: 10 },
          { valeur: "Cybersécurité", points: 8 },
          { valeur: "Cloud", points: 9 },
          { valeur: "IA", points: 10 },
          { valeur: "IoT", points: 7 },
        ],
      } as CritereDemographique,
      {
        id: "tech-taille",
        nom: "Taille de l'entreprise",
        description: "Nombre d'employés",
        type: "demographique",
        categorie: "taille",
        poids: 1.5,
        actif: true,
        valeurs: [
          { valeur: "1-10", points: 3 },
          { valeur: "11-50", points: 5 },
          { valeur: "51-200", points: 7 },
          { valeur: "201-1000", points: 10 },
          { valeur: "1000+", points: 8 },
        ],
      } as CritereDemographique,
      {
        id: "tech-telechargement-wp",
        nom: "Téléchargement Whitepaper",
        description: "A téléchargé un whitepaper technique",
        type: "comportemental",
        categorie: "telechargement",
        poids: 3,
        actif: true,
        points: 15,
        decroissance: {
          active: true,
          periodeJours: 30,
          pourcentage: 50,
        },
      } as CritereComportemental,
    ],
    seuils: {
      froid: 0,
      tiede: 30,
      chaud: 60,
      qualifie: 80,
    },
    actions: [],
    secteurActivite: "Technologie",
    estModele: true,
  },
  {
    id: "modele-ecommerce",
    nom: "Modèle E-commerce",
    description: "Modèle de scoring pour les entreprises du secteur e-commerce",
    criteres: [
      {
        id: "ecom-localisation",
        nom: "Localisation",
        description: "Région géographique du lead",
        type: "demographique",
        categorie: "localisation",
        poids: 1.5,
        actif: true,
        valeurs: [
          { valeur: "France", points: 10 },
          { valeur: "Europe", points: 8 },
          { valeur: "Amérique du Nord", points: 7 },
          { valeur: "Asie", points: 6 },
          { valeur: "Autres", points: 4 },
        ],
      } as CritereDemographique,
      {
        id: "ecom-visite",
        nom: "Visite de pages produits",
        description: "Nombre de visites sur les pages produits",
        type: "comportemental",
        categorie: "visite",
        poids: 2,
        actif: true,
        points: 5,
        decroissance: {
          active: true,
          periodeJours: 7,
          pourcentage: 70,
        },
      } as CritereComportemental,
      {
        id: "ecom-evenement",
        nom: "Participation webinar",
        description: "A participé à un webinar sur l'e-commerce",
        type: "comportemental",
        categorie: "evenement",
        poids: 3,
        actif: true,
        points: 15,
        decroissance: {
          active: true,
          periodeJours: 14,
          pourcentage: 50,
        },
      } as CritereComportemental,
    ],
    seuils: {
      froid: 0,
      tiede: 25,
      chaud: 50,
      qualifie: 75,
    },
    actions: [],
    secteurActivite: "E-commerce",
    estModele: true,
  },
];

// Mock d'historique pour la démo
const historiqueMock: HistoriqueScore[] = [
  {
    id: uuidv4(),
    leadId: "lead-1",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours avant
    score: 25,
    statut: "tiede",
    details: [
      { critereId: "tech-industrie", points: 16 },
      { critereId: "tech-taille", points: 9 },
    ],
  },
  {
    id: uuidv4(),
    leadId: "lead-1",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 jours avant
    score: 50,
    statut: "tiede",
    details: [
      { critereId: "tech-industrie", points: 16 },
      { critereId: "tech-taille", points: 9 },
      { critereId: "tech-telechargement-wp", points: 25 },
    ],
  },
  {
    id: uuidv4(),
    leadId: "lead-1",
    date: new Date(), // Aujourd'hui
    score: 75,
    statut: "chaud",
    details: [
      { critereId: "tech-industrie", points: 16 },
      { critereId: "tech-taille", points: 9 },
      { critereId: "tech-telechargement-wp", points: 25 },
      { critereId: "tech-visite-demo", points: 25 },
    ],
  },
];

// Fonction utilitaire pour trouver une règle par ID
const trouverRegle = (regles: RegleScoring[], id: string) => {
  return regles.find((regle) => regle.id === id);
};

// Fonction utilitaire pour calculer le statut en fonction du score et des seuils
const determinerStatut = (
  score: number,
  seuils: RegleScoring["seuils"]
): StatutQualification => {
  if (score >= seuils.qualifie) return "qualifie";
  if (score >= seuils.chaud) return "chaud";
  if (score >= seuils.tiede) return "tiede";
  return "froid";
};

export const useScoringStore = create<ScoringState>((set, get) => ({
  regles: [...modelesPredefinisParSecteur],
  historique: [...historiqueMock],
  modeles: [],
  analyses: [],
  donneesEntrainement: [],
  regleSelectionnee: null,
  leadSelectionne: null,

  // Actions pour les règles
  ajouterRegle: (regle) => {
    const id = uuidv4();
    set((state) => ({
      regles: [...state.regles, { ...regle, id }],
    }));
    return id;
  },

  modifierRegle: (id, updates) => {
    set((state) => ({
      regles: state.regles.map((regle) =>
        regle.id === id ? { ...regle, ...updates } : regle
      ),
    }));
  },

  supprimerRegle: (id) => {
    set((state) => ({
      regles: state.regles.filter((regle) => regle.id !== id),
    }));
  },

  dupliquerRegle: (id) => {
    const { regles } = get();
    const regleSource = regles.find((r) => r.id === id);

    if (!regleSource) return "";

    const nouvelId = uuidv4();
    const regleDupliquee: RegleScoring = {
      ...regleSource,
      id: nouvelId,
      nom: `${regleSource.nom} (copie)`,
      estModele: false,
    };

    set((state) => ({
      regles: [...state.regles, regleDupliquee],
    }));

    return nouvelId;
  },

  // Actions pour les critères
  ajouterCritere: (regleId, critere) => {
    const id = uuidv4();

    set((state) => {
      return {
        ...state,
        regles: state.regles.map((regle) => {
          if (regle.id === regleId) {
            return {
              ...regle,
              criteres: [
                ...regle.criteres,
                { ...critere, id } as CritereScoring,
              ],
            };
          }
          return regle;
        }),
      };
    });

    return id;
  },

  modifierCritere: (regleId, critereId, updates) => {
    set((state) => ({
      regles: state.regles.map((regle) => {
        if (regle.id === regleId) {
          return {
            ...regle,
            criteres: regle.criteres.map((critere) =>
              critere.id === critereId ? { ...critere, ...updates } : critere
            ),
          };
        }
        return regle;
      }),
    }));
  },

  supprimerCritere: (regleId, critereId) => {
    set((state) => ({
      regles: state.regles.map((regle) => {
        if (regle.id === regleId) {
          return {
            ...regle,
            criteres: regle.criteres.filter(
              (critere) => critere.id !== critereId
            ),
          };
        }
        return regle;
      }),
    }));
  },

  // Actions pour les actions automatiques
  ajouterAction: (regleId, action) => {
    const id = uuidv4();
    set((state) => ({
      regles: state.regles.map((regle) => {
        if (regle.id === regleId) {
          return {
            ...regle,
            actions: [...regle.actions, { ...action, id }],
          };
        }
        return regle;
      }),
    }));
    return id;
  },

  modifierAction: (regleId, actionId, updates) => {
    set((state) => ({
      regles: state.regles.map((regle) => {
        if (regle.id === regleId) {
          return {
            ...regle,
            actions: regle.actions.map((action) =>
              action.id === actionId ? { ...action, ...updates } : action
            ),
          };
        }
        return regle;
      }),
    }));
  },

  supprimerAction: (regleId, actionId) => {
    set((state) => ({
      regles: state.regles.map((regle) => {
        if (regle.id === regleId) {
          return {
            ...regle,
            actions: regle.actions.filter((action) => action.id !== actionId),
          };
        }
        return regle;
      }),
    }));
  },

  // Actions pour les scores
  calculerScore: (leadId, regleId) => {
    // Ici, nous simulerions le calcul du score en fonction des données du lead
    // et des critères de la règle de scoring
    // Pour simplifier, nous retournons un score aléatoire
    return Math.floor(Math.random() * 100);
  },

  mettreAJourScoreLead: (leadId, regleId) => {
    const { regles } = get();
    const regle = trouverRegle(regles, regleId);

    if (!regle) return;

    const score = get().calculerScore(leadId, regleId);
    const statut = determinerStatut(score, regle.seuils);

    const nouvelleEntree: HistoriqueScore = {
      id: uuidv4(),
      leadId,
      date: new Date(),
      score,
      statut,
      details: [], // À remplir avec les détails réels du calcul
    };

    set((state) => ({
      historique: [...state.historique, nouvelleEntree],
    }));

    // Vérifier si des actions doivent être déclenchées
    // basées sur le nouveau score ou statut
  },

  obtenirStatutLead: (leadId, regleId) => {
    const { historique, regles } = get();
    const regle = trouverRegle(regles, regleId);

    if (!regle) return "froid";

    // Trouver la dernière entrée d'historique pour ce lead et cette règle
    const derniereEntree = [...historique]
      .filter((h) => h.leadId === leadId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    if (!derniereEntree) return "froid";

    return derniereEntree.statut;
  },

  // Actions pour le machine learning
  ajouterDonneeEntrainement: (donnee) => {
    set((state) => ({
      donneesEntrainement: [...state.donneesEntrainement, donnee],
    }));
  },

  entrainerModele: (regleId) => {
    // Ici, nous simulerions l'entraînement du modèle
    // et la mise à jour des poids des critères
    console.log(`Entraînement du modèle pour la règle ${regleId}`);
  },

  // Actions pour les tests A/B
  creerTestAB: (test) => {
    const id = uuidv4();
    set((state) => ({
      modeles: [...state.modeles, { ...test, id }],
    }));
    return id;
  },

  terminerTestAB: (id) => {
    set((state) => ({
      modeles: state.modeles.map((modele) =>
        modele.id === id
          ? { ...modele, actif: false, dateFin: new Date() }
          : modele
      ),
    }));
  },

  // Sélecteurs
  selectionnerRegle: (id) => {
    set({ regleSelectionnee: id });
  },

  selectionnerLead: (id) => {
    set({ leadSelectionne: id });
  },

  // Actions pour les modèles prédéfinis
  chargerModelesPredefinies: () => {
    set((state) => ({
      regles: [
        ...state.regles.filter((r) => !r.estModele),
        ...modelesPredefinisParSecteur,
      ],
    }));
  },
}));
