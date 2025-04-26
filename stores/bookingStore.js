import { create } from "zustand";

export const useBookingStore = create((set) => ({
  // État initial
  bookingDetails: null,

  // Actions
  setBookingDetails: (details) => set({ bookingDetails: details }),

  resetBooking: () => set({ bookingDetails: null }),

  // Pour des cas d'utilisation plus avancés, on pourrait ajouter:
  // - historique des réservations
  // - état de chargement
  // - gestion des erreurs
}));
