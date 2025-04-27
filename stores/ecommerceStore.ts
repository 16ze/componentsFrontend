"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { queryClient } from "../lib/queryClient";

// Types pour notre store
export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  discountedPrice?: number;
  image: string;
  quantity: number;
  variantId?: string;
  variant?: string;
  options?: Record<string, string>;
  maxQuantity?: number; // Pour le stock disponible
};

export type Address = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
};

export type PaymentMethod =
  | "credit_card"
  | "paypal"
  | "applepay"
  | "googlepay"
  | "bank_transfer";

export type ShippingMethod = {
  id: string;
  name: string;
  price: number;
  estimatedDelivery: string;
};

export type CheckoutStep =
  | "cart"
  | "information"
  | "shipping"
  | "payment"
  | "review"
  | "confirmation";

export type CartState = {
  // État du panier
  items: CartItem[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  sameAsShipping: boolean;
  paymentMethod: PaymentMethod | null;
  shippingMethod: ShippingMethod | null;
  couponCode: string | null;
  couponDiscount: number;
  checkoutStep: CheckoutStep;
  orderId: string | null;
  lastError: string | null;
  isLoading: boolean;
  sessionExpiry: Date | null;

  // Actions du panier
  addItem: (item: Omit<CartItem, "id">) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address) => void;
  setSameAsShipping: (sameAsShipping: boolean) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  setCheckoutStep: (step: CheckoutStep) => void;
  submitOrder: () => Promise<string | null>;
  resetCheckout: () => void;
  setError: (error: string | null) => void;

  // Getters
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getShippingCost: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getTotalItems: () => number;
  isEmpty: () => boolean;
};

// Middleware de validation du stock
const stockValidation = (config) => (set, get, api) =>
  config(
    (...args) => {
      const nextState =
        typeof args[0] === "function" ? args[0](get()) : args[0];

      // Si on a de nouveaux items, vérifier le stock
      if (nextState.items && !get().isLoading) {
        nextState.isLoading = true;
        set(nextState);

        // Vérification simulée du stock (à remplacer par une API réelle)
        const validateStock = async () => {
          try {
            // Simuler une requête API de vérification de stock
            await new Promise((resolve) => setTimeout(resolve, 500));

            const stockValid = nextState.items.every(
              (item) => !item.maxQuantity || item.quantity <= item.maxQuantity
            );

            if (!stockValid) {
              set({
                lastError:
                  "Certains produits ne sont plus disponibles en quantité demandée",
                isLoading: false,
              });
              return false;
            }

            set({ isLoading: false, lastError: null });
            return true;
          } catch (error) {
            set({
              lastError: "Erreur lors de la vérification du stock",
              isLoading: false,
            });
            return false;
          }
        };

        validateStock();
      } else {
        set(nextState);
      }
    },
    get,
    api
  );

// Middleware de persistance et synchronisation
const persistAndSync = (config) => (set, get, api) => {
  const apiSync = (state) => {
    // Logique de synchronisation avec l'API
    // À implémenter selon vos besoins
  };

  return persist(stockValidation(config), {
    name: "ecommerce-cart",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      items: state.items,
      shippingAddress: state.shippingAddress,
      billingAddress: state.billingAddress,
      sameAsShipping: state.sameAsShipping,
      paymentMethod: state.paymentMethod,
      shippingMethod: state.shippingMethod,
      couponCode: state.couponCode,
      couponDiscount: state.couponDiscount,
      checkoutStep: state.checkoutStep,
      sessionExpiry: state.sessionExpiry,
    }),
    onRehydrateStorage: () => (state) => {
      // Vérifier l'expiration de session
      if (state && state.sessionExpiry) {
        const expiry = new Date(state.sessionExpiry);
        if (expiry < new Date()) {
          // Session expirée, réinitialiser
          set({
            items: [],
            shippingAddress: null,
            billingAddress: null,
            sameAsShipping: true,
            paymentMethod: null,
            shippingMethod: null,
            couponCode: null,
            couponDiscount: 0,
            checkoutStep: "cart",
            orderId: null,
            lastError: null,
            isLoading: false,
            sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          });
        }
      }
    },
  })(set, get, api);
};

