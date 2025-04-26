"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTheme } from "next-themes";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Variants de mise en page pour la galerie
const galleryVariants = cva("grid grid-cols-1 gap-4", {
  variants: {
    layout: {
      grid: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      masonry: "columns-1 sm:columns-2 md:columns-3 lg:columns-4",
      spotlight: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 spotlight-gallery",
    },
  },
  defaultVariants: {
    layout: "grid",
  },
});

// Types de filtres disponibles
const filterCategories = [
  { id: "all", label: "Tous" },
  { id: "nature", label: "Nature" },
  { id: "architecture", label: "Architecture" },
  { id: "people", label: "Personnes" },
  { id: "travel", label: "Voyages" },
];

// Exemple de données d'images - en production, récupérez cela depuis une API
const galleryImages = [
  {
    id: 1,
    src: "/api/placeholder/800/600",
    alt: "Mountains with lake",
    width: 800,
    height: 600,
    category: "nature",
    title: "Montagnes majestueuses",
    description: "Vue panoramique sur les montagnes avec un lac cristallin",
    featured: true,
  },
  {
    id: 2,
    src: "/api/placeholder/600/800",
    alt: "Modern building",
    width: 600,
    height: 800,
    category: "architecture",
    title: "Architecture moderne",
    description: "Lignes épurées d'un bâtiment contemporain",
    featured: false,
  },
  {
    id: 3,
    src: "/api/placeholder/800/800",
    alt: "Person in city",
    width: 800,
    height: 800,
    category: "people",
    title: "Vie urbaine",
    description: "Portrait d'une personne dans l'environnement urbain",
    featured: false,
  },
  {
    id: 4,
    src: "/api/placeholder/800/500",
    alt: "Beach sunset",
    width: 800,
    height: 500,
    category: "travel",
    title: "Coucher de soleil tropical",
    description: "Magnifique coucher de soleil sur une plage paradisiaque",
    featured: true,
  },
  {
    id: 5,
    src: "/api/placeholder/600/900",
    alt: "Forest path",
    width: 600,
    height: 900,
    category: "nature",
    title: "Chemin forestier",
    description: "Sentier ombragé à travers une forêt dense",
    featured: false,
  },
  {
    id: 6,
    src: "/api/placeholder/900/600",
    alt: "Historic building",
    width: 900,
    height: 600,
    category: "architecture",
    title: "Patrimoine architectural",
    description: "Détails d'architecture historique",
    featured: false,
  },
  {
    id: 7,
    src: "/api/placeholder/800/700",
    alt: "Children playing",
    width: 800,
    height: 700,
    category: "people",
    title: "Joie enfantine",
    description: "Enfants s'amusant dans un parc",
    featured: false,
  },
  {
    id: 8,
    src: "/api/placeholder/750/650",
    alt: "City skyline",
    width: 750,
    height: 650,
    category: "travel",
    title: "Horizon urbain",
    description: "Vue panoramique d'une métropole au crépuscule",
    featured: true,
  },
  {
    id: 9,
    src: "/api/placeholder/850/550",
    alt: "Waterfall",
    width: 850,
    height: 550,
    category: "nature",
    title: "Cascade sauvage",
    description: "Puissante cascade dans un environnement naturel préservé",
    featured: false,
  },
  {
    id: 10,
    src: "/api/placeholder/650/850",
    alt: "Bridge design",
    width: 650,
    height: 850,
    category: "architecture",
    title: "Architecture de pont",
    description: "Ingénierie remarquable d'un pont moderne",
    featured: false,
  },
  {
    id: 11,
    src: "/api/placeholder/700/700",
    alt: "Street portrait",
    width: 700,
    height: 700,
    category: "people",
    title: "Portrait de rue",
    description: "Portrait expressif capturé dans l'ambiance urbaine",
    featured: false,
  },
  {
    id: 12,
    src: "/api/placeholder/800/550",
    alt: "Ancient ruins",
    width: 800,
    height: 550,
    category: "travel",
    title: "Vestiges antiques",
    description: "Site archéologique témoignant d'une civilisation ancienne",
    featured: false,
  },
];

