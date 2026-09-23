import type { CareerDataset } from "../core/domain/schemas";
import type { CareerGoal } from "../core/trajectory/calculate";
import type { createDevelopmentCalculator } from "../core/development";
import type { AIClientState, ActivityCommand } from "../core/ai/contracts";

export interface UserPreferences {
  careerGoal: string;
  targetGoal: CareerGoal | null;
  interests: string;
  learningFormat: string;
  weeklyHours: string;
}
export type Language = "en" | "ru";
export type Development = ReturnType<ReturnType<typeof createDevelopmentCalculator>["calculateEmployee"]>;
export type ActionResult = { ok: true; recordId: string } | { ok: false; error: string };
export interface UserStore {
  language: Language;
  setLanguage: (language: Language) => void;
  dataset: CareerDataset;
  selectedEmployeeId: string;
  preferencesByEmployee: Record<string, UserPreferences>;
  dataRevision: number;
  preferencesRevision: number;
  activityCommands: ActivityCommand[];
  ai: AIClientState;
  requestAIRecommendations: () => Promise<void>;
  selectEmployee: (id: string) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  startActivity: (employeeId: string, eventId: string) => ActionResult;
  completeActivity: (employeeId: string, recordId: string) => ActionResult;
}
