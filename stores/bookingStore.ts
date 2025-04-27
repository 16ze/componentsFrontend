import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useUserStore } from "./userStore";

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Booking {
  _id: string;
  date: string;
  time: string;
  service: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  message?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface BookingState {
  bookings: Booking[];
  activeBooking: Booking | null;
  availableSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  selectedDate: string | null;

  // Actions
  fetchBookings: () => Promise<void>;
  fetchAvailableSlots: (date: string) => Promise<void>;
  createBooking: (
    bookingData: Omit<Booking, "_id" | "status" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateBooking: (id: string, bookingData: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  setSelectedDate: (date: string | null) => void;
  setActiveBooking: (booking: Booking | null) => void;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],
      activeBooking: null,
      availableSlots: [],
      isLoading: false,
      error: null,
      selectedDate: null,

      fetchBookings: async () => {
        const userState = useUserStore.getState();
        if (!userState.isAuthenticated) {
          set({
            error: "Vous devez être connecté pour accéder à vos réservations",
          });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/booking`,
            {
              headers: {
                Authorization: `Bearer ${userState.user?.token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Échec de la récupération des réservations"
            );
          }

          set({
            bookings: data.data,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Une erreur est survenue",
            isLoading: false,
          });
        }
      },

      fetchAvailableSlots: async (date) => {
        set({ isLoading: true, error: null, selectedDate: date });
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/booking/available?date=${date}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Échec de la récupération des créneaux"
            );
          }

          // Convertir les heures en objets TimeSlot
          const timeSlots: TimeSlot[] = data.data.map((time: string) => ({
            time,
            available: true,
          }));

          set({
            availableSlots: timeSlots,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Une erreur est survenue",
            isLoading: false,
          });
        }
      },

      createBooking: async (bookingData) => {
        set({ isLoading: true, error: null });
        try {
          const userState = useUserStore.getState();
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };

          if (userState.isAuthenticated && userState.user?.token) {
            headers["Authorization"] = `Bearer ${userState.user.token}`;
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/booking`,
            {
              method: "POST",
              headers,
              body: JSON.stringify(bookingData),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Échec de la création de la réservation"
            );
          }

          // Si l'utilisateur est connecté, ajouter cette réservation à la liste
          if (userState.isAuthenticated) {
            set((state) => ({
              bookings: [...state.bookings, data.data],
              activeBooking: data.data,
              isLoading: false,
            }));
          } else {
            set({
              activeBooking: data.data,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Une erreur est survenue",
            isLoading: false,
          });
        }
      },

      updateBooking: async (id, bookingData) => {
        const userState = useUserStore.getState();
        if (!userState.isAuthenticated) {
          set({
            error: "Vous devez être connecté pour modifier une réservation",
          });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userState.user?.token}`,
              },
              body: JSON.stringify(bookingData),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Échec de la mise à jour de la réservation"
            );
          }

          // Mettre à jour la réservation dans le state
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking._id === id ? { ...booking, ...data.data } : booking
            ),
            activeBooking: data.data,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Une erreur est survenue",
            isLoading: false,
          });
        }
      },

      deleteBooking: async (id) => {
        const userState = useUserStore.getState();
        if (!userState.isAuthenticated) {
          set({
            error: "Vous devez être connecté pour supprimer une réservation",
          });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${userState.user?.token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Échec de la suppression de la réservation"
            );
          }

          // Supprimer la réservation du state
          set((state) => ({
            bookings: state.bookings.filter((booking) => booking._id !== id),
            activeBooking:
              state.activeBooking?._id === id ? null : state.activeBooking,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Une erreur est survenue",
            isLoading: false,
          });
        }
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      setActiveBooking: (booking) => {
        set({ activeBooking: booking });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "booking-storage",
      storage: createJSONStorage(() => sessionStorage), // Utilisation de sessionStorage pour les réservations
      partialize: (state) => ({
        // Ne persister que certaines parties du state
        activeBooking: state.activeBooking,
        selectedDate: state.selectedDate,
      }),
    }
  )
);
