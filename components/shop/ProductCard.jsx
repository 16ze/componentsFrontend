"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cartStore";
import { useFavoriteStore } from "@/stores/favoriteStore";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { addItem } = useCartStore();
  const { favorites, toggleFavorite } = useFavoriteStore();

  const isFavorite = favorites.includes(product.id);
  const hasSecondaryImage =
    product.additionalImages && product.additionalImages.length > 0;
  const isOnSale =
    product.priceDiscount && product.priceDiscount < product.price;
  const isOutOfStock = product.countInStock <= 0;
  const isNew =
    new Date(product.createdAt) >
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addItem(product.id, 1);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 1500);
    }
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <motion.div
      className="group relative flex flex-col h-full rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/shop/product/${product.slug}`}>
        <div className="relative overflow-hidden pt-[100%]">
          {/* Image principale ou secondaire au survol */}
          <Image
            src={
              isHovered && hasSecondaryImage
                ? product.additionalImages[0]
                : product.image
            }
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />

          {/* Bouton favori */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 z-10"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
              )}
            />
          </Button>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <Badge
                variant="default"
                className="bg-blue-500 hover:bg-blue-500"
              >
                Nouveau
              </Badge>
            )}
            {isOnSale && (
              <Badge variant="default" className="bg-red-500 hover:bg-red-500">
                -
                {Math.round(
                  ((product.price - product.priceDiscount) / product.price) *
                    100
                )}
                %
              </Badge>
            )}
            {isOutOfStock && (
              <Badge
                variant="outline"
                className="bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
              >
                Épuisé
              </Badge>
            )}
          </div>

          {/* Ajouter au panier */}
          {!isOutOfStock && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <Button
                onClick={handleAddToCart}
                className="m-3 w-full max-w-[90%] gap-2 bg-primary hover:bg-primary/90"
              >
                {showConfirmation ? (
                  <>
                    <Check className="h-4 w-4" />
                    Ajouté
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Ajouter au panier
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col flex-grow">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {product.brand}
          </span>
          <h3 className="text-base font-medium mt-1 mb-1 line-clamp-2">
            {product.name}
          </h3>

          <div className="mt-auto pt-2 flex items-center">
            {isOnSale ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {product.priceDiscount} €
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.price} €
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary">
                {product.price} €
              </span>
            )}

            {product.countInStock > 0 && product.countInStock <= 5 && (
              <span className="ml-auto text-xs text-amber-600 dark:text-amber-500">
                Plus que {product.countInStock} en stock
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
