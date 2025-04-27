import { getRequestConfig } from "next-intl/server";

export const locales = ["fr", "en", "ar", "es", "de"];
export const defaultLocale = "fr";

export default getRequestConfig(async ({ locale }) => {
  const messages = (await import(`./messages/${locale}.json`)).default;
  return {
    messages,
    timeZone: "Europe/Paris",
    now: new Date(),
    locale,
  };
});

// Configuration pour les langages RTL
export const isRTL = (locale: string) => ["ar", "he"].includes(locale);

// Formatage des dates et nombres selon la locale
export const getFormatOptions = (locale: string) => {
  const baseOptions = {
    date: {
      short: {
        day: "numeric",
        month: "short",
        year: "numeric",
      } as Intl.DateTimeFormatOptions,
      long: {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      } as Intl.DateTimeFormatOptions,
    },
    number: {
      currency: {
        style: "currency",
        currency: locale === "fr" ? "EUR" : "USD",
      } as Intl.NumberFormatOptions,
      percent: {
        style: "percent",
      } as Intl.NumberFormatOptions,
    },
  };

  return baseOptions;
};
