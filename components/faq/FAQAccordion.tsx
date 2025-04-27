import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { FAQItem } from "./types";

interface FAQAccordionProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  activeClassName?: string;
  animationDuration?: number;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  item,
  isOpen,
  onToggle,
  className,
  activeClassName,
  animationDuration = 300,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">(0);

  // Mesure la hauteur du contenu pour l'animation
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [item.answer]);

  return (
    <div
      className={cn(
        "border rounded-md overflow-hidden mb-4",
        isOpen ? activeClassName || "border-primary" : "border-gray-200",
        className
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between w-full p-4 text-left font-medium transition-colors",
          isOpen ? "bg-primary/5 text-primary" : "hover:bg-gray-50"
        )}
        aria-expanded={isOpen}
      >
        <span>{item.question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: contentHeight,
              opacity: 1,
              transition: {
                height: { duration: animationDuration / 1000 },
                opacity: {
                  duration: (animationDuration / 1000) * 0.5,
                  delay: (animationDuration / 1000) * 0.2,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: (animationDuration / 1000) * 0.75 },
                opacity: { duration: (animationDuration / 1000) * 0.25 },
              },
            }}
            className="overflow-hidden"
          >
            <div
              ref={contentRef}
              className="p-4 pt-0 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
