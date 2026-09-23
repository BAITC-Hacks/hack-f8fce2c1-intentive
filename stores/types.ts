import type { CareerDataset } from "../core/domain/schemas";
import type { CareerGoal } from "../core/trajectory/calculate";
import type { createDevelopmentCalculator } from "../core/development";

export interface UserPreferences {
  careerGoal: string;
  targetGoal: CareerGoal | null;
  interests: string;
  learningFormat: string;
  weeklyHours: string;
}
export type Development = ReturnType<ReturnType<typeof createDevelopmentCalculator>["calculateEmployee"]>;
export type ActionResult = { ok: true; recordId: string } | { ok: false; error: string };
export interface UserStore {
  dataset: CareerDataset;
  selectedEmployeeId: string;
  preferencesByEmployee: Record<string, UserPreferences>;
  dataRevision: number;
  preferencesRevision: number;
  selectEmployee: (id: string) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  startActivity: (employeeId: string, eventId: string) => ActionResult;
  completeActivity: (employeeId: string, recordId: string) => ActionResult;
}
