import { createStore } from "zustand/vanilla";
import type { Employee } from "../lib/employees";

export interface UserPreferences {
  careerGoal: string;
  interests: string;
  learningFormat: string;
  weeklyHours: string;
}

export interface UserStore {
  accountType: "employee" | "hr";
  employees: Employee[];
  profile: Employee;
  preferences: UserPreferences;
  preferencesByEmployee: Record<string, UserPreferences>;
  setAccountType: (accountType: "employee" | "hr") => void;
  selectEmployee: (employeeId: string) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

function initialPreferences(employee: Employee): UserPreferences {
  const goal = employee.career_goal;
  return {
    careerGoal: !goal ? "undecided" : goal.target_role !== employee.role
      ? "change_role" : goal.target_grade !== employee.grade ? "promotion" : "grow",
    interests: "", learningFormat: "any", weeklyHours: "undecided",
  };
}

// Synthetic demo profiles only; selection is not authentication.
export function createUserStore(employees: Employee[]) {
  const profile = employees[0];
  if (!profile) throw new Error("At least one employee is required");
  return createStore<UserStore>()((set) => ({
    accountType: "employee",
    employees,
    profile,
    preferences: initialPreferences(profile),
    preferencesByEmployee: {},
    setAccountType: (accountType) => set({ accountType }),
    selectEmployee: (employeeId) => set((state) => {
      const employee = state.employees.find((item) => item.employee_id === employeeId);
      if (!employee || employee.employee_id === state.profile.employee_id) return state;
      return {
        profile: employee,
        preferences: state.preferencesByEmployee[employeeId] ?? initialPreferences(employee),
      };
    }),
    updatePreferences: (preferences) =>
      set((state) => {
        const updated = { ...state.preferences, ...preferences };
        return {
          preferences: updated,
          preferencesByEmployee: { ...state.preferencesByEmployee, [state.profile.employee_id]: updated },
        };
      }),
  }));
}
