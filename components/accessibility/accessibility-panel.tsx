"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAccessibility } from "./accessibility-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Wheelchair,
  TextCursorInput,
  Contrast,
  Lightbulb,
  MousePointerClick,
  KeyRound,
  Languages,
} from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";

export function AccessibilityPanel() {
  const t = useTranslations("accessibility");
  const [open, setOpen] = useState(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 z-50 rounded-full"
          aria-label={t("accessibilitySettings")}
        >
          <Wheelchair className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t("accessibilitySettings")}</DialogTitle>
          <DialogDescription>
            {t("adjustSettingsForAccessibility")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="display">
          <TabsList className="w-full">
            <TabsTrigger value="display">
              <TextCursorInput className="mr-2 h-4 w-4" />
              {t("display")}
            </TabsTrigger>
            <TabsTrigger value="motion">
              <MousePointerClick className="mr-2 h-4 w-4" />
              {t("motion")}
            </TabsTrigger>
            <TabsTrigger value="language">
              <Languages className="mr-2 h-4 w-4" />
              {t("language")}
            </TabsTrigger>
            <TabsTrigger value="keyboard">
              <KeyRound className="mr-2 h-4 w-4" />
              {t("keyboard")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="display" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">{t("textSize")}</h3>
                <div className="flex items-center justify-between mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseTextSize}
                    aria-label={t("decreaseTextSize")}
                  >
                    A-
                  </Button>
                  <span className="mx-2">{textSize}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseTextSize}
                    aria-label={t("increaseTextSize")}
                  >
                    A+
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetTextSize}
                    className="ml-2"
                    aria-label={t("resetTextSize")}
                  >
                    {t("reset")}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Contrast className="h-4 w-4" />
                  <Label htmlFor="high-contrast">{t("highContrast")}</Label>
                </div>
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={toggleHighContrast}
                  aria-label={t("highContrast")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <Label htmlFor="simplified-mode">{t("simplifiedMode")}</Label>
                </div>
                <Switch
                  id="simplified-mode"
                  checked={simplifiedMode}
                  onCheckedChange={toggleSimplifiedMode}
                  aria-label={t("simplifiedMode")}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="motion" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MousePointerClick className="h-4 w-4" />
                <Label htmlFor="reduced-motion">{t("reducedMotion")}</Label>
              </div>
              <Switch
                id="reduced-motion"
                checked={reducedMotion}
                onCheckedChange={toggleReducedMotion}
                aria-label={t("reducedMotion")}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {t("reducedMotionDescription")}
            </div>
          </TabsContent>

          <TabsContent value="language" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("chooseLanguage")}</Label>
              <div className="py-2">
                <LanguageSwitcher />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("languageChangeDescription")}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="keyboard" className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("keyboardShortcuts")}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Alt + 1</span>
                  <span>{t("navigateToHome")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Alt + 2</span>
                  <span>{t("navigateToShop")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Alt + 3</span>
                  <span>{t("navigateToContact")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Alt + 4</span>
                  <span>{t("navigateToBooking")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Alt + A</span>
                  <span>{t("openAccessibilityPanel")}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
