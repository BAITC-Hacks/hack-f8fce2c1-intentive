import type { CareerDataset } from "./domain/schemas";
import { createDatasetIndexes } from "./dataset/indexes";
import { calculateSkillSnapshot, projectEventImpact } from "./skills/calculate";
import { calculateRequirementProgress, calculateTrajectory, type CareerGoal } from "./trajectory/calculate";
import { evaluateActivityAvailability } from "./activities/availability";
import { roleProfileKey } from "./dataset/validate";

/** Build once per validated dataset snapshot. Recreate after import or history changes. */
export function createDevelopmentCalculator(dataset: CareerDataset) {
  const indexes = createDatasetIndexes(dataset);
  return {
    calculateEmployee(employeeId: string, selectedGoal?: CareerGoal | null) {
      const employee = indexes.employeesById.get(employeeId);
      if (!employee) throw new Error(`Unknown employee: ${employeeId}`);
      const history = indexes.historyByEmployee.get(employeeId) ?? [];
      const skills = calculateSkillSnapshot(employee, dataset.skills, indexes.eventsById, history, dataset.meta.as_of_date);
      const trajectory = calculateTrajectory(employee, skills.levels, indexes.roleProfilesByKey, selectedGoal);
      const targetProfile = indexes.roleProfilesByKey.get(roleProfileKey(trajectory.goal.target.target_role, trajectory.goal.target.target_grade))!;
      const activities = dataset.events.map((event) => {
        const availability = evaluateActivityAvailability(employee, skills.levels, event, history, dataset.meta.as_of_date);
        const impact = projectEventImpact(skills.levels, event);
        const projectedProgress = calculateRequirementProgress(impact.levels, targetProfile);
        return {
          ...availability,
          // Hypothetical benefit is separate from eligibility; this does not award any skills.
          impact: {
            changes: impact.changes,
            targetGapReduction: trajectory.target.gapPoints - projectedProgress.gapPoints,
            targetCoveragePercent: projectedProgress.coveragePercent,
          },
        };
      });
      return { employeeId, asOfDate: dataset.meta.as_of_date, skills, trajectory, activities };
    },
  };
}