// Création du store
export const useEcommerceStore = create<CartState>()(
  persistAndSync((set, get) => ({
    // État initial
    items: [],
    shippingAddress: null,
    billingAddress: null,
    sameAsShipping: true,
    paymentMethod: null,
    shippingMethod: null,
    couponCode: null,
    couponDiscount: 0,
    checkoutStep: "cart",
    orderId: null,
    lastError: null,
    isLoading: false,
    sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h par défaut

    // Actions
    addItem: (item) => {
      const { items } = get();
      const existingItem = items.find(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );

      if (existingItem) {
        set({
          items: items.map((i) =>
            i.productId === item.productId && i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        });
      } else {
        set({
          items: [
            ...items,
            {
              ...item,
              id: `${item.productId}_${item.variantId || ""}_${Date.now()}`,
            },
          ],
        });
      }
    },

    updateItemQuantity: (itemId, quantity) => {
      const { items } = get();

      if (quantity <= 0) {
        set({
          items: items.filter((item) => item.id !== itemId),
        });
        return;
      }

      set({
        items: items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      });
    },

    removeItem: (itemId) => {
      set({
        items: get().items.filter((item) => item.id !== itemId),
      });
    },

    clearCart: () => {
      set({
        items: [],
        couponCode: null,
        couponDiscount: 0,
      });
    },

    setShippingAddress: (address) => {
      set({ shippingAddress: address });

      // Si même adresse de facturation, mettre à jour aussi
      if (get().sameAsShipping) {
        set({ billingAddress: address });
      }
    },

    setBillingAddress: (address) => {
      set({ billingAddress: address });
    },

    setSameAsShipping: (sameAsShipping) => {
      set({ sameAsShipping });

      // Si activé, copier l'adresse de livraison vers la facturation
      if (sameAsShipping && get().shippingAddress) {
        set({ billingAddress: get().shippingAddress });
      }
    },

    setPaymentMethod: (method) => {
      set({ paymentMethod: method });
    },

    setShippingMethod: (method) => {
      set({ shippingMethod: method });
    },

    applyCoupon: async (code) => {
      set({ isLoading: true });

      try {
        // Simuler une vérification de coupon par API
        // À remplacer par un appel API réel
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (code === "DISCOUNT20") {
          set({
            couponCode: code,
            couponDiscount: get().getSubtotal() * 0.2,
            isLoading: false,
            lastError: null,
          });
          return true;
        } else {
          set({
            isLoading: false,
            lastError: "Code promo invalide",
          });
          return false;
        }
      } catch (error) {
        set({
          isLoading: false,
          lastError: "Erreur lors de la vérification du code promo",
        });
        return false;
      }
    },

    removeCoupon: () => {
      set({
        couponCode: null,
        couponDiscount: 0,
      });
    },

    setCheckoutStep: (step) => {
      set({ checkoutStep: step });
    },

    submitOrder: async () => {
      const {
        items,
        shippingAddress,
        billingAddress,
        paymentMethod,
        shippingMethod,
      } = get();

      // Validation avant soumission
      if (!items.length) {
        set({ lastError: "Votre panier est vide" });
        return null;
      }

      if (!shippingAddress) {
        set({ lastError: "Adresse de livraison manquante" });
        return null;
      }

      if (!billingAddress) {
        set({ lastError: "Adresse de facturation manquante" });
        return null;
      }

      if (!paymentMethod) {
        set({ lastError: "Méthode de paiement non sélectionnée" });
        return null;
      }

      if (!shippingMethod) {
        set({ lastError: "Méthode de livraison non sélectionnée" });
        return null;
      }

      set({ isLoading: true });

      try {
        // Simuler une soumission de commande
        // À remplacer par un appel API réel
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const orderId = `ORD-${Date.now()}`;

        set({
          orderId,
          checkoutStep: "confirmation",
          isLoading: false,
          lastError: null,
        });

        // Invalidate related queries
        queryClient.invalidateQueries(["orders"]);

        return orderId;
      } catch (error) {
        set({
          isLoading: false,
          lastError: "Erreur lors de la soumission de la commande",
        });
        return null;
      }
    },

    resetCheckout: () => {
      set({
        items: [],
        shippingAddress: null,
        billingAddress: null,
        sameAsShipping: true,
        paymentMethod: null,
        shippingMethod: null,
        couponCode: null,
        couponDiscount: 0,
        checkoutStep: "cart",
        orderId: null,
        lastError: null,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    },

    setError: (error) => {
      set({ lastError: error });
    },

    // Getters
    getSubtotal: () => {
      return get().items.reduce((total, item) => {
        const price = item.discountedPrice ?? item.price;
        return total + price * item.quantity;
      }, 0);
    },

    getTaxAmount: () => {
      // Taux de TVA simulé à 20%
      return get().getSubtotal() * 0.2;
    },

    getShippingCost: () => {
      const { shippingMethod } = get();
      return shippingMethod ? shippingMethod.price : 0;
    },

    getDiscountAmount: () => {
      return get().couponDiscount;
    },

    getTotal: () => {
      const subtotal = get().getSubtotal();
      const shipping = get().getShippingCost();
      const tax = get().getTaxAmount();
      const discount = get().getDiscountAmount();

      return Math.max(0, subtotal + shipping + tax - discount);
    },

    getTotalItems: () => {
      return get().items.reduce((total, item) => total + item.quantity, 0);
    },

    isEmpty: () => {
      return get().items.length === 0;
    },
  }))
);
