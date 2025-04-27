"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  CreditCard,
  PlusCircle,
  ArrowRight,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StripePaymentMethod } from "@/lib/payment/stripeConnector";
import { PayPalPaymentSource } from "@/lib/payment/paypalConnector";
import { stripeConnector } from "@/lib/payment/stripeConnector";
import { paypalConnector } from "@/lib/payment/paypalConnector";

type SavedPaymentMethod = {
  id: string;
  type: "card" | "paypal" | "applepay" | "googlepay";
  label: string;
  details: string;
  expiryDate?: string;
  icon: string;
  isDefault?: boolean;
};

type SavedPaymentMethodsProps = {
  customerId: string;
  onSelect?: (methodId: string, methodType: string) => void;
  onDelete?: (methodId: string) => void;
  onNewMethod?: () => void;
  readOnly?: boolean;
  selectedMethodId?: string;
};

export default function SavedPaymentMethods({
  customerId,
  onSelect,
  onDelete,
  onNewMethod,
  readOnly = false,
  selectedMethodId,
}: SavedPaymentMethodsProps) {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Charger les méthodes de paiement sauvegardées
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true);

      try {
        // Charger les cartes depuis Stripe
        const stripeResult = await stripeConnector.getSavedPaymentMethods(
          customerId
        );

        // Charger les comptes PayPal
        const paypalResult = await paypalConnector.getSavedPaymentSources(
          customerId
        );

        // Formater les résultats
        const methods: SavedPaymentMethod[] = [];

        // Ajouter les cartes Stripe
        if (stripeResult.success && stripeResult.paymentMethods) {
          stripeResult.paymentMethods.forEach((method: StripePaymentMethod) => {
            if (method.card) {
              methods.push({
                id: method.id,
                type: "card",
                label: `${method.card.brand.toUpperCase()} se terminant par ${
                  method.card.last4
                }`,
                details: `${method.billingDetails.name}`,
                expiryDate: `${method.card.expMonth}/${method.card.expYear}`,
                icon: `/images/payment/${method.card.brand.toLowerCase()}.svg`,
                isDefault: false,
              });
            }
          });
        }

        // Ajouter les comptes PayPal
        if (paypalResult.success && paypalResult.sources) {
          paypalResult.sources.forEach((source: PayPalPaymentSource) => {
            methods.push({
              id: source.id,
              type: "paypal",
              label: "Compte PayPal",
              details: source.email || source.name,
              icon: "/images/payment/paypal.svg",
              isDefault: false,
            });
          });
        }

        // Si aucune méthode n'est présente, simuler des données pour la démo
        if (methods.length === 0) {
          methods.push(
            {
              id: "pm_mock_visa",
              type: "card",
              label: "VISA se terminant par 4242",
              details: "Jean Dupont",
              expiryDate: "12/2025",
              icon: "/images/payment/visa.svg",
              isDefault: true,
            },
            {
              id: "pm_mock_mastercard",
              type: "card",
              label: "MASTERCARD se terminant par 8210",
              details: "Jean Dupont",
              expiryDate: "03/2026",
              icon: "/images/payment/mastercard.svg",
              isDefault: false,
            },
            {
              id: "pm_mock_paypal",
              type: "paypal",
              label: "Compte PayPal",
              details: "jean.dupont@example.com",
              icon: "/images/payment/paypal.svg",
              isDefault: false,
            }
          );
        }

        setPaymentMethods(methods);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des méthodes de paiement:",
          error
        );
        toast({
          title: "Erreur",
          description:
            "Impossible de charger vos méthodes de paiement enregistrées",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      fetchPaymentMethods();
    } else {
      setIsLoading(false);
    }
  }, [customerId, toast]);

  // Supprimer une méthode de paiement
  const handleDeleteMethod = async (methodId: string, methodType: string) => {
    if (isDeletingId) return;

    setIsDeletingId(methodId);

    try {
      let success = false;

      if (methodType === "card") {
        const result = await stripeConnector.deletePaymentMethod(methodId);
        success = result.success;
      } else if (methodType === "paypal") {
        // Simuler la suppression pour PayPal (à implémenter avec l'API réelle)
        await new Promise((resolve) => setTimeout(resolve, 500));
        success = true;
      }

      if (success) {
        setPaymentMethods((methods) =>
          methods.filter((m) => m.id !== methodId)
        );

        toast({
          title: "Méthode de paiement supprimée",
          description: "Votre méthode de paiement a été supprimée avec succès",
        });

        if (onDelete) {
          onDelete(methodId);
        }
      } else {
        throw new Error("Échec de la suppression");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la méthode de paiement:",
        error
      );
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cette méthode de paiement",
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  // Sélectionner une méthode de paiement
  const handleSelectMethod = (methodId: string, methodType: string) => {
    if (onSelect && !readOnly) {
      onSelect(methodId, methodType);
    }
  };

  // Ajouter une nouvelle méthode de paiement
  const handleAddNewMethod = () => {
    if (onNewMethod && !readOnly) {
      onNewMethod();
    }
  };

  // Rendu d'une méthode de paiement
  const renderPaymentMethod = (method: SavedPaymentMethod) => {
    const isDeleting = isDeletingId === method.id;
    const isSelected = selectedMethodId === method.id;

    return (
      <motion.div
        key={method.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`mb-3 ${isSelected ? "border-primary" : ""} ${
            readOnly ? "opacity-75" : ""
          }`}
        >
          <CardContent className="p-4 flex justify-between items-center">
            <div
              className="flex items-center space-x-4"
              onClick={() => handleSelectMethod(method.id, method.type)}
            >
              <div className="h-10 w-16 flex items-center justify-center">
                <img
                  src={method.icon}
                  alt={method.type}
                  className="max-h-8 max-w-full"
                />
              </div>

              <div>
                <p className="font-medium flex items-center">
                  {method.label}
                  {method.isDefault && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Par défaut
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {method.details}
                  {method.expiryDate && ` • Exp. ${method.expiryDate}`}
                </p>
              </div>
            </div>

            {!readOnly && (
              <div className="flex space-x-2">
                {isDeleting ? (
                  <Button size="sm" variant="ghost" disabled>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteMethod(method.id, method.type)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {!readOnly && !isSelected && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSelectMethod(method.id, method.type)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="payment-methods-container">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl">
          Moyens de paiement enregistrés
        </CardTitle>
        <CardDescription>
          Gérez vos moyens de paiement enregistrés en toute sécurité
        </CardDescription>
      </CardHeader>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="py-6 text-center">
          <div className="rounded-full bg-muted w-12 h-12 mx-auto flex items-center justify-center mb-3">
            <CreditCard className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">Aucun moyen de paiement</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Vous n'avez pas encore enregistré de moyen de paiement
          </p>
          {!readOnly && (
            <Button onClick={handleAddNewMethod}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter un moyen de paiement
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <AnimatePresence>
              {paymentMethods.map(renderPaymentMethod)}
            </AnimatePresence>
          </div>

          {!readOnly && (
            <>
              <Separator className="my-4" />
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleAddNewMethod}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter un autre moyen de paiement
                </Button>
              </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t flex items-center text-xs text-muted-foreground">
            <Shield className="h-4 w-4 mr-2" />
            Vos données de paiement sont protégées et cryptées
          </div>
        </>
      )}
    </div>
  );
}
