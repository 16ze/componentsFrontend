"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import ImageGallery from "react-image-gallery";
import {
  Loader2,
  ShoppingBag,
  Heart,
  Share2,
  Star,
  StarHalf,
  Mail,
  Minus,
  Plus,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsHeader,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/stores/cartStore";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";

// Composant pour afficher les étoiles de notation
const RatingStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );
};

const ProductDetail = ({ product, relatedProducts = [], reviews = [] }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const { favorites, toggleFavorite } = useFavoriteStore();

  // États
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [currentStock, setCurrentStock] = useState(product?.countInStock || 0);
  const [imageGalleryItems, setImageGalleryItems] = useState([]);

  const isFavorite = favorites.includes(product?.id);
  const isOnSale =
    product?.priceDiscount && product?.priceDiscount < product?.price;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;

  // Préparer les images pour la galerie
  useEffect(() => {
    if (product) {
      const galleryItems = [
        {
          original: product.image,
          thumbnail: product.image,
          originalAlt: product.name,
          thumbnailAlt: product.name,
        },
        ...(product.additionalImages || []).map((img) => ({
          original: img,
          thumbnail: img,
          originalAlt: product.name,
          thumbnailAlt: product.name,
        })),
      ];

      setImageGalleryItems(galleryItems);
    }
  }, [product]);

  // Vérifier le stock en fonction des variantes sélectionnées
  useEffect(() => {
    if (product && product.variants) {
      const selectedVariantCombo = Object.values(selectedVariants)
        .sort()
        .join("-");

      // Trouver la variante correspondante
      const matchingVariant = product.variants.find(
        (variant) =>
          variant.combination.sort().join("-") === selectedVariantCombo
      );

      if (matchingVariant) {
        setCurrentStock(matchingVariant.stock);
      } else {
        setCurrentStock(product.countInStock);
      }
    }
  }, [selectedVariants, product]);

  // Sélection d'une variante
  const handleVariantChange = (attributeName, value) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  // Gestion de la quantité
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  // Ajout au panier
  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    try {
      setLoading(true);

      // Construire les attributs sélectionnés
      const selectedAttributes =
        Object.keys(selectedVariants).length > 0 ? selectedVariants : {};

      // Ajouter au panier
      await addItem(product.id, quantity, selectedAttributes);

      toast({
        title: "Produit ajouté au panier",
        description: `${quantity} × ${product.name} a été ajouté à votre panier.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error.message || "Impossible d'ajouter ce produit au panier.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Partage sur les réseaux sociaux
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Découvrez ${product.name} - ${product.shortDescription}`;

    let shareUrl;

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`;
        break;
      case "pinterest":
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
          url
        )}&description=${encodeURIComponent(text)}&media=${encodeURIComponent(
          product.image
        )}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(
          `Partage: ${product.name}`
        )}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank");
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Galerie d'images */}
        <div className="md:sticky md:top-24 h-fit">
          <div className="aspect-square relative overflow-hidden rounded-lg">
            {imageGalleryItems.length > 0 && (
              <ImageGallery
                items={imageGalleryItems}
                showPlayButton={false}
                showFullscreenButton={true}
                showNav={true}
                thumbnailPosition="bottom"
                useBrowserFullscreen={true}
                showBullets={imageGalleryItems.length > 1}
                renderItem={(item) => (
                  <div className="relative w-full h-full">
                    <Image
                      src={item.original}
                      alt={item.originalAlt}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                )}
                renderThumbInner={(item) => (
                  <div className="relative w-full h-16">
                    <Image
                      src={item.thumbnail}
                      alt={item.thumbnailAlt}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
              />
            )}
          </div>
        </div>

        {/* Informations produit */}
        <div>
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Link
                href={`/shop/brand/${product.brand.toLowerCase()}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {product.brand}
              </Link>
              <span className="text-muted-foreground mx-2">•</span>
              <Link
                href={`/shop/category/${product.category.slug}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {product.category.name}
              </Link>
            </div>

            <h1 className="text-3xl font-bold">{product.name}</h1>

            <div className="flex items-center gap-2 mt-2">
              <RatingStars rating={product.rating} />
              <span className="text-sm text-muted-foreground">
                ({product.numReviews} avis)
              </span>
              {product.sku && (
                <>
                  <span className="text-muted-foreground mx-2">•</span>
                  <span className="text-sm text-muted-foreground">
                    SKU: {product.sku}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Prix */}
          <div className="mb-6">
            {isOnSale ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {product.priceDiscount} €
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  {product.price} €
                </span>
                <Badge variant="destructive" className="ml-2">
                  -
                  {Math.round(
                    ((product.price - product.priceDiscount) / product.price) *
                      100
                  )}
                  %
                </Badge>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary">
                {product.price} €
              </span>
            )}
          </div>

          {/* Courte description */}
          <div className="mb-6">
            <p className="text-muted-foreground">{product.shortDescription}</p>
          </div>

          <Separator className="my-6" />

          {/* Sélecteurs de variantes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="space-y-6 mb-6">
              {Object.entries(product.attributes).map(([attrName, values]) => (
                <div key={attrName}>
                  <h3 className="text-sm font-medium mb-3">{attrName}</h3>

                  {attrName.toLowerCase() === "couleur" ? (
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => (
                        <button
                          key={value}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all",
                            selectedVariants[attrName] === value
                              ? "ring-2 ring-primary ring-offset-2"
                              : "ring-0"
                          )}
                          style={{ backgroundColor: value.toLowerCase() }}
                          onClick={() => handleVariantChange(attrName, value)}
                          aria-label={value}
                        />
                      ))}
                    </div>
                  ) : (
                    <RadioGroup
                      className="flex flex-wrap gap-2"
                      value={selectedVariants[attrName]}
                      onValueChange={(value) =>
                        handleVariantChange(attrName, value)
                      }
                    >
                      {values.map((value) => (
                        <div key={value} className="flex items-center gap-2">
                          <RadioGroupItem
                            value={value}
                            id={`${attrName}-${value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`${attrName}-${value}`}
                            className="px-3 py-1.5 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary"
                          >
                            {value}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stock status */}
          <div className="mb-6">
            {isOutOfStock ? (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-500 border-red-200"
              >
                Épuisé
              </Badge>
            ) : isLowStock ? (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-600 border-amber-200"
              >
                Plus que {currentStock} en stock
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-600 border-green-200"
              >
                En stock
              </Badge>
            )}
          </div>

          {/* Quantité et ajout au panier */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                disabled={quantity >= currentStock || isOutOfStock}
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="flex-1 gap-2"
                size="lg"
                disabled={isOutOfStock || loading}
                onClick={handleAddToCart}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingBag className="h-4 w-4" />
                )}
                Ajouter au panier
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "aspect-square",
                  isFavorite && "text-red-500 border-red-200"
                )}
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart
                  className={cn("h-5 w-5", isFavorite && "fill-current")}
                />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare("facebook")}>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("twitter")}>
                    Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("pinterest")}>
                    Pinterest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("email")}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs pour les détails */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Spécifications</TabsTrigger>
          <TabsTrigger value="reviews">Avis ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
            <ReactMarkdown>{product.description}</ReactMarkdown>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Accordion type="single" collapsible className="w-full max-w-2xl">
            {product.technicalDetails &&
              Object.entries(product.technicalDetails).map(
                ([category, details], index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{category}</AccordionTrigger>
                    <AccordionContent>
                      <dl className="divide-y">
                        {Object.entries(details).map(([key, value], i) => (
                          <div
                            key={i}
                            className="grid grid-cols-3 py-3 text-sm"
                          >
                            <dt className="text-muted-foreground">{key}</dt>
                            <dd className="col-span-2">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </AccordionContent>
                  </AccordionItem>
                )
              )}

            {/* Dimensions et poids */}
            <AccordionItem value="dimensions">
              <AccordionTrigger>Dimensions et poids</AccordionTrigger>
              <AccordionContent>
                <dl className="divide-y">
                  {product.dimensions && (
                    <div className="grid grid-cols-3 py-3 text-sm">
                      <dt className="text-muted-foreground">Dimensions</dt>
                      <dd className="col-span-2">
                        {`${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`}
                      </dd>
                    </div>
                  )}
                  {product.weight !== undefined && (
                    <div className="grid grid-cols-3 py-3 text-sm">
                      <dt className="text-muted-foreground">Poids</dt>
                      <dd className="col-span-2">{product.weight} kg</dd>
                    </div>
                  )}
                </dl>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun avis pour le moment</p>
              <Button className="mt-4">Laisser un avis</Button>
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{review.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <RatingStars rating={review.rating} />
                  </div>
                  <p className="mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Produits similaires */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
