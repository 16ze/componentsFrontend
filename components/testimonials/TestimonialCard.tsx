import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TestimonialCardProps } from "./types";

const animationVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  },
  slide: {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
  },
  scale: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  },
  none: {
    hidden: {},
    visible: {},
  },
};

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  showRating = true,
  showDate = false,
  enableMicrodata = false,
  className,
  animationVariant = "fade",
}) => {
  const {
    quote,
    authorName,
    authorTitle,
    authorCompany,
    authorImage,
    rating,
    date,
    url,
  } = testimonial;

  const formattedDate = date
    ? format(new Date(date), "d MMMM yyyy", { locale: fr })
    : null;

  // Construction du schema.org pour les microdata
  const structuredData = enableMicrodata
    ? {
        "@context": "https://schema.org",
        "@type": "Review",
        reviewBody: quote,
        author: {
          "@type": "Person",
          name: authorName,
        },
        ...(authorCompany && {
          itemReviewed: {
            "@type": "Organization",
            name: authorCompany,
          },
        }),
        ...(rating && {
          reviewRating: {
            "@type": "Rating",
            ratingValue: rating,
            bestRating: 5,
          },
        }),
        ...(date && { datePublished: date }),
      }
    : null;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={animationVariants[animationVariant]}
    >
      <Card className={cn("h-full", className)}>
        <CardContent className="pt-6">
          <div className="mb-4">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
          </div>

          <p className="text-base md:text-lg font-medium mb-6">{quote}</p>

          {showRating && rating && (
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < rating ? "text-yellow-400" : "text-gray-300"
                  )}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center pt-0 border-t">
          <div className="flex items-center gap-4">
            {authorImage ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src={authorImage}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <span className="text-lg font-medium text-gray-600">
                  {authorName.charAt(0)}
                </span>
              </div>
            )}

            <div>
              <p className="font-semibold">{authorName}</p>

              {(authorTitle || authorCompany) && (
                <p className="text-sm text-gray-600">
                  {authorTitle}
                  {authorTitle && authorCompany && ", "}
                  {authorCompany}
                </p>
              )}

              {showDate && formattedDate && (
                <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
              )}
            </div>
          </div>
        </CardFooter>

        {enableMicrodata && structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </Card>
    </motion.div>
  );
};
