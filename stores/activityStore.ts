import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Activity,
  ActivityTemplate,
  ActivityType,
  TaskPriority,
  TaskStatus,
  CalendarViewState,
  ActivityFilters,
  ActivitySortOptions,
  TimeTrackingEntry,
  ReminderType,
} from "../components/crm/ActivityManager/types";
import { format, isSameDay, isAfter, isBefore, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { v4 as uuidv4 } from "uuid";

interface ActivityState {
  activities: Activity[];
  templates: ActivityTemplate[];
  timeEntries: TimeTrackingEntry[];
  offlineQueue: Activity[];
  selectedActivity: Activity | null;
  calendarView: CalendarViewState;
  filters: ActivityFilters;
  sortOption: ActivitySortOptions;
  activeTimeTracking: string | null; // ID de l'activité en cours de suivi de temps

  // Actions
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (activityId: string) => void;
  selectActivity: (activityId: string | null) => void;
  setCalendarView: (view: Partial<CalendarViewState>) => void;
  setFilters: (filters: Partial<ActivityFilters>) => void;
  resetFilters: () => void;
  setSortOption: (sortOption: ActivitySortOptions) => void;
  addTemplate: (template: ActivityTemplate) => void;
  updateTemplate: (template: ActivityTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  startTimeTracking: (activityId: string) => void;
  stopTimeTracking: (notes?: string) => void;
  addTimeEntry: (entry: TimeTrackingEntry) => void;
  updateTimeEntry: (entry: TimeTrackingEntry) => void;
  deleteTimeEntry: (entryId: string) => void;
  addToOfflineQueue: (activity: Activity) => void;
  syncOfflineQueue: () => Promise<void>;
  getActivities: (filters?: ActivityFilters) => Activity[];
}

// Templates d'activités par défaut
const defaultTemplates: ActivityTemplate[] = [
  {
    id: "template-1",
    nom: "Appel de suivi",
    description: "Appel de suivi standard après une première discussion",
    type: ActivityType.APPEL,
    duree: 30,
    rappels: [
      { type: ReminderType.NOTIFICATION, delai: 15, active: true },
      { type: ReminderType.EMAIL, delai: 60, active: false },
    ],
    etapesDefaut: [
      "Rappeler les points de la dernière discussion",
      "Vérifier les besoins actuels",
      "Présenter les solutions adaptées",
      "Définir les prochaines étapes",
    ],
  },
  {
    id: "template-2",
    nom: "Démonstration produit",
    description: "Démonstration complète du produit ou service",
    type: ActivityType.DEMONSTRATION,
    duree: 60,
    rappels: [
      { type: ReminderType.NOTIFICATION, delai: 30, active: true },
      { type: ReminderType.EMAIL, delai: 120, active: true },
      { type: ReminderType.CALENDRIER, delai: 1440, active: true },
    ],
    etapesDefaut: [
      "Introduction et présentation des objectifs",
      "Démonstration des fonctionnalités principales",
      "Questions et réponses",
      "Présentation des tarifs",
      "Définition des prochaines étapes",
    ],
  },
  {
    id: "template-3",
    nom: "Négociation",
    description: "Session de négociation pour finaliser un contrat",
    type: ActivityType.NEGOCIATION,
    duree: 45,
    rappels: [
      { type: ReminderType.NOTIFICATION, delai: 30, active: true },
      { type: ReminderType.EMAIL, delai: 120, active: true },
    ],
    etapesDefaut: [
      "Récapitulatif de la proposition actuelle",
      "Discussion des points négociables",
      "Présentation des avantages",
      "Finalisation des termes",
      "Planification de la signature",
    ],
  },
  {
    id: "template-4",
    nom: "Réunion découverte",
    description: "Première réunion pour découvrir les besoins du client",
    type: ActivityType.REUNION,
    duree: 60,
    rappels: [
      { type: ReminderType.NOTIFICATION, delai: 15, active: true },
      { type: ReminderType.EMAIL, delai: 1440, active: true },
    ],
    etapesDefaut: [
      "Présentation de notre entreprise",
      "Découverte des besoins du client",
      "Exploration des défis actuels",
      "Présentation générale de nos solutions",
      "Définition des prochaines étapes",
    ],
  },
  {
    id: "template-5",
    nom: "Email de proposition",
    description: "Envoi d'une proposition commerciale par email",
    type: ActivityType.EMAIL,
    duree: 15,
    rappels: [{ type: ReminderType.NOTIFICATION, delai: 15, active: true }],
    etapesDefaut: [
      "Préparation de la proposition",
      "Personnalisation selon les besoins du client",
      "Envoi de l'email",
      "Planification du suivi",
    ],
  },
];

// État par défaut des filtres
const defaultFilters: ActivityFilters = {
  statut: undefined,
  type: undefined,
  priorite: undefined,
  assigneA: undefined,
  client: undefined,
  opportunite: undefined,
  periode: undefined,
  recherche: undefined,
  tagsSelectionnes: undefined,
};

// Option de tri par défaut
const defaultSortOption: ActivitySortOptions = {
  champ: "dateDebut",
  direction: "asc",
};

// Vue calendrier par défaut
const defaultCalendarView: CalendarViewState = {
  vue: "semaine",
  date: new Date(),
};

// Fonction pour générer un ID unique
const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      templates: defaultTemplates,
      timeEntries: [],
      offlineQueue: [],
      selectedActivity: null,
      calendarView: defaultCalendarView,
      filters: defaultFilters,
      sortOption: defaultSortOption,
      activeTimeTracking: null,

      setActivities: (activities) => set({ activities }),

      addActivity: (activity) => {
        const newActivity = {
          ...activity,
          id: activity.id || uuidv4(),
          creeLe: activity.creeLe || new Date(),
          modifieLe: new Date(),
        };

        set((state) => ({
          activities: [...state.activities, newActivity],
        }));

        return newActivity;
      },

      updateActivity: (activity) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === activity.id ? { ...activity, modifieLe: new Date() } : a
          ),
          selectedActivity:
            state.selectedActivity?.id === activity.id
              ? { ...activity, modifieLe: new Date() }
              : state.selectedActivity,
        }));
      },

      deleteActivity: (activityId) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== activityId),
          selectedActivity:
            state.selectedActivity?.id === activityId
              ? null
              : state.selectedActivity,
        }));
      },

      selectActivity: (activityId) => {
        if (!activityId) {
          set({ selectedActivity: null });
          return;
        }

        const activity = get().activities.find((a) => a.id === activityId);
        set({ selectedActivity: activity || null });
      },

      setCalendarView: (view) => {
        set((state) => ({
          calendarView: { ...state.calendarView, ...view },
        }));
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      resetFilters: () => {
        set({ filters: defaultFilters });
      },

      setSortOption: (sortOption) => {
        set({ sortOption });
      },

      addTemplate: (template) => {
        const newTemplate = {
          ...template,
          id: template.id || generateId(),
        };

        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },

      updateTemplate: (template) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === template.id ? template : t
          ),
        }));
      },

      deleteTemplate: (templateId) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== templateId),
        }));
      },

      startTimeTracking: (activityId) => {
        // Arrêter le suivi en cours s'il y en a un
        const currentTracking = get().activeTimeTracking;
        if (currentTracking) {
          get().stopTimeTracking();
        }

        // Débuter un nouveau suivi
        const newEntry: TimeTrackingEntry = {
          id: generateId(),
          activiteId: activityId,
          debut: new Date(),
          utilisateurId: "current-user", // à remplacer par l'utilisateur réel
        };

        set((state) => ({
          timeEntries: [...state.timeEntries, newEntry],
          activeTimeTracking: activityId,
        }));
      },

      stopTimeTracking: (notes) => {
        const state = get();
        const activeId = state.activeTimeTracking;

        if (!activeId) return;

        set((state) => {
          const updatedEntries = state.timeEntries.map((entry) => {
            if (entry.activiteId === activeId && !entry.fin) {
              const fin = new Date();
              const duree = Math.round(
                (fin.getTime() - entry.debut.getTime()) / 60000
              ); // en minutes
              return { ...entry, fin, duree, notes: notes || entry.notes };
            }
            return entry;
          });

          // Mettre à jour le temps passé sur l'activité
          const totalDuree = updatedEntries
            .filter((e) => e.activiteId === activeId && e.duree)
            .reduce((sum, entry) => sum + (entry.duree || 0), 0);

          const updatedActivities = state.activities.map((activity) => {
            if (activity.id === activeId) {
              return { ...activity, tempsPasse: totalDuree };
            }
            return activity;
          });

          return {
            timeEntries: updatedEntries,
            activeTimeTracking: null,
            activities: updatedActivities,
          };
        });
      },

      addTimeEntry: (entry) => {
        const newEntry = {
          ...entry,
          id: entry.id || generateId(),
        };

        set((state) => ({
          timeEntries: [...state.timeEntries, newEntry],
        }));

        // Mettre à jour le temps total passé sur l'activité
        if (entry.duree) {
          set((state) => {
            const totalDuree = state.timeEntries
              .filter((e) => e.activiteId === entry.activiteId && e.duree)
              .reduce((sum, e) => sum + (e.duree || 0), 0);

            const updatedActivities = state.activities.map((activity) => {
              if (activity.id === entry.activiteId) {
                return { ...activity, tempsPasse: totalDuree };
              }
              return activity;
            });

            return { activities: updatedActivities };
          });
        }
      },

      updateTimeEntry: (entry) => {
        set((state) => ({
          timeEntries: state.timeEntries.map((e) =>
            e.id === entry.id ? entry : e
          ),
        }));

        // Mettre à jour le temps total passé sur l'activité
        set((state) => {
          const totalDuree = state.timeEntries
            .filter((e) => e.activiteId === entry.activiteId && e.duree)
            .reduce((sum, e) => sum + (e.duree || 0), 0);

          const updatedActivities = state.activities.map((activity) => {
            if (activity.id === entry.activiteId) {
              return { ...activity, tempsPasse: totalDuree };
            }
            return activity;
          });

          return { activities: updatedActivities };
        });
      },

      deleteTimeEntry: (entryId) => {
        let activiteId = "";

        // Récupérer l'activité ID avant suppression
        const entry = get().timeEntries.find((e) => e.id === entryId);
        if (entry) {
          activiteId = entry.activiteId;
        }

        set((state) => ({
          timeEntries: state.timeEntries.filter((e) => e.id !== entryId),
        }));

        // Mettre à jour le temps total passé sur l'activité
        if (activiteId) {
          set((state) => {
            const totalDuree = state.timeEntries
              .filter((e) => e.activiteId === activiteId && e.duree)
              .reduce((sum, e) => sum + (e.duree || 0), 0);

            const updatedActivities = state.activities.map((activity) => {
              if (activity.id === activiteId) {
                return { ...activity, tempsPasse: totalDuree };
              }
              return activity;
            });

            return { activities: updatedActivities };
          });
        }
      },

      addToOfflineQueue: (activity) => {
        const offlineActivity = {
          ...activity,
          estHorsLigne: true,
          id: activity.id || generateId(),
          creeLe: activity.creeLe || new Date(),
          modifieLe: new Date(),
        };

        set((state) => ({
          activities: [...state.activities, offlineActivity],
          offlineQueue: [...state.offlineQueue, offlineActivity],
        }));
      },

      syncOfflineQueue: async () => {
        // Simulation de synchronisation avec le serveur
        // Dans un cas réel, il faudrait appeler une API
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            set((state) => {
              const updatedActivities = state.activities.map((activity) => {
                if (activity.estHorsLigne) {
                  return { ...activity, estHorsLigne: false };
                }
                return activity;
              });

              return {
                activities: updatedActivities,
                offlineQueue: [],
              };
            });

            resolve();
          }, 1000);
        });
      },

      getActivities: (filters?: ActivityFilters) => {
        const { activities } = get();

        if (!filters) return activities;

        return activities.filter((activity) => {
          let match = true;

          if (filters.client && activity.client?.id !== filters.client) {
            match = false;
          }

          if (
            filters.opportunite &&
            activity.opportunite?.id !== filters.opportunite
          ) {
            match = false;
          }

          if (filters.type && activity.type !== filters.type) {
            match = false;
          }

          if (filters.statut && activity.statut !== filters.statut) {
            match = false;
          }

          if (
            filters.dateDebut &&
            new Date(activity.dateDebut) < filters.dateDebut
          ) {
            match = false;
          }

          if (filters.dateFin && new Date(activity.dateFin) > filters.dateFin) {
            match = false;
          }

          if (
            filters.recherche &&
            !activity.titre
              .toLowerCase()
              .includes(filters.recherche.toLowerCase())
          ) {
            match = false;
          }

          return match;
        });
      },
    }),
    {
      name: "activity-storage",
    }
  )
);

