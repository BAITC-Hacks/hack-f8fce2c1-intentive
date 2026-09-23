import { grades, type Employee, type RoleProfile } from "../domain/schemas";
import { roleProfileKey } from "../dataset/validate";

export type CareerGoal = NonNullable<Employee["career_goal"]>;
export interface ResolvedGoal {
  target: CareerGoal;
  source: "selected" | "profile" | "suggested_next_grade" | "current_role";
}

/** undefined retains the profile goal; null explicitly clears it and uses a provisional path. */
export function resolveCareerGoal(employee: Employee, selectedGoal?: CareerGoal | null): ResolvedGoal {
  const goal = selectedGoal === undefined ? employee.career_goal : selectedGoal;
  if (goal) return { target: { ...goal }, source: selectedGoal === undefined ? "profile" : "selected" };
  const nextGrade = grades[grades.indexOf(employee.grade) + 1];
  return {
    target: { target_role: employee.role, target_grade: nextGrade ?? employee.grade },
    source: nextGrade ? "suggested_next_grade" : "current_role",
  };
}

export interface SkillGap {
  skillId: string;
  current: number;
  required: number;
  gap: number;
  critical: boolean;
}

export interface RequirementProgress {
  skills: SkillGap[];
  requiredPoints: number;
  coveredPoints: number;
  gapPoints: number;
  coveragePercent: number;
  metSkills: number;
  totalSkills: number;
  criticalGaps: SkillGap[];
  allRequirementsMet: boolean;
  criticalRequirementsMet: boolean;
}

/** Coverage is capped per skill: surplus in one skill cannot offset another skill's gap. */
export function calculateRequirementProgress(levels: Readonly<Record<string, number>>, profile: RoleProfile): RequirementProgress {
  const critical = new Set(profile.critical_skills);
  const skills = Object.entries(profile.required_skills).map(([skillId, required]) => {
    const current = levels[skillId] ?? 0;
    return { skillId, current, required, gap: Math.max(0, required - current), critical: critical.has(skillId) };
  }).sort((a, b) => Number(b.critical) - Number(a.critical) || b.gap - a.gap || a.skillId.localeCompare(b.skillId));
  const requiredPoints = skills.reduce((sum, skill) => sum + skill.required, 0);
  const gapPoints = skills.reduce((sum, skill) => sum + skill.gap, 0);
  const coveredPoints = requiredPoints - gapPoints;
  const criticalGaps = skills.filter((skill) => skill.critical && skill.gap > 0);
  return {
    skills, requiredPoints, coveredPoints, gapPoints,
    coveragePercent: requiredPoints === 0 ? 100 : coveredPoints / requiredPoints * 100,
    metSkills: skills.filter((skill) => skill.gap === 0).length,
    totalSkills: skills.length,
    criticalGaps,
    allRequirementsMet: gapPoints === 0,
    criticalRequirementsMet: criticalGaps.length === 0,
  };
}

export function calculateTrajectory(
  employee: Employee,
  levels: Readonly<Record<string, number>>,
  profilesByKey: ReadonlyMap<string, RoleProfile>,
  selectedGoal?: CareerGoal | null,
) {
  const goal = resolveCareerGoal(employee, selectedGoal);
  const currentProfile = profilesByKey.get(roleProfileKey(employee.role, employee.grade));
  const targetProfile = profilesByKey.get(roleProfileKey(goal.target.target_role, goal.target.target_grade));
  if (!currentProfile || !targetProfile) throw new Error("No requirements found for current or target role/grade");
  return {
    goal,
    current: calculateRequirementProgress(levels, currentProfile),
    target: calculateRequirementProgress(levels, targetProfile),
  };
}
