import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CareerDataset } from "../core/domain/schemas";
import { completeActivity } from "../core/activities/complete";
import { startActivity } from "../core/activities/start";
import { createGoalPolicy } from "../core/policies/goal";
import type { UserPreferences, UserStore, ActionResult } from "./types";
import { createAIActions, idleAI } from "./ai-actions";

/** Synthetic demo session; only the interface language is persisted locally. */
export function createUserStore(input: CareerDataset, transport: typeof fetch = fetch) {
  const dataset = structuredClone(input);
  if (!dataset.employees.length) throw new Error("At least one employee is required");
  const preferencesByEmployee = Object.fromEntries(dataset.employees.map((employee) => {
    const goal = employee.career_goal;
    const preferences: UserPreferences = {
      careerGoal: !goal ? "undecided" : goal.target_role !== employee.role ? "change_role"
        : goal.target_grade !== employee.grade ? "promotion" : "grow",
      targetGoal: goal, interests: "", learningFormat: "any", weeklyHours: "undecided",
    };
    return [employee.employee_id, preferences];
  }));
  const error = (message: string): ActionResult => ({ ok: false, error: message });
  return createStore<UserStore>()(persist((set, get) => {
    const aiActions = createAIActions(set, get, transport);
    return {
      language: "en", setLanguage: (language) => {
        if (get().language !== language) set({ language, ai: aiActions.invalidate() });
      },
      dataset, selectedEmployeeId: dataset.employees[0].employee_id, preferencesByEmployee,
    dataRevision: 0, preferencesRevision: 0,
    activityCommands: [], ai: idleAI(), requestAIRecommendations: aiActions.requestAIRecommendations,
    selectEmployee: (id) => {
      if (get().dataset.employees.some((item) => item.employee_id === id) && id !== get().selectedEmployeeId) set({ selectedEmployeeId: id, ai: aiActions.invalidate() });
    },
    updatePreferences: (patch) => {
      const state = get();
      const employee = state.dataset.employees.find((item) => item.employee_id === state.selectedEmployeeId)!;
      const next = { ...state.preferencesByEmployee[employee.employee_id], ...patch };
      if (patch.careerGoal !== undefined && patch.targetGoal === undefined) {
        next.targetGoal = patch.careerGoal === "grow" ? { target_role: employee.role, target_grade: employee.grade }
          : patch.careerGoal === "promotion" ? createGoalPolicy("next_grade").resolve(employee, null).target : null;
      }
      if (next.targetGoal && !state.dataset.role_profiles.some((profile) => profile.role === next.targetGoal!.target_role && profile.grade === next.targetGoal!.target_grade)) throw new Error("Unknown target role/grade");
      set({ preferencesByEmployee: { ...state.preferencesByEmployee, [employee.employee_id]: next }, preferencesRevision: state.preferencesRevision + 1, ai: aiActions.invalidate() });
    },
    startActivity: (employeeId, eventId) => {
      const state = get();
      if (state.selectedEmployeeId !== employeeId) return error("The selected employee has changed. Try again.");
      const event = state.dataset.events.find((item) => item.event_id === eventId);
      if (!event) return error("Activity not found");
      const existing = state.dataset.activity_history.find((item) => item.employee_id === employeeId && item.event_id === eventId && item.status === "in_progress");
      if (existing) return { ok: true, recordId: existing.record_id };
      let sequence = state.dataRevision + 1;
      let recordId = `LOCAL_${employeeId}_${sequence}`;
      while (state.dataset.activity_history.some((item) => item.record_id === recordId)) recordId = `LOCAL_${employeeId}_${++sequence}`;
      try {
        const dataset = startActivity(state.dataset, employeeId, eventId, recordId);
        set({ dataset, dataRevision: state.dataRevision + 1, ai: aiActions.invalidate(),
          activityCommands: [...state.activityCommands, { kind: "start", employeeId, eventId, recordId }] });
      } catch (cause) { return error(cause instanceof Error ? cause.message : "Unable to start activity"); }
      return { ok: true, recordId };
    },
    completeActivity: (employeeId, recordId) => {
      const state = get();
      if (state.selectedEmployeeId !== employeeId) return error("The selected employee has changed. Try again.");
      try {
        const dataset = completeActivity(state.dataset, employeeId, recordId);
        if (dataset !== state.dataset) set({ dataset, dataRevision: state.dataRevision + 1, ai: aiActions.invalidate(),
          activityCommands: [...state.activityCommands, { kind: "complete", employeeId, recordId }] });
        return { ok: true, recordId };
      } catch (cause) { return error(cause instanceof Error ? cause.message : "Unable to complete activity"); }
    },
  }; }, {
    name: "intentive-user-settings",
    storage: createJSONStorage(() => typeof window === "undefined"
      ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      : window.localStorage),
    skipHydration: true,
    partialize: (state) => ({ language: state.language }) as UserStore,
    version: 1,
  }));
}
