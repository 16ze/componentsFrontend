import { StaticImageData } from "next/image";
import { ReactNode } from "react";

export type HeroVariant = "image" | "video" | "animation";

export type CtaButton = {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  icon?: ReactNode;
  trackingId?: string;
};

export interface HeroProps {
  variant: HeroVariant;
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string | StaticImageData;
  backgroundOpacity?: number;
  videoUrl?: string;
  videoThumbnail?: string | StaticImageData;
  animationData?: any;
  ctaButtons?: CtaButton[];
  textAlignment?: "left" | "center" | "right";
  textColor?: string;
  containerClassName?: string;
  fullHeight?: boolean;
  overlay?: boolean;
  overlayColor?: string;
}
