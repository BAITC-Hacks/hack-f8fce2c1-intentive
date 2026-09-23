import type React from "react";
import type { LucideIcon } from "lucide-react";

export interface SettingsTabConfig {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  badge?: string;
  component: React.ComponentType;
}
