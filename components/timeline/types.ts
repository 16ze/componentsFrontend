import { StaticImageData } from "next/image";
import { ReactNode } from "react";

export type TimelineOrientation = "vertical" | "horizontal";

export type TimelineMedia = {
  type: "image" | "video" | "embed";
  url: string | StaticImageData;
  caption?: string;
  width?: number;
  height?: number;
};

export interface TimelineItem {
  id: string;
  title: string;
  date: string;
  description: string;
  icon?: ReactNode;
  customDot?: ReactNode;
  dotColor?: string;
  media?: TimelineMedia;
  links?: Array<{
    label: string;
    url: string;
    external?: boolean;
  }>;
  highlighted?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  orientation?: TimelineOrientation;
  title?: string;
  description?: string;
  alternating?: boolean;
  connectorColor?: string;
  dotColor?: string;
  animateEntries?: boolean;
  animationDistance?: number;
  animationDuration?: number;
  className?: string;
  reverseOrder?: boolean;
  enableDotInteraction?: boolean;
  enableExpandedView?: boolean;
  defaultExpandedIds?: string[];
}
