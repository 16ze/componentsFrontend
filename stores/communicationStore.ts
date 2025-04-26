import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  format,
  addHours,
  addDays,
  isBefore,
  isAfter,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";

import {
  Communication,
  CommunicationType,
  CommunicationStatus,
  CommunicationFolder,
  CommunicationPriority,
  CommunicationFilters,
  EmailTemplate,
  SequenceEmail,
  TrackingEvent,
  TrackingEventType,
  ConsentPreferences,
  EmailTemplateCategory,
} from "../components/crm/Communication/types";

// Modèles d'emails par défaut
const defaultTemplates: EmailTemplate[] = [
  {
    id: "template-1",
    nom: "Présentation initiale",
    sujet:
      "Découvrez comment {{entreprise.nom}} peut vous aider à atteindre vos objectifs",
    contenuHtml: `
      <h2>Bonjour {{client.prenom}},</h2>
      <p>Suite à notre récente conversation, je souhaitais vous présenter les solutions que {{entreprise.nom}} peut vous proposer pour répondre à vos besoins.</p>
      <p>Notre expertise en {{entreprise.domaine}} a déjà permis à de nombreuses entreprises comme {{client.entreprise}} d'améliorer leur performance et d'atteindre leurs objectifs.</p>
      <p>Seriez-vous disponible pour un appel de 30 minutes cette semaine afin d'explorer plus en détail comment nous pourrions collaborer ?</p>
      <p>Cordialement,<br>{{utilisateur.nom}}<br>{{utilisateur.titre}}</p>
    `,
    contenuTexte:
      "Bonjour {{client.prenom}},\n\nSuite à notre récente conversation, je souhaitais vous présenter les solutions que {{entreprise.nom}} peut vous proposer pour répondre à vos besoins.\n\nNotre expertise en {{entreprise.domaine}} a déjà permis à de nombreuses entreprises comme {{client.entreprise}} d'améliorer leur performance et d'atteindre leurs objectifs.\n\nSeriez-vous disponible pour un appel de 30 minutes cette semaine afin d'explorer plus en détail comment nous pourrions collaborer ?\n\nCordialement,\n{{utilisateur.nom}}\n{{utilisateur.titre}}",
    categorie: EmailTemplateCategory.PROSPECTION,
    variables: [
      {
        code: "client.prenom",
        description: "Prénom du client",
        valeurParDefaut: "Cher client",
        categorie: "client",
      },
      {
        code: "client.entreprise",
        description: "Nom de l'entreprise du client",
        valeurParDefaut: "votre entreprise",
        categorie: "client",
      },
      {
        code: "entreprise.nom",
        description: "Nom de notre entreprise",
        valeurParDefaut: "Notre entreprise",
        categorie: "entreprise",
      },
      {
        code: "entreprise.domaine",
        description: "Domaine d'expertise",
        valeurParDefaut: "notre domaine d'expertise",
        categorie: "entreprise",
      },
      {
        code: "utilisateur.nom",
        description: "Nom du commercial",
        valeurParDefaut: "L'équipe commerciale",
        categorie: "utilisateur",
      },
      {
        code: "utilisateur.titre",
        description: "Titre du commercial",
        valeurParDefaut: "Conseiller commercial",
        categorie: "utilisateur",
      },
    ],
    tags: ["prospection", "présentation"],
    creePar: "système",
    dateCreation: new Date(),
    dateModification: new Date(),
    actif: true,
    metriques: {
      nombreEnvois: 0,
    },
  },
  {
    id: "template-2",
    nom: "Suivi après une réunion",
    sujet: "Résumé de notre conversation - Prochaines étapes",
    contenuHtml: `
      <h2>Bonjour {{client.prenom}},</h2>
      <p>Je vous remercie pour notre conversation d'aujourd'hui concernant {{opportunite.nom}}.</p>
      <p>Pour résumer, nous avons discuté de :</p>
      <ul>
        <li>Vos besoins principaux : {{opportunite.besoins}}</li>
        <li>Les solutions envisagées</li>
        <li>Les prochaines étapes</li>
      </ul>
      <p>Comme convenu, je vous enverrai une proposition détaillée d'ici {{systeme.date_plus_3j}}.</p>
      <p>N'hésitez pas à me contacter si vous avez des questions d'ici là.</p>
      <p>Cordialement,<br>{{utilisateur.nom}}</p>
    `,
    contenuTexte:
      "Bonjour {{client.prenom}},\n\nJe vous remercie pour notre conversation d'aujourd'hui concernant {{opportunite.nom}}.\n\nPour résumer, nous avons discuté de :\n- Vos besoins principaux : {{opportunite.besoins}}\n- Les solutions envisagées\n- Les prochaines étapes\n\nComme convenu, je vous enverrai une proposition détaillée d'ici {{systeme.date_plus_3j}}.\n\nN'hésitez pas à me contacter si vous avez des questions d'ici là.\n\nCordialement,\n{{utilisateur.nom}}",
    categorie: EmailTemplateCategory.SUIVI,
    variables: [
      {
        code: "client.prenom",
        description: "Prénom du client",
        valeurParDefaut: "Cher client",
        categorie: "client",
      },
      {
        code: "opportunite.nom",
        description: "Nom de l'opportunité",
        valeurParDefaut: "votre projet",
        categorie: "opportunite",
      },
      {
        code: "opportunite.besoins",
        description: "Besoins identifiés",
        valeurParDefaut: "les besoins identifiés",
        categorie: "opportunite",
      },
      {
        code: "systeme.date_plus_3j",
        description: "Date dans 3 jours",
        valeurParDefaut: "la fin de la semaine",
        categorie: "systeme",
      },
      {
        code: "utilisateur.nom",
        description: "Nom du commercial",
        valeurParDefaut: "L'équipe commerciale",
        categorie: "utilisateur",
      },
    ],
    tags: ["suivi", "résumé"],
    creePar: "système",
    dateCreation: new Date(),
    dateModification: new Date(),
    actif: true,
    metriques: {
      nombreEnvois: 0,
    },
  },
];

