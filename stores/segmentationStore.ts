import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  Tag,
  TagType,
  TagColor,
  Segment,
  SegmentType,
  AutoTagRule,
  ConditionGroup,
  LogicalOperator,
  SegmentAnalytics,
  SegmentChange,
  SegmentRecommendation,
  TagRule,
  SegmentationFilters,
  TagFilters,
  SegmentationUIState,
  TagStats,
  GroupOperator,
} from "@/components/crm/Segmentation/types";

interface SegmentationState {
  // Collections
  tags: Tag[];
  segments: Segment[];
  autoTagRules: AutoTagRule[];
  segmentAnalytics: Record<string, SegmentAnalytics>;
  segmentChanges: SegmentChange[];
  segmentRecommendations: SegmentRecommendation[];
  tagRules: TagRule[];
  tagStats: Record<string, TagStats>;

  // Cache
  cachedSegmentResults: Record<string, string[]>; // segmentId -> clientIds

  // État de l'UI
  selectedSegmentId: string | null;
  selectedTagId: string | null;
  isSegmentBuilderOpen: boolean;
  isTagEditorOpen: boolean;
  ui: SegmentationUIState;
  segmentFilters: SegmentationFilters;
  tagFilters: TagFilters;

  // Actions - Tags
  addTag: (
    tag: Omit<Tag, "id" | "createdAt" | "updatedAt" | "createdBy">
  ) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  rearrangeTagHierarchy: (tagId: string, newParentId: string | null) => void;

  // Actions - Segments
  addSegment: (
    segment: Omit<Segment, "id" | "createdAt" | "updatedAt" | "createdBy">
  ) => void;
  updateSegment: (id: string, updates: Partial<Segment>) => void;
  deleteSegment: (id: string) => void;
  duplicateSegment: (id: string, newName: string) => void;
  calculateSegment: (id: string) => void;

  // Actions - Conditions
  createEmptyConditionGroup: () => ConditionGroup;
  addConditionToGroup: (groupId: string, condition: any) => void;
  removeConditionFromGroup: (groupId: string, conditionId: string) => void;
  updateCondition: (groupId: string, conditionId: string, updates: any) => void;

  // Actions - Auto-tagging
  addAutoTagRule: (
    rule: Omit<AutoTagRule, "id" | "createdAt" | "updatedAt" | "createdBy">
  ) => void;
  updateAutoTagRule: (id: string, updates: Partial<AutoTagRule>) => void;
  deleteAutoTagRule: (id: string) => void;
  toggleAutoTagRule: (id: string) => void;
  runAutoTagRule: (id: string) => void;

  // Actions - Analytics
  updateSegmentAnalytics: (
    segmentId: string,
    analytics: Partial<SegmentAnalytics>
  ) => void;

  // Actions - Bulk Operations
  applyBulkAction: (segmentId: string, action: string, params: any) => void;

  // État de cache
  invalidateSegmentCache: (segmentId: string) => void;
  cacheSegmentResults: (segmentId: string, clientIds: string[]) => void;

  // Sélecteurs utiles
  getChildTags: (parentId: string | null) => Tag[];
  getSegmentById: (id: string) => Segment | undefined;
  getTagById: (id: string) => Tag | undefined;
  getSegmentsByTag: (tagId: string) => Segment[];
  getRecentlyChangedSegments: (limit?: number) => Segment[];

  // Actions - Tag Rules
  addTagRule: (rule: Omit<TagRule, "id" | "createdAt" | "updatedAt">) => void;
  updateTagRule: (id: string, rule: Partial<TagRule>) => void;
  deleteTagRule: (id: string) => void;
  toggleTagRule: (id: string, active: boolean) => void;

  // Actions - UI
  setSelectedSegment: (id?: string) => void;
  setSelectedTag: (id?: string) => void;
  setSegmentBuilderOpen: (isOpen: boolean) => void;
  setTagBuilderOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: "segments" | "tags" | "rules" | "analytics") => void;

  // Actions - Filtres
  updateSegmentFilters: (filters: Partial<SegmentationFilters>) => void;
  updateTagFilters: (filters: Partial<TagFilters>) => void;
  resetSegmentFilters: () => void;
  resetTagFilters: () => void;

  // Actions d'analyse
  calculateSegmentAnalytics: (segmentId: string) => void;
  calculateTagStats: (tagId: string) => void;
}

