"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useInView } from "react-intersection-observer";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Filter,
  Loader2,
  Grid3x3,
  Grid2x2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { fetchProducts } from "@/lib/api/products";

// Composant de squelette pour le chargement
const ProductCardSkeleton = () => (
  <div className="relative h-full rounded-lg overflow-hidden">
    <div className="aspect-square w-full">
      <Skeleton className="h-full w-full" />
    </div>
    <div className="p-3">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-6 w-20 mt-2" />
    </div>
  </div>
);

const ProductGrid = ({
  initialData,
  categories = [],
  attributes = {},
  priceRange = { min: 0, max: 1000 },
  categoryPath = null,
}) => {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");
  const [ref, inView] = useInView();

  // États locaux
  const [currentPage, setCurrentPage] = useState(1);
  const [gridColumns, setGridColumns] = useState(
    isMobile ? 2 : isTablet ? 3 : 4
  );
  const [sortOption, setSortOption] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Paramètres à suivre pour les requêtes
  const pageSize = 12;

  // Construction des paramètres de recherche
  const getQueryParams = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Ajouter les paramètres de pagination et de tri
    params.set("page", currentPage.toString());
    params.set("limit", pageSize.toString());
    params.set("sort", sortOption);

    return params.toString();
  };

  // Récupération des produits avec React Query
  const {
    data,
    isLoading,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuery({
    queryKey: ["products", getQueryParams()],
    queryFn: () => fetchProducts(getQueryParams()),
    initialData: initialData
      ? {
          products: initialData.products,
          pagination: initialData.pagination,
          filters: initialData.filters,
        }
      : undefined,
    keepPreviousData: true,
  });

  // Charger plus de produits quand l'utilisateur atteint le bas de la page
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Mettre à jour le nombre de colonnes en fonction de la taille de l'écran
  useEffect(() => {
    if (isMobile) {
      setGridColumns(2);
    } else if (isTablet) {
      setGridColumns(3);
    } else {
      setGridColumns(4);
    }
  }, [isMobile, isTablet]);

  // Gestionnaire pour le changement de tri
  const handleSortChange = (option) => {
    setSortOption(option);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", option);
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Fonction pour obtenir le label du tri
  const getSortLabel = () => {
    switch (sortOption) {
      case "newest":
        return "Plus récents";
      case "oldest":
        return "Plus anciens";
      case "price_asc":
        return "Prix croissant";
      case "price_desc":
        return "Prix décroissant";
      case "popular":
        return "Popularité";
      default:
        return "Trier par";
    }
  };

  // Fonction pour obtenir l'icône du tri
  const getSortIcon = () => {
    switch (sortOption) {
      case "price_asc":
        return <ArrowUp className="ml-2 h-4 w-4" />;
      case "price_desc":
        return <ArrowDown className="ml-2 h-4 w-4" />;
      default:
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
  };

  // Obtenir tous les produits (y compris ceux des pages suivantes)
  const allProducts = data?.pages?.flatMap((page) => page.products) || [];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Filtres */}
      <ProductFilters
        categories={categories}
        attributes={attributes}
        priceRange={priceRange}
        categoryPath={categoryPath}
      />

      {/* Contenu principal */}
      <div className="flex-1">
        {/* Barre d'outils */}
        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-2">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">
              {data?.pagination?.total || 0} produits
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Menu de tri */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  {getSortLabel()}
                  {getSortIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSortChange("newest")}>
                  Plus récents
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("oldest")}>
                  Plus anciens
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("price_asc")}>
                  Prix croissant
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSortChange("price_desc")}
                >
                  Prix décroissant
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("popular")}>
                  Popularité
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Boutons de changement de vue (grille) */}
            <div className="hidden md:flex border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-none rounded-l-md",
                  gridColumns === 3 && "bg-muted"
                )}
                onClick={() => setGridColumns(3)}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-none rounded-r-md",
                  gridColumns === 4 && "bg-muted"
                )}
                onClick={() => setGridColumns(4)}
              >
                <Grid2x2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grille de produits */}
        <div
          className={cn(
            "grid gap-4",
            gridColumns === 2 && "grid-cols-2",
            gridColumns === 3 && "grid-cols-2 md:grid-cols-3",
            gridColumns === 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          )}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              // Squelettes de chargement
              Array.from({ length: pageSize }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <ProductCardSkeleton />
                </motion.div>
              ))
            ) : isError ? (
              // Message d'erreur
              <div className="col-span-full p-8 text-center">
                <p className="text-red-500">
                  Une erreur est survenue lors du chargement des produits.
                </p>
                <Button onClick={() => router.refresh()} className="mt-4">
                  Réessayer
                </Button>
              </div>
            ) : allProducts.length === 0 ? (
              // Aucun produit trouvé
              <div className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">
                  Aucun produit ne correspond à vos critères de recherche.
                </p>
              </div>
            ) : (
              // Affichage des produits
              allProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Indicateur de chargement pour le chargement infini */}
        {(isFetchingNextPage || isFetching) && !isLoading && (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Element de référence pour l'intersection observer */}
        {!isLoading && hasNextPage && <div ref={ref} className="h-10 mt-4" />}

        {/* Pas de produits supplémentaires */}
        {!isLoading && !hasNextPage && allProducts.length > 0 && (
          <div className="text-center my-8 text-muted-foreground">
            Vous avez atteint la fin des produits
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
