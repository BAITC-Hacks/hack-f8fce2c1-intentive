"use client";

import { useUserStore } from "@/components/providers/user-store-provider";

export function useDashboardLanguage() {
  const language = useUserStore((state) => state.language);
  return {
    language,
    text: (ru: string, en: string) => language === "ru" ? ru : en,
  };
}
