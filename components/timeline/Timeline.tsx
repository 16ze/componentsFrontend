import React, { useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { TimelineItem } from "./TimelineItem";
import { TimelineProps, TimelineOrientation } from "./types";

export const Timeline: React.FC<TimelineProps> = ({
  items,
  orientation = "vertical",
  title,
  description,
  alternating = true,
  connectorColor = "bg-gray-200",
  dotColor = "bg-primary",
  animateEntries = true,
  animationDistance = 50,
  animationDuration = 0.5,
  className,
  reverseOrder = false,
  enableDotInteraction = true,
  enableExpandedView = true,
  defaultExpandedIds = [],
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(
    defaultExpandedIds || []
  );

  const sortedItems = [...items];
  if (reverseOrder) {
    sortedItems.reverse();
  }

  const handleToggleExpand = (id: string) => {
    if (!enableExpandedView) return;

    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <section className={cn("py-12", className)}>
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        {(title || description) && (
          <div className="text-center mb-12">
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

        {/* Timeline */}
        {orientation === "vertical" ? (
          <div className="max-w-4xl mx-auto">
            {sortedItems.map((item, index) => (
              <TimelineItem
                key={item.id}
                item={{
                  ...item,
                  dotColor: item.dotColor || dotColor,
                }}
                position={index}
                isAlternating={alternating}
                orientation="vertical"
                connectorColor={connectorColor}
                isExpanded={expandedIds.includes(item.id)}
                onToggleExpand={
                  enableExpandedView ? handleToggleExpand : undefined
                }
                animationDelay={animateEntries ? index * 0.1 : 0}
                isLast={index === sortedItems.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="w-full overflow-x-auto pb-4">
            <div
              className="flex min-w-full"
              style={{
                minWidth: `${sortedItems.length * 250}px`,
                maxWidth: `${sortedItems.length * 400}px`,
              }}
            >
              {sortedItems.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  item={{
                    ...item,
                    dotColor: item.dotColor || dotColor,
                  }}
                  position={index}
                  orientation="horizontal"
                  connectorColor={connectorColor}
                  isExpanded={expandedIds.includes(item.id)}
                  onToggleExpand={
                    enableExpandedView ? handleToggleExpand : undefined
                  }
                  animationDelay={animateEntries ? index * 0.1 : 0}
                  isLast={index === sortedItems.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
