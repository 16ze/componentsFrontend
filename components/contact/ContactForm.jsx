"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle, Send, Info } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema de validation avec zod
const contactFormSchema = z.object({
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
  subject: z.string().min(1, {
    message: "Veuillez sélectionner un sujet",
  }),
  message: z
    .string()
    .min(10, {
      message: "Votre message doit contenir au moins 10 caractères",
    })
    .max(500, {
      message: "Votre message ne doit pas dépasser 500 caractères",
    }),
  newsletter: z.boolean().default(false),
});

// Options de sujet disponibles
const subjectOptions = [
  { value: "information", label: "Demande d'information" },
  { value: "quotation", label: "Demande de devis" },
  { value: "support", label: "Support technique" },
  { value: "partnership", label: "Proposition de partenariat" },
  { value: "other", label: "Autre" },
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [charactersLeft, setCharactersLeft] = useState(500);

  // Initialisation du formulaire avec react-hook-form
  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      newsletter: false,
    },
  });

  // Suivi du nombre de caractères restants
  const watchMessage = form.watch("message");

  useEffect(() => {
    if (watchMessage) {
      setCharactersLeft(500 - watchMessage.length);
    }
  }, [watchMessage]);

  // Soumission du formulaire
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // En cas de succès
      toast.success("Votre message a été envoyé avec succès !");
      setSubmitted(true);

      // Log pour débogage (à supprimer en production)
      console.log("Données du formulaire:", data);
    } catch (error) {
      // En cas d'erreur
      toast.error("Une erreur est survenue lors de l'envoi du message.");
      console.error("Erreur:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    form.reset();
    setSubmitted(false);
    setCharactersLeft(500);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Contactez-nous</CardTitle>
        <CardDescription>
          Remplissez le formulaire ci-dessous pour nous envoyer un message
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-xl font-semibold">Message envoyé !</h3>
                <p className="text-muted-foreground max-w-md">
                  Merci de nous avoir contacté. Notre équipe vous répondra dans
                  les plus brefs délais.
                </p>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="mt-4"
                >
                  Envoyer un autre message
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Alerte informative */}
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle>Temps de réponse</AlertTitle>
                    <AlertDescription>
                      Nous nous efforçons de répondre à toutes les demandes sous
                      24-48h ouvrées.
                    </AlertDescription>
                  </Alert>

                  {/* Champs du formulaire */}
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
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sujet</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un sujet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjectOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              placeholder="Votre message..."
                              className="min-h-32 resize-none"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setCharactersLeft(500 - e.target.value.length);
                              }}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                              {charactersLeft} caractères restants
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Newsletter
                          </FormLabel>
                          <FormDescription>
                            Recevoir nos actualités et offres par email.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
