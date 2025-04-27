"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { locales } from "@/app/i18n/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useEffect } from "react";

const languageNames: Record<string, { native: string; localized: string }> = {
  fr: { native: "Français", localized: "Français" },
  en: { native: "English", localized: "Anglais" },
  ar: { native: "العربية", localized: "Arabe" },
  es: { native: "Español", localized: "Espagnol" },
  de: { native: "Deutsch", localized: "Allemand" },
};

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Fonction pour changer la langue
  const handleLocaleChange = (newLocale: string) => {
    // Supprimer le préfixe de locale actuel
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

    // Rediriger vers le même chemin avec la nouvelle locale
    router.push(`/${newLocale}${pathWithoutLocale}`);

    // Stockage de la préférence de langue dans localStorage
    localStorage.setItem("preferred-locale", newLocale);

    // Force refresh pour appliquer les changements
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2" aria-label={t("languageSelector")}>
      <Globe className="h-4 w-4" aria-hidden="true" />
      <Select defaultValue={locale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-[140px]" aria-label={t("selectLanguage")}>
          <SelectValue placeholder={languageNames[locale]?.native} />
        </SelectTrigger>
        <SelectContent>
          {locales.map((loc) => (
            <SelectItem key={loc} value={loc}>
              <span lang={loc}>{languageNames[loc]?.native}</span>
              {loc !== locale && (
                <span className="ml-2 text-muted-foreground">
                  ({languageNames[loc]?.localized})
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
