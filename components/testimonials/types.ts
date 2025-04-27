import { StaticImageData } from "next/image";

export type TestimonialDisplayMode = "grid" | "list" | "slider";

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  authorImage?: string | StaticImageData;
  rating?: number; // étoiles sur 5
  date?: string;
  url?: string; // URL externe vers le témoignage complet
}

export interface TestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  description?: string;
  displayMode?: TestimonialDisplayMode;
  columns?: 1 | 2 | 3 | 4;
  showRatings?: boolean;
  showDates?: boolean;
  enableMicrodata?: boolean;
  className?: string;
  itemClassName?: string;
  animationVariant?: "fade" | "slide" | "scale" | "none";
  autoplay?: boolean;
  autoplaySpeed?: number;
  enableNavigation?: boolean;
  enablePagination?: boolean;
  enableTouchDrag?: boolean;
}

export interface TestimonialCardProps {
  testimonial: Testimonial;
  showRating?: boolean;
  showDate?: boolean;
  enableMicrodata?: boolean;
  className?: string;
  animationVariant?: "fade" | "slide" | "scale" | "none";
}
