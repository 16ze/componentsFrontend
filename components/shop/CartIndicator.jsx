"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CartIndicator() {
  const pathname = usePathname();
  const router = useRouter();
  const cartStore = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [animateCount, setAnimateCount] = useState(false);
  const previousCount = useRef(0);
  const dropdownRef = useRef(null);

  // Récupérer le nombre d'articles et les articles récents
  const totalItems = cartStore.getTotalItems();
  const subtotal = cartStore.getSubtotal();
  const recentItems = cartStore.items.slice(0, 3);

  // Vérifier si le panier est vide
  const isEmpty = totalItems === 0;

  // Animation quand le nombre d'articles change
  useEffect(() => {
    if (previousCount.current < totalItems) {
      setAnimateCount(true);
      const timer = setTimeout(() => setAnimateCount(false), 800);
      return () => clearTimeout(timer);
    }
    previousCount.current = totalItems;
  }, [totalItems]);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Formater le prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Panier"
      >
        <ShoppingCart className="h-6 w-6" />
        {!isEmpty && (
          <AnimatePresence>
            <motion.div
              key="badge"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{
                scale: animateCount ? [1, 1.2, 1] : 1,
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 20,
              }}
              className="absolute -top-2 -right-2"
            >
              <Badge
                variant="destructive"
                className="flex h-5 w-5 items-center justify-center rounded-full p-0"
              >
                {totalItems}
              </Badge>
            </motion.div>
          </AnimatePresence>
        )}
      </Button>

      {/* Mini-dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border bg-background shadow-lg"
          >
            <div className="p-4">
              <h3 className="mb-2 font-medium">
                {isEmpty ? "Votre panier est vide" : "Articles récents"}
              </h3>

              {!isEmpty && (
                <>
                  <ul className="space-y-3">
                    {recentItems.map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                          {item.product.image && (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="line-clamp-1 font-medium">
                            {item.product.name}
                          </p>
                          <p className="text-muted-foreground">
                            {item.quantity} x{" "}
                            {formatPrice(
                              item.product.priceDiscount || item.product.price
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <span className="text-sm font-medium">Sous-total:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        router.push("/cart");
                        setIsOpen(false);
                      }}
                    >
                      Voir le panier
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        router.push("/checkout");
                        setIsOpen(false);
                      }}
                    >
                      Commander
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
