export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  description?: string;
  items: FAQItem[];
}

export interface FAQProps {
  items: FAQItem[];
  categories?: FAQCategory[];
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  useCategoryTabs?: boolean;
  generateTableOfContents?: boolean;
  enableSchemaMarkup?: boolean;
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  animationDuration?: number;
  defaultOpen?: string[];
  accordionType?: "single" | "multiple";
  showCategoryDescription?: boolean;
}
