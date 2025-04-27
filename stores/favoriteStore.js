"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavoriteStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      // Ajouter un produit aux favoris
      addFavorite: (productId) => {
        set((state) => ({
          favorites: [...state.favorites, productId],
        }));
      },

      // Supprimer un produit des favoris
      removeFavorite: (productId) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== productId),
        }));
      },

      // Basculer l'état favori d'un produit
      toggleFavorite: (productId) => {
        const { favorites } = get();
        const isFavorite = favorites.includes(productId);

        if (isFavorite) {
          set((state) => ({
            favorites: state.favorites.filter((id) => id !== productId),
          }));
        } else {
          set((state) => ({
            favorites: [...state.favorites, productId],
          }));
        }
      },

      // Vérifier si un produit est dans les favoris
      isFavorite: (productId) => {
        return get().favorites.includes(productId);
      },

      // Vider tous les favoris
      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: "favorites-storage", // nom pour localStorage
    }
  )
);
