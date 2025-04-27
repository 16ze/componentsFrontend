"use client";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const ProductFilters = ({
  categories = [],
  attributes = {},
  priceRange = { min: 0, max: 1000 },
  categoryPath = null,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // État local pour les filtres
  const [filters, setFilters] = useState({
    price: [priceRange.min, priceRange.max],
    categories: categoryPath ? [categoryPath] : [],
    attributes: {},
    inStock: false,
    onSale: false,
  });

  // État pour suivre quels accordéons sont ouverts
  const [openSections, setOpenSections] = useState({
    price: true,
    categories: true,
    ...Object.keys(attributes).reduce(
      (acc, attr) => ({ ...acc, [attr]: true }),
      {}
    ),
  });

  // Compte le nombre total de filtres actifs
  const activeFiltersCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (JSON.stringify(filters.price) !==
    JSON.stringify([priceRange.min, priceRange.max])
      ? 1
      : 0) +
    Object.values(filters.attributes).flat().length +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0);

  // Fonction pour construire les paramètres d'URL
  const buildQueryString = (filters) => {
    const params = new URLSearchParams(searchParams.toString());

    // Mise à jour des prix
    if (
      filters.price[0] !== priceRange.min ||
      filters.price[1] !== priceRange.max
    ) {
      params.set("minPrice", filters.price[0]);
      params.set("maxPrice", filters.price[1]);
    } else {
      params.delete("minPrice");
      params.delete("maxPrice");
    }

    // Mise à jour des catégories
    if (filters.categories.length > 0) {
      params.set("category", filters.categories.join(","));
    } else {
      params.delete("category");
    }

    // Mise à jour des attributs
    for (const [key, values] of Object.entries(filters.attributes)) {
      if (values.length > 0) {
        params.set(key, values.join(","));
      } else {
        params.delete(key);
      }
    }

    // Mise à jour des filtres booléens
    params.set("inStock", filters.inStock);
    if (!filters.inStock) params.delete("inStock");

    params.set("onSale", filters.onSale);
    if (!filters.onSale) params.delete("onSale");

    return params.toString();
  };

  // Charger les filtres depuis l'URL au montage
  useEffect(() => {
    const loadFiltersFromUrl = () => {
      const newFilters = { ...filters };

      // Chargement des prix
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      if (minPrice !== null && maxPrice !== null) {
        newFilters.price = [Number(minPrice), Number(maxPrice)];
      }

      // Chargement des catégories
      const category = searchParams.get("category");
      if (category) {
        newFilters.categories = category.split(",");
      }

      // Chargement des attributs
      for (const attr of Object.keys(attributes)) {
        const value = searchParams.get(attr);
        if (value) {
          newFilters.attributes[attr] = value.split(",");
        } else {
          newFilters.attributes[attr] = [];
        }
      }

      // Chargement des filtres booléens
      newFilters.inStock = searchParams.get("inStock") === "true";
      newFilters.onSale = searchParams.get("onSale") === "true";

      setFilters(newFilters);
    };

    loadFiltersFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mettre à jour l'URL quand les filtres changent
  useEffect(() => {
    const queryString = buildQueryString(filters);
    const url = pathname + (queryString ? `?${queryString}` : "");
    router.push(url, { scroll: false });

    // Sauvegarder les filtres dans localStorage
    localStorage.setItem("productFilters", JSON.stringify(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Fonction pour réinitialiser tous les filtres
  const handleReset = () => {
    setFilters({
      price: [priceRange.min, priceRange.max],
      categories: categoryPath ? [categoryPath] : [],
      attributes: Object.keys(attributes).reduce(
        (acc, key) => ({ ...acc, [key]: [] }),
        {}
      ),
      inStock: false,
      onSale: false,
    });
  };

  // Fonction pour gérer les changements de catégories
  const handleCategoryChange = (categoryId) => {
    setFilters((prev) => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId];

      return {
        ...prev,
        categories: newCategories,
      };
    });
  };

  // Fonction pour gérer les changements d'attributs
  const handleAttributeChange = (attributeName, value) => {
    setFilters((prev) => {
      const currentValues = prev.attributes[attributeName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeName]: newValues,
        },
      };
    });
  };

  // Fonction pour gérer le changement de prix
  const handlePriceChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      price: value,
    }));
  };

  // Fonction pour basculer les accordéons
  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Contenu du filtre
  const filterContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-medium">Filtres</h2>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Filtre Prix */}
        <div className="mb-6">
          <button
            className="flex w-full items-center justify-between mb-2"
            onClick={() => toggleSection("price")}
          >
            <span className="font-medium">Prix</span>
            {openSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <AnimatePresence>
            {openSections.price && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 px-1">
                  <Slider
                    value={filters.price}
                    min={priceRange.min}
                    max={priceRange.max}
                    step={5}
                    onValueChange={handlePriceChange}
                    className="mb-6"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatPrice(filters.price[0])}</span>
                    <span>{formatPrice(filters.price[1])}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="my-4" />

        {/* Filtre Catégories */}
        <div className="mb-6">
          <button
            className="flex w-full items-center justify-between mb-2"
            onClick={() => toggleSection("categories")}
          >
            <span className="font-medium">Catégories</span>
            {openSections.categories ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <AnimatePresence>
            {openSections.categories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 mt-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <button
                        className="flex items-center w-full hover:text-primary py-1 text-sm"
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 border rounded-sm mr-2 flex items-center justify-center",
                            filters.categories.includes(category.id)
                              ? "bg-primary border-primary"
                              : "border-input"
                          )}
                        >
                          {filters.categories.includes(category.id) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span>{category.name}</span>
                        <span className="ml-auto text-muted-foreground text-xs">
                          ({category.count})
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="my-4" />

        {/* Filtres d'attributs */}
        {Object.entries(attributes).map(([attributeName, values]) => (
          <div key={attributeName} className="mb-6">
            <button
              className="flex w-full items-center justify-between mb-2"
              onClick={() => toggleSection(attributeName)}
            >
              <span className="font-medium">{attributeName}</span>
              {openSections[attributeName] ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <AnimatePresence>
              {openSections[attributeName] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 mt-2">
                    {values.map((value) => (
                      <div
                        key={`${attributeName}-${value.name}`}
                        className="flex items-center"
                      >
                        <button
                          className="flex items-center w-full hover:text-primary py-1 text-sm"
                          onClick={() =>
                            handleAttributeChange(attributeName, value.name)
                          }
                        >
                          <div
                            className={cn(
                              "w-4 h-4 border rounded-sm mr-2 flex items-center justify-center",
                              filters.attributes[attributeName]?.includes(
                                value.name
                              )
                                ? "bg-primary border-primary"
                                : "border-input"
                            )}
                          >
                            {filters.attributes[attributeName]?.includes(
                              value.name
                            ) && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <span>{value.name}</span>
                          <span className="ml-auto text-muted-foreground text-xs">
                            ({value.count})
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <Separator className="my-4" />
          </div>
        ))}

        {/* Filtres booléens */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Uniquement en stock</span>
            <Switch
              checked={filters.inStock}
              onCheckedChange={(value) =>
                setFilters((prev) => ({ ...prev, inStock: value }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Promotions</span>
            <Switch
              checked={filters.onSale}
              onCheckedChange={(value) =>
                setFilters((prev) => ({ ...prev, onSale: value }))
              }
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  // Version mobile (dans un drawer)
  if (isMobile) {
    return (
      <div className="md:hidden mb-4">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span>Filtres</span>
              </div>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80vh]">{filterContent}</DrawerContent>
        </Drawer>
      </div>
    );
  }

  // Version desktop
  return (
    <div className="hidden md:block w-64 flex-shrink-0">{filterContent}</div>
  );
};

export default ProductFilters;