export function ImageGallery() {
  const [images, setImages] = useState(galleryImages);
  const [filteredImages, setFilteredImages] = useState(galleryImages);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [loadedImages, setLoadedImages] = useState({});
  const dialogContentRef = useRef(null);
  const { theme } = useTheme();

  // Filtrer les images en fonction de la catégorie et de la recherche
  useEffect(() => {
    let filtered = images;

    // Filtre par catégorie
    if (filterCategory !== "all") {
      filtered = filtered.filter((img) => img.category === filterCategory);
    }

    // Filtre par recherche
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (img) =>
          img.title.toLowerCase().includes(query) ||
          img.description.toLowerCase().includes(query) ||
          img.category.toLowerCase().includes(query)
      );
    }

    setFilteredImages(filtered);
  }, [filterCategory, searchQuery, images]);

  // Gérer le changement d'image dans la modal
  const handlePrevImage = () => {
    if (!selectedImage) return;

    const currentIndex = filteredImages.findIndex(
      (img) => img.id === selectedImage.id
    );
    const prevIndex =
      (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
    setZoomLevel(1);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;

    const currentIndex = filteredImages.findIndex(
      (img) => img.id === selectedImage.id
    );
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
    setZoomLevel(1);
  };

  // Gérer le zoom de l'image
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  // Simuler le téléchargement de l'image
  const handleDownload = () => {
    if (!selectedImage) return;

    // En production, vous utiliseriez un lien réel ou une API
    const link = document.createElement("a");
    link.href = selectedImage.src;
    link.download = `image-${selectedImage.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fermer la modal et réinitialiser le zoom
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setSelectedImage(null);
      setZoomLevel(1);
    }, 300);
  };

  // Composant d'élément de galerie avec lazy loading
  const GalleryItem = ({ image }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      rootMargin: "200px 0px",
    });

    const [isLoaded, setIsLoaded] = useState(false);

    const handleImageClick = () => {
      setSelectedImage(image);
      setIsDialogOpen(true);
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg group",
          layout === "masonry" ? "mb-4 break-inside-avoid" : "h-full",
          image.featured && layout === "spotlight"
            ? "md:col-span-2 md:row-span-2"
            : ""
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -5 }}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          {inView && (
            <>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={cn(
                  "object-cover transition-all duration-300",
                  !isLoaded && "scale-110 blur-sm",
                  isLoaded && "scale-100 blur-0"
                )}
                onLoad={() => setIsLoaded(true)}
                priority={image.featured}
              />
              {!isLoaded && (
                <Skeleton className="absolute inset-0 rounded-lg" />
              )}
            </>
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              onClick={handleImageClick}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {image.featured && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary">En vedette</Badge>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="font-medium text-sm">{image.title}</h3>
          </div>
        </div>
      </motion.div>
    );
  };

  // Afficher un message si aucune image ne correspond aux filtres
  const NoResults = () => (
    <div className="col-span-full py-12 text-center">
      <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
      <p className="text-muted-foreground">
        Essayez d'ajuster vos filtres ou votre recherche.
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => {
          setFilterCategory("all");
          setSearchQuery("");
        }}
      >
        Réinitialiser les filtres
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Contrôles de la galerie */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans la galerie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-4 w-full sm:w-auto">
          <Tabs
            value={filterCategory}
            onValueChange={setFilterCategory}
            className="w-full sm:w-auto"
          >
            <TabsList className="w-full grid-cols-3 sm:w-auto sm:grid-cols-5">
              {filterCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Tabs
            value={layout}
            onValueChange={setLayout}
            className="hidden sm:flex"
          >
            <TabsList>
              <TabsTrigger value="grid">Grille</TabsTrigger>
              <TabsTrigger value="masonry">Mosaïque</TabsTrigger>
              <TabsTrigger value="spotlight">Spotlight</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Galerie d'images */}
      <div className={galleryVariants({ layout })}>
        {filteredImages.length > 0 ? (
          filteredImages.map((image) => (
            <GalleryItem key={image.id} image={image} />
          ))
        ) : (
          <NoResults />
        )}
      </div>

      {/* Modal d'affichage d'image */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent
          ref={dialogContentRef}
          className="max-w-6xl w-[95vw] p-0 overflow-hidden bg-background/95 backdrop-blur"
        >
          <div className="relative h-full">
            {selectedImage && (
              <>
                <div className="absolute top-2 right-2 z-10 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseDialog}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                  {/* Image principale */}
                  <div className="relative flex-1 overflow-hidden bg-black flex items-center justify-center">
                    <div className="relative w-full h-full overflow-auto flex items-center justify-center">
                      <div
                        style={{
                          transform: `scale(${zoomLevel})`,
                          transition: "transform 0.3s ease",
                        }}
                        className="relative"
                      >
                        <Image
                          src={selectedImage.src}
                          alt={selectedImage.alt}
                          width={selectedImage.width}
                          height={selectedImage.height}
                          className="max-h-[70vh] object-contain"
                          priority
                        />
                      </div>
                    </div>

                    {/* Contrôles de navigation */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 hover:bg-black/40 text-white"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 hover:bg-black/40 text-white"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Informations sur l'image */}
                  <div className="w-full md:w-80 p-6 flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        {selectedImage.title}
                      </DialogTitle>
                      <div className="flex items-center mt-2">
                        <Badge>{selectedImage.category}</Badge>
                        {selectedImage.featured && (
                          <Badge variant="secondary" className="ml-2">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </DialogHeader>

                    <DialogDescription className="py-4">
                      {selectedImage.description}
                    </DialogDescription>

                    <div className="mt-auto pt-4 space-y-4">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleZoomOut}
                          disabled={zoomLevel <= 0.5}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <div className="px-2 py-1 rounded border text-sm text-center min-w-[60px]">
                          {Math.round(zoomLevel * 100)}%
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleZoomIn}
                          disabled={zoomLevel >= 3}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button className="w-full" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
