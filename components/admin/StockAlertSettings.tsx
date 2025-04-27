"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertTriangle,
  Loader2,
  PackageCheck,
  Save,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useInventoryStore } from "@/stores/inventoryStore";

// Schéma de validation pour le formulaire
const stockAlertSchema = z.object({
  productId: z.string().min(1, "Veuillez sélectionner un produit"),
  lowStockThreshold: z.coerce
    .number()
    .min(1, "Le seuil doit être au moins de 1")
    .max(1000, "Le seuil doit être inférieur à 1000"),
  criticalStockThreshold: z.coerce
    .number()
    .min(0, "Le seuil doit être au moins de 0")
    .max(100, "Le seuil doit être inférieur à 100"),
  allowBackorders: z.boolean().default(false),
  backorderLimit: z.coerce
    .number()
    .min(0, "La limite doit être au moins de 0")
    .max(1000, "La limite doit être inférieure à 1000")
    .optional()
    .nullable(),
  restockDate: z.string().optional().nullable(),
});

type StockAlertFormValues = z.infer<typeof stockAlertSchema>;

type Product = {
  id: string;
  name: string;
  sku?: string;
};

export default function StockAlertSettings() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    fetchProductStock,
    setLowStockThreshold,
    setCriticalStockThreshold,
    setBackorderStatus,
    setRestockDate,
  } = useInventoryStore();

  // Formulaire
  const form = useForm<StockAlertFormValues>({
    resolver: zodResolver(stockAlertSchema),
    defaultValues: {
      productId: "",
      lowStockThreshold: 10,
      criticalStockThreshold: 3,
      allowBackorders: false,
      backorderLimit: null,
      restockDate: null,
    },
  });

  // Charger la liste des produits
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        // Simuler une requête API (à remplacer par votre API réelle)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Données fictives pour l'exemple
        const mockProducts = [
          {
            id: "prod_001",
            name: "Chaise de bureau ergonomique",
            sku: "SKU001",
          },
          {
            id: "prod_002",
            name: "Bureau ajustable électrique",
            sku: "SKU002",
          },
          { id: "prod_003", name: "Lampe LED de bureau", sku: "SKU003" },
          { id: "prod_004", name: "Support moniteur double", sku: "SKU004" },
          { id: "prod_005", name: "Clavier mécanique sans fil", sku: "SKU005" },
        ];

        setProducts(mockProducts);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des produits",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  // Charger les données de stock lorsqu'un produit est sélectionné
  const handleProductChange = async (productId: string) => {
    try {
      setIsLoading(true);
      const stockInfo = await fetchProductStock(productId);

      if (stockInfo) {
        form.setValue("lowStockThreshold", stockInfo.lowStockThreshold);
        form.setValue(
          "criticalStockThreshold",
          stockInfo.criticalStockThreshold
        );
        form.setValue("allowBackorders", stockInfo.backorderAllowed);
        form.setValue("backorderLimit", stockInfo.backorderLimit || null);
        form.setValue(
          "restockDate",
          stockInfo.restockDate
            ? stockInfo.restockDate.toISOString().split("T")[0]
            : null
        );
      } else {
        // Valeurs par défaut
        form.setValue("lowStockThreshold", 10);
        form.setValue("criticalStockThreshold", 3);
        form.setValue("allowBackorders", false);
        form.setValue("backorderLimit", null);
        form.setValue("restockDate", null);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations de stock",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (data: StockAlertFormValues) => {
    try {
      setIsSaving(true);

      // Mettre à jour les seuils
      setLowStockThreshold(data.productId, data.lowStockThreshold);
      setCriticalStockThreshold(data.productId, data.criticalStockThreshold);

      // Mettre à jour le statut de backorder
      setBackorderStatus(
        data.productId,
        data.allowBackorders,
        data.allowBackorders ? data.backorderLimit || undefined : undefined
      );

      // Mettre à jour la date de réapprovisionnement
      if (data.restockDate) {
        setRestockDate(data.productId, new Date(data.restockDate));
      }

      toast({
        title: "Succès",
        description: "Paramètres d'alerte de stock mis à jour",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Paramètres d'alerte de stock
        </CardTitle>
        <CardDescription>
          Configurez les seuils d'alerte pour le stock et les options de
          précommande
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produit</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleProductChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un produit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} {product.sku ? `(${product.sku})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {form.watch("productId") && !isLoading && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seuil de stock bas</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={1} />
                        </FormControl>
                        <FormDescription>
                          Alerte lorsque le stock est inférieur à cette valeur
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="criticalStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seuil de stock critique</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={0} />
                        </FormControl>
                        <FormDescription>
                          Alerte critique lorsque le stock est inférieur à cette
                          valeur
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                <FormField
                  control={form.control}
                  name="allowBackorders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Autoriser les précommandes
                        </FormLabel>
                        <FormDescription>
                          Permettre aux clients de commander même si le stock
                          est épuisé
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

                {form.watch("allowBackorders") && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="backorderLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite de précommande</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? null
                                    : parseInt(e.target.value, 10);
                                field.onChange(value);
                              }}
                              min={0}
                            />
                          </FormControl>
                          <FormDescription>
                            Nombre maximum d'unités pouvant être précommandées
                            (vide = illimité)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="restockDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de réapprovisionnement</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                field.onChange(e.target.value || null);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Date prévue de retour en stock
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            )}

            <CardFooter className="px-0 pb-0">
              <Button
                type="submit"
                disabled={isLoading || isSaving || !form.watch("productId")}
                className="ml-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les paramètres
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
