"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Calendar, Clock, CheckCircle } from "lucide-react";
import { useBookingStore } from "@/stores/bookingStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schéma de validation Zod pour le formulaire
const bookingFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide",
  }),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(?:\+33|0)[1-9](?:[\s.-]?[0-9]{2}){4}$/.test(val),
      {
        message: "Veuillez entrer un numéro de téléphone français valide",
      }
    ),
  notes: z
    .string()
    .max(500, {
      message: "Les notes ne doivent pas dépasser 500 caractères",
    })
    .optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions générales",
  }),
});

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { bookingDetails, resetBooking } = useBookingStore();

  // Configuration du formulaire avec react-hook-form
  const form = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
      termsAccepted: false,
    },
  });

  // Vérifier si les détails de réservation sont disponibles
  if (!bookingDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Veuillez d'abord sélectionner une date et un horaire
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Retournez à l'étape précédente pour choisir un créneau de
            rendez-vous.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => document.getElementById("calendar-tab")?.click()}
          >
            Sélectionner un créneau
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Soumission du formulaire
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Combiner les données du formulaire avec les détails de réservation
      const bookingData = {
        ...data,
        ...bookingDetails,
      };

      console.log("Données de réservation complètes:", bookingData);

      // Notification de succès
      toast.success("Votre réservation a été confirmée !");
      setIsSubmitted(true);

      // Réinitialiser après un délai
      setTimeout(() => {
        resetBooking();
        form.reset();
      }, 5000);
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      toast.error("Une erreur est survenue lors de la réservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher la confirmation si soumis
  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Réservation confirmée !</CardTitle>
          <CardDescription>
            Votre rendez-vous a été enregistré avec succès
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-300" />
          </div>

          <h3 className="text-xl font-semibold mb-2">
            Merci pour votre réservation
          </h3>

          <div className="space-y-2 mt-4 max-w-md text-left">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>
                {format(bookingDetails.date, "EEEE d MMMM yyyy", {
                  locale: fr,
                })}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>
                {bookingDetails.time} ({bookingDetails.duration} min)
              </span>
            </div>
          </div>

          <p className="mt-6 text-muted-foreground">
            Un email de confirmation a été envoyé à votre adresse email.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              resetBooking();
              setIsSubmitted(false);
              form.reset();
            }}
          >
            Faire une nouvelle réservation
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Formulaire de réservation
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vos informations</CardTitle>
        <CardDescription>
          Complétez vos coordonnées pour finaliser la réservation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Récapitulatif de la réservation */}
        <Alert className="mb-6">
          <div className="flex flex-col space-y-1">
            <AlertTitle>Récapitulatif de votre rendez-vous</AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-sm">Type:</div>
                <div className="text-sm font-medium">
                  {bookingDetails.type.name}
                </div>

                <div className="text-sm">Date:</div>
                <div className="text-sm font-medium">
                  {format(bookingDetails.date, "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                </div>

                <div className="text-sm">Heure:</div>
                <div className="text-sm font-medium">{bookingDetails.time}</div>

                <div className="text-sm">Durée:</div>
                <div className="text-sm font-medium">
                  {bookingDetails.duration} minutes
                </div>
              </div>
            </AlertDescription>
          </div>
        </Alert>

        {/* Formulaire */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jean.dupont@exemple.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Téléphone{" "}
                      <span className="text-muted-foreground text-xs">
                        (optionnel)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="06 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes{" "}
                    <span className="text-muted-foreground text-xs">
                      (optionnel)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations supplémentaires pour votre rendez-vous"
                      className="resize-none min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ajoutez des informations complémentaires si nécessaire
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      J'accepte les conditions générales d'utilisation
                    </FormLabel>
                    <FormDescription>
                      En cochant cette case, vous acceptez nos{" "}
                      <a href="#" className="text-primary underline">
                        conditions générales
                      </a>{" "}
                      et notre{" "}
                      <a href="#" className="text-primary underline">
                        politique de confidentialité
                      </a>
                      .
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmation en cours...
                </>
              ) : (
                "Confirmer la réservation"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
