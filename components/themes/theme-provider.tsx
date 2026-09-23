"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export type ColorTheme = "claude" | "harbor" | "dusk";

export interface ColorThemeOption {
  id: ColorTheme;
  name: string;
  primaryColor: string;
}

export const COLOR_THEMES: ColorThemeOption[] = [
  { id: "claude", name: "Claude", primaryColor: "oklch(0.62 0.14 41)" },
  { id: "harbor", name: "Harbor", primaryColor: "oklch(0.55 0.16 245)" },
  { id: "dusk", name: "Dusk", primaryColor: "oklch(0.54 0.17 350)" },
];

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  colorThemes: ColorThemeOption[];
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const ColorThemeContext = React.createContext<ColorThemeContextType>({
  colorTheme: "claude",
  setColorTheme: () => {},
  colorThemes: COLOR_THEMES,
  highContrast: false,
  setHighContrast: () => {},
});

export function useColorTheme() {
  return React.useContext(ColorThemeContext);
}

const COLOR_THEME_STORAGE_KEY = "intentive_color_theme";
const HIGH_CONTRAST_STORAGE_KEY = "intentive_high_contrast";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [colorTheme, setColorThemeState] = React.useState<ColorTheme>("claude");
  const [highContrast, setHighContrastState] = React.useState(false);

  React.useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ColorTheme | null;
      if (savedTheme && COLOR_THEMES.some((t) => t.id === savedTheme)) {
        setColorThemeState(savedTheme);
        const root = document.documentElement;
        if (savedTheme === "claude") {
          root.removeAttribute("data-theme");
        } else {
          root.setAttribute("data-theme", savedTheme);
        }
      }

      const savedHighContrast = localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY) === "true";
      setHighContrastState(savedHighContrast);
      document.documentElement.toggleAttribute("data-high-contrast", savedHighContrast);
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const setHighContrast = React.useCallback((enabled: boolean) => {
    setHighContrastState(enabled);
    document.documentElement.toggleAttribute("data-high-contrast", enabled);
    try {
      localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, String(enabled));
    } catch {
      // Ignore localStorage write errors
    }
  }, []);

  const setColorTheme = React.useCallback((newTheme: ColorTheme) => {
    setColorThemeState(newTheme);
    const root = document.documentElement;
    if (newTheme === "claude") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", newTheme);
    }
    try {
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore localStorage write errors
    }
  }, []);

  return (
    <ColorThemeContext.Provider
      value={{
        colorTheme,
        setColorTheme,
        colorThemes: COLOR_THEMES,
        highContrast,
        setHighContrast,
      }}
    >
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ColorThemeContext.Provider>
  );
}
