"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Bell,
  BellOff,
  CalendarClock,
  Check,
  Loader2,
  PackageCheck,
  PackageX,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

type ProductStockDisplayProps = {
  productId: string;
  productName: string;
  onStockCheck?: (isAvailable: boolean, quantity: number) => void;
};

export default function ProductStockDisplay({
  productId,
  productName,
  onStockCheck,
}: ProductStockDisplayProps) {
  const { toast } = useToast();
  const [notificationEmail, setNotificationEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<
    "backInStock" | "preOrder"
  >("backInStock");
  const [formError, setFormError] = useState("");

  const {
    fetchProductStock,
    getAvailableStock,
    getStockLevel,
    isBackorderable,
    getRestockDate,
    hasNotification,
    registerStockNotification,
    isLoading,
  } = useInventoryStore();

  // Obtenir les informations de stock
  const stockLevel = getStockLevel(productId);
  const availableStock = getAvailableStock(productId);
  const backorderable = isBackorderable(productId);
  const restockDate = getRestockDate(productId);
  const hasActiveNotification = hasNotification(productId, notificationEmail);

  // Charger les données de stock au montage du composant
  useState(() => {
    fetchProductStock(productId);
    // Notifier le parent du statut du stock si nécessaire
    if (onStockCheck) {
      onStockCheck(stockLevel !== "outOfStock", availableStock);
    }
  });

  // Ouvrir le modal de notification
  const openNotificationDialog = (type: "backInStock" | "preOrder") => {
    setNotificationType(type);
    setNotificationEmail("");
    setFormError("");
    setNotificationOpen(true);
  };

  // Soumettre une demande de notification
  const handleNotificationSubmit = async () => {
    // Valider l'email
    if (!notificationEmail || !/^\S+@\S+\.\S+$/.test(notificationEmail)) {
      setFormError("Veuillez entrer une adresse email valide");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const success = await registerStockNotification(
        productId,
        productName,
        notificationEmail,
        notificationType
      );

      if (success) {
        toast({
          title: "Notification enregistrée",
          description:
            notificationType === "backInStock"
              ? "Vous serez notifié lorsque ce produit sera à nouveau en stock."
              : "Vous serez notifié lorsque ce produit sera disponible en précommande.",
          duration: 3000,
        });
        setNotificationOpen(false);
      } else {
        setFormError(
          "Impossible d'enregistrer votre notification. Veuillez réessayer."
        );
      }
    } catch (error) {
      setFormError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonctions d'affichage conditionnel
  const renderStockBadge = () => {
    switch (stockLevel) {
      case "normal":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <PackageCheck className="w-3.5 h-3.5 mr-1" />
            En Stock
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Stock Limité
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Presque Épuisé
          </Badge>
        );
      case "outOfStock":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <PackageX className="w-3.5 h-3.5 mr-1" />
            Rupture de Stock
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderQuantityIndicator = () => {
    if (stockLevel === "outOfStock") return null;

    if (stockLevel === "normal") {
      return (
        <span className="text-sm text-gray-600">
          <Check className="inline-block w-4 h-4 mr-1 text-green-600" />
          Disponible
        </span>
      );
    }

    return (
      <span className="text-sm text-gray-600">
        {availableStock === 1
          ? "Dernier exemplaire !"
          : `Plus que ${availableStock} en stock !`}
      </span>
    );
  };

  const renderBackorderInfo = () => {
    if (stockLevel !== "outOfStock" || !backorderable) return null;

    return (
      <div className="mt-2">
        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertDescription className="flex items-center">
            <CalendarClock className="w-4 h-4 mr-2" />
            <span>
              Disponible en précommande
              {restockDate && (
                <span className="font-medium">
                  {" "}
                  (livraison prévue le{" "}
                  {format(restockDate, "dd MMMM yyyy", { locale: fr })})
                </span>
              )}
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  const renderActionButton = () => {
    if (isLoading) {
      return (
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Vérification du stock...
        </div>
      );
    }

    if (stockLevel === "outOfStock") {
      return backorderable ? (
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => openNotificationDialog("preOrder")}
        >
          <Bell className="w-4 h-4 mr-2" />
          Précommander
        </Button>
      ) : (
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => openNotificationDialog("backInStock")}
        >
          <Bell className="w-4 h-4 mr-2" />
          M'avertir quand disponible
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-2">
        {renderStockBadge()}
        {renderQuantityIndicator()}
      </div>

      {renderBackorderInfo()}
      {renderActionButton()}

      {/* Dialog de notification */}
      <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {notificationType === "backInStock"
                ? "Être notifié du retour en stock"
                : "Être notifié pour précommande"}
            </DialogTitle>
            <DialogDescription>
              {notificationType === "backInStock"
                ? "Recevez un email dès que ce produit est à nouveau disponible."
                : "Recevez un email dès que ce produit est disponible en précommande."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                htmlFor="notification-email"
                className="text-sm font-medium"
              >
                Adresse email
              </label>
              <Input
                id="notification-email"
                type="email"
                placeholder="votre@email.com"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                className="col-span-3"
              />
              {formError && <p className="text-sm text-red-500">{formError}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotificationOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={handleNotificationSubmit}
              disabled={isSubmitting || hasActiveNotification}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : hasActiveNotification ? (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Déjà notifié
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  M'avertir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