// Fonctions utilitaires pour filtrer et trier les activités

export const filterActivities = (
  activities: Activity[],
  filters: ActivityFilters
): Activity[] => {
  return activities.filter((activity) => {
    // Filtrer par statut
    if (
      filters.statut &&
      filters.statut.length > 0 &&
      !filters.statut.includes(activity.statut)
    ) {
      return false;
    }

    // Filtrer par type
    if (
      filters.type &&
      filters.type.length > 0 &&
      !filters.type.includes(activity.type)
    ) {
      return false;
    }

    // Filtrer par priorité
    if (
      filters.priorite &&
      filters.priorite.length > 0 &&
      !filters.priorite.includes(activity.priorite)
    ) {
      return false;
    }

    // Filtrer par assigné
    if (
      filters.assigneA &&
      filters.assigneA.length > 0 &&
      !filters.assigneA.includes(activity.assigneA.id)
    ) {
      return false;
    }

    // Filtrer par client
    if (filters.client && activity.client?.id !== filters.client) {
      return false;
    }

    // Filtrer par opportunité
    if (
      filters.opportunite &&
      activity.opportunite?.id !== filters.opportunite
    ) {
      return false;
    }

    // Filtrer par période
    if (filters.periode) {
      const { debut, fin } = filters.periode;

      if (debut && isAfter(debut, activity.dateDebut)) {
        return false;
      }

      if (fin && isBefore(fin, activity.dateFin)) {
        return false;
      }
    }

    // Filtrer par recherche
    if (filters.recherche) {
      const searchText = filters.recherche.toLowerCase();
      const titleMatch = activity.titre.toLowerCase().includes(searchText);
      const descMatch =
        activity.description?.toLowerCase().includes(searchText) || false;
      const clientMatch =
        activity.client?.nom.toLowerCase().includes(searchText) || false;

      if (!titleMatch && !descMatch && !clientMatch) {
        return false;
      }
    }

    // Filtrer par tags
    if (filters.tagsSelectionnes && filters.tagsSelectionnes.length > 0) {
      if (!activity.tags || activity.tags.length === 0) {
        return false;
      }

      const hasTag = filters.tagsSelectionnes.some((tag) =>
        activity.tags?.includes(tag)
      );
      if (!hasTag) {
        return false;
      }
    }

    return true;
  });
};

