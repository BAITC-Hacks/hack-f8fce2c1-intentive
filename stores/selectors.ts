import { createDevelopmentCalculator } from "../core/development";
import type { CareerDataset } from "../core/domain/schemas";
import type { Development, UserPreferences, UserStore } from "./types";
import { createRecommendationEngine, type RecommendationResult } from "../core/recommendations/recommend";

export const selectEmployees = (state: UserStore) => state.dataset.employees;
export const selectProfile = (state: UserStore) => state.dataset.employees.find((item) => item.employee_id === state.selectedEmployeeId)!;
export const selectPreferences = (state: UserStore) => state.preferencesByEmployee[state.selectedEmployeeId];

/** One selector per consumer: stable snapshots for useSyncExternalStore, no global cache. */
export function createDevelopmentSelector() {
  let dataset: CareerDataset | undefined;
  let calculator: ReturnType<typeof createDevelopmentCalculator>;
  let employeeId: string | undefined;
  let preferences: UserPreferences | undefined;
  let result: Development;
  return (state: UserStore) => {
    if (state.dataset !== dataset) {
      dataset = state.dataset;
      calculator = createDevelopmentCalculator(dataset);
      employeeId = undefined;
    }
    const nextPreferences = selectPreferences(state);
    if (employeeId !== state.selectedEmployeeId || preferences !== nextPreferences) {
      employeeId = state.selectedEmployeeId;
      preferences = nextPreferences;
      result = calculator.calculateEmployee(employeeId, preferences.targetGoal);
    }
    return result;
  };
}

export function createRecommendationSelector() {
  let dataset: CareerDataset | undefined;
  let engine: ReturnType<typeof createRecommendationEngine>;
  let employeeId: string | undefined;
  let preferences: UserPreferences | undefined;
  let result: RecommendationResult;
  return (state: UserStore) => {
    if (dataset !== state.dataset) {
      dataset = state.dataset;
      engine = createRecommendationEngine(dataset);
      employeeId = undefined;
    }
    const next = selectPreferences(state);
    if (employeeId !== state.selectedEmployeeId || preferences !== next) {
      employeeId = state.selectedEmployeeId;
      preferences = next;
      // Explicit literal matches only; semantic/multilingual interest interpretation is a separate layer.
      const normalize = (text: string) => ` ${text.toLowerCase().replace(/[^\p{L}\p{N}_]+/gu, " ").trim()} `;
      const interests = normalize(preferences.interests);
      const interestSkillIds = dataset.skills.filter((skill) => interests.includes(normalize(skill.name))
        || interests.includes(normalize(skill.skill_id))).map((skill) => skill.skill_id);
      result = engine.recommend(employeeId, preferences.targetGoal, {
        preferredFormat: preferences.learningFormat === "self_paced" ? "self_paced" : undefined,
        preferredType: preferences.learningFormat === "workshop" || preferences.learningFormat === "mentoring" ? preferences.learningFormat : undefined,
        weeklyHours: preferences.weeklyHours === "undecided" ? undefined : Number(preferences.weeklyHours),
        interestSkillIds,
      });
    }
    return result;
  };
}
