"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      shippingAddress: null,
      paymentMethod: null,
      shippingMethod: null,
      discountCode: null,
      discountAmount: 0,

      // Fonctions pour manipuler le panier
      addItem: (product, quantity = 1) => {
        const { items } = get();

        // Vérifier si le produit est déjà dans le panier
        const existingItemIndex = items.findIndex(
          (item) => item.product.id === product.id
        );

        if (existingItemIndex !== -1) {
          // Si le produit existe déjà, mettre à jour la quantité
          const updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          };
          set({ items: updatedItems });
        } else {
          // Si c'est un nouveau produit, l'ajouter au panier
          set({
            items: [
              {
                id: `${product.id}_${Date.now()}`, // ID unique pour l'article du panier
                product,
                quantity,
                addedAt: new Date().toISOString(),
              },
              ...items, // Ajouter les nouveaux articles au début pour faciliter l'affichage récent
            ],
          });
        }
      },

      // Mettre à jour la quantité d'un produit
      updateItemQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          return get().removeItem(itemId);
        }

        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },

      // Supprimer un produit du panier
      removeItem: (itemId) => {
        set({
          items: get().items.filter((item) => item.id !== itemId),
        });
      },

      // Vider le panier
      clearCart: () => {
        set({ items: [] });
      },

      // Récupérer le nombre total d'articles dans le panier
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Calculer le sous-total du panier
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.priceDiscount || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },

      // Vérifier si un produit est dans le panier
      isInCart: (productId) => {
        return get().items.some((item) => item.product.id === productId);
      },

      // Obtenir la quantité d'un produit dans le panier
      getItemQuantity: (productId) => {
        const item = get().items.find((item) => item.product.id === productId);
        return item ? item.quantity : 0;
      },

      setShippingAddress: (address) => set({ shippingAddress: address }),

      setPaymentMethod: (method) => set({ paymentMethod: method }),

      setShippingMethod: (method) => set({ shippingMethod: method }),

      applyDiscount: (code, amount) =>
        set({
          discountCode: code,
          discountAmount: amount,
        }),

      removeDiscount: () =>
        set({
          discountCode: null,
          discountAmount: 0,
        }),

      // Calculer le total final
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discountAmount;
        // Ici, on pourrait également ajouter des taxes, frais de livraison, etc.
        return Math.max(0, subtotal - discount);
      },
    }),
    {
      name: "shopping-cart", // Nom utilisé pour le stockage localStorage
      skipHydration: true, // Éviter les problèmes d'hydratation côté serveur
    }
  )
);