export const sortActivities = (
  activities: Activity[],
  sortOption: ActivitySortOptions
): Activity[] => {
  return [...activities].sort((a, b) => {
    const { champ, direction } = sortOption;
    const multiplier = direction === "asc" ? 1 : -1;

    switch (champ) {
      case "dateDebut":
        return (a.dateDebut.getTime() - b.dateDebut.getTime()) * multiplier;
      case "priorite":
        const priorityOrder = {
          [TaskPriority.FAIBLE]: 0,
          [TaskPriority.MOYENNE]: 1,
          [TaskPriority.ELEVEE]: 2,
          [TaskPriority.URGENTE]: 3,
        };
        return (
          (priorityOrder[a.priorite] - priorityOrder[b.priorite]) * multiplier
        );
      case "type":
        return a.type.localeCompare(b.type) * multiplier;
      case "statut":
        return a.statut.localeCompare(b.statut) * multiplier;
      case "client":
        const clientA = a.client?.nom || "";
        const clientB = b.client?.nom || "";
        return clientA.localeCompare(clientB) * multiplier;
      default:
        return 0;
    }
  });
};

export const getActivitiesForToday = (): Activity[] => {
  const state = useActivityStore.getState();
  const today = new Date();

  return state.activities.filter(
    (activity) =>
      isSameDay(activity.dateDebut, today) || isSameDay(activity.dateFin, today)
  );
};

export const getUpcomingActivities = (days: number = 7): Activity[] => {
  const state = useActivityStore.getState();
  const today = new Date();
  const endDate = addDays(today, days);

  return state.activities.filter(
    (activity) =>
      (isAfter(activity.dateDebut, today) ||
        isSameDay(activity.dateDebut, today)) &&
      (isBefore(activity.dateDebut, endDate) ||
        isSameDay(activity.dateDebut, endDate))
  );
};

export const getLateActivities = (): Activity[] => {
  const state = useActivityStore.getState();
  const today = new Date();

  return state.activities.filter(
    (activity) =>
      isBefore(activity.dateFin, today) &&
      activity.statut !== TaskStatus.TERMINEE &&
      activity.statut !== TaskStatus.ANNULEE
  );
};

// Export pour compatibilité avec le code existant
export const activityStore = {
  getActivities: (filters?: ActivityFilters) =>
    useActivityStore.getState().getActivities(filters),
  addActivity: (activity: Activity) =>
    useActivityStore.getState().addActivity(activity),
  updateActivity: (activity: Activity) =>
    useActivityStore.getState().updateActivity(activity),
  deleteActivity: (id: string) =>
    useActivityStore.getState().deleteActivity(id),
};
