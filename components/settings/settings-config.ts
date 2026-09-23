import { Palette, SlidersHorizontal, UserRound } from "lucide-react";
import type { SettingsTabConfig } from "./types";
import { PersonalizationTab } from "./tabs/personalization-tab";
import { AccountTab } from "./tabs/account-tab";
import { PreferencesTab } from "./tabs/preferences-tab";

/**
 * Конфигурация табов настроек.
 * Для добавления нового таба достаточно создать компонент в папке `tabs/`
 * и добавить сюда один объект с настройками.
 */
export const SETTINGS_TABS: SettingsTabConfig[] = [
  {
    id: "account",
    label: "Account",
    description: "Your profile and personal details",
    icon: UserRound,
    component: AccountTab,
  },
  {
    id: "preferences",
    label: "My preferences",
    description: "Shape your development around your interests and pace",
    icon: SlidersHorizontal,
    component: PreferencesTab,
  },
  {
    id: "personalization",
    label: "Personalization",
    description: "Appearance, theme, and display settings",
    icon: Palette,
    component: PersonalizationTab,
  },
];

export const DEFAULT_SETTINGS_TAB = SETTINGS_TABS[0].id;
