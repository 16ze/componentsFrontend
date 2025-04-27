import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeroProps } from "./types";

export const Hero: React.FC<HeroProps> = ({
  variant = "image",
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundOpacity = 0.7,
  videoUrl,
  videoThumbnail,
  animationData,
  ctaButtons = [],
  textAlignment = "center",
  textColor = "text-white",
  containerClassName,
  fullHeight = true,
  overlay = true,
  overlayColor = "rgba(0, 0, 0, 0.4)",
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const handleCtaClick = (trackingId?: string) => {
    if (trackingId) {
      // Analytique - remplacer par votre propre implémentation
      console.log(`Conversion tracked: ${trackingId}`);
      // Exemple: analytics.trackConversion(trackingId);
    }
  };

  const renderBackground = () => {
    switch (variant) {
      case "video":
        return (
          <>
            {videoThumbnail && (
              <div className="absolute inset-0 w-full h-full z-0">
                <Image
                  src={videoThumbnail}
                  alt="Video thumbnail"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-10"
              style={{ opacity: backgroundOpacity }}
            >
              <source src={videoUrl} type="video/mp4" />
              Votre navigateur ne prend pas en charge la lecture de vidéos.
            </video>
          </>
        );

      case "animation":
        // Ici, vous pouvez implémenter votre animation personnalisée
        return (
          <div className="absolute inset-0 w-full h-full z-0">
            {/* Intégrer Lottie ou autre solution d'animation ici */}
            <div className="w-full h-full" id="animation-container"></div>
          </div>
        );

      case "image":
      default:
        return backgroundImage ? (
          <div className="absolute inset-0 w-full h-full z-0">
            <Image
              src={backgroundImage}
              alt="Hero background"
              fill
              className="object-cover"
              style={{ opacity: backgroundOpacity }}
              priority
            />
          </div>
        ) : null;
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fullHeight ? "min-h-[80vh]" : "min-h-[50vh]",
        containerClassName
      )}
      ref={ref}
    >
      {renderBackground()}

      {overlay && (
        <div
          className="absolute inset-0 z-20"
          style={{ backgroundColor: overlayColor }}
        ></div>
      )}

      <div className="relative z-30 h-full w-full">
        <div
          className={cn(
            "container mx-auto px-4 h-full flex flex-col justify-center items-center",
            {
              "items-start text-left": textAlignment === "left",
              "items-center text-center": textAlignment === "center",
              "items-end text-right": textAlignment === "right",
            }
          )}
        >
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate={controls}
            className="max-w-4xl"
          >
            {subtitle && (
              <motion.div variants={itemVariants} className="mb-4">
                <span
                  className={cn("text-lg md:text-xl font-medium", textColor)}
                >
                  {subtitle}
                </span>
              </motion.div>
            )}

            <motion.h1
              variants={itemVariants}
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
                textColor
              )}
            >
              {title}
            </motion.h1>

            {description && (
              <motion.p
                variants={itemVariants}
                className={cn("text-lg md:text-xl mb-8", textColor)}
              >
                {description}
              </motion.p>
            )}

            {ctaButtons.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4 mt-6"
              >
                {ctaButtons.map((button, index) => (
                  <Link href={button.href} key={index} legacyBehavior>
                    <Button
                      onClick={() => handleCtaClick(button.trackingId)}
                      variant={button.variant || "default"}
                      size={button.size || "lg"}
                      asChild
                    >
                      <a className="flex items-center gap-2">
                        {button.label}
                        {button.icon && button.icon}
                      </a>
                    </Button>
                  </Link>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
