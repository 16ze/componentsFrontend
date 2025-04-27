"use client";

import { useTranslations, useFormatter, useNow } from "next-intl";
import { useAccessibility } from "./accessibility-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LanguageSwitcher } from "./language-switcher";

export function AccessibilityTestPage() {
  const t = useTranslations();
  const format = useFormatter();
  const now = useNow();
  const {
    textSize,
    increaseTextSize,
    decreaseTextSize,
    resetTextSize,
    highContrast,
    toggleHighContrast,
    simplifiedMode,
    toggleSimplifiedMode,
    reducedMotion,
    toggleReducedMotion,
  } = useAccessibility();

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">{t("common.welcome")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("accessibility.accessibilitySettings")}</CardTitle>
          <CardDescription>
            {t("accessibility.adjustSettingsForAccessibility")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-semibold">
              {t("accessibility.textSize")}: {textSize}%
            </h2>
            <div className="flex space-x-2">
              <Button onClick={decreaseTextSize}>
                {t("accessibility.decreaseTextSize")}
              </Button>
              <Button onClick={increaseTextSize}>
                {t("accessibility.increaseTextSize")}
              </Button>
              <Button variant="outline" onClick={resetTextSize}>
                {t("accessibility.resetTextSize")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-semibold">{t("common.language")}</h2>
            <LanguageSwitcher />
          </div>

          <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-semibold">
              {t("accessibility.visualPreferences")}
            </h2>
            <div className="flex space-x-2">
              <Button
                variant={highContrast ? "default" : "outline"}
                onClick={toggleHighContrast}
              >
                {t("accessibility.highContrast")}:{" "}
                {highContrast ? t("common.on") : t("common.off")}
              </Button>
              <Button
                variant={simplifiedMode ? "default" : "outline"}
                onClick={toggleSimplifiedMode}
              >
                {t("accessibility.simplifiedMode")}:{" "}
                {simplifiedMode ? t("common.on") : t("common.off")}
              </Button>
              <Button
                variant={reducedMotion ? "default" : "outline"}
                onClick={toggleReducedMotion}
              >
                {t("accessibility.reducedMotion")}:{" "}
                {reducedMotion ? t("common.on") : t("common.off")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("common.examples")}</CardTitle>
          <CardDescription>
            {t("common.internationalizedExamples")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t("dates.today")}</h3>
            <p>{format.dateTime(now, { dateStyle: "full" })}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium">{t("common.currency")}</h3>
            <p>
              {format.number(1234.56, { style: "currency", currency: "EUR" })}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium">{t("common.pluralization")}</h3>
            <p>{t("common.itemCount", { count: 0 })}</p>
            <p>{t("common.itemCount", { count: 1 })}</p>
            <p>{t("common.itemCount", { count: 5 })}</p>
          </div>

          <div className="mt-8">
            <p className="mb-4">
              {t("accessibility.keyboardAccessibilityInfo")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="#"
                className="block p-4 border rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none"
              >
                {t("navigation.home")}
              </a>
              <a
                href="#"
                className="block p-4 border rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none"
              >
                {t("navigation.shop")}
              </a>
              <a
                href="#"
                className="block p-4 border rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none"
              >
                {t("navigation.contact")}
              </a>
              <a
                href="#"
                className="block p-4 border rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none"
              >
                {t("navigation.booking")}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
