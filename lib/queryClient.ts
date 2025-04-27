import { QueryClient } from "@tanstack/react-query";

// Créer une instance de QueryClient pour gérer les requêtes React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes par défaut
      cacheTime: 1000 * 60 * 30, // 30 minutes de mise en cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
