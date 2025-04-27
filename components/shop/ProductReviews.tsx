"use client";

import { useState, useEffect } from "react";
import {
  Star,
  StarHalf,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Flag,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  ExternalLink,
  Clock,
  Camera,
  BadgeCheck,
  Calendar,
  User,
  ShieldCheck,
  MoreHorizontal,
  Search,
  ListFilter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useReviewsStore,
  ProductReview,
  ReviewFilter,
  ReviewStats,
} from "@/stores/reviewsStore";
import { formatDate } from "@/lib/utils";

type ProductReviewsProps = {
  productId: string;
  productName: string;
  onAddReview?: () => void;
  canAddReview?: boolean;
  className?: string;
};

export default function ProductReviews({
  productId,
  productName,
  onAddReview,
  canAddReview = true,
  className,
}: ProductReviewsProps) {
  const { toast } = useToast();
  const {
    fetchProductReviews,
    getProductReviewStats,
    getFilteredReviews,
    voteReview,
    reportReview,
  } = useReviewsStore();

  // États locaux
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    verifiedCount: 0,
    withPhotosCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>({
    sortBy: "recent",
  });
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(
    null
  );

  // Charger les avis au chargement du composant
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        await fetchProductReviews(productId);
        const reviewStats = await getProductReviewStats(productId);
        setStats(reviewStats);

        // Appliquer le filtre initial
        const filteredReviews = getFilteredReviews(productId, activeFilter);
        setReviews(filteredReviews);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les avis du produit",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, [
    productId,
    fetchProductReviews,
    getProductReviewStats,
    getFilteredReviews,
    activeFilter,
    toast,
  ]);

  // Gérer les votes
  const handleVote = async (
    reviewId: string,
    vote: "helpful" | "unhelpful" | null
  ) => {
    try {
      const success = await voteReview(reviewId, vote);
      if (success) {
        // Recharger les avis avec le même filtre
        const updatedReviews = getFilteredReviews(productId, activeFilter);
        setReviews(updatedReviews);

        toast({
          title: "Merci pour votre vote",
          description: "Votre avis a été pris en compte",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre vote",
        variant: "destructive",
      });
    }
  };

  // Ouvrir la boîte de dialogue de signalement
  const handleReportReview = (reviewId: string) => {
    setReportingReviewId(reviewId);
    setReportReason("");
    setReportDialogOpen(true);
  };

  // Soumettre un signalement
  const handleSubmitReport = async (reason: string) => {
    if (!reportingReviewId || !reason.trim()) return;

    try {
      const success = await reportReview(reportingReviewId, reason);
      if (success) {
        toast({
          title: "Signalement envoyé",
          description:
            "Merci d'avoir signalé ce contenu. Notre équipe va l'examiner.",
        });
        setReportDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre signalement",
        variant: "destructive",
      });
    }
  };

  // Ouvrir la modal d'image
  const handleViewPhoto = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setPhotoModalOpen(true);
  };

  // Appliquer un filtre
  const applyFilter = (filter: Partial<ReviewFilter>) => {
    const newFilter = { ...activeFilter, ...filter };
    setActiveFilter(newFilter);
    const filteredReviews = getFilteredReviews(productId, newFilter);
    setReviews(filteredReviews);
  };

  // Effacer un filtre
  const clearFilter = (filterKey: keyof ReviewFilter) => {
    const newFilter = { ...activeFilter };
    if (filterKey === "rating") newFilter.rating = undefined;
    if (filterKey === "verified") newFilter.verified = undefined;
    if (filterKey === "hasPhotos") newFilter.hasPhotos = undefined;

    setActiveFilter(newFilter);
    const filteredReviews = getFilteredReviews(productId, newFilter);
    setReviews(filteredReviews);
  };

  // Afficher les étoiles de notation
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : star - 0.5 <= rating ? (
              <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <Star className="h-4 w-4 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  // Afficher la distribution des notes
  const renderRatingDistribution = () => {
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.distribution[rating] || 0;
          const percentage =
            stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center w-10">
                <Star
                  className={`h-4 w-4 ${
                    rating >= 3
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                />
                <span className="ml-1 text-sm">{rating}</span>
              </div>
              <Progress value={percentage} className="h-2 flex-1" />
              <div className="text-xs text-gray-500 w-14 text-right">
                {count} ({percentage}%)
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Afficher les filtres actifs
  const renderActiveFilters = () => {
    const hasActiveFilters =
      activeFilter.rating !== undefined ||
      activeFilter.verified ||
      activeFilter.hasPhotos;

    if (!hasActiveFilters) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-500 pt-1">Filtres actifs:</span>

        {activeFilter.rating !== undefined && (
          <Badge variant="outline" className="flex items-center gap-1">
            {activeFilter.rating}{" "}
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <X
              className="h-3 w-3 ml-1 cursor-pointer"
              onClick={() => clearFilter("rating")}
            />
          </Badge>
        )}

        {activeFilter.verified && (
          <Badge variant="outline" className="flex items-center gap-1">
            Vérifiés <BadgeCheck className="h-3 w-3" />
            <X
              className="h-3 w-3 ml-1 cursor-pointer"
              onClick={() => clearFilter("verified")}
            />
          </Badge>
        )}

        {activeFilter.hasPhotos && (
          <Badge variant="outline" className="flex items-center gap-1">
            Avec photos <Camera className="h-3 w-3" />
            <X
              className="h-3 w-3 ml-1 cursor-pointer"
              onClick={() => clearFilter("hasPhotos")}
            />
          </Badge>
        )}
      </div>
    );
  };

  // Rendu principal
  return (
    <div className={`product-reviews mt-8 ${className || ""}`}>
      <h2 className="text-2xl font-bold mb-6">Avis clients</h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche: résumé et filtres */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Résumé des avis</h3>
                <Badge variant="outline">{stats.total} avis</Badge>
              </div>

              <div className="text-center mb-4">
                <span className="text-4xl font-bold">{stats.average}</span>
                <div className="flex justify-center mt-2">
                  {renderStars(stats.average)}
                </div>
              </div>

              {renderRatingDistribution()}

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Filtrer les avis</h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm mb-2 block">Par note</span>
                    <div className="flex flex-wrap gap-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <Badge
                          key={rating}
                          variant={
                            activeFilter.rating === rating
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            applyFilter({
                              rating:
                                activeFilter.rating === rating
                                  ? undefined
                                  : rating,
                            })
                          }
                        >
                          {rating} <Star className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm mb-1 block">Options</span>
                    <div className="flex flex-col gap-2">
                      <button
                        className={`flex items-center text-sm ${
                          activeFilter.verified
                            ? "text-primary font-medium"
                            : "text-gray-600"
                        }`}
                        onClick={() =>
                          applyFilter({
                            verified: !activeFilter.verified,
                          })
                        }
                      >
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        Avis vérifiés ({stats.verifiedCount})
                      </button>
                      <button
                        className={`flex items-center text-sm ${
                          activeFilter.hasPhotos
                            ? "text-primary font-medium"
                            : "text-gray-600"
                        }`}
                        onClick={() =>
                          applyFilter({
                            hasPhotos: !activeFilter.hasPhotos,
                          })
                        }
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Avec photos ({stats.withPhotosCount})
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm mb-2 block">Trier par</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full">
                          {activeFilter.sortBy === "recent" && "Plus récents"}
                          {activeFilter.sortBy === "helpful" && "Plus utiles"}
                          {activeFilter.sortBy === "highest" &&
                            "Meilleures notes"}
                          {activeFilter.sortBy === "lowest" && "Notes basses"}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => applyFilter({ sortBy: "recent" })}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Plus récents
                          {activeFilter.sortBy === "recent" && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => applyFilter({ sortBy: "helpful" })}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Plus utiles
                          {activeFilter.sortBy === "helpful" && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => applyFilter({ sortBy: "highest" })}
                        >
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Meilleures notes
                          {activeFilter.sortBy === "highest" && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => applyFilter({ sortBy: "lowest" })}
                        >
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Notes basses
                          {activeFilter.sortBy === "lowest" && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {canAddReview && (
                <div className="mt-6">
                  <Button onClick={onAddReview} className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Donner mon avis
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Colonne de droite: liste des avis */}
          <div className="lg:col-span-2">
            {renderActiveFilters()}

            {reviews.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Aucun avis trouvé</h3>
                <p className="text-gray-500 mt-2">
                  {activeFilter.rating !== undefined ||
                  activeFilter.verified ||
                  activeFilter.hasPhotos
                    ? "Essayez de modifier vos filtres pour voir plus d'avis."
                    : "Soyez le premier à donner votre avis sur ce produit !"}
                </p>
                {(activeFilter.rating !== undefined ||
                  activeFilter.verified ||
                  activeFilter.hasPhotos) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveFilter({ sortBy: "recent" })}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Effacer les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="p-4 sm:p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          {review.userAvatar ? (
                            <AvatarImage
                              src={review.userAvatar}
                              alt={review.userName}
                            />
                          ) : (
                            <AvatarFallback>
                              {review.userName.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="ml-3">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {review.userName}
                            </span>
                            {review.verified && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs py-0"
                              >
                                <BadgeCheck className="h-3 w-3 mr-1 text-green-500" />
                                Achat vérifié
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleReportReview(review.id)}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Signaler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center mb-2">
                        {renderStars(review.rating)}
                        <span className="ml-2 font-medium">{review.title}</span>
                      </div>
                      <p className="text-gray-700 text-sm mt-2">
                        {review.comment}
                      </p>
                    </div>

                    {(review.pros && review.pros.length > 0) ||
                    (review.cons && review.cons.length > 0) ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {review.pros && review.pros.length > 0 && (
                          <div className="bg-green-50 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-green-800 mb-2">
                              Points forts
                            </h4>
                            <ul className="text-xs space-y-1">
                              {review.pros.map((pro, i) => (
                                <li
                                  key={i}
                                  className="flex items-start text-green-700"
                                >
                                  <Check className="h-3 w-3 mr-1 mt-0.5" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {review.cons && review.cons.length > 0 && (
                          <div className="bg-red-50 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-red-800 mb-2">
                              Points faibles
                            </h4>
                            <ul className="text-xs space-y-1">
                              {review.cons.map((con, i) => (
                                <li
                                  key={i}
                                  className="flex items-start text-red-700"
                                >
                                  <X className="h-3 w-3 mr-1 mt-0.5" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {review.photos && review.photos.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          Photos du client
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {review.photos.map((photo, index) => (
                            <div
                              key={index}
                              className="w-16 h-16 rounded overflow-hidden cursor-pointer border hover:opacity-90"
                              onClick={() => handleViewPhoto(photo)}
                            >
                              <img
                                src={photo}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {review.sellerResponse && (
                      <div className="mt-4 bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <BadgeCheck className="h-4 w-4 text-blue-600 mr-2" />
                          <h4 className="text-sm font-medium text-blue-800">
                            Réponse de {review.sellerResponse.sellerName}
                          </h4>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          {review.sellerResponse.response}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          {formatDate(review.sellerResponse.createdAt)}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Cet avis vous a-t-il été utile?
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`flex items-center space-x-1 ${
                            review.userVote === "helpful"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : ""
                          }`}
                          onClick={() =>
                            handleVote(
                              review.id,
                              review.userVote === "helpful" ? null : "helpful"
                            )
                          }
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>Oui ({review.helpful})</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`flex items-center space-x-1 ${
                            review.userVote === "unhelpful"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : ""
                          }`}
                          onClick={() =>
                            handleVote(
                              review.id,
                              review.userVote === "unhelpful"
                                ? null
                                : "unhelpful"
                            )
                          }
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span>Non ({review.unhelpful})</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal pour voir les photos */}
      <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Photo du client</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={selectedPhoto}
              alt="Photo d'avis client"
              className="max-h-[600px] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour signaler un avis */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Signaler cet avis</DialogTitle>
            <DialogDescription>
              Merci de nous indiquer pourquoi vous souhaitez signaler cet avis
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Expliquez la raison du signalement..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={() => handleSubmitReport(reportReason)}
              disabled={!reportReason.trim()}
            >
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
