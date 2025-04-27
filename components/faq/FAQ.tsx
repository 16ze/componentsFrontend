import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FAQAccordion } from "./FAQAccordion";
import { FAQCategory, FAQItem, FAQProps } from "./types";

export const FAQ: React.FC<FAQProps> = ({
  items,
  categories,
  title = "Questions fréquemment posées",
  description,
  searchPlaceholder = "Rechercher une question...",
  useCategoryTabs = true,
  generateTableOfContents = true,
  enableSchemaMarkup = true,
  className,
  itemClassName,
  activeItemClassName,
  animationDuration = 300,
  defaultOpen = [],
  accordionType = "multiple",
  showCategoryDescription = true,
}) => {
  const [activeItems, setActiveItems] = useState<string[]>(defaultOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");

  // Si des catégories sont fournies, regrouper les éléments par catégorie
  const processedCategories = useMemo(() => {
    if (!categories) {
      // Si aucune catégorie n'est fournie mais que les items ont des catégories définies
      // Générer automatiquement les catégories
      const categoryMap = new Map<string, FAQCategory>();

      items.forEach((item) => {
        if (item.category) {
          if (!categoryMap.has(item.category)) {
            categoryMap.set(item.category, {
              id: item.category.toLowerCase().replace(/\s+/g, "-"),
              name: item.category,
              items: [],
            });
          }

          const category = categoryMap.get(item.category);
          if (category) {
            category.items.push(item);
          }
        }
      });

      const generatedCategories = Array.from(categoryMap.values());

      // Ajouter une catégorie "Toutes" si des catégories ont été générées
      if (generatedCategories.length > 0) {
        return [
          {
            id: "all",
            name: "Toutes",
            items: items,
          },
          ...generatedCategories,
        ];
      }

      return [];
    }

    return categories;
  }, [categories, items]);

  // Définir l'onglet actif au chargement
  useEffect(() => {
    if (processedCategories.length > 0) {
      setActiveTab(processedCategories[0].id);
    }
  }, [processedCategories]);

  // Filtrer les éléments en fonction de la recherche
  const filteredItems = useMemo(() => {
    if (!searchQuery) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Filtrer les catégories en fonction de la recherche
  const filteredCategories = useMemo(() => {
    if (!searchQuery || !processedCategories.length) {
      return processedCategories;
    }

    return processedCategories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [processedCategories, searchQuery]);

  // Fonction pour basculer l'état ouvert/fermé des éléments
  const toggleItem = (id: string) => {
    if (accordionType === "single") {
      setActiveItems((prev) => (prev.includes(id) ? [] : [id]));
    } else {
      setActiveItems((prev) =>
        prev.includes(id)
          ? prev.filter((itemId) => itemId !== id)
          : [...prev, id]
      );
    }
  };

  // Générer le schéma structuré pour SEO
  const generateSchemaMarkup = () => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer.replace(/<[^>]*>/g, ""), // Supprimer les balises HTML
        },
      })),
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    );
  };

  // Génération de la table des matières
  const TableOfContents = ({ items }: { items: FAQItem[] }) => {
    return (
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h3 className="font-semibold mb-2">Table des matières</h3>
        <ol className="list-decimal pl-5 space-y-1">
          {items.map((item) => (
            <li key={`toc-${item.id}`}>
              <a
                href={`#faq-${item.id}`}
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(`faq-${item.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                    toggleItem(item.id);
                  }
                }}
              >
                {item.question}
              </a>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  // Rendu du contenu basé sur l'utilisation de catégories ou non
  const renderContent = () => {
    if (useCategoryTabs && processedCategories.length > 0) {
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 flex flex-wrap">
            {filteredCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                disabled={category.items.length === 0}
                className="flex items-center gap-2"
              >
                {category.name}
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-xs">
                  {category.items.length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {filteredCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="pt-2">
              {showCategoryDescription && category.description && (
                <p className="text-gray-600 mb-6">{category.description}</p>
              )}

              {generateTableOfContents && category.items.length > 3 && (
                <TableOfContents items={category.items} />
              )}

              {category.items.map((item) => (
                <div
                  id={`faq-${item.id}`}
                  key={item.id}
                  className="scroll-mt-20"
                >
                  <FAQAccordion
                    item={item}
                    isOpen={activeItems.includes(item.id)}
                    onToggle={() => toggleItem(item.id)}
                    className={itemClassName}
                    activeClassName={activeItemClassName}
                    animationDuration={animationDuration}
                  />
                </div>
              ))}

              {category.items.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucun résultat ne correspond à votre recherche dans cette
                  catégorie.
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      );
    }

    // Mode sans catégories
    return (
      <>
        {generateTableOfContents && filteredItems.length > 3 && (
          <TableOfContents items={filteredItems} />
        )}

        {filteredItems.map((item) => (
          <div id={`faq-${item.id}`} key={item.id} className="scroll-mt-20">
            <FAQAccordion
              item={item}
              isOpen={activeItems.includes(item.id)}
              onToggle={() => toggleItem(item.id)}
              className={itemClassName}
              activeClassName={activeItemClassName}
              animationDuration={animationDuration}
            />
          </div>
        ))}

        {filteredItems.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            Aucun résultat ne correspond à votre recherche.
          </p>
        )}
      </>
    );
  };

  return (
    <section className={cn("py-12", className)}>
      {enableSchemaMarkup && generateSchemaMarkup()}

      <div className="container mx-auto px-4">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-4"
          >
            {title}
          </motion.h2>
        )}

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 text-center max-w-3xl mx-auto mb-8"
          >
            {description}
          </motion.p>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>

            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10 w-full"
            />
          </div>

          {renderContent()}
        </div>
      </div>
    </section>
  );
};
