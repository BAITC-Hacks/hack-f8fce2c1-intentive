"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useColorTheme, type ColorTheme } from "@/components/themes/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUserStore } from "@/components/providers/user-store-provider";
import { useSettingsI18n } from "../i18n";

const MODE_OPTIONS = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    icon: Laptop,
  },
] as const;

const THEME_PREVIEWS: Record<
  ColorTheme,
  { label: string; primary: string; secondary: string; accent: string }
> = {
  claude: {
    label: "Claude",
    primary: "bg-[oklch(0.62_0.14_41)] dark:bg-[oklch(0.68_0.14_41)]",
    secondary: "bg-[oklch(0.94_0.01_95)] dark:bg-[oklch(0.33_0.01_60)]",
    accent: "bg-[oklch(0.91_0.03_60)] dark:bg-[oklch(0.38_0.04_45)]",
  },
  harbor: {
    label: "Harbor",
    primary: "bg-[oklch(0.55_0.16_245)] dark:bg-[oklch(0.72_0.12_230)]",
    secondary: "bg-[oklch(0.93_0.025_235)] dark:bg-[oklch(0.30_0.025_250)]",
    accent: "bg-[oklch(0.89_0.045_220)] dark:bg-[oklch(0.32_0.04_235)]",
  },
  dusk: {
    label: "Dusk",
    primary: "bg-[oklch(0.54_0.17_350)] dark:bg-[oklch(0.73_0.13_350)]",
    secondary: "bg-[oklch(0.94_0.025_45)] dark:bg-[oklch(0.30_0.028_340)]",
    accent: "bg-[oklch(0.91_0.05_25)] dark:bg-[oklch(0.32_0.045_350)]",
  },
};

export function PersonalizationTab() {
  const { t, language } = useSettingsI18n();
  const setLanguage = useUserStore((state) => state.setLanguage);
  const { theme, setTheme } = useTheme();
  const {
    colorTheme,
    setColorTheme,
    colorThemes,
    highContrast,
    setHighContrast,
  } = useColorTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Секция выбора языка — приведа к единому стилю с карточкой контрастности */}
      <section className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-muted/25 px-3.5 py-3">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-xs font-medium text-foreground">{t.chooseLanguage}</p>
          <p className="truncate text-xs text-muted-foreground">{t.languageDescription}</p>
        </div>
        <Select value={language} onValueChange={(value) => { if (value === "en" || value === "ru") setLanguage(value); }}>
          <SelectTrigger aria-label={t.chooseLanguage} className="h-9 w-[140px] shrink-0 px-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="en">{t.english}</SelectItem>
            <SelectItem value="ru">{t.russian}</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Верхний блок: Заголовок + Select справа + Карточки цветов */}
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              {t.colorAccent}
            </h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.colorDescription}
            </p>
          </div>

          {/* Select переключения темы (Light/Dark/System) справа */}
          <Select
            value={theme || "system"}
            onValueChange={(value) => {
              if (value) setTheme(value);
            }}
          >
            <SelectTrigger className="h-9 w-[130px] shrink-0 px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {MODE_OPTIONS.map((item) => {
                const Icon = item.icon;

                return (
                  <SelectItem key={item.value} value={item.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="size-3.5 text-muted-foreground" />
                      <span>{item.value === "light" ? t.light : item.value === "dark" ? t.dark : t.system}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Сетка карточек с акцентными цветами */}
        <div className="grid grid-cols-3 gap-3">
          {colorThemes.map((item) => {
            const isSelected = colorTheme === item.id;
            const preview = THEME_PREVIEWS[item.id] || THEME_PREVIEWS.claude;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setColorTheme(item.id)}
                className={cn(
                  "group relative flex aspect-square flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30 shadow-xs"
                    : "border-border/50 bg-card hover:border-border hover:bg-accent/30"
                )}
              >
                {/* Цветовое превью */}
                <div className="flex flex-1 items-center justify-center rounded-lg border border-border/30 bg-background/50 p-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "size-4 rounded-full shadow-2xs transition-transform group-hover:scale-105",
                        preview.primary
                      )}
                    />
                    <span
                      className={cn(
                        "size-3.5 rounded-full transition-transform group-hover:scale-105",
                        preview.secondary
                      )}
                    />
                    <span
                      className={cn(
                        "size-2.5 rounded-full transition-transform group-hover:scale-105",
                        preview.accent
                      )}
                    />
                  </div>
                </div>

                <div className="mt-2 flex w-full items-center justify-between">
                  <span
                    className={cn(
                      "text-xs transition-colors",
                      isSelected
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {preview.label}
                  </span>

                  {isSelected && (
                    <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Нижняя секция: High contrast */}
      <section className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-muted/25 px-3.5 py-3">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-xs font-medium text-foreground">{t.highContrast}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t.contrastDescription}
          </p>
        </div>
        <Switch
          checked={highContrast}
          onCheckedChange={setHighContrast}
          aria-label={t.toggleContrast}
        />
      </section>
    </div>
  );
}