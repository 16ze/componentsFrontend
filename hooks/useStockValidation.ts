"use client";

import { useState, useCallback } from "react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useToast } from "@/components/ui/use-toast";

type ValidationResult = {
  isValid: boolean;
  message?: string;
  stockQuantity: number;
  isBackorderable: boolean;
  restockDate?: Date | null;
};

export function useStockValidation() {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);

  const {
    getAvailableStock,
    canAddToCart,
    isBackorderable,
    getRestockDate,
    fetchProductStock,
  } = useInventoryStore();

  const validateStockBeforeAddToCart = useCallback(
    async (
      productId: string,
      quantity: number,
      options?: { showToast?: boolean; autoFetch?: boolean }
    ): Promise<ValidationResult> => {
      const { showToast = true, autoFetch = true } = options || {};

      setIsValidating(true);

      try {
        // Actualiser les données de stock si nécessaire
        if (autoFetch) {
          await fetchProductStock(productId);
        }

        const availableStock = getAvailableStock(productId);
        const canAdd = canAddToCart(productId, quantity);
        const backorderable = isBackorderable(productId);
        const restockDate = getRestockDate(productId);

        // Stock suffisant
        if (canAdd && availableStock >= quantity) {
          return {
            isValid: true,
            stockQuantity: availableStock,
            isBackorderable: backorderable,
            restockDate,
          };
        }

        // Stock insuffisant mais backorder possible
        if (canAdd && backorderable) {
          const message = restockDate
            ? `Stock insuffisant. Disponible en précommande (livraison prévue: ${restockDate.toLocaleDateString()})`
            : "Stock insuffisant. Disponible en précommande";

          if (showToast) {
            toast({
              title: "Précommande",
              description: message,
              variant: "default",
              duration: 5000,
            });
          }

          return {
            isValid: true,
            message,
            stockQuantity: availableStock,
            isBackorderable: true,
            restockDate,
          };
        }

        // Stock insuffisant et pas de backorder
        const message = "Stock insuffisant pour ajouter ce produit au panier";

        if (showToast) {
          toast({
            title: "Rupture de stock",
            description: message,
            variant: "destructive",
            duration: 3000,
          });
        }

        return {
          isValid: false,
          message,
          stockQuantity: availableStock,
          isBackorderable: false,
          restockDate,
        };
      } catch (error) {
        const message = "Erreur lors de la vérification du stock";

        if (showToast) {
          toast({
            title: "Erreur",
            description: message,
            variant: "destructive",
            duration: 3000,
          });
        }

        return {
          isValid: false,
          message,
          stockQuantity: 0,
          isBackorderable: false,
        };
      } finally {
        setIsValidating(false);
      }
    },
    [
      fetchProductStock,
      getAvailableStock,
      canAddToCart,
      isBackorderable,
      getRestockDate,
      toast,
    ]
  );

  return {
    validateStockBeforeAddToCart,
    isValidating,
  };
}
