import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine et gère les classes Tailwind CSS conditionnelles
 * @param  {...string} inputs - Les classes Tailwind CSS à combiner
 * @returns {string} - Les classes combinées et sans conflit
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
