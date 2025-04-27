import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useSubscriptionStore,
  PlanPeriod,
  Plan,
} from "@/stores/subscriptionStore";
import { Check, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Définition du schéma de validation pour le formulaire
const subscriptionFormSchema = z.object({
  planId: z.string().min(1, "Veuillez sélectionner un plan"),
  period: z.enum(["monthly", "yearly"], {
    required_error: "Veuillez sélectionner une période de facturation",
  }),
  paymentMethod: z.enum(["new", "existing"], {
    required_error: "Veuillez sélectionner une méthode de paiement",
  }),
  paymentMethodId: z.string().optional(),
  cardNumber: z.string().optional(),
  cardHolder: z.string().optional(),
  expiry: z.string().optional(),
  cvc: z.string().optional(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

interface SubscriptionFormProps {
  initialPlanId?: string;
}

export default function SubscriptionForm({
  initialPlanId,
}: SubscriptionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    plans,
    fetchPlans,
    isLoading,
    subscribeToPlan,
    selectedPeriod,
    setPeriodSelection,
  } = useSubscriptionStore();
  const [paymentMethods, setPaymentMethods] = useState<
    { id: string; brand: string; last4: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les valeurs par défaut
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      planId: initialPlanId || "",
      period: selectedPeriod,
      paymentMethod: "new",
    },
  });

  // Observer la valeur de period pour mettre à jour le store
  const watchPeriod = form.watch("period");

  useEffect(() => {
    setPeriodSelection(watchPeriod as PlanPeriod);
  }, [watchPeriod, setPeriodSelection]);

  // Charger les plans et les méthodes de paiement au chargement
  useEffect(() => {
    fetchPlans();

    // Normalement, charger les méthodes de paiement enregistrées depuis l'API
    const fetchPaymentMethods = async () => {
      try {
        // Remplacer par un appel API réel
        // const response = await fetch('/api/payment-methods');
        // const data = await response.json();
        // setPaymentMethods(data);

        // Exemples de méthodes de paiement
        setPaymentMethods([
          { id: "pm_1234567890", brand: "visa", last4: "4242" },
          { id: "pm_0987654321", brand: "mastercard", last4: "9876" },
        ]);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des méthodes de paiement",
          error
        );
      }
    };

    fetchPaymentMethods();
  }, [fetchPlans]);

  // Soumission du formulaire
  const onSubmit = async (data: SubscriptionFormValues) => {
    setIsSubmitting(true);

    let paymentMethodId = data.paymentMethodId;

    // Si c'est une nouvelle carte, créer d'abord la méthode de paiement
    if (data.paymentMethod === "new") {
      try {
        // Simuler l'ajout d'une méthode de paiement
        // Normalement, vous utiliseriez Stripe Elements ou une autre bibliothèque

        // Exemple:
        // const { error, paymentMethod } = await stripe.createPaymentMethod({
        //   type: 'card',
        //   card: cardElement,
        // });

        // Simuler pour cet exemple
        paymentMethodId = `pm_new_${Date.now()}`;
      } catch (error) {
        console.error(
          "Erreur lors de la création de la méthode de paiement",
          error
        );
        toast({
          title: "Erreur de paiement",
          description: "Impossible de traiter votre carte. Veuillez réessayer.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    if (!paymentMethodId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner ou ajouter une méthode de paiement",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Souscrire au plan
    const success = await subscribeToPlan(
      data.planId,
      data.period as PlanPeriod,
      paymentMethodId
    );

    if (success) {
      router.push("/account/subscriptions/confirmation");
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedPlan = plans.find(
    (plan) => plan.id === form.getValues("planId")
  );
  const periodPrice =
    form.getValues("period") === "monthly"
      ? selectedPlan?.monthlyPrice
      : selectedPlan?.yearlyPrice;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Sélection du plan */}
        <FormField
          control={form.control}
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} -{" "}
                      {plan.period === "monthly"
                        ? plan.monthlyPrice
                        : plan.yearlyPrice}
                      €/{plan.period === "monthly" ? "mois" : "an"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Période de facturation */}
        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Période de facturation</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="monthly" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Mensuel - {selectedPlan?.monthlyPrice || "--"}€/mois
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yearly" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Annuel - {selectedPlan?.yearlyPrice || "--"}€/an
                      {selectedPlan && (
                        <span className="text-sm text-green-600 ml-2">
                          Économisez{" "}
                          {Math.round(
                            100 -
                              (selectedPlan.yearlyPrice /
                                (selectedPlan.monthlyPrice * 12)) *
                                100
                          )}
                          %
                        </span>
                      )}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Carte récapitulative */}
        {selectedPlan && (
          <Card className="bg-muted/40">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
              <CardDescription>Détails de votre abonnement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Facturation</span>
                <span className="font-medium">
                  {form.getValues("period") === "monthly"
                    ? "Mensuelle"
                    : "Annuelle"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Prix</span>
                <span className="font-medium">
                  {periodPrice}€/
                  {form.getValues("period") === "monthly" ? "mois" : "an"}
                </span>
              </div>
              {selectedPlan.trialDays && (
                <div className="flex justify-between text-green-600">
                  <span>Période d'essai</span>
                  <span className="font-medium">
                    {selectedPlan.trialDays} jours
                  </span>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="flex justify-between font-bold">
                  <span>Total à payer aujourd'hui</span>
                  <span>
                    {selectedPlan.trialDays ? "0€" : `${periodPrice}€`}
                  </span>
                </div>
                {selectedPlan.trialDays && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Votre carte sera débitée de {periodPrice}€ après la période
                    d'essai de {selectedPlan.trialDays} jours, sauf si vous
                    annulez avant.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Méthode de paiement */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Méthode de paiement</h2>

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-3"
                  >
                    {paymentMethods.length > 0 && (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="existing" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer w-full">
                          Utiliser une carte existante
                        </FormLabel>
                      </FormItem>
                    )}

                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="new" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer w-full">
                        Ajouter une nouvelle carte
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cartes existantes */}
          {form.getValues("paymentMethod") === "existing" &&
            paymentMethods.length > 0 && (
              <FormField
                control={form.control}
                name="paymentMethodId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        {paymentMethods.map((method) => (
                          <FormItem
                            key={method.id}
                            className="flex items-center space-x-3 space-y-0 border rounded-md p-3"
                          >
                            <FormControl>
                              <RadioGroupItem value={method.id} />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span className="capitalize">
                                {method.brand}
                              </span>{" "}
                              •••• {method.last4}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

          {/* Nouvelle carte */}
          {form.getValues("paymentMethod") === "new" && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cardHolder">Titulaire de la carte</Label>
                <Input
                  id="cardHolder"
                  placeholder="Nom du titulaire"
                  {...form.register("cardHolder")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cardNumber">Numéro de carte</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  {...form.register("cardNumber")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiry">Date d'expiration</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    {...form.register("expiry")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" {...form.register("cvc")} />
                </div>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-2" />
                Ces données de carte sont factices pour la démonstration.
              </div>
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2">Traitement en cours...</span>
              <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
            </>
          ) : selectedPlan?.trialDays ? (
            `Commencer l'essai gratuit de ${selectedPlan.trialDays} jours`
          ) : (
            "Souscrire maintenant"
          )}
        </Button>

        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          Paiement sécurisé
        </div>
      </form>
    </Form>
  );
}
