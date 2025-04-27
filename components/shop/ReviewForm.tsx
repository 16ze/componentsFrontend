"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useReviewsStore } from "@/stores/reviewsStore";
import {
  Camera,
  Check,
  Image as ImageIcon,
  Info,
  Loader2,
  Star,
  X,
  Plus,
  Trash,
  Upload,
} from "lucide-react";
import {
  Button,
  Textarea,
  Input,
  Separator,
  Alert,
  AlertDescription,
  AlertTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Toaster,
  toast,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Schéma de validation pour le formulaire
const reviewSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(100),
  content: z
    .string()
    .min(10, "Votre avis doit contenir au moins 10 caractères")
    .max(1000),
  recommendProduct: z.boolean().default(false),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

type ReviewFormProps = {
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function ReviewForm({
  productId,
  productName,
  userId,
  userName,
  userAvatar,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { toast } = useToast();
  const { addReview, hasUserReviewed } = useReviewsStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUploads, setPhotoUploads] = useState<
    { file: File; previewUrl: string; isUploading: boolean }[]
  >([]);
  const [prosList, setProsList] = useState<string[]>([""]);
  const [consList, setConsList] = useState<string[]>([""]);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState<boolean>(false);

  // Formulaire
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: "",
      content: "",
      recommendProduct: false,
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    if (rating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez attribuer une note au produit",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si l'utilisateur a déjà posté un avis
    if (hasUserReviewed(productId, userId)) {
      toast({
        title: "Avis déjà publié",
        description: "Vous avez déjà publié un avis pour ce produit",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Filtrer les listes pour supprimer les entrées vides
      const filteredPros = prosList.filter((pro) => pro.trim() !== "");
      const filteredCons = consList.filter((con) => con.trim() !== "");

      // Simuler l'upload des photos
      const uploadedPhotos = await Promise.all(
        photoUploads.map(async (photo) => {
          // Dans une application réelle, vous appelleriez votre API d'upload ici
          // Simulons un délai d'upload
          return new Promise<string>((resolve) => {
            setTimeout(() => {
              resolve(photo.previewUrl);
            }, 1000);
          });
        })
      );

      // Créer l'objet d'avis
      const newReview = {
        productId,
        userId,
        userName,
        userAvatar: userAvatar || "",
        title: values.title,
        comment: values.content, // Renommé content en comment pour correspondre au type
        rating,
        pros: filteredPros,
        cons: filteredCons,
        photos: uploadedPhotos,
        verified: true, // Ajouté pour correspondre au type ProductReview
      };

      // Ajouter l'avis
      await addReview(newReview);

      toast({
        title: "Avis publié",
        description: "Merci d'avoir partagé votre expérience",
      });

      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de publier votre avis",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer le téléchargement de photos
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Limiter à 5 photos maximum
    if (photoUploads.length + files.length > 5) {
      toast({
        title: "Limite atteinte",
        description: "Vous pouvez télécharger jusqu'à 5 photos maximum",
        variant: "destructive",
      });
      return;
    }

    // Créer les previews
    Array.from(files).forEach((file) => {
      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Type de fichier non supporté",
          description: "Seules les images sont acceptées",
          variant: "destructive",
        });
        return;
      }

      // Vérifier la taille du fichier (max 5 MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale est de 5 MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUploads((prev) => [
          ...prev,
          {
            file,
            previewUrl: reader.result as string,
            isUploading: false,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Réinitialiser l'input
    event.target.value = "";
  };

  // Supprimer une photo
  const handleRemovePhoto = (index: number) => {
    setPhotoUploads((prev) => prev.filter((_, i) => i !== index));
  };

  // Gérer les avantages
  const handleAddPro = () => {
    setProsList((prev) => [...prev, ""]);
  };

  const handleRemovePro = (index: number) => {
    setProsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProChange = (index: number, value: string) => {
    setProsList((prev) => prev.map((pro, i) => (i === index ? value : pro)));
  };

  // Gérer les inconvénients
  const handleAddCon = () => {
    setConsList((prev) => [...prev, ""]);
  };

  const handleRemoveCon = (index: number) => {
    setConsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConChange = (index: number, value: string) => {
    setConsList((prev) => prev.map((con, i) => (i === index ? value : con)));
  };

  // Composant pour l'évaluation par étoiles
  const StarRating = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (value: number) => void;
  }) => {
    const [hoverValue, setHoverValue] = useState(0);

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 focus:outline-none"
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={cn(
                "h-8 w-8 transition-all",
                (hoverValue || value) >= star
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  // Gestion du hover pour les étoiles
  const handleHoverStar = (index: number) => {
    setHoverRating(index);
  };

  const handleLeaveStar = () => {
    setHoverRating(0);
  };

  // Gestion du clic pour les étoiles
  const handleClickStar = (index: number) => {
    setRating(index);
  };

  const handlePreviewPhoto = (url: string) => {
    setPhotoPreviewUrl(url);
    setPhotoPreviewOpen(true);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Donner votre avis sur {productName}</CardTitle>
        <CardDescription>
          Partagez votre expérience pour aider les autres acheteurs
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormLabel>Note globale</FormLabel>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'avis</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Résumez votre expérience en quelques mots"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre avis détaillé</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Partagez les détails de votre expérience avec ce produit"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="recommendProduct"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Je recommande ce produit
                  </FormLabel>
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Points forts</h3>
              <div className="space-y-2">
                {prosList.map((pro, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={pro}
                      onChange={(e) => handleProChange(index, e.target.value)}
                      placeholder="Ex: Bonne qualité"
                      className="flex-1"
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemovePro(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {prosList.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPro}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un point fort
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Points faibles</h3>
              <div className="space-y-2">
                {consList.map((con, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={con}
                      onChange={(e) => handleConChange(index, e.target.value)}
                      placeholder="Ex: Livraison lente"
                      className="flex-1"
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveCon(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {consList.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCon}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un point faible
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Photos (optionnel)</h3>
              <FormDescription>
                Ajoutez jusqu'à 5 photos pour illustrer votre avis
              </FormDescription>

              <div className="flex flex-wrap gap-3">
                {/* Prévisualisations des photos */}
                {photoUploads.map((photo, index) => (
                  <div
                    key={index}
                    className="relative h-24 w-24 border rounded-md overflow-hidden flex items-center justify-center"
                  >
                    {photo.isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <img
                          src={photo.previewUrl}
                          alt={`Preview ${index}`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}

                {/* Bouton d'upload */}
                {photoUploads.length < 5 && (
                  <label className="h-24 w-24 border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Camera className="h-6 w-6 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Ajouter photos
                    </span>
                  </label>
                )}
              </div>
            </div>

            <CardFooter className="flex justify-end gap-2 px-0">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publication...
                  </>
                ) : (
                  "Publier l'avis"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>

      {/* Prévisualisation de la photo */}
      <Dialog open={photoPreviewOpen} onOpenChange={setPhotoPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Prévisualisation de la photo</DialogTitle>
            <DialogDescription>
              Vous pouvez zoomer et vous déplacer pour voir les détails.
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-[400px] w-full">
            {photoPreviewUrl && (
              <Image
                src={photoPreviewUrl}
                alt="Prévisualisation"
                fill
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </Card>
  );
}
