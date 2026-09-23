import { createStore } from "zustand/vanilla";
import type { CareerDataset } from "../core/domain/schemas";
import { completeActivity } from "../core/activities/complete";
import { createDevelopmentCalculator } from "../core/development";
import { resolveCareerGoal } from "../core/trajectory/calculate";
import type { UserPreferences, UserStore, ActionResult } from "./types";

/** Synthetic demo session, not authentication or persistent storage. */
export function createUserStore(input: CareerDataset) {
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
  return createStore<UserStore>()((set, get) => ({
    dataset, selectedEmployeeId: dataset.employees[0].employee_id, preferencesByEmployee,
    dataRevision: 0, preferencesRevision: 0,
    selectEmployee: (id) => {
      if (get().dataset.employees.some((item) => item.employee_id === id) && id !== get().selectedEmployeeId) set({ selectedEmployeeId: id });
    },
    updatePreferences: (patch) => {
      const state = get();
      const employee = state.dataset.employees.find((item) => item.employee_id === state.selectedEmployeeId)!;
      const next = { ...state.preferencesByEmployee[employee.employee_id], ...patch };
      if (patch.careerGoal !== undefined && patch.targetGoal === undefined) {
        next.targetGoal = patch.careerGoal === "grow" ? { target_role: employee.role, target_grade: employee.grade }
          : patch.careerGoal === "promotion" ? resolveCareerGoal({ ...employee, career_goal: null }).target : null;
      }
      if (next.targetGoal && !state.dataset.role_profiles.some((profile) => profile.role === next.targetGoal!.target_role && profile.grade === next.targetGoal!.target_grade)) throw new Error("Unknown target role/grade");
      set({ preferencesByEmployee: { ...state.preferencesByEmployee, [employee.employee_id]: next }, preferencesRevision: state.preferencesRevision + 1 });
    },
    startActivity: (employeeId, eventId) => {
      const state = get();
      if (state.selectedEmployeeId !== employeeId) return error("The selected employee has changed. Try again.");
      const event = state.dataset.events.find((item) => item.event_id === eventId);
      if (!event) return error("Activity not found");
      const existing = state.dataset.activity_history.find((item) => item.employee_id === employeeId && item.event_id === eventId && item.status === "in_progress");
      if (existing) return { ok: true, recordId: existing.record_id };
      const availability = createDevelopmentCalculator(state.dataset).calculateEmployee(employeeId).activities.find((item) => item.eventId === eventId)!;
      if (!availability.available) return error(`Activity unavailable: ${availability.blockers.map((item) => item.code).join(", ")}`);
      if (event.format !== "self_paced" && availability.nextSessionDate !== state.dataset.meta.as_of_date) return error("This session has not started yet");
      let sequence = state.dataRevision + 1;
      let recordId = `LOCAL_${employeeId}_${sequence}`;
      while (state.dataset.activity_history.some((item) => item.record_id === recordId)) recordId = `LOCAL_${employeeId}_${++sequence}`;
      set({ dataset: { ...state.dataset, activity_history: [...state.dataset.activity_history, {
        record_id: recordId, employee_id: employeeId, event_id: eventId, date: state.dataset.meta.as_of_date,
        due_date: null, status: "in_progress", completion_pct: 0, score: null, feedback_rating: null, assigned_by: "self",
      }] }, dataRevision: state.dataRevision + 1 });
      return { ok: true, recordId };
    },
    completeActivity: (employeeId, recordId) => {
      const state = get();
      if (state.selectedEmployeeId !== employeeId) return error("The selected employee has changed. Try again.");
      try {
        const dataset = completeActivity(state.dataset, employeeId, recordId);
        if (dataset !== state.dataset) set({ dataset, dataRevision: state.dataRevision + 1 });
        return { ok: true, recordId };
      } catch (cause) { return error(cause instanceof Error ? cause.message : "Unable to complete activity"); }
    },
  }));
}