// Séquences d'emails par défaut
const defaultSequences: SequenceEmail[] = [
  {
    id: "sequence-1",
    nom: "Onboarding nouveau client",
    description: "Séquence d'emails pour accueillir un nouveau client",
    declencheur: "nouveau_client",
    emails: [
      {
        ordre: 1,
        templateId: "template-1",
        delai: 0, // immédiat
        optimisationHoraire: true,
      },
      {
        ordre: 2,
        templateId: "template-2",
        delai: 72, // 3 jours après
        conditionsEnvoi: {
          siPasOuverture: true,
        },
        optimisationHoraire: true,
      },
    ],
    active: true,
    dateCreation: new Date(),
    dateModification: new Date(),
    creePar: "système",
    statistiques: {
      nombreDeclenchements: 0,
      nombreEmailsEnvoyes: 0,
      tauxConversion: 0,
      tauxDesabonnement: 0,
    },
  },
];

interface CommunicationState {
  communications: Communication[];
  templates: EmailTemplate[];
  sequences: SequenceEmail[];
  trackingEvents: TrackingEvent[];
  selectedCommunication: Communication | null;
  currentFolder: CommunicationFolder;
  filters: CommunicationFilters;
  queuedCommunications: Communication[];
  consentRegistry: Record<string, ConsentPreferences>; // clientId -> préférences

  // Actions
  setCommunications: (communications: Communication[]) => void;
  addCommunication: (communication: Communication) => void;
  updateCommunication: (communication: Communication) => void;
  deleteCommunication: (id: string) => void;
  moveToDossier: (id: string, dossier: CommunicationFolder) => void;
  selectCommunication: (id: string | null) => void;
  setCurrentFolder: (folder: CommunicationFolder) => void;
  setFilters: (filters: Partial<CommunicationFilters>) => void;
  resetFilters: () => void;

  // Templates
  addTemplate: (template: EmailTemplate) => void;
  updateTemplate: (template: EmailTemplate) => void;
  deleteTemplate: (id: string) => void;

  // Séquences
  addSequence: (sequence: SequenceEmail) => void;
  updateSequence: (sequence: SequenceEmail) => void;
  deleteSequence: (id: string) => void;
  triggerSequence: (sequenceId: string, clientIds: string[]) => void;

