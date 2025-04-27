"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Minus, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AddToCartButton = ({
  productId,
  stock = 0,
  initialQuantity = 1,
  showQuantityControls = true,
  maxQuantity = null,
  className,
  variant = "default",
  size = "default",
  fullWidth = false,
  withIcon = true,
  onAddToCart = null,
  disableAnimation = false,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { addItem } = useCartStore();

  // Utiliser maxQuantity s'il est fourni, sinon utiliser le stock disponible
  const actualMaxQuantity = maxQuantity !== null ? maxQuantity : stock;

  // Réinitialiser l'état de succès et d'erreur après un certain délai
  useEffect(() => {
    let timeout;
    if (success) {
      timeout = setTimeout(() => {
        setSuccess(false);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [success]);

  useEffect(() => {
    let timeout;
    if (error) {
      timeout = setTimeout(() => {
        setError(null);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [error]);

  // Gérer l'ajout au panier
  const handleAddToCart = async () => {
    if (loading || stock <= 0) return;

    try {
      setLoading(true);
      setError(null);

      // Ajouter l'article au panier via Zustand
      await addItem(productId, quantity);

      // Jouer un son optionnel si disponible dans le navigateur
      if (typeof window !== "undefined" && !disableAnimation) {
        try {
          const audio = new Audio("/sounds/cart-add.mp3");
          audio.volume = 0.2;
          await audio.play();
        } catch (e) {
          // Ignorer les erreurs audio (certains navigateurs bloquent l'autoplay)
        }
      }

      // Indiquer le succès
      setSuccess(true);

      // Appeler le callback si fourni
      if (onAddToCart) {
        onAddToCart(quantity);
      }
    } catch (err) {
      setError(err.message || "Impossible d'ajouter au panier");
      console.error("Erreur d'ajout au panier:", err);
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements de quantité
  const incrementQuantity = () => {
    if (quantity < actualMaxQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Déterminer l'état du bouton
  const isOutOfStock = stock <= 0;
  const isDisabled = isOutOfStock || loading;

  return (
    <div className={cn("flex flex-col gap-2", fullWidth && "w-full")}>
      {/* Contrôles de quantité */}
      {showQuantityControls && (
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={quantity <= 1 || isDisabled}
            onClick={decrementQuantity}
            className="h-9 w-9 rounded-r-none"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <div className="h-9 px-3 flex items-center justify-center border-y border-input bg-background min-w-[40px]">
            {quantity}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={quantity >= actualMaxQuantity || isDisabled}
            onClick={incrementQuantity}
            className="h-9 w-9 rounded-l-none"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {actualMaxQuantity > 0 && (
            <span className="text-xs text-muted-foreground ml-3">
              {isOutOfStock
                ? "Produit indisponible"
                : `${actualMaxQuantity} disponible${
                    actualMaxQuantity > 1 ? "s" : ""
                  }`}
            </span>
          )}
        </div>
      )}

      {/* Bouton d'ajout au panier */}
      <AnimatePresence mode="wait">
        <motion.div
          className={cn(fullWidth && "w-full")}
          key={`${loading}-${success}-${error}`}
          initial={disableAnimation ? {} : { opacity: 0, y: 5 }}
          animate={disableAnimation ? {} : { opacity: 1, y: 0 }}
          exit={disableAnimation ? {} : { opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {error ? (
            <Button
              variant="destructive"
              size={size}
              className={cn(className, fullWidth && "w-full")}
              onClick={() => setError(null)}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </Button>
          ) : success ? (
            <Button
              variant="outline"
              size={size}
              className={cn(
                "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800",
                className,
                fullWidth && "w-full"
              )}
              disabled
            >
              <Check className="mr-2 h-4 w-4" />
              Ajouté au panier
            </Button>
          ) : (
            <Button
              variant={variant}
              size={size}
              disabled={isDisabled}
              className={cn(
                className,
                isOutOfStock &&
                  "bg-gray-300 hover:bg-gray-300 cursor-not-allowed",
                fullWidth && "w-full"
              )}
              onClick={handleAddToCart}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                withIcon && (
                  <ShoppingBag
                    className={cn(
                      "h-4 w-4",
                      size === "lg" && "h-5 w-5",
                      !isOutOfStock && "mr-2"
                    )}
                  />
                )
              )}
              {isOutOfStock ? "Indisponible" : "Ajouter au panier"}
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AddToCartButton;
