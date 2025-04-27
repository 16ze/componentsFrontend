"use client";

import React from "react";
import Image from "next/image";

// Composants UI basiques si les modules ne sont pas disponibles
const Card = ({ className, children }) => {
  return (
    <div className={`border rounded-lg shadow-sm ${className || ""}`}>
      {children}
    </div>
  );
};

const CardContent = ({ className, children }) => {
  return <div className={`p-6 ${className || ""}`}>{children}</div>;
};

const CardFooter = ({ className, children }) => {
  return (
    <div className={`px-6 py-4 border-t ${className || ""}`}>{children}</div>
  );
};

const Separator = ({ className }) => {
  return <hr className={`border-t my-4 ${className || ""}`} />;
};

const ScrollArea = ({ className, children }) => {
  return <div className={`overflow-auto ${className || ""}`}>{children}</div>;
};

export default function OrderSummary({
  cartItems = [],
  subtotal = 0,
  shipping = 0,
  discount = 0,
  tax = 0,
  readOnly = false,
  className = "",
}) {
  // Calcul du total
  const total = subtotal - discount + shipping + tax;

  // Formatter les prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {readOnly ? "Récapitulatif de commande" : "Votre panier"}
        </h2>

        {/* Liste des articles */}
        <ScrollArea className="max-h-[240px] pr-4 -mr-4">
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li key={item.id} className="flex gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted/50">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-medium leading-none">
                    {item.name}
                  </h4>
                  <div className="mt-1 flex text-xs text-muted-foreground">
                    <span>{item.color}</span>
                    {item.size && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{item.size}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 flex items-center text-sm">
                    <span>{formatPrice(item.price)}</span>
                    <span className="mx-1">×</span>
                    <span>{item.quantity}</span>
                  </div>
                </div>

                <div className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <Separator className="my-4" />

        {/* Récapitulatif des prix */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {shipping > 0 && (
            <div className="flex justify-between text-sm">
              <span>Frais de livraison</span>
              <span>{formatPrice(shipping)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Réduction</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>TVA</span>
              <span>{formatPrice(tax)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-muted/50 px-6 py-4">
        <span className="text-base font-medium">Total</span>
        <span className="text-base font-medium">{formatPrice(total)}</span>
      </CardFooter>
    </Card>
  );
}
