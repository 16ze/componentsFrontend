"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Check, MapPin, Package, AlertCircle, Loader2 } from "lucide-react";
import Script from "next/script";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schéma de validation pour l'adresse de livraison
const shippingSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z
    .string()
    .regex(/^(\+\d{1,3})?\d{9,10}$/, "Numéro de téléphone invalide"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  apartment: z.string().optional(),
  postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  country: z.string().min(2, "Veuillez sélectionner un pays"),
  saveAddress: z.boolean().optional(),
  sameAsBilling: z.boolean().optional(),
});

// Méthodes de livraison disponibles
const SHIPPING_METHODS = [
  {
    id: "standard",
    name: "Livraison standard",
    description: "3-5 jours ouvrables",
    price: 4.99,
    icon: Package,
  },
  {
    id: "express",
    name: "Express",
    description: "1-2 jours ouvrables",
    price: 9.99,
    icon: Package,
  },
  {
    id: "free",
    name: "Livraison gratuite",
    description: "5-7 jours ouvrables",
    price: 0,
    icon: Package,
    threshold: 50, // Seuil minimum pour la livraison gratuite
  },
];

// Liste des pays
const COUNTRIES = [
  { value: "FR", label: "France" },
  { value: "BE", label: "Belgique" },
  { value: "CH", label: "Suisse" },
  { value: "LU", label: "Luxembourg" },
  { value: "MC", label: "Monaco" },
];

export default function ShippingForm({
  initialData,
  onSave,
  onShippingMethodSelect,
  selectedShippingMethod,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [autocompleteInitialized, setAutocompleteInitialized] = useState(false);
  const [isAddressPredicting, setIsAddressPredicting] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const cartStore = useCartStore();

  // Initialiser le formulaire avec react-hook-form
  const form = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      apartment: initialData?.apartment || "",
      postalCode: initialData?.postalCode || "",
      city: initialData?.city || "",
      country: initialData?.country || "FR",
      saveAddress: initialData?.saveAddress || false,
      sameAsBilling: initialData?.sameAsBilling || true,
    },
  });

  // Détermine si la livraison gratuite est disponible
  const cartTotal = cartStore.getSubtotal();
  const freeShippingAvailable =
    cartTotal >= SHIPPING_METHODS.find((m) => m.id === "free")?.threshold;

  // Détermine les méthodes de livraison disponibles en fonction du montant du panier
  const availableShippingMethods = SHIPPING_METHODS.filter((method) => {
    if (method.id === "free") {
      return freeShippingAvailable;
    }
    return true;
  });

  // Initialiser l'autocomplétion d'adresse Google Places
  useEffect(() => {
    if (
      googleScriptLoaded &&
      !autocompleteInitialized &&
      addressInputRef.current
    ) {
      try {
        // Initialiser l'autocomplétion Google Places
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ["address"],
            componentRestrictions: { country: ["fr", "be", "ch", "lu", "mc"] },
          }
        );

        // Ajouter un écouteur d'événements pour la sélection d'une adresse
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();

          if (place.address_components) {
            let streetNumber = "";
            let route = "";
            let postalCode = "";
            let city = "";
            let country = "";

            // Extraire les composants de l'adresse
            for (const component of place.address_components) {
              const types = component.types;

              if (types.includes("street_number")) {
                streetNumber = component.long_name;
              } else if (types.includes("route")) {
                route = component.long_name;
              } else if (types.includes("postal_code")) {
                postalCode = component.long_name;
              } else if (types.includes("locality")) {
                city = component.long_name;
              } else if (types.includes("country")) {
                country = component.short_name;
              }
            }

            // Mettre à jour les champs du formulaire
            form.setValue("address", `${streetNumber} ${route}`.trim());
            form.setValue("postalCode", postalCode);
            form.setValue("city", city);
            form.setValue("country", country);
          }
        });

        setAutocompleteInitialized(true);
        setAddressSuggestions([]);
      } catch (error) {
        console.error(
          "Erreur lors de l'initialisation de l'autocomplétion:",
          error
        );
      }
    }
  }, [googleScriptLoaded, autocompleteInitialized, form]);

  // Gérer la soumission du formulaire
  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Simuler une requête API
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Appeler le callback pour sauvegarder les données
      onSave(data);

      // Si aucune méthode de livraison n'est sélectionnée, sélectionner la première disponible
      if (!selectedShippingMethod && availableShippingMethods.length > 0) {
        onShippingMethodSelect(availableShippingMethods[0].id);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'adresse:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la sélection d'une méthode de livraison
  const handleShippingMethodSelect = (methodId) => {
    onShippingMethodSelect(methodId);
  };

  return (
    <div>
      {/* Script Google Places API */}
      <Script
        id="google-places-api"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setGoogleScriptLoaded(true)}
        onError={() =>
          console.error("Erreur lors du chargement de l'API Google Places")
        }
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Adresse de livraison</h2>
        <p className="text-muted-foreground">
          Veuillez renseigner votre adresse de livraison pour recevoir votre
          commande.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations personnelles */}
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
                      placeholder="jean.dupont@example.com"
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
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="0612345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Adresse de livraison */}
          <Separator className="my-6" />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between">
                  <FormLabel>Adresse</FormLabel>
                  <span className="text-xs text-muted-foreground">
                    {googleScriptLoaded
                      ? "La saisie automatique est disponible"
                      : "Chargement de la saisie automatique..."}
                  </span>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="12 rue de Paris"
                      {...field}
                      ref={(el) => {
                        addressInputRef.current = el;
                        field.ref(el);
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        setIsAddressPredicting(e.target.value.length > 3);
                      }}
                      onBlur={() => {
                        field.onBlur();
                        setTimeout(() => setIsAddressPredicting(false), 200);
                      }}
                    />
                    {isAddressPredicting && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apartment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appartement, suite, etc. (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="Apt 4B, Bâtiment C, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code postal</FormLabel>
                  <FormControl>
                    <Input placeholder="75001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <Input placeholder="Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un pays" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Options */}
          <div className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="sameAsBilling"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Utiliser comme adresse de facturation
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="saveAddress"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Sauvegarder cette adresse pour mes prochaines commandes
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          {/* Méthodes de livraison */}
          <Separator className="my-6" />

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Méthode de livraison</h3>

            {!freeShippingAvailable && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ajoutez{" "}
                  {(
                    SHIPPING_METHODS.find((m) => m.id === "free")?.threshold -
                    cartTotal
                  ).toFixed(2)}
                  € d'articles supplémentaires pour bénéficier de la livraison
                  gratuite !
                </AlertDescription>
              </Alert>
            )}

            <RadioGroup
              value={selectedShippingMethod || ""}
              onValueChange={handleShippingMethodSelect}
              className="space-y-3"
            >
              {availableShippingMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`
                      flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                      hover:bg-accent
                      ${
                        selectedShippingMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-input"
                      }
                    `}
                  >
                    <RadioItem
                      value={method.id}
                      id={method.id}
                      className="sr-only"
                    />
                    <div className="w-8 h-8 mr-4 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-semibold">{method.name}</span>
                        <span>
                          {method.price === 0
                            ? "Gratuit"
                            : `${method.price.toFixed(2)}€`}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {method.description}
                      </span>
                    </div>
                    {selectedShippingMethod === method.id && (
                      <Check className="ml-2 h-5 w-5 text-primary" />
                    )}
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde en cours...
              </>
            ) : (
              "Sauvegarder l'adresse de livraison"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
