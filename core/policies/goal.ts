import { grades, type Employee } from "../domain/schemas";

export type CareerGoal = NonNullable<Employee["career_goal"]>;
export interface ResolvedGoal {
  target: CareerGoal;
  source: "selected" | "profile" | "suggested_next_grade" | "current_role";
}
export interface GoalPolicy {
  version: string;
  resolve: (employee: Employee, selectedGoal?: CareerGoal | null) => ResolvedGoal;
}

/** Replace the resolver to introduce another provisional-goal strategy. Explicit goals win. */
export function createGoalPolicy(fallback: "next_grade" | "current_role"): GoalPolicy {
  return {
    version: `goal-${fallback}-v1`,
    resolve(employee, selectedGoal) {
      const goal = selectedGoal === undefined ? employee.career_goal : selectedGoal;
      if (goal) return { target: { ...goal }, source: selectedGoal === undefined ? "profile" : "selected" };
      const nextGrade = fallback === "next_grade" ? grades[grades.indexOf(employee.grade) + 1] : undefined;
      return {
        target: { target_role: employee.role, target_grade: nextGrade ?? employee.grade },
        source: nextGrade ? "suggested_next_grade" : "current_role",
      };
    },
  };
}
