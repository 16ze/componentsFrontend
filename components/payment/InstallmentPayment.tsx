"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertCircle,
  Calendar,
  Check,
  CreditCard,
  DollarSign,
  Loader2,
  Calculator,
  CalendarClock,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { format, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { stripeConnector } from "@/lib/payment/stripeConnector";
import { cn } from "@/lib/utils";

// Types pour les plans de paiement fractionné
type InstallmentPlan = {
  id: string;
  name: string;
  installments: number;
  firstPaymentPercentage: number;
  interestRate: number;
  provider: "stripe" | "paypal" | "klarna" | "affirm" | "alma" | "scalapay";
  providerName: string;
  providerLogo: string;
  minAmount?: number;
  maxAmount?: number;
};

// Types pour les options de paiement
type InstallmentPaymentOptions = {
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerId?: string;
  onPlanSelected?: (planId: string, installments: number) => void;
  onPaymentStarted?: () => void;
  onPaymentCompleted?: (result: {
    success: boolean;
    paymentId?: string;
    error?: string;
  }) => void;
  onCancel?: () => void;
};

// Schéma de validation
const installmentFormSchema = z.object({
  plan: z.string().min(1, "Veuillez sélectionner un plan de paiement"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions générales",
  }),
});

export default function InstallmentPayment({
  amount,
  currency = "EUR",
  customerEmail = "",
  customerId = "",
  onPlanSelected,
  onPaymentStarted,
  onPaymentCompleted,
  onCancel,
}: InstallmentPaymentOptions) {
  const { toast } = useToast();
  const [availablePlans, setAvailablePlans] = useState<InstallmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan | null>(
    null
  );
  const [installmentBreakdown, setInstallmentBreakdown] = useState<
    {
      date: Date;
      amount: number;
    }[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Formulaire
  const form = useForm<z.infer<typeof installmentFormSchema>>({
    resolver: zodResolver(installmentFormSchema),
    defaultValues: {
      plan: "",
      terms: false,
    },
  });

  // Charger les plans disponibles
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        // En production, ceci serait une vraie API pour récupérer les plans disponibles
        // pour la région du client et le montant de la commande
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Plans fictifs pour la démo
        const mockPlans: InstallmentPlan[] = [
          {
            id: "stripe-installments-4",
            name: "Payer en 4 fois",
            installments: 4,
            firstPaymentPercentage: 25,
            interestRate: 0,
            provider: "stripe",
            providerName: "Stripe",
            providerLogo: "/images/payment/stripe.svg",
            minAmount: 50,
            maxAmount: 2000,
          },
          {
            id: "klarna-installments-3",
            name: "Paiement en 3 fois sans frais",
            installments: 3,
            firstPaymentPercentage: 33.33,
            interestRate: 0,
            provider: "klarna",
            providerName: "Klarna",
            providerLogo: "/images/payment/klarna.svg",
            minAmount: 35,
            maxAmount: 1500,
          },
          {
            id: "alma-installments-10",
            name: "Paiement en 10 fois",
            installments: 10,
            firstPaymentPercentage: 10,
            interestRate: 2.5,
            provider: "alma",
            providerName: "Alma",
            providerLogo: "/images/payment/alma.svg",
            minAmount: 100,
            maxAmount: 3000,
          },
          {
            id: "paypal-later",
            name: "Payez plus tard (30 jours)",
            installments: 1,
            firstPaymentPercentage: 0,
            interestRate: 0,
            provider: "paypal",
            providerName: "PayPal",
            providerLogo: "/images/payment/paypal.svg",
            minAmount: 15,
            maxAmount: 1000,
          },
        ];

        // Filtrer les plans en fonction du montant
        const filteredPlans = mockPlans.filter(
          (plan) =>
            (!plan.minAmount || amount >= plan.minAmount) &&
            (!plan.maxAmount || amount <= plan.maxAmount)
        );

        setAvailablePlans(filteredPlans);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des plans de paiement fractionné:",
          error
        );
        toast({
          title: "Erreur",
          description:
            "Impossible de charger les options de paiement fractionné",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [amount, toast]);

  // Mise à jour du plan sélectionné
  const updateSelectedPlan = (planId: string) => {
    const plan = availablePlans.find((p) => p.id === planId);
    setSelectedPlan(plan || null);

    if (plan) {
      // Calculer le découpage des paiements
      const firstPaymentAmount = (amount * plan.firstPaymentPercentage) / 100;
      const remainingAmount = amount - firstPaymentAmount;
      const remainingInstallments = plan.installments - 1;

      // Si c'est un paiement à l'échéance (comme PayPal Later)
      if (plan.installments === 1 && plan.firstPaymentPercentage === 0) {
        setInstallmentBreakdown([
          {
            date: addMonths(new Date(), 1),
            amount: amount,
          },
        ]);
        return;
      }

      // Sinon, calculer les versements
      const installmentAmount = remainingAmount / remainingInstallments;

      // Générer l'échéancier
      const breakdown = [];

      // Premier versement
      if (plan.firstPaymentPercentage > 0) {
        breakdown.push({
          date: new Date(),
          amount: firstPaymentAmount,
        });
      }

      // Versements suivants
      for (let i = 0; i < remainingInstallments; i++) {
        breakdown.push({
          date: addMonths(new Date(), i + 1),
          amount: installmentAmount * (1 + plan.interestRate / 100),
        });
      }

      setInstallmentBreakdown(breakdown);

      // Notifier le parent
      if (onPlanSelected) {
        onPlanSelected(planId, plan.installments);
      }
    }
  };

  // Soumission du formulaire
  const onSubmit = async (values: z.infer<typeof installmentFormSchema>) => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    if (onPaymentStarted) {
      onPaymentStarted();
    }

    try {
      // Exemple avec Stripe (à adapter pour les autres fournisseurs)
      if (selectedPlan.provider === "stripe") {
        const result = await stripeConnector.createInstallmentPlan(
          amount * 100, // Stripe utilise des centimes
          currency,
          selectedPlan.installments,
          {
            receipt_email: customerEmail,
            customer_id: customerId,
            metadata: {
              plan_id: selectedPlan.id,
              installments: selectedPlan.installments.toString(),
              provider: selectedPlan.provider,
            },
          }
        );

        if (result.success && result.clientSecret) {
          // Simuler un traitement réussi pour la démo
          await new Promise((resolve) => setTimeout(resolve, 1500));

          if (onPaymentCompleted) {
            onPaymentCompleted({
              success: true,
              paymentId: `inst_${Date.now()}`,
            });
          }
        } else {
          throw new Error(
            result.error?.message ||
              "Erreur lors de la création du plan de paiement"
          );
        }
      } else {
        // Simuler un traitement réussi pour les autres fournisseurs
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (onPaymentCompleted) {
          onPaymentCompleted({
            success: true,
            paymentId: `inst_${selectedPlan.provider}_${Date.now()}`,
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors du traitement du paiement fractionné:", error);

      toast({
        title: "Erreur de paiement",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du traitement du paiement",
        variant: "destructive",
      });

      if (onPaymentCompleted) {
        onPaymentCompleted({
          success: false,
          error: error instanceof Error ? error.message : "Erreur de paiement",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Formatage du montant
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  // Rendu des plans disponibles
  const renderPlans = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (availablePlans.length === 0) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucune option de paiement fractionné n'est disponible pour ce
            montant.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <RadioGroup
        defaultValue={form.getValues().plan}
        onValueChange={(value) => {
          form.setValue("plan", value, { shouldValidate: true });
          updateSelectedPlan(value);
        }}
        className="grid gap-4 mt-2"
      >
        {availablePlans.map((plan) => {
          // Calculer le premier versement et le montant des versements suivants
          const firstPayment = (amount * plan.firstPaymentPercentage) / 100;
          const remainingAmount = amount - firstPayment;
          const remainingInstallments = plan.installments - 1;
          const installmentAmount =
            remainingInstallments > 0
              ? remainingAmount / remainingInstallments
              : remainingAmount;

          // Montant avec intérêts si applicable
          const withInterest = plan.interestRate > 0;
          const interestAmount = installmentAmount * (plan.interestRate / 100);
          const installmentWithInterest = installmentAmount + interestAmount;
          const totalWithInterest =
            firstPayment + installmentWithInterest * remainingInstallments;
          const interestTotalAmount = totalWithInterest - amount;

          return (
            <Label
              key={plan.id}
              className={cn(
                "flex flex-col sm:flex-row items-start p-4 border rounded-lg cursor-pointer transition",
                form.getValues().plan === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              htmlFor={plan.id}
            >
              <div className="flex items-start w-full">
                <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full ml-3 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <div className="font-medium">{plan.name}</div>
                      <div className="ml-2 h-5 w-auto">
                        <img
                          src={plan.providerLogo}
                          alt={plan.providerName}
                          className="h-5 w-auto object-contain"
                        />
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {plan.installments === 1
                        ? "Payez dans 30 jours"
                        : `Payez en ${plan.installments} fois`}
                      {withInterest && ` (${plan.interestRate}% d'intérêts)`}
                    </div>
                  </div>

                  <div className="font-medium text-right">
                    {plan.installments === 1 ? (
                      formatAmount(amount)
                    ) : (
                      <div className="space-y-1">
                        {firstPayment > 0 && (
                          <div className="text-sm">
                            Aujourd'hui :{" "}
                            <span className="font-semibold">
                              {formatAmount(firstPayment)}
                            </span>
                          </div>
                        )}
                        <div className="text-sm">
                          {remainingInstallments} ×{" "}
                          <span className="font-semibold">
                            {formatAmount(installmentWithInterest)}
                          </span>
                        </div>
                        {withInterest && (
                          <div className="text-xs text-muted-foreground">
                            Total : {formatAmount(totalWithInterest)} (+
                            {formatAmount(interestTotalAmount)})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Label>
          );
        })}
      </RadioGroup>
    );
  };

  // Rendu de l'échéancier des paiements
  const renderInstallmentBreakdown = () => {
    if (!selectedPlan || installmentBreakdown.length === 0) {
      return null;
    }

    return (
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium mb-3 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Échéancier des paiements
        </h4>

        <div className="space-y-2">
          {installmentBreakdown.map((payment, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 rounded-md bg-muted/50"
            >
              <div className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {index === 0 &&
                  payment.date.getTime() === new Date().setHours(0, 0, 0, 0)
                    ? "Aujourd'hui"
                    : format(payment.date, "dd MMMM yyyy", { locale: fr })}
                </span>
              </div>
              <div className="font-medium">{formatAmount(payment.amount)}</div>
            </div>
          ))}
        </div>

        {selectedPlan.interestRate > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Taux débiteur fixe : {selectedPlan.interestRate}%. TAEG :{" "}
              {(selectedPlan.interestRate * 1.1).toFixed(2)}%.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="installment-payment w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="plan"
              render={() => (
                <FormItem>
                  <div className="space-y-2">
                    <FormLabel className="text-base font-semibold flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Options de paiement fractionné
                    </FormLabel>
                    <FormDescription>
                      Choisissez comment vous souhaitez répartir votre paiement
                      de {formatAmount(amount)}
                    </FormDescription>
                  </div>

                  <FormControl>{renderPlans()}</FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {renderInstallmentBreakdown()}

            <Separator className="my-6" />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        id="terms"
                        className="h-4 w-4 border-gray-300 rounded"
                      />
                    </div>
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="terms" className="text-sm font-normal">
                      J'accepte les conditions générales de paiement fractionné
                    </FormLabel>
                    <FormDescription>
                      En continuant, vous acceptez les conditions générales de{" "}
                      {selectedPlan?.providerName || "paiement fractionné"}.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={
                isProcessing ||
                !form.getValues().plan ||
                !form.getValues().terms
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <ReceiptText className="mr-2 h-4 w-4" />
                  Confirmer le paiement fractionné
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
