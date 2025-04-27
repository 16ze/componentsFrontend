"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StockLevel = "normal" | "low" | "critical" | "outOfStock";

export type InventoryItem = {
  productId: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  backorderAllowed: boolean;
  backorderLimit?: number;
  restockDate?: Date;
  updatedAt: Date;
};

export type StockNotification = {
  id: string;
  productId: string;
  productName: string;
  email: string;
  notificationType: "backInStock" | "preOrder";
  createdAt: Date;
  sent: boolean;
  sentAt?: Date;
};

type InventoryState = {
  inventory: Record<string, InventoryItem>;
  notifications: StockNotification[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProductStock: (productId: string) => Promise<InventoryItem | null>;
  updateStock: (productId: string, quantity: number) => Promise<boolean>;
  reserveStock: (productId: string, quantity: number) => Promise<boolean>;
  releaseReservedStock: (productId: string, quantity: number) => void;
  registerStockNotification: (
    productId: string,
    productName: string,
    email: string,
    type: "backInStock" | "preOrder"
  ) => Promise<boolean>;
  removeStockNotification: (id: string) => void;
  setLowStockThreshold: (productId: string, threshold: number) => void;
  setCriticalStockThreshold: (productId: string, threshold: number) => void;
  setBackorderStatus: (
    productId: string,
    allowed: boolean,
    limit?: number
  ) => void;
  setRestockDate: (productId: string, date: Date) => void;

  // Getters
  getAvailableStock: (productId: string) => number;
  getStockLevel: (productId: string) => StockLevel;
  canAddToCart: (productId: string, quantity: number) => boolean;
  isBackorderable: (productId: string) => boolean;
  getBackorderLimit: (productId: string) => number | null;
  getRestockDate: (productId: string) => Date | null;
  getStockNotifications: (productId: string) => StockNotification[];
  hasNotification: (productId: string, email: string) => boolean;
};

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      inventory: {},
      notifications: [],
      isLoading: false,
      error: null,

      fetchProductStock: async (productId) => {
        set({ isLoading: true, error: null });
        try {
          // Simulation d'une requête API
          await new Promise((resolve) => setTimeout(resolve, 300));

          // En production, remplacer par une vraie requête API
          const inventory = get().inventory;
          const item = inventory[productId];

          set({ isLoading: false });
          return item || null;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return null;
        }
      },

      updateStock: async (productId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          // Simulation d'une requête API
          await new Promise((resolve) => setTimeout(resolve, 300));

          // En production, remplacer par une vraie requête API
          const inventory = { ...get().inventory };

          if (!inventory[productId]) {
            inventory[productId] = {
              productId,
              sku: `SKU-${productId.substring(0, 6)}`,
              quantity,
              reservedQuantity: 0,
              lowStockThreshold: 10,
              criticalStockThreshold: 3,
              backorderAllowed: false,
              updatedAt: new Date(),
            };
          } else {
            inventory[productId] = {
              ...inventory[productId],
              quantity,
              updatedAt: new Date(),
            };
          }

          set({ inventory, isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return false;
        }
      },

      reserveStock: async (productId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          const inventory = { ...get().inventory };
          const item = inventory[productId];

          if (!item) {
            set({
              isLoading: false,
              error: "Produit non trouvé dans l'inventaire",
            });
            return false;
          }

          const availableQuantity = item.quantity - item.reservedQuantity;

          if (availableQuantity < quantity && !item.backorderAllowed) {
            set({
              isLoading: false,
              error: "Stock insuffisant",
            });
            return false;
          }

          // Si backorder est autorisé, vérifier la limite
          if (availableQuantity < quantity && item.backorderAllowed) {
            const backorderNeeded = quantity - availableQuantity;
            if (item.backorderLimit && backorderNeeded > item.backorderLimit) {
              set({
                isLoading: false,
                error: "Quantité de pré-commande dépassée",
              });
              return false;
            }
          }

          inventory[productId] = {
            ...item,
            reservedQuantity: item.reservedQuantity + quantity,
            updatedAt: new Date(),
          };

          set({ inventory, isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return false;
        }
      },

      releaseReservedStock: (productId, quantity) => {
        const inventory = { ...get().inventory };
        const item = inventory[productId];

        if (!item) return;

        inventory[productId] = {
          ...item,
          reservedQuantity: Math.max(0, item.reservedQuantity - quantity),
          updatedAt: new Date(),
        };

        set({ inventory });
      },

      registerStockNotification: async (
        productId,
        productName,
        email,
        type
      ) => {
        try {
          const notifications = [...get().notifications];
          const id = `notif-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;

          // Vérifier si une notification existe déjà
          const existingNotification = notifications.find(
            (n) =>
              n.productId === productId &&
              n.email === email &&
              n.notificationType === type
          );

          if (existingNotification) {
            return true; // Déjà enregistré
          }

          notifications.push({
            id,
            productId,
            productName,
            email,
            notificationType: type,
            createdAt: new Date(),
            sent: false,
          });

          set({ notifications });
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
          return false;
        }
      },

      removeStockNotification: (id) => {
        const notifications = get().notifications.filter((n) => n.id !== id);
        set({ notifications });
      },

      setLowStockThreshold: (productId, threshold) => {
        const inventory = { ...get().inventory };
        const item = inventory[productId];

        if (!item) return;

        inventory[productId] = {
          ...item,
          lowStockThreshold: threshold,
          updatedAt: new Date(),
        };

        set({ inventory });
      },

      setCriticalStockThreshold: (productId, threshold) => {
        const inventory = { ...get().inventory };
        const item = inventory[productId];

        if (!item) return;

        inventory[productId] = {
          ...item,
          criticalStockThreshold: threshold,
          updatedAt: new Date(),
        };

        set({ inventory });
      },

      setBackorderStatus: (productId, allowed, limit) => {
        const inventory = { ...get().inventory };
        const item = inventory[productId];

        if (!item) return;

        inventory[productId] = {
          ...item,
          backorderAllowed: allowed,
          backorderLimit: limit,
          updatedAt: new Date(),
        };

        set({ inventory });
      },

      setRestockDate: (productId, date) => {
        const inventory = { ...get().inventory };
        const item = inventory[productId];

        if (!item) return;

        inventory[productId] = {
          ...item,
          restockDate: date,
          updatedAt: new Date(),
        };

        set({ inventory });
      },

      // Getters
      getAvailableStock: (productId) => {
        const item = get().inventory[productId];
        if (!item) return 0;

        return Math.max(0, item.quantity - item.reservedQuantity);
      },

      getStockLevel: (productId) => {
        const item = get().inventory[productId];
        if (!item) return "outOfStock";

        const availableStock = item.quantity - item.reservedQuantity;

        if (availableStock <= 0) return "outOfStock";
        if (availableStock <= item.criticalStockThreshold) return "critical";
        if (availableStock <= item.lowStockThreshold) return "low";
        return "normal";
      },

      canAddToCart: (productId, quantity) => {
        const item = get().inventory[productId];
        if (!item) return false;

        const availableStock = item.quantity - item.reservedQuantity;

        if (availableStock >= quantity) return true;
        if (item.backorderAllowed) {
          if (!item.backorderLimit) return true;
          const backorderNeeded = quantity - availableStock;
          return backorderNeeded <= item.backorderLimit;
        }

        return false;
      },

      isBackorderable: (productId) => {
        const item = get().inventory[productId];
        if (!item) return false;

        return item.backorderAllowed;
      },

      getBackorderLimit: (productId) => {
        const item = get().inventory[productId];
        if (!item || !item.backorderAllowed) return null;

        return item.backorderLimit || null;
      },

      getRestockDate: (productId) => {
        const item = get().inventory[productId];
        if (!item || !item.restockDate) return null;

        return item.restockDate;
      },

      getStockNotifications: (productId) => {
        return get().notifications.filter((n) => n.productId === productId);
      },

      hasNotification: (productId, email) => {
        return get().notifications.some(
          (n) => n.productId === productId && n.email === email && !n.sent
        );
      },
    }),
    {
      name: "ecommerce-inventory",
    }
  )
);
