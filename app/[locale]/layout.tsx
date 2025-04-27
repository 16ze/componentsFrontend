import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import { ReactQueryProvider } from "@/lib/providers/ReactQueryProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTimeZone } from "next-intl/server";
import { ThemeProvider } from "@/components/accessibility/theme-provider";
import { AccessibilityProvider } from "@/components/accessibility/accessibility-provider";
import { AccessibilityPanel } from "@/components/accessibility/accessibility-panel";
import { isRTL } from "@/app/i18n/settings";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const messages = await getMessages({ locale: params.locale });

  return {
    title: "Kairo Digital - Plateforme CRM",
    description: "Plateforme CRM et e-commerce complète",
    // Support pour les balises HTML dir et lang pour l'accessibilité
    alternates: {
      languages: {
        fr: "/fr",
        en: "/en",
        ar: "/ar",
        es: "/es",
        de: "/de",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const timeZone = await getTimeZone();
  const dir = isRTL(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {/* Meta-balises pour l'accessibilité */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone={timeZone}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AccessibilityProvider>
              <ReactQueryProvider>{children}</ReactQueryProvider>
              <AccessibilityPanel />
            </AccessibilityProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
