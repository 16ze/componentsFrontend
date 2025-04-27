import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TimelineItem as TimelineItemType, TimelineMedia } from "./types";

interface TimelineItemProps {
  item: TimelineItemType;
  position: number;
  isAlternating?: boolean;
  orientation?: "vertical" | "horizontal";
  connectorColor?: string;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  animationDelay?: number;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  position,
  isAlternating = false,
  orientation = "vertical",
  connectorColor = "bg-gray-200",
  isExpanded = false,
  onToggleExpand,
  animationDelay = 0,
  isLast = false,
}) => {
  const {
    id,
    title,
    date,
    description,
    icon,
    customDot,
    dotColor = "bg-primary",
    media,
    links,
    highlighted = false,
  } = item;

  const [isHovered, setIsHovered] = useState(false);

  const renderMedia = (media: TimelineMedia) => {
    switch (media.type) {
      case "image":
        return (
          <div className="relative rounded-md overflow-hidden my-4 aspect-video">
            <Image
              src={media.url}
              alt={media.caption || title}
              fill
              className="object-cover"
            />
            {media.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-3 py-2 text-sm">
                {media.caption}
              </div>
            )}
          </div>
        );

      case "video":
        return (
          <div className="my-4 rounded-md overflow-hidden aspect-video">
            <video
              src={media.url as string}
              controls
              className="w-full h-full object-cover"
              poster={media.caption}
            >
              Votre navigateur ne prend pas en charge la lecture de vidéos.
            </video>
          </div>
        );

      case "embed":
        return (
          <div className="my-4 rounded-md overflow-hidden aspect-video">
            <iframe
              src={media.url as string}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={media.caption || title}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const isRight = isAlternating ? position % 2 === 1 : false;

  const renderContent = () => (
    <>
      <div
        className={cn(
          "flex flex-col",
          highlighted && "bg-primary/5 p-4 rounded-lg border border-primary/10",
          !highlighted && isExpanded && "bg-gray-50 p-4 rounded-lg"
        )}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">{date}</p>

        {isExpanded || !onToggleExpand ? (
          <>
            <div className="prose prose-sm max-w-none">
              {typeof description === "string" ? (
                <p>{description}</p>
              ) : (
                description
              )}
            </div>

            {media && renderMedia(media)}

            {links && links.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    legacyBehavior
                  >
                    <Button variant="outline" size="sm" asChild>
                      <a className="flex items-center gap-1">
                        {link.label}
                        {link.external && <ExternalLink className="h-3 w-3" />}
                      </a>
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="line-clamp-2 text-sm text-gray-700">
            {typeof description === "string"
              ? description
              : "Cliquez pour afficher plus de détails"}
          </p>
        )}
      </div>

      {onToggleExpand && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleExpand(id)}
          className="self-end mt-1"
        >
          <span className="text-xs mr-1">
            {isExpanded ? "Réduire" : "Lire plus"}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </Button>
      )}
    </>
  );

  // Animations
  const entryAnimationVariants = {
    hidden:
      orientation === "vertical"
        ? { opacity: 0, y: 50 }
        : { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.5,
        delay: animationDelay,
      },
    },
  };

  // Timeline en mode vertical
  if (orientation === "vertical") {
    return (
      <motion.div
        className={cn(
          "relative grid grid-cols-[auto_1fr] md:grid-cols-[1fr_auto_1fr]",
          "gap-x-4 md:gap-x-8 pb-8",
          isLast && "pb-0"
        )}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={entryAnimationVariants}
      >
        {/* Contenu à gauche (si alternant) */}
        {isAlternating && (
          <div
            className={cn(
              "hidden md:block",
              isRight ? "md:col-start-1" : "md:col-start-1 md:col-end-2"
            )}
          >
            {!isRight && renderContent()}
          </div>
        )}

        {/* Point et connecteur */}
        <div
          className={cn(
            "relative flex flex-col items-center",
            isAlternating ? "md:col-start-2" : "col-start-1"
          )}
        >
          <div
            className={cn(
              "shrink-0 h-8 w-8 rounded-full flex items-center justify-center z-10",
              isHovered || highlighted ? "scale-110" : "scale-100",
              "transition-transform duration-200",
              dotColor
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {customDot || icon || (
              <span className="text-white text-xs font-bold">
                {position + 1}
              </span>
            )}
          </div>

          {!isLast && (
            <div
              className={cn(
                "absolute top-8 bottom-0 w-1 left-1/2 transform -translate-x-1/2",
                connectorColor
              )}
            />
          )}
        </div>

        {/* Contenu principal (ou à droite si alternant) */}
        <div
          className={cn(
            isAlternating
              ? isRight
                ? "md:col-start-3"
                : "md:col-start-3 md:hidden"
              : "col-start-2"
          )}
        >
          {(isRight || !isAlternating) && renderContent()}
        </div>
      </motion.div>
    );
  }

  // Timeline en mode horizontal
  return (
    <motion.div
      className="relative flex-1 min-w-[250px] px-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={entryAnimationVariants}
    >
      <div className="relative pb-12">
        {/* Connecteur */}
        {!isLast && (
          <div
            className={cn("absolute left-0 right-0 top-4 h-1", connectorColor)}
          />
        )}

        {/* Point */}
        <div
          className={cn(
            "relative h-8 w-8 mx-auto rounded-full flex items-center justify-center z-10 mb-4",
            dotColor,
            isHovered || highlighted ? "scale-110" : "scale-100",
            "transition-transform duration-200"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {customDot || icon || (
            <span className="text-white text-xs font-bold">{position + 1}</span>
          )}
        </div>

        {/* Contenu */}
        <div className="text-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500 mb-2">{date}</p>

          {isExpanded || !onToggleExpand ? (
            <>
              <div className="prose prose-sm max-w-none">
                {typeof description === "string" ? (
                  <p>{description}</p>
                ) : (
                  description
                )}
              </div>

              {media && renderMedia(media)}

              {links && links.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      legacyBehavior
                    >
                      <Button variant="outline" size="sm" asChild>
                        <a className="flex items-center gap-1">
                          {link.label}
                          {link.external && (
                            <ExternalLink className="h-3 w-3" />
                          )}
                        </a>
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="line-clamp-2 text-sm text-gray-700">
              {typeof description === "string"
                ? description
                : "Cliquez pour afficher plus de détails"}
            </p>
          )}

          {onToggleExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(id)}
              className="mx-auto mt-1"
            >
              <span className="text-xs mr-1">
                {isExpanded ? "Réduire" : "Lire plus"}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
