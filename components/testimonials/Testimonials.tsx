import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TestimonialCard } from "./TestimonialCard";
import { TestimonialsProps } from "./types";

export const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials,
  title,
  description,
  displayMode = "grid",
  columns = 3,
  showRatings = true,
  showDates = false,
  enableMicrodata = true,
  className,
  itemClassName,
  animationVariant = "fade",
  autoplay = false,
  autoplaySpeed = 5000,
  enableNavigation = true,
  enablePagination = true,
  enableTouchDrag = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [animationID, setAnimationID] = useState<number | null>(null);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (autoplay && displayMode === "slider") {
      const interval = setInterval(handleNext, autoplaySpeed);
      return () => clearInterval(interval);
    }
  }, [autoplay, autoplaySpeed, displayMode, activeIndex]);

  // Fonctions pour le slider tactile
  const touchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!enableTouchDrag || displayMode !== "slider") return;

    setIsDragging(true);

    let clientX;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    setStartPos(clientX);
    if (animationID !== null) {
      cancelAnimationFrame(animationID);
      setAnimationID(null);
    }
  };

  const touchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !enableTouchDrag || displayMode !== "slider") return;

    let currentPosition;
    if ("touches" in e) {
      currentPosition = e.touches[0].clientX;
    } else {
      currentPosition = e.clientX;
    }

    const diff = currentPosition - startPos;
    setCurrentTranslate(diff);

    const animation = () => {
      if (sliderRef.current) {
        sliderRef.current.style.transform = `translateX(calc(-${
          activeIndex * 100
        }% + ${currentTranslate}px))`;
      }
      if (isDragging) {
        const id = requestAnimationFrame(animation);
        setAnimationID(id);
      }
    };

    requestAnimationFrame(animation);
  };

  const touchEnd = () => {
    if (!isDragging || !enableTouchDrag || displayMode !== "slider") return;

    setIsDragging(false);

    if (animationID !== null) {
      cancelAnimationFrame(animationID);
      setAnimationID(null);
    }

    const threshold = 100; // déplacement minimum pour changer de slide

    if (currentTranslate < -threshold) {
      handleNext();
    } else if (currentTranslate > threshold) {
      handlePrev();
    }

    setCurrentTranslate(0);
  };

  // Définition des styles de grille en fonction du nombre de colonnes
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  // Schema.org pour l'ensemble des témoignages
  const structuredData = enableMicrodata
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: testimonials.map((testimonial, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Review",
            reviewBody: testimonial.quote,
            author: {
              "@type": "Person",
              name: testimonial.authorName,
            },
            ...(testimonial.rating && {
              reviewRating: {
                "@type": "Rating",
                ratingValue: testimonial.rating,
                bestRating: 5,
              },
            }),
          },
        })),
      }
    : null;

  return (
    <section className={cn("py-12 md:py-16", className)}>
      {/* Schéma structuré pour SEO */}
      {enableMicrodata && structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* En-tête de section */}
      {(title || description) && (
        <div className="container mx-auto px-4 mb-12 text-center">
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
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
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              {description}
            </motion.p>
          )}
        </div>
      )}

      {/* Conteneur des témoignages */}
      <div className="container mx-auto px-4">
        {displayMode === "grid" && (
          <div className={cn("grid gap-6", gridClasses[columns])}>
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                showRating={showRatings}
                showDate={showDates}
                enableMicrodata={false} // Microdata est déjà défini au niveau liste
                className={itemClassName}
                animationVariant={animationVariant}
              />
            ))}
          </div>
        )}

        {displayMode === "list" && (
          <div className="space-y-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                showRating={showRatings}
                showDate={showDates}
                enableMicrodata={false}
                className={cn("max-w-3xl mx-auto", itemClassName)}
                animationVariant={animationVariant}
              />
            ))}
          </div>
        )}

        {displayMode === "slider" && (
          <div className="relative">
            <div
              className="overflow-hidden"
              onTouchStart={touchStart}
              onTouchMove={touchMove}
              onTouchEnd={touchEnd}
              onMouseDown={touchStart}
              onMouseMove={touchMove}
              onMouseUp={touchEnd}
              onMouseLeave={touchEnd}
            >
              <div
                ref={sliderRef}
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <TestimonialCard
                      testimonial={testimonial}
                      showRating={showRatings}
                      showDate={showDates}
                      enableMicrodata={false}
                      className={cn("max-w-2xl mx-auto", itemClassName)}
                      animationVariant="none" // Désactiver l'animation individuelle en mode slider
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            {enableNavigation && testimonials.length > 1 && (
              <div className="flex justify-center mt-8 gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="rounded-full h-10 w-10"
                  aria-label="Témoignage précédent"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="rounded-full h-10 w-10"
                  aria-label="Témoignage suivant"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Pagination */}
            {enablePagination && testimonials.length > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      index === activeIndex
                        ? "bg-primary w-4"
                        : "bg-gray-300 hover:bg-gray-400"
                    )}
                    aria-label={`Aller au témoignage ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
