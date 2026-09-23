import { createDevelopmentCalculator } from "../core/development";
import type { CareerDataset } from "../core/domain/schemas";
import type { Development, UserPreferences, UserStore } from "./types";

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
