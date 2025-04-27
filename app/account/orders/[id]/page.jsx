import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Package2,
  ChevronLeft,
  Truck,
  Clock,
  CheckCircle,
  CreditCard,
  Printer,
  DownloadCloud,
  MessageSquare,
  ShoppingBag,
} from "lucide-react";

// Simuler des données de commandes (en production, cela viendrait d'une API)
const ORDERS = {
  "ORD-2023-1156": {
    id: "ORD-2023-1156",
    date: "2023-12-10T14:30:00Z",
    total: 109.97,
    status: "delivered",
    statusHistory: [
      {
        status: "ordered",
        date: "2023-12-10T14:30:00Z",
        description: "Commande confirmée",
      },
      {
        status: "processing",
        date: "2023-12-10T15:45:00Z",
        description: "Commande en cours de traitement",
      },
      {
        status: "shipped",
        date: "2023-12-11T10:15:00Z",
        description: "Commande expédiée",
        trackingNumber: "TRK123456789FR",
      },
      {
        status: "delivered",
        date: "2023-12-13T14:20:00Z",
        description: "Commande livrée",
      },
    ],
    items: [
      {
        id: 1,
        name: "T-shirt col rond",
        quantity: 2,
        price: 24.99,
        image: "/images/products/tshirt-homme-blanc-1.jpg",
        slug: "tshirt-homme-blanc",
      },
      {
        id: 2,
        name: "Jean slim fit",
        quantity: 1,
        price: 59.99,
        image: "/images/products/jean-homme-slim.jpg",
        slug: "jean-homme-slim",
      },
    ],
    subtotal: 109.97,
    shipping: {
      method: "standard",
      price: 0,
      estimatedDelivery: "2023-12-13",
      address: {
        firstName: "Jean",
        lastName: "Dupont",
        address: "12 rue de Paris",
        city: "Paris",
        postalCode: "75001",
        country: "France",
        phone: "+33612345678",
      },
    },
    payment: {
      method: "card",
      lastFour: "4242",
      brand: "Visa",
      billingAddress: {
        sameAsShipping: true,
      },
    },
    tax: 18.33,
    discount: 0,
  },
  "ORD-2023-1103": {
    id: "ORD-2023-1103",
    date: "2023-11-25T09:15:00Z",
    total: 199.97,
    status: "delivered",
    statusHistory: [
      {
        status: "ordered",
        date: "2023-11-25T09:15:00Z",
        description: "Commande confirmée",
      },
      {
        status: "processing",
        date: "2023-11-25T10:30:00Z",
        description: "Commande en cours de traitement",
      },
      {
        status: "shipped",
        date: "2023-11-26T11:45:00Z",
        description: "Commande expédiée",
        trackingNumber: "TRK987654321FR",
      },
      {
        status: "delivered",
        date: "2023-11-27T16:20:00Z",
        description: "Commande livrée",
      },
    ],
    items: [
      {
        id: 3,
        name: "Veste en cuir",
        quantity: 1,
        price: 149.99,
        image: "/images/products/veste-homme-cuir.jpg",
        slug: "veste-homme-cuir",
      },
      {
        id: 4,
        name: "Ceinture en cuir",
        quantity: 1,
        price: 39.99,
        image: "/images/products/ceinture-cuir.jpg",
        slug: "ceinture-cuir",
      },
    ],
    subtotal: 189.98,
    shipping: {
      method: "express",
      price: 9.99,
      estimatedDelivery: "2023-11-27",
      address: {
        firstName: "Jean",
        lastName: "Dupont",
        address: "12 rue de Paris",
        city: "Paris",
        postalCode: "75001",
        country: "France",
        phone: "+33612345678",
      },
    },
    payment: {
      method: "paypal",
      email: "jean.dupont@example.com",
      billingAddress: {
        sameAsShipping: true,
      },
    },
    tax: 33.33,
    discount: 0,
  },
};

// Mapping des statuts pour affichage
const STATUS_MAP = {
  ordered: {
    label: "Commande confirmée",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: CheckCircle,
  },
  processing: {
    label: "En cours de traitement",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: Package2,
  },
  shipped: {
    label: "Expédié",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    icon: Truck,
  },
  delivered: {
    label: "Livré",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Annulé",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: Clock,
  },
};