  // Envoi et tracking
  sendCommunication: (communication: Communication) => Promise<boolean>;
  scheduleCommunication: (communication: Communication, date: Date) => void;
  recordTrackingEvent: (event: Omit<TrackingEvent, "id" | "date">) => void;

  // Consentement RGPD
  updateConsentPreferences: (
    clientId: string,
    preferences: Partial<ConsentPreferences>
  ) => void;
  getConsentPreferences: (clientId: string) => ConsentPreferences | null;

  // Recherche et filtrage
  getCommunications: (filters?: CommunicationFilters) => Communication[];
  getUnreadCount: (folder?: CommunicationFolder) => number;
}

// Filtres par défaut
const defaultFilters: CommunicationFilters = {
  dossier: CommunicationFolder.BOITE_RECEPTION,
};

export const useCommunicationStore = create<CommunicationState>()(
  persist(
    (set, get) => ({
      communications: [],
      templates: defaultTemplates,
      sequences: defaultSequences,
      trackingEvents: [],
      selectedCommunication: null,
      currentFolder: CommunicationFolder.BOITE_RECEPTION,
      filters: defaultFilters,
      queuedCommunications: [],
      consentRegistry: {},

      setCommunications: (communications) => set({ communications }),

      addCommunication: (communication) => {
        const newCommunication = {
          ...communication,
          id: communication.id || uuidv4(),
          dateCreation: communication.dateCreation || new Date(),
          dateModification: new Date(),
        };

        set((state) => ({
          communications: [...state.communications, newCommunication],
        }));

        return newCommunication;
      },

      updateCommunication: (communication) => {
        set((state) => ({
          communications: state.communications.map((c) =>
            c.id === communication.id
              ? { ...communication, dateModification: new Date() }
              : c
          ),
          selectedCommunication:
            state.selectedCommunication?.id === communication.id
              ? { ...communication, dateModification: new Date() }
              : state.selectedCommunication,
        }));
      },

      deleteCommunication: (id) => {
        set((state) => ({
          communications: state.communications.filter((c) => c.id !== id),
          selectedCommunication:
            state.selectedCommunication?.id === id
              ? null
              : state.selectedCommunication,
        }));
      },

      moveToDossier: (id, dossier) => {
        set((state) => ({
          communications: state.communications.map((c) =>
            c.id === id ? { ...c, dossier, dateModification: new Date() } : c
          ),
        }));
      },

      selectCommunication: (id) => {
        if (!id) {
          set({ selectedCommunication: null });
          return;
        }

        const communication = get().communications.find((c) => c.id === id);
        set({ selectedCommunication: communication || null });
      },

      setCurrentFolder: (folder) => {
        set({ currentFolder: folder });
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      resetFilters: () => {
        set({ filters: defaultFilters });
      },

      // Templates
      addTemplate: (template) => {
        const newTemplate = {
          ...template,
          id: template.id || uuidv4(),
          dateCreation: template.dateCreation || new Date(),
          dateModification: new Date(),
        };

        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },

      updateTemplate: (template) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === template.id
              ? { ...template, dateModification: new Date() }
              : t
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      // Séquences
      addSequence: (sequence) => {
        const newSequence = {
          ...sequence,
          id: sequence.id || uuidv4(),
          dateCreation: sequence.dateCreation || new Date(),
          dateModification: new Date(),
        };

        set((state) => ({
          sequences: [...state.sequences, newSequence],
        }));
      },

      updateSequence: (sequence) => {
        set((state) => ({
          sequences: state.sequences.map((s) =>
            s.id === sequence.id
              ? { ...sequence, dateModification: new Date() }
              : s
          ),
        }));
      },

      deleteSequence: (id) => {
        set((state) => ({
          sequences: state.sequences.filter((s) => s.id !== id),
        }));
      },

      triggerSequence: (sequenceId, clientIds) => {
        const sequence = get().sequences.find((s) => s.id === sequenceId);

        if (!sequence || !sequence.active) return;

        // Pour chaque client
        clientIds.forEach((clientId) => {
          // Vérifier le consentement
          const consent = get().getConsentPreferences(clientId);
          if (!consent?.emailsCommercials) return;

          // Déclencher le premier email de la séquence
          const firstEmail = sequence.emails.find((e) => e.ordre === 1);
          if (!firstEmail) return;

          const template = get().templates.find(
            (t) => t.id === firstEmail.templateId
          );
          if (!template) return;

          // Créer une communication programmée
          const communication: Communication = {
            id: uuidv4(),
            type: CommunicationType.EMAIL,
            statut: CommunicationStatus.PROGRAMMEE,
            dossier: CommunicationFolder.ENVOYES,
            expediteur: {
              id: "current-user", // À remplacer par l'utilisateur réel
              nom: "Utilisateur actuel",
              email: "contact@entreprise.com",
            },
            destinataires: [
              {
                id: clientId,
                nom: "Client", // Idéalement, récupérer le nom réel du client
                type: "to",
              },
            ],
            sujet: template.sujet,
            contenuHtml: template.contenuHtml,
            contenuTexte: template.contenuTexte,
            dateCreation: new Date(),
            dateModification: new Date(),
            dateProgrammee: new Date(), // Date immédiate ou optimisée
            priorite: CommunicationPriority.NORMALE,
            clientId: clientId,
            templateId: template.id,
            templateNom: template.nom,
            sequenceId: sequence.id,
            sequenceEtape: firstEmail.ordre,
            optimisationHoraire: firstEmail.optimisationHoraire,
          };

          // Ajouter à la file d'attente
          get().scheduleCommunication(communication, new Date());
        });

        // Mettre à jour les statistiques de la séquence
        set((state) => ({
          sequences: state.sequences.map((s) => {
            if (s.id === sequenceId) {
              return {
                ...s,
                statistiques: {
                  ...s.statistiques,
                  nombreDeclenchements:
                    (s.statistiques?.nombreDeclenchements || 0) +
                    clientIds.length,
                },
              };
            }
            return s;
          }),
        }));
      },

      // Envoi et tracking
      sendCommunication: async (communication) => {
        // Simuler l'envoi (remplacer par un appel API réel)
        return new Promise<boolean>((resolve) => {
          setTimeout(() => {
            const updatedCommunication = {
              ...communication,
              statut: CommunicationStatus.ENVOYEE,
              dateEnvoi: new Date(),
              dateModification: new Date(),
            };

            set((state) => ({
              communications: state.communications.map((c) =>
                c.id === communication.id ? updatedCommunication : c
              ),
              queuedCommunications: state.queuedCommunications.filter(
                (c) => c.id !== communication.id
              ),
            }));

            // Mise à jour des métriques du template
            if (communication.templateId) {
              set((state) => ({
                templates: state.templates.map((t) => {
                  if (t.id === communication.templateId) {
                    return {
                      ...t,
                      metriques: {
                        ...t.metriques,
                        nombreEnvois: (t.metriques?.nombreEnvois || 0) + 1,
                      },
                    };
                  }
                  return t;
                }),
              }));
            }

            resolve(true);
          }, 1000);
        });
      },

      scheduleCommunication: (communication, date) => {
        const scheduledCommunication = {
          ...communication,
          statut: CommunicationStatus.PROGRAMMEE,
          dateProgrammee: date,
        };

        // Ajouter à la file d'attente
        set((state) => ({
          queuedCommunications: [
            ...state.queuedCommunications,
            scheduledCommunication,
          ],
          communications: [...state.communications, scheduledCommunication],
        }));
      },

      recordTrackingEvent: (eventData) => {
        const event: TrackingEvent = {
          ...eventData,
          id: uuidv4(),
          date: new Date(),
        };

        set((state) => ({
          trackingEvents: [...state.trackingEvents, event],
        }));

        // Mettre à jour le tracking sur la communication
        const { communicationId, type } = eventData;

        set((state) => ({
          communications: state.communications.map((c) => {
            if (c.id === communicationId) {
              let updatedTracking = c.tracking || {
                ouvert: false,
                repondu: false,
              };

              switch (type) {
                case TrackingEventType.OUVERTURE:
                  updatedTracking = {
                    ...updatedTracking,
                    ouvert: true,
                    dateOuverture: updatedTracking.dateOuverture || new Date(),
                    nombreOuvertures:
                      (updatedTracking.nombreOuvertures || 0) + 1,
                  };
                  break;
                case TrackingEventType.CLIC:
                  const url = eventData.details?.url || "";
                  const existingClics = updatedTracking.clics || [];
                  const existingClickIndex = existingClics.findIndex(
                    (c) => c.url === url
                  );

                  if (existingClickIndex >= 0) {
                    existingClics[existingClickIndex].nombreClics += 1;
                  } else {
                    existingClics.push({
                      url,
                      date: new Date(),
                      nombreClics: 1,
                    });
                  }

                  updatedTracking = {
                    ...updatedTracking,
                    clics: existingClics,
                  };
                  break;
                case TrackingEventType.REPONSE:
                  updatedTracking = {
                    ...updatedTracking,
                    repondu: true,
                    dateReponse: new Date(),
                  };
                  break;
              }

              return {
                ...c,
                tracking: updatedTracking,
              };
            }
            return c;
          }),
        }));

        // Mettre à jour les métriques du template si nécessaire
        const communication = get().communications.find(
          (c) => c.id === eventData.communicationId
        );

        if (communication?.templateId) {
          set((state) => ({
            templates: state.templates.map((t) => {
              if (t.id === communication.templateId) {
                let updatedMetrics = { ...t.metriques };
                const totalEnvois = updatedMetrics?.nombreEnvois || 0;

                if (totalEnvois > 0) {
                  switch (eventData.type) {
                    case TrackingEventType.OUVERTURE:
                      // Calculer le taux d'ouverture
                      const openEvents = state.trackingEvents.filter(
                        (e) =>
                          e.type === TrackingEventType.OUVERTURE &&
                          state.communications.find(
                            (c) =>
                              c.id === e.communicationId &&
                              c.templateId === communication.templateId
                          )
                      );

                      updatedMetrics = {
                        ...updatedMetrics,
                        tauxOuverture: openEvents.length / totalEnvois,
                      };
                      break;
                    case TrackingEventType.CLIC:
                      // Calculer le taux de clics
                      const clickEvents = state.trackingEvents.filter(
                        (e) =>
                          e.type === TrackingEventType.CLIC &&
                          state.communications.find(
                            (c) =>
                              c.id === e.communicationId &&
                              c.templateId === communication.templateId
                          )
                      );

                      updatedMetrics = {
                        ...updatedMetrics,
                        tauxClics: clickEvents.length / totalEnvois,
                      };
                      break;
                    case TrackingEventType.REPONSE:
                      // Calculer le taux de réponses
                      const responseEvents = state.trackingEvents.filter(
                        (e) =>
                          e.type === TrackingEventType.REPONSE &&
                          state.communications.find(
                            (c) =>
                              c.id === e.communicationId &&
                              c.templateId === communication.templateId
                          )
                      );

                      updatedMetrics = {
                        ...updatedMetrics,
                        tauxReponses: responseEvents.length / totalEnvois,
                      };
                      break;
                  }
                }

                return {
                  ...t,
                  metriques: updatedMetrics,
                };
              }
              return t;
            }),
          }));
        }
      },

      // Consentement RGPD
      updateConsentPreferences: (clientId, preferences) => {
        set((state) => {
          const existingPreferences = state.consentRegistry[clientId] || {
            marketing: false,
            notifications: false,
            emailsCommercials: false,
            sms: false,
            appelsCommercials: false,
            dateConsentement: new Date(),
            derniereMiseAJour: new Date(),
          };

          return {
            consentRegistry: {
              ...state.consentRegistry,
              [clientId]: {
                ...existingPreferences,
                ...preferences,
                derniereMiseAJour: new Date(),
              },
            },
          };
        });
      },

      getConsentPreferences: (clientId) => {
        return get().consentRegistry[clientId] || null;
      },

      // Recherche et filtrage
      getCommunications: (filters) => {
        return filterCommunications(
          get().communications,
          filters || get().filters
        );
      },

      getUnreadCount: (folder) => {
        const targetFolder = folder || get().currentFolder;
        return get().communications.filter(
          (c) =>
            c.dossier === targetFolder &&
            c.statut === CommunicationStatus.RECUE &&
            (!c.tracking?.ouvert || !c.tracking.dateOuverture)
        ).length;
      },
    }),
    {
      name: "communication-storage",
    }
  )
);

// Fonction utilitaire pour filtrer les communications
export const filterCommunications = (
  communications: Communication[],
  filters: CommunicationFilters
): Communication[] => {
  return communications.filter((communication) => {
    // Filtrer par dossier
    if (filters.dossier && communication.dossier !== filters.dossier) {
      return false;
    }

    // Filtrer par type
    if (
      filters.type &&
      filters.type.length > 0 &&
      !filters.type.includes(communication.type)
    ) {
      return false;
    }

    // Filtrer par statut
    if (
      filters.statut &&
      filters.statut.length > 0 &&
      !filters.statut.includes(communication.statut)
    ) {
      return false;
    }

    // Filtrer par client
    if (filters.clientId && communication.clientId !== filters.clientId) {
      return false;
    }

    // Filtrer par opportunité
    if (
      filters.opportuniteId &&
      communication.opportuniteId !== filters.opportuniteId
    ) {
      return false;
    }

    // Filtrer par expéditeur
    if (
      filters.expediteurId &&
      filters.expediteurId.length > 0 &&
      !filters.expediteurId.includes(communication.expediteur.id)
    ) {
      return false;
    }

    // Filtrer par destinataire
    if (filters.destinataireId && filters.destinataireId.length > 0) {
      const destinataireIds = communication.destinataires.map((d) => d.id);
      const hasMatchingDestinataire = filters.destinataireId.some((id) =>
        destinataireIds.includes(id)
      );
      if (!hasMatchingDestinataire) {
        return false;
      }
    }

    // Filtrer par période
    if (filters.periode) {
      const { debut, fin } = filters.periode;

      if (debut && isAfter(debut, communication.dateCreation)) {
        return false;
      }

      if (fin && isBefore(fin, communication.dateCreation)) {
        return false;
      }
    }

    // Filtrer par contenu
    if (filters.contient) {
      const searchText = filters.contient.toLowerCase();
      const sujetMatch =
        communication.sujet?.toLowerCase().includes(searchText) || false;
      const contenuMatch = communication.contenuTexte
        .toLowerCase()
        .includes(searchText);
      const expediteurMatch = communication.expediteur.nom
        .toLowerCase()
        .includes(searchText);
      const destinataireMatch = communication.destinataires.some((d) =>
        d.nom.toLowerCase().includes(searchText)
      );

      if (
        !sujetMatch &&
        !contenuMatch &&
        !expediteurMatch &&
        !destinataireMatch
      ) {
        return false;
      }
    }

    // Filtrer par tags
    if (filters.tags && filters.tags.length > 0) {
      if (!communication.tags || communication.tags.length === 0) {
        return false;
      }

      const hasTag = filters.tags.some((tag) =>
        communication.tags?.includes(tag)
      );
      if (!hasTag) {
        return false;
      }
    }

    // Filtrer par messages non lus
    if (filters.nonLus && (communication.tracking?.ouvert || false)) {
      return false;
    }

    // Filtrer par messages avec pièce jointe
    if (
      filters.avecPieceJointe &&
      (!communication.pieceJointes || communication.pieceJointes.length === 0)
    ) {
      return false;
    }

    // Filtrer par messages importants
    if (filters.importants && !communication.estImportant) {
      return false;
    }

    return true;
  });
};

// Export pour compatibilité avec le code existant
export const communicationStore = {
  getCommunications: (filters?: CommunicationFilters) =>
    useCommunicationStore.getState().getCommunications(filters),
  addCommunication: (communication: Communication) =>
    useCommunicationStore.getState().addCommunication(communication),
  updateCommunication: (communication: Communication) =>
    useCommunicationStore.getState().updateCommunication(communication),
  deleteCommunication: (id: string) =>
    useCommunicationStore.getState().deleteCommunication(id),
  sendCommunication: (communication: Communication) =>
    useCommunicationStore.getState().sendCommunication(communication),
  getTemplates: () => useCommunicationStore.getState().templates,
  getSequences: () => useCommunicationStore.getState().sequences,
};
