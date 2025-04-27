import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useBookingStore } from "@/stores/bookingStore";

const bookingSchema = z.object({
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  time: z.string({
    required_error: "Veuillez sélectionner une heure",
  }),
  service: z.string({
    required_error: "Veuillez sélectionner un service",
  }),
  clientName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  clientEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide",
  }),
  clientPhone: z
    .string()
    .min(10, {
      message: "Veuillez entrer un numéro de téléphone valide",
    })
    .optional(),
  message: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

// Les services proposés
const services = [
  { id: "consultation", name: "Consultation" },
  { id: "coaching", name: "Séance de coaching" },
  { id: "workshop", name: "Atelier collectif" },
];

export function BookingForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    availableSlots,
    selectedDate,
    isLoading,
    error,
    createBooking,
    fetchAvailableSlots,
    setSelectedDate,
    clearError,
  } = useBookingStore();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: undefined,
      time: "",
      service: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      message: "",
    },
  });

  // Récupérer les créneaux disponibles lorsque la date change
  useEffect(() => {
    const date = form.watch("date");
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      fetchAvailableSlots(formattedDate);
    }
  }, [form.watch("date")]);

  // Gérer les erreurs du store
  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  async function onSubmit(values: BookingFormValues) {
    setIsSubmitting(true);
    try {
      await createBooking({
        date: format(values.date, "yyyy-MM-dd"),
        time: values.time,
        service: values.service,
        clientName: values.clientName,
        clientEmail: values.clientEmail,
        clientPhone: values.clientPhone,
        message: values.message,
      });

      // Réinitialiser le formulaire après soumission réussie
      form.reset();

      // Afficher un message de succès
      toast({
        title: "Réservation confirmée",
        description: "Votre réservation a été enregistrée avec succès.",
      });
    } catch (error) {
      // L'erreur est déjà gérée par le store et affichée via l'effet ci-dessus
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Réserver un rendez-vous
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "P", { locale: fr })
                        ) : (
                          <span>Sélectionnez une date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        // Désactiver les dates passées et les weekends
                        return (
                          date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          date.getDay() === 0 || // Dimanche
                          date.getDay() === 6 // Samedi
                        );
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Heure */}
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!form.watch("date") || isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une heure" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Chargement...
                      </SelectItem>
                    ) : availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <SelectItem
                          key={slot.time}
                          value={slot.time}
                          disabled={!slot.available}
                        >
                          {slot.time}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Aucun créneau disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Service */}
          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nom */}
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Votre nom complet" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="clientEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Téléphone */}
          <FormField
            control={form.control}
            name="clientPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="Votre numéro de téléphone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message (optionnel)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informations complémentaires"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting
              ? "Réservation en cours..."
              : "Confirmer la réservation"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
