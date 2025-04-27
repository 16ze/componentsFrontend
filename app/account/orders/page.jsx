import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package2,
  Search,
  ChevronRight,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Simuler des données de commandes
const ORDERS = [
  {
    id: "ORD-2023-1156",
    date: "2023-12-10T14:30:00Z",
    total: 109.97,
    status: "delivered",
    items: [
      {
        id: 1,
        name: "T-shirt col rond",
        quantity: 2,
        price: 24.99,
        image: "/images/products/tshirt-homme-blanc-1.jpg",
      },
      {
        id: 2,
        name: "Jean slim fit",
        quantity: 1,
        price: 59.99,
        image: "/images/products/jean-homme-slim.jpg",
      },
    ],
    shipping: {
      method: "standard",
      price: 0,
      address: {
        firstName: "Jean",
        lastName: "Dupont",
        address: "12 rue de Paris",
        city: "Paris",
        postalCode: "75001",
        country: "France",
      },
    },
    payment: {
      method: "card",
      lastFour: "4242",
    },
  },
  {
    id: "ORD-2023-1103",
    date: "2023-11-25T09:15:00Z",
    total: 89.99,
    status: "delivered",
    items: [
      {
        id: 3,
        name: "Veste en cuir",
        quantity: 1,
        price: 149.99,
        image: "/images/products/veste-homme-cuir.jpg",
      },
      {
        id: 4,
        name: "Ceinture en cuir",
        quantity: 1,
        price: 39.99,
        image: "/images/products/ceinture-cuir.jpg",
      },
    ],
    shipping: {
      method: "express",
      price: 9.99,
      address: {
        firstName: "Jean",
        lastName: "Dupont",
        address: "12 rue de Paris",
        city: "Paris",
        postalCode: "75001",
        country: "France",
      },
    },
    payment: {
      method: "paypal",
      email: "jean.dupont@example.com",
    },
  },
  {
    id: "ORD-2023-1042",
    date: "2023-10-15T16:45:00Z",
    total: 64.99,
    status: "processing",
    items: [
      {
        id: 5,
        name: "Pull en cachemire",
        quantity: 1,
        price: 89.99,
        image: "/images/products/pull-femme-cachemire.jpg",
      },
    ],
    shipping: {
      method: "standard",
      price: 4.99,
      address: {
        firstName: "Jean",
        lastName: "Dupont",
        address: "12 rue de Paris",
        city: "Paris",
        postalCode: "75001",
        country: "France",
      },
    },
    payment: {
      method: "card",
      lastFour: "1234",
    },
  },
];

// Mapping des statuts pour affichage
const STATUS_MAP = {
  processing: {
    label: "En cours de traitement",
    color: "bg-blue-100 text-blue-700",
    icon: Package2,
  },
  shipped: {
    label: "Expédié",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
  },
  delivered: {
    label: "Livré",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Annulé",
    color: "bg-red-100 text-red-700",
    icon: AlertCircle,
  },
};

// Génération des métadonnées statiques
export const metadata = {
  title: "Historique des commandes | E-Commerce",
  description: "Consultez l'historique de vos commandes et leur statut",
  robots: {
    index: false,
    follow: true,
  },
};

export default function OrdersPage() {
  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Formater le prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mes commandes</h1>
          <p className="text-muted-foreground">
            Consultez le statut et l'historique de vos commandes
          </p>
        </div>

        {/* Recherche de commande (optionnelle) */}
        <div className="hidden md:flex w-64 relative">
          <input
            type="text"
            placeholder="Rechercher une commande"
            className="w-full py-2 pl-10 pr-4 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-6">
        {ORDERS.map((order) => {
          const StatusIcon = STATUS_MAP[order.status]?.icon || Package2;

          return (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              {/* En-tête de la commande */}
              <div className="bg-gray-50 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Commande n°
                  </div>
                  <div className="font-semibold">{order.id}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Date</div>
                  <div>{formatDate(order.date)}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Total
                  </div>
                  <div className="font-semibold">
                    {formatPrice(order.total)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Statut
                  </div>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_MAP[order.status]?.color || "bg-gray-100"
                    }`}
                  >
                    <StatusIcon className="h-3.5 w-3.5 mr-1" />
                    {STATUS_MAP[order.status]?.label || "Inconnu"}
                  </div>
                </div>

                <Link
                  href={`/account/orders/${order.id}`}
                  className="ml-auto flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Voir les détails
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Aperçu des articles */}
              <div className="p-4 md:p-6">
                <h3 className="font-medium mb-3">Articles</h3>
                <div className="space-y-4">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Quantité: {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {order.items.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      + {order.items.length - 2} articles supplémentaires
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 p-4 md:p-6 flex flex-wrap gap-3 border-t">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium"
                >
                  Voir les détails
                </Link>

                {order.status === "delivered" && (
                  <button className="px-4 py-2 border rounded-md text-sm font-medium">
                    Acheter à nouveau
                  </button>
                )}

                {order.status === "processing" || order.status === "shipped" ? (
                  <button className="px-4 py-2 border rounded-md text-sm font-medium">
                    Suivre la livraison
                  </button>
                ) : null}

                <button className="px-4 py-2 border rounded-md text-sm font-medium ml-auto">
                  Besoin d'aide ?
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Si aucune commande */}
      {ORDERS.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Package2 className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Aucune commande</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Vous n'avez pas encore passé de commande. Parcourez notre boutique
            pour découvrir nos produits.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md font-medium"
          >
            Découvrir notre boutique
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