const defaultSegmentFilters: SegmentationFilters = {
  search: "",
  types: Object.values(SegmentType),
  tags: [],
  sortBy: "name",
  sortOrder: "asc",
};

const defaultTagFilters: TagFilters = {
  search: "",
  colors: [],
  sortBy: "name",
  sortOrder: "asc",
};

const defaultUIState: SegmentationUIState = {
  isSegmentBuilderOpen: false,
  isTagBuilderOpen: false,
  activeTab: "segments",
};

const useSegmentationStore = create<SegmentationState>()(
  persist(
    (set, get) => ({
      // État initial
      tags: [],
      segments: [],
      autoTagRules: [],
      segmentAnalytics: {},
      segmentChanges: [],
      segmentRecommendations: [],
      cachedSegmentResults: {},
      selectedSegmentId: null,
      selectedTagId: null,
      isSegmentBuilderOpen: false,
      isTagEditorOpen: false,
      ui: defaultUIState,
      segmentFilters: defaultSegmentFilters,
      tagFilters: defaultTagFilters,
      tagRules: [],
      tagStats: {},

      // Implémentation des actions
      addTag: (tag) => {
        const userId = "current-user"; // À remplacer par l'ID utilisateur réel
        const newTag: Tag = {
          ...tag,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: userId,
        };

        set((state) => ({
          tags: [...state.tags, newTag],
          // Enregistrer le changement dans l'historique
          segmentChanges: [
            {
              id: uuidv4(),
              segmentId: "tag-" + newTag.id, // Préfixe pour les tags
              userId,
              changeType: "created",
              details: { tag: newTag },
              timestamp: new Date().toISOString(),
            },
            ...state.segmentChanges,
          ],
        }));
      },

      updateTag: (id, updates) => {
        const userId = "current-user";
        set((state) => {
          const tagIndex = state.tags.findIndex((tag) => tag.id === id);
          if (tagIndex === -1) return state;

          const updatedTag = {
            ...state.tags[tagIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          const updatedTags = [...state.tags];
          updatedTags[tagIndex] = updatedTag;

          return {
            tags: updatedTags,
            segmentChanges: [
              {
                id: uuidv4(),
                segmentId: "tag-" + id,
                userId,
                changeType: "updated",
                details: {
                  before: state.tags[tagIndex],
                  after: updatedTag,
                  changes: updates,
                },
                timestamp: new Date().toISOString(),
              },
              ...state.segmentChanges,
            ],
          };
        });
      },

      deleteTag: (id) => {
        const userId = "current-user";
        const tagToDelete = get().tags.find((tag) => tag.id === id);

        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== id),
          segmentChanges: tagToDelete
            ? [
                {
                  id: uuidv4(),
                  segmentId: "tag-" + id,
                  userId,
                  changeType: "deleted",
                  details: { tag: tagToDelete },
                  timestamp: new Date().toISOString(),
                },
                ...state.segmentChanges,
              ]
            : state.segmentChanges,
        }));
      },

      rearrangeTagHierarchy: (tagId, newParentId) => {
        set((state) => {
          const tagIndex = state.tags.findIndex((tag) => tag.id === tagId);
          if (tagIndex === -1) return state;

          const updatedTags = [...state.tags];
          updatedTags[tagIndex] = {
            ...updatedTags[tagIndex],
            parentId: newParentId || undefined,
            updatedAt: new Date().toISOString(),
          };

          return { tags: updatedTags };
        });
      },

      addSegment: (segment) => {
        const userId = "current-user";
        const newSegment: Segment = {
          ...segment,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: userId,
          rootGroup: segment.rootGroup || {
            id: uuidv4(),
            operator: GroupOperator.AND,
            conditions: [],
          },
        };

        set((state) => ({
          segments: [...state.segments, newSegment],
          segmentChanges: [
            {
              id: uuidv4(),
              segmentId: newSegment.id,
              userId,
              changeType: "created",
              details: { segment: newSegment },
              timestamp: new Date().toISOString(),
            },
            ...state.segmentChanges,
          ],
        }));
      },

      updateSegment: (id, updates) => {
        const userId = "current-user";
        set((state) => {
          const segmentIndex = state.segments.findIndex(
            (segment) => segment.id === id
          );
          if (segmentIndex === -1) return state;

          const updatedSegment = {
            ...state.segments[segmentIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          const updatedSegments = [...state.segments];
          updatedSegments[segmentIndex] = updatedSegment;

          // Si les conditions ont changé, invalider le cache
          if (
            updates.rootGroup ||
            updates.staticMembers ||
            updates.excludedMembers
          ) {
            delete state.cachedSegmentResults[id];
          }

          return {
            segments: updatedSegments,
            segmentChanges: [
              {
                id: uuidv4(),
                segmentId: id,
                userId,
                changeType: "updated",
                details: {
                  before: state.segments[segmentIndex],
                  after: updatedSegment,
                  changes: updates,
                },
                timestamp: new Date().toISOString(),
              },
              ...state.segmentChanges,
            ],
          };
        });
      },

      deleteSegment: (id) => {
        const userId = "current-user";
        const segmentToDelete = get().segments.find(
          (segment) => segment.id === id
        );

        set((state) => ({
          segments: state.segments.filter((segment) => segment.id !== id),
          // Supprimer également du cache
          cachedSegmentResults: {
            ...state.cachedSegmentResults,
            [id]: undefined,
          },
          segmentChanges: segmentToDelete
            ? [
                {
                  id: uuidv4(),
                  segmentId: id,
                  userId,
                  changeType: "deleted",
                  details: { segment: segmentToDelete },
                  timestamp: new Date().toISOString(),
                },
                ...state.segmentChanges,
              ]
            : state.segmentChanges,
        }));
      },

      duplicateSegment: (id, newName) => {
        const segment = get().segments.find((s) => s.id === id);
        if (!segment) return;

        const userId = "current-user";
        const duplicatedSegment: Segment = {
          ...segment,
          id: uuidv4(),
          name: newName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: userId,
          rootGroup: segment.rootGroup || {
            id: uuidv4(),
            operator: GroupOperator.AND,
            conditions: [],
          },
        };

        set((state) => ({
          segments: [...state.segments, duplicatedSegment],
          segmentChanges: [
            {
              id: uuidv4(),
              segmentId: duplicatedSegment.id,
              userId,
              changeType: "created",
              details: {
                segment: duplicatedSegment,
                duplicatedFrom: id,
              },
              timestamp: new Date().toISOString(),
            },
            ...state.segmentChanges,
          ],
        }));
      },

      calculateSegment: (id) => {
        // Cette fonction serait normalement un appel API pour recalculer le segment
        // Pour cet exemple, nous simulons juste une mise à jour du lastCalculatedAt
        set((state) => {
          const segmentIndex = state.segments.findIndex(
            (segment) => segment.id === id
          );
          if (segmentIndex === -1) return state;

          const updatedSegments = [...state.segments];
          updatedSegments[segmentIndex] = {
            ...updatedSegments[segmentIndex],
            lastCalculatedAt: new Date().toISOString(),
          };

          return { segments: updatedSegments };
        });
      },

      createEmptyConditionGroup: () => ({
        id: uuidv4(),
        conditions: [],
        operator: LogicalOperator.AND,
      }),

      addConditionToGroup: (groupId, condition) => {
        set((state) => {
          // Ceci nécessiterait une fonction récursive pour trouver et mettre à jour le bon groupe
          // Pour simplifier cet exemple, nous supposons que groupId fait référence au rootGroup d'un segment
          const segmentIndex = state.segments.findIndex(
            (segment) => segment.rootGroup && segment.rootGroup.id === groupId
          );

          if (segmentIndex === -1) return state;

          const segment = state.segments[segmentIndex];
          const rootGroup = segment.rootGroup;

          if (!rootGroup) return state;

          const updatedRootGroup = {
            ...rootGroup,
            conditions: [
              ...rootGroup.conditions,
              {
                id: uuidv4(),
                ...condition,
              },
            ],
          };

          const updatedSegments = [...state.segments];
          updatedSegments[segmentIndex] = {
            ...segment,
            rootGroup: updatedRootGroup,
            updatedAt: new Date().toISOString(),
          };

          // Invalider le cache pour ce segment
          delete state.cachedSegmentResults[segment.id];

          return { segments: updatedSegments };
        });
      },

      removeConditionFromGroup: (groupId, conditionId) => {
        // Implémentation similaire à addConditionToGroup
        // Pour des raisons de simplicité, nous ne l'implémentons pas complètement ici
      },

      updateCondition: (groupId, conditionId, updates) => {
        // Implémentation similaire à addConditionToGroup
        // Pour des raisons de simplicité, nous ne l'implémentons pas complètement ici
      },

      addAutoTagRule: (rule) => {
        const userId = "current-user";
        const newRule: AutoTagRule = {
          ...rule,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: userId,
        };

        set((state) => ({
          autoTagRules: [...state.autoTagRules, newRule],
        }));
      },

      updateAutoTagRule: (id, updates) => {
        set((state) => {
          const ruleIndex = state.autoTagRules.findIndex(
            (rule) => rule.id === id
          );
          if (ruleIndex === -1) return state;

          const updatedRules = [...state.autoTagRules];
          updatedRules[ruleIndex] = {
            ...updatedRules[ruleIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          return { autoTagRules: updatedRules };
        });
      },

      deleteAutoTagRule: (id) => {
        set((state) => ({
          autoTagRules: state.autoTagRules.filter((rule) => rule.id !== id),
        }));
      },

      toggleAutoTagRule: (id) => {
        set((state) => {
          const ruleIndex = state.autoTagRules.findIndex(
            (rule) => rule.id === id
          );
          if (ruleIndex === -1) return state;

          const updatedRules = [...state.autoTagRules];
          updatedRules[ruleIndex] = {
            ...updatedRules[ruleIndex],
            isActive: !updatedRules[ruleIndex].isActive,
            updatedAt: new Date().toISOString(),
          };

          return { autoTagRules: updatedRules };
        });
      },

      runAutoTagRule: (id) => {
        // Cette fonction serait normalement un appel API pour exécuter la règle
        // Pour cet exemple, nous simulons juste une mise à jour du lastRunAt
        set((state) => {
          const ruleIndex = state.autoTagRules.findIndex(
            (rule) => rule.id === id
          );
          if (ruleIndex === -1) return state;

          const updatedRules = [...state.autoTagRules];
          updatedRules[ruleIndex] = {
            ...updatedRules[ruleIndex],
            lastRunAt: new Date().toISOString(),
          };

          return { autoTagRules: updatedRules };
        });
      },

      updateSegmentAnalytics: (segmentId, analytics) => {
        set((state) => {
          const currentAnalytics = state.segmentAnalytics[segmentId] || {
            id: uuidv4(),
            segmentId,
            kpis: {},
            growthRate: 0,
            churnRate: 0,
            calculatedAt: new Date().toISOString(),
          };

          return {
            segmentAnalytics: {
              ...state.segmentAnalytics,
              [segmentId]: {
                ...currentAnalytics,
                ...analytics,
                calculatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      applyBulkAction: (segmentId, action, params) => {
        // Cette fonction serait normalement un appel API
        // Pour cet exemple, nous ne l'implémentons pas
        console.log(
          `Applying ${action} to segment ${segmentId} with params:`,
          params
        );
      },

      invalidateSegmentCache: (segmentId) => {
        set((state) => {
          const newCache = { ...state.cachedSegmentResults };
          delete newCache[segmentId];
          return { cachedSegmentResults: newCache };
        });
      },

      cacheSegmentResults: (segmentId, clientIds) => {
        set((state) => ({
          cachedSegmentResults: {
            ...state.cachedSegmentResults,
            [segmentId]: clientIds,
          },
        }));
      },

      // Sélecteurs
      getChildTags: (parentId) => {
        return get().tags.filter((tag) =>
          parentId === null
            ? tag.parentId === undefined
            : tag.parentId === parentId
        );
      },

      getSegmentById: (id) => {
        return get().segments.find((segment) => segment.id === id);
      },

      getTagById: (id) => {
        return get().tags.find((tag) => tag.id === id);
      },

      getSegmentsByTag: (tagId) => {
        return get().segments.filter(
          (segment) => segment.tags && segment.tags.includes(tagId)
        );
      },

      getRecentlyChangedSegments: (limit = 5) => {
        return [...get().segments]
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, limit);
      },

      // Actions - Tag Rules
      addTagRule: (ruleData) => {
        const id = uuidv4();
        const now = new Date().toISOString();

        const newRule: TagRule = {
          id,
          ...ruleData,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          tagRules: [...state.tagRules, newRule],
        }));

        return id;
      },

      updateTagRule: (id, ruleUpdate) => {
        set((state) => ({
          tagRules: state.tagRules.map((rule) =>
            rule.id === id
              ? { ...rule, ...ruleUpdate, updatedAt: new Date().toISOString() }
              : rule
          ),
        }));
      },

      deleteTagRule: (id) => {
        set((state) => ({
          tagRules: state.tagRules.filter((rule) => rule.id !== id),
        }));
      },

      toggleTagRule: (id, active) => {
        set((state) => ({
          tagRules: state.tagRules.map((rule) =>
            rule.id === id
              ? {
                  ...rule,
                  isActive: active,
                  updatedAt: new Date().toISOString(),
                }
              : rule
          ),
        }));
      },

      // Actions - UI
      setSelectedSegment: (id) => {
        set((state) => ({
          ui: { ...state.ui, selectedSegmentId: id },
        }));
      },

      setSelectedTag: (id) => {
        set((state) => ({
          ui: { ...state.ui, selectedTagId: id },
        }));
      },

      setSegmentBuilderOpen: (isOpen) => {
        set((state) => ({
          ui: { ...state.ui, isSegmentBuilderOpen: isOpen },
        }));
      },

      setTagBuilderOpen: (isOpen) => {
        set((state) => ({
          ui: { ...state.ui, isTagBuilderOpen: isOpen },
        }));
      },

      setActiveTab: (tab) => {
        set((state) => ({
          ui: { ...state.ui, activeTab: tab },
        }));
      },

      // Actions - Filtres
      updateSegmentFilters: (filters) => {
        set((state) => ({
          segmentFilters: { ...state.segmentFilters, ...filters },
        }));
      },

      updateTagFilters: (filters) => {
        set((state) => ({
          tagFilters: { ...state.tagFilters, ...filters },
        }));
      },

      resetSegmentFilters: () => {
        set(() => ({
          segmentFilters: defaultSegmentFilters,
        }));
      },

      resetTagFilters: () => {
        set(() => ({
          tagFilters: defaultTagFilters,
        }));
      },

      // Actions d'analyse
      calculateSegmentAnalytics: (segmentId) => {
        // Simulation de calcul d'analytiques
        // Dans une implémentation réelle, cela pourrait appeler une API
        const segment = get().segments.find((s) => s.id === segmentId);

        if (!segment) return;

        const memberCount = Math.floor(Math.random() * 1000);
        const now = new Date().toISOString();

        const analytics: SegmentAnalytics = {
          kpis: {
            memberCount,
            growthRate: Math.random() * 20 - 10, // Entre -10% et +10%
            activeMembers: Math.floor(memberCount * 0.7),
            conversionRate: Math.random() * 30,
          },
          chartData: {
            timeline: Array(12)
              .fill(0)
              .map((_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - 11 + i);
                return {
                  date: date.toISOString().split("T")[0],
                  count: Math.floor(Math.random() * memberCount * 1.2),
                };
              }),
            distribution: [
              { label: "Nouveaux", value: Math.floor(memberCount * 0.3) },
              { label: "Actifs", value: Math.floor(memberCount * 0.5) },
              { label: "Inactifs", value: Math.floor(memberCount * 0.2) },
            ],
          },
          lastUpdated: now,
        };

        set((state) => ({
          segmentAnalytics: {
            ...state.segmentAnalytics,
            [segmentId]: analytics,
          },
          segments: state.segments.map((s) =>
            s.id === segmentId ? { ...s, lastCalculatedAt: now } : s
          ),
        }));
      },

      calculateTagStats: (tagId) => {
        // Simulation de calcul de statistiques pour un tag
        const tag = get().tags.find((t) => t.id === tagId);

        if (!tag) return;

        const usageCount = Math.floor(Math.random() * 500);

        const stats: TagStats = {
          id: tagId,
          usageCount,
          entityDistribution: {
            client: Math.floor(usageCount * 0.4),
            contact: Math.floor(usageCount * 0.3),
            opportunite: Math.floor(usageCount * 0.2),
            activite: Math.floor(usageCount * 0.1),
          },
        };

        set((state) => ({
          tagStats: { ...state.tagStats, [tagId]: stats },
        }));
      },
    }),
    {
      name: "crm-segmentation-store",
      partialize: (state) => ({
        segments: state.segments,
        tags: state.tags,
        tagRules: state.tagRules,
        segmentFilters: state.segmentFilters,
        tagFilters: state.tagFilters,
      }),
    }
  )
);

export default useSegmentationStore;
