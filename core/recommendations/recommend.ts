import type { CareerDataset, DevelopmentEvent } from "../domain/schemas";
import { createDevelopmentCalculator } from "../development";
import { developmentPolicy } from "../config";
import type { CareerGoal, GoalPolicy } from "../policies/goal";
import type { RecommendationPolicy, RankingFactors } from "./policy";

export interface RecommendationPreferences {
  preferredFormat?: DevelopmentEvent["format"];
  preferredType?: DevelopmentEvent["type"];
  interestSkillIds?: readonly string[];
  weeklyHours?: number;
}
export interface RecommendationPolicies {
  goal: GoalPolicy;
  recommendations: RecommendationPolicy;
}

/** Deterministic factual selection. No LLM calls, promises of promotion or inferred attendance dates. */
export function createRecommendationEngine(dataset: CareerDataset, policies: RecommendationPolicies = developmentPolicy) {
  const policy = policies.recommendations;
  if (![1, 2, 3].includes(policy.limit) || !Number.isInteger(policy.historyWindowDays) || policy.historyWindowDays < 1
    || Object.values(policy.weights).some((value) => !Number.isFinite(value) || value < 0)
    || Object.values(policy.historyWeights).some((value) => !Number.isFinite(value) || value < -1 || value > 1)) throw new Error("Invalid recommendation policy");
  const calculator = createDevelopmentCalculator(dataset, policies.goal);
  const eventsById = new Map(dataset.events.map((event) => [event.event_id, event]));
  const skillsById = new Map(dataset.skills.map((skill) => [skill.skill_id, skill]));
  const snapshotTime = Date.parse(`${dataset.meta.as_of_date}T00:00:00Z`);
  const windowStart = new Date(snapshotTime - policy.historyWindowDays * 86400000).toISOString().slice(0, 10);

  return {
    recommend(employeeId: string, selectedGoal?: CareerGoal | null, preferences: RecommendationPreferences = {}) {
      if (preferences.weeklyHours !== undefined && (!Number.isFinite(preferences.weeklyHours) || preferences.weeklyHours <= 0)) throw new Error("Weekly hours must be positive");
      const development = calculator.calculateEmployee(employeeId, selectedGoal);
      const employee = dataset.employees.find((item) => item.employee_id === employeeId)!;
      const recentHistory = dataset.activity_history.filter((record) => {
        const date = record.completed_at ?? record.date;
        return record.employee_id === employeeId && date >= windowStart && date <= dataset.meta.as_of_date;
      });
      const candidates = development.activities.filter((activity) => activity.available && activity.impact.targetGapReduction > 0).map((activity) => {
        const event = eventsById.get(activity.eventId)!;
        const skillGaps = development.trajectory.target.skills.filter((gap) => gap.gap > 0).flatMap((gap) => {
          const change = activity.impact.changes.find((item) => item.skillId === gap.skillId);
          if (!change || change.gain <= 0) return [];
          return [{ ...gap, name: skillsById.get(gap.skillId)!.name, after: change.after, reduction: Math.min(change.gain, gap.gap) }];
        });
        // Similarity is transparent: same event, or same format and at least one shared developed skill.
        const relevantHistory = recentHistory.filter((record) => {
          const past = eventsById.get(record.event_id)!;
          return !past.mandatory && (past.event_id === event.event_id || (past.format === event.format
            && past.develops_skills.some((skill) => event.develops_skills.some((target) => target.skill_id === skill.skill_id))));
        });
        const count = (status: string) => relevantHistory.filter((record) => record.status === status).length;
        const history = {
          windowStart, recordIds: relevantHistory.map((record) => record.record_id),
          completed: count("completed"), noShow: count("no_show"), dropped: count("dropped"), declined: count("declined"),
        };
        const outcomes = history.completed + history.noShow + history.dropped + history.declined;
        const interestSkills = skillGaps.filter((gap) => preferences.interestSkillIds?.includes(gap.skillId)).map((gap) => gap.skillId);
        const preferenceMatch = (preferences.preferredFormat === event.format || preferences.preferredType === event.type) ? 1 : 0;
        const estimatedWeeks = preferences.weeklyHours ? event.duration_hours / preferences.weeklyHours : null;
        const factors: RankingFactors = {
          criticalGapReduction: skillGaps.filter((gap) => gap.critical).reduce((sum, gap) => sum + gap.reduction, 0),
          gapReduction: activity.impact.targetGapReduction,
          historyAffinity: outcomes ? (history.completed * policy.historyWeights.completed + history.noShow * policy.historyWeights.noShow
            + history.dropped * policy.historyWeights.dropped + history.declined * policy.historyWeights.declined) / outcomes : 0,
          preferenceMatch,
          interestMatch: interestSkills.length ? 1 : 0,
          effortFit: estimatedWeeks === null ? 0 : 1 / Math.max(1, estimatedWeeks),
        };
        const score = policy.score(Object.freeze(factors), policy.weights);
        if (!Number.isFinite(score)) throw new Error("Ranking strategy returned a non-finite score");
        const target = development.trajectory.goal.target;
        const reasons = [
          `Your current role is ${employee.grade} ${employee.role}; the target is ${target.target_grade} ${target.target_role}. This activity accepts your current role and grade.`,
          skillGaps.map((gap) => `${gap.name}: ${gap.current}/${gap.required} required, projected ${gap.after}${gap.critical ? " (critical skill)" : ""}.`).join(" "),
          outcomes ? `Since ${windowStart}, similar voluntary activities: ${history.completed} completed, ${history.noShow} missed, ${history.dropped} dropped, ${history.declined} declined.`
            : `No completed, missed, dropped or declined similar voluntary activities since ${windowStart}; history has a neutral effect.`,
        ];
        if (preferenceMatch) reasons.push("Matches your preferred learning format or activity type.");
        if (interestSkills.length) reasons.push("Develops a skill you explicitly expressed interest in.");
        if (estimatedWeeks !== null) reasons.push(`${event.duration_hours} total hours is approximately ${Math.ceil(estimatedWeeks)} weeks at ${preferences.weeklyHours} hours/week; the actual schedule may differ.`);
        return {
          eventId: event.event_id, score, factors, reasons,
          evidence: { currentRole: employee.role, currentGrade: employee.grade, target, skillGaps, history, interestSkills,
            durationHours: event.duration_hours, estimatedWeeks, nextSessionDate: activity.nextSessionDate },
          projectedCoveragePercent: activity.impact.targetCoveragePercent,
        };
      });
      candidates.sort((a, b) => b.score - a.score || a.eventId.localeCompare(b.eventId));
      const recommendations = candidates.slice(0, policy.limit);
      const emptyReason = recommendations.length ? null
        : development.trajectory.target.allRequirementsMet ? "goal_requirements_met" as const
          : development.activities.some((item) => item.available) ? "no_goal_improving_activity" as const : "no_available_activity" as const;
      return {
        employeeId, asOfDate: dataset.meta.as_of_date,
        policyVersion: policy.version, goalPolicyVersion: policies.goal.version,
        mode: "deterministic" as const,
        goal: development.trajectory.goal,
        recommendations, emptyReason,
        candidates,
        candidateCount: candidates.length,
        exclusions: development.activities.filter((item) => !item.available || item.impact.targetGapReduction === 0)
          .map((item) => ({ eventId: item.eventId, blockers: item.blockers, noGoalBenefit: item.impact.targetGapReduction === 0 })),
      };
    },
  };
}

export type RecommendationResult = ReturnType<ReturnType<typeof createRecommendationEngine>["recommend"]>;
