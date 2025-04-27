"use client";

import React, { useState, useEffect } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Filter,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  ChevronDown,
} from "lucide-react";

// Components
import ProductCard from "@/components/shop/ProductCard";
import ProductCardSkeleton from "@/components/shop/ProductCardSkeleton";
import CategoryNav from "@/components/shop/CategoryNav";
import FilterSidebar from "@/components/shop/FilterSidebar";
import SortDropdown from "@/components/shop/SortDropdown";

// Metadata et options de cache gérés dans le fichier layout.js

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Récupérer les paramètres de filtre depuis l'URL
  const filterCategory = searchParams.get("category");
  const filterPrice = searchParams.get("price");
  const sortBy = searchParams.get("sort") || "newest";

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        // Construire l'URL avec les paramètres de filtre
        let url = "/api/products";
        const params = new URLSearchParams();

        if (filterCategory) params.append("category", filterCategory);
        if (filterPrice) params.append("price", filterPrice);
        if (sortBy) params.append("sort", sortBy);

        if (params.toString()) url += `?${params.toString()}`;

        // Simuler un délai de chargement pour démontrer le skeleton loader
        setTimeout(async () => {
          const response = await fetch(url);
          if (!response.ok)
            throw new Error("Erreur lors du chargement des produits");
          const data = await response.json();
          setProducts(data);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Erreur:", error);
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filterCategory, filterPrice, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Notre Boutique</h1>

      {/* Navigation des catégories */}
      <div className="mb-8">
        <CategoryNav />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtres (version mobile: modal, desktop: sidebar) */}
        <div
          className={`lg:w-1/4 lg:block ${showFilters ? "block" : "hidden"}`}
        >
          <FilterSidebar
            onClose={() => setShowFilters(false)}
            selectedCategory={filterCategory}
            selectedPrice={filterPrice}
          />
        </div>

        {/* Contenu principal */}
        <div className="lg:w-3/4">
          {/* Barre d'outils: tri, vue, filtres */}
          <div className="flex flex-wrap items-center justify-between bg-gray-50 p-4 rounded-lg mb-6">
            <button
              className="lg:hidden flex items-center gap-2 text-sm font-medium"
              onClick={() => setShowFilters(true)}
            >
              <Filter size={18} />
              Filtres
            </button>

            <div className="flex items-center gap-4">
              <SortDropdown value={sortBy} />

              <div className="hidden md:flex border-l pl-4 gap-2">
                <button
                  className={`p-2 rounded-md ${
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "bg-gray-100"
                  }`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Vue grille"
                >
                  <Grid3X3 size={18} />
                </button>

                <button
                  className={`p-2 rounded-md ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "bg-gray-100"
                  }`}
                  onClick={() => setViewMode("list")}
                  aria-label="Vue liste"
                >
                  <LayoutList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Liste des produits */}
          <div
            className={`grid ${
              viewMode === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
            } gap-6`}
          >
            {loading
              ? // Skeleton loading state
                Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={index} viewMode={viewMode} />
                ))
              : products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
          </div>

          {/* Pagination */}
          {!loading && products.length > 0 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center gap-2">
                <button className="px-4 py-2 border rounded-md bg-gray-50">
                  Précédent
                </button>
                <button className="px-4 py-2 border rounded-md bg-primary text-white">
                  1
                </button>
                <button className="px-4 py-2 border rounded-md">2</button>
                <button className="px-4 py-2 border rounded-md">3</button>
                <button className="px-4 py-2 border rounded-md bg-gray-50">
                  Suivant
                </button>
              </nav>
            </div>
          )}

          {/* Aucun produit trouvé */}
          {!loading && products.length === 0 && (
            <div className="py-20 text-center">
              <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500 mb-6">
                Essayez de modifier vos filtres ou consultez nos autres
                catégories
              </p>
              <Link
                href="/shop"
                className="inline-block px-6 py-3 bg-primary text-white rounded-md"
              >
                Voir tous les produits
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
