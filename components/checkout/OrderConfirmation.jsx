"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Truck,
  Mail,
  Phone,
  Copy,
  Share2,
  ArrowRight,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import OrderSummary from "./OrderSummary";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default function OrderConfirmation({ orderData }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Données de commande simulées si non fournies
  const order = orderData || {
    orderId: "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    date: new Date().toISOString(),
    status: "confirmed",
    total: 239.94,
    shippingAddress: {
      firstName: "Jean",
      lastName: "Dupont",
      address: "123 Rue de Paris",
      apartment: "Apt 4B",
      city: "Paris",
      postalCode: "75001",
      country: "France",
      phone: "+33 6 12 34 56 78",
    },
    items: [
      {
        id: "prod-1",
        name: "Chemise en lin premium",
        price: 89.99,
        quantity: 2,
        image: "/images/products/shirt.jpg",
        color: "Blanc",
        size: "M",
      },
      {
        id: "prod-2",
        name: "Chaussures en cuir",
        price: 149.95,
        quantity: 1,
        image: "/images/products/shoes.jpg",
        color: "Noir",
        size: "42",
      },
    ],
    paymentMethod: {
      type: "card",
      last4: "4242",
    },
    shipping: {
      method: "standard",
      price: 4.99,
      estimatedDelivery: new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    subtotal: 329.93,
    discount: 95.0,
    tax: 0,
  };

  // Formater une date pour l'affichage
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Copier le numéro de commande
  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Fonction de partage (simulation)
  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Ma commande ${order.orderId}`,
        text: `J'ai passé une commande sur [nom du site]. Numéro de commande: ${order.orderId}`,
        url: window.location.href,
      });
    } else {
      // Fallback si Web Share API n'est pas disponible
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  // Calculer la date de livraison estimée
  const estimatedDeliveryDate = formatDate(order.shipping.estimatedDelivery);

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* En-tête */}
      <motion.div className="text-center mb-10" variants={itemVariants}>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
        <p className="text-lg text-muted-foreground mb-2">
          Merci pour votre achat, {order.shippingAddress.firstName}
        </p>
        <p className="flex items-center justify-center text-sm">
          <span className="font-medium mr-2">Commande #{order.orderId}</span>
          <button
            onClick={copyOrderNumber}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            {copySuccess ? "Copié !" : "Copier"}
          </button>
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Section principale */}
        <div className="md:col-span-2 space-y-8">
          {/* Statut de la commande */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Suivi de commande
                </h2>

                <div className="relative pb-8">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="relative flex items-start mb-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center z-10">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4 mt-0.5">
                      <h3 className="font-medium">Commande confirmée</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.date)}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex items-start mb-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center z-10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-4 mt-0.5">
                      <h3 className="font-medium">Préparation en cours</h3>
                      <p className="text-sm text-muted-foreground">
                        Nous préparons votre commande
                      </p>
                    </div>
                  </div>

                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center z-10">
                      <Truck className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4 mt-0.5">
                      <h3 className="font-medium">Expédition</h3>
                      <p className="text-sm text-muted-foreground">
                        Livraison prévue le {estimatedDeliveryDate}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-medium">
                    Besoin d'aide avec votre commande ?
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Nous contacter
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Phone className="h-4 w-4" />
                      Assistance
                    </Button>
                    <Button
                      onClick={shareOrder}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      {shareSuccess ? "Partagé !" : "Partager"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Adresse de livraison */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Adresse de livraison</h3>
                    <p className="text-sm mb-1">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p className="text-sm mb-1">
                      {order.shippingAddress.address}
                      {order.shippingAddress.apartment &&
                        `, ${order.shippingAddress.apartment}`}
                    </p>
                    <p className="text-sm mb-1">
                      {order.shippingAddress.postalCode}{" "}
                      {order.shippingAddress.city}
                    </p>
                    <p className="text-sm mb-1">
                      {order.shippingAddress.country}
                    </p>
                    <p className="text-sm mb-1">
                      {order.shippingAddress.phone}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Méthode de livraison</h3>
                    <p className="text-sm capitalize mb-1">
                      {order.shipping.method === "standard"
                        ? "Livraison standard"
                        : "Livraison premium"}
                    </p>
                    <p className="text-sm mb-1">
                      Livraison prévue le {estimatedDeliveryDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Options pour continuer */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link href="/account/orders" passHref>
              <Button variant="outline" size="lg" className="flex-1 gap-2">
                Voir mes commandes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products" passHref>
              <Button size="lg" className="flex-1 gap-2">
                <ShoppingBag className="h-4 w-4" />
                Continuer mes achats
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Récapitulatif de commande */}
        <motion.div variants={itemVariants} className="md:col-span-1">
          <div className="sticky top-8">
            <OrderSummary
              cartItems={order.items}
              subtotal={order.subtotal}
              shipping={order.shipping.price}
              discount={order.discount}
              tax={order.tax}
              readOnly={true}
            />

            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Moyen de paiement</h3>
                <p className="text-sm flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  {order.paymentMethod.type === "card"
                    ? `Carte se terminant par ${order.paymentMethod.last4}`
                    : "PayPal"}
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Confirmation par email */}
      <motion.div
        variants={fadeIn}
        className="text-center mt-12 p-4 border rounded-lg bg-accent/10"
      >
        <p className="text-sm text-muted-foreground">
          Un email de confirmation a été envoyé à{" "}
          {order.shippingAddress.email || "votre adresse email"}. Si vous ne
          l'avez pas reçu, vérifiez votre dossier spam ou contactez notre
          service client.
        </p>
      </motion.div>
    </motion.div>
  );
}