// Génération des métadonnées dynamiques
export async function generateMetadata({ params }) {
  const { id } = params;
  const order = ORDERS[id];

  if (!order) {
    return {
      title: "Commande non trouvée | E-Commerce",
      description: "La commande que vous recherchez n'existe pas",
    };
  }

  return {
    title: `Commande ${order.id} | E-Commerce`,
    description: `Détails de votre commande ${order.id} du ${new Date(
      order.date
    ).toLocaleDateString("fr-FR")}`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

// Génération statique des paramètres pour les commandes existantes
export async function generateStaticParams() {
  return Object.keys(ORDERS).map((id) => ({ id }));
}

export default function OrderDetailsPage({ params }) {
  const { id } = params;
  const order = ORDERS[id];

  // Si la commande n'existe pas, renvoyer une page 404
  if (!order) {
    notFound();
  }

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Formater l'heure
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formater le prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Récupérer l'état actuel de la commande
  const currentStatus = order.status;
  const CurrentStatusIcon = STATUS_MAP[currentStatus]?.icon || Package2;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center text-sm text-primary hover:underline mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour à mes commandes
          </Link>
          <h1 className="text-3xl font-bold">Commande {order.id}</h1>
          <p className="text-muted-foreground">
            Passée le {formatDate(order.date)} à {formatTime(order.date)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">
            <Printer className="h-4 w-4" />
            Imprimer
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">
            <DownloadCloud className="h-4 w-4" />
            Télécharger la facture
          </button>
        </div>
      </div>

      {/* Statut actuel */}
      <div
        className={`${
          STATUS_MAP[currentStatus]?.bgColor || "bg-gray-50"
        } p-4 rounded-lg mb-8 flex items-center gap-4`}
      >
        <div
          className={`${
            STATUS_MAP[currentStatus]?.color || "text-gray-600"
          } p-2 rounded-full bg-white`}
        >
          <CurrentStatusIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-semibold">
            Statut : {STATUS_MAP[currentStatus]?.label || "Inconnu"}
          </h2>
          <p className="text-sm">
            {currentStatus === "shipped"
              ? `Votre commande a été expédiée. Numéro de suivi : ${
                  order.statusHistory.find((h) => h.status === "shipped")
                    ?.trackingNumber
                }`
              : currentStatus === "delivered"
              ? "Votre commande a été livrée avec succès."
              : "Nous vous tiendrons informé de l'évolution de votre commande."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Suivi de commande */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-4">Suivi de commande</h2>
              <div className="space-y-8 relative">
                {/* Ligne verticale de connexion */}
                <div className="absolute left-[15px] top-[30px] bottom-0 w-[2px] bg-gray-200"></div>

                {order.statusHistory.map((status, index) => {
                  const StatusIcon =
                    STATUS_MAP[status.status]?.icon || Package2;
                  const isCompleted = true; // Tous les statuts affichés sont considérés comme complétés

                  return (
                    <div key={status.status} className="flex gap-4 relative">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                          isCompleted
                            ? `${STATUS_MAP[status.status]?.bgColor} ${
                                STATUS_MAP[status.status]?.color
                              }`
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {STATUS_MAP[status.status]?.label || status.status}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(status.date)} à {formatTime(status.date)}
                        </p>
                        <p className="text-sm mt-1">{status.description}</p>
                        {status.trackingNumber && (
                          <div className="mt-2">
                            <a
                              href="#"
                              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                            >
                              Suivre votre colis ({status.trackingNumber})
                              <ChevronLeft className="h-3 w-3 rotate-180" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assistance */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-start gap-4">
                <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium">
                    Besoin d'aide avec cette commande ?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Notre équipe du service client est disponible pour vous
                    aider.
                  </p>
                  <button className="text-sm text-primary hover:underline">
                    Contacter le service client
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Articles commandés */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-4">Articles commandés</h2>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/shop/product/${item.slug}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        Quantité: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatPrice(item.price)} / unité
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium">
                <ShoppingBag className="h-4 w-4" />
                Acheter à nouveau
              </button>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-100"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Résumé de la commande */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="font-semibold mb-4">Résumé de la commande</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>
                    {order.shipping.price === 0
                      ? "Gratuit"
                      : formatPrice(order.shipping.price)}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Paiement</h3>
              </div>
              <div className="text-sm">
                {order.payment.method === "card" ? (
                  <p>
                    Carte {order.payment.brand} se terminant par{" "}
                    {order.payment.lastFour}
                  </p>
                ) : order.payment.method === "paypal" ? (
                  <p>PayPal ({order.payment.email})</p>
                ) : (
                  <p>Méthode de paiement</p>
                )}
              </div>
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Adresse de livraison</h3>
              </div>
              <div className="text-sm">
                <p className="mb-1">
                  {order.shipping.address.firstName}{" "}
                  {order.shipping.address.lastName}
                </p>
                <p className="mb-1">{order.shipping.address.address}</p>
                <p className="mb-1">
                  {order.shipping.address.postalCode}{" "}
                  {order.shipping.address.city}
                </p>
                <p className="mb-1">{order.shipping.address.country}</p>
                <p>{order.shipping.address.phone}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <h3 className="font-medium mb-2">Méthode de livraison</h3>
              <p className="text-sm capitalize">
                {order.shipping.method === "standard"
                  ? "Livraison standard"
                  : order.shipping.method === "express"
                  ? "Livraison express"
                  : order.shipping.method}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Livraison prévue le{" "}
                {formatDate(order.shipping.estimatedDelivery)}
              </p>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="border rounded-lg p-6">
            <h3 className="font-medium mb-3">Informations complémentaires</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Numéro de commande
                </span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date de commande</span>
                <span>{formatDate(order.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paiement</span>
                <span>
                  {order.payment.method === "card"
                    ? "Carte bancaire"
                    : "PayPal"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
