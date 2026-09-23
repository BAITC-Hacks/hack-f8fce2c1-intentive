import type { CareerDataset } from "../domain/schemas";
import { createDevelopmentCalculator } from "../development";

export interface HRFilters {
  department: string;
  role: string;
  grade: string;
}

export const ALL = "all";

/** Aggregates the selected cohort. No employee-level result leaves this function. */
export function createHROverview(dataset: CareerDataset, filters: HRFilters) {
  const people = dataset.employees.filter((employee) =>
    (filters.department === ALL || employee.department === filters.department)
    && (filters.role === ALL || employee.role === filters.role)
    && (filters.grade === ALL || employee.grade === filters.grade));
  const selectedIds = new Set(people.map((employee) => employee.employee_id));
  const skillNames = new Map(dataset.skills.map((skill) => [skill.skill_id, skill.name]));
  const eventMap = new Map(dataset.events.map((event) => [event.event_id, event]));
  const calculator = createDevelopmentCalculator(dataset);
  const skills = new Map<string, { skillId: string; name: string; people: number; criticalPeople: number; missingLevels: number }>();
  const opportunities = new Map<string, { eventId: string; title: string; format: string; durationHours: number; people: number; gapReduction: number }>();
  let coverage = 0;
  let withCriticalGaps = 0;
  let withProvisionalGoals = 0;

  for (const employee of people) {
    const development = calculator.calculateEmployee(employee.employee_id, employee.career_goal ?? null);
    coverage += development.trajectory.target.coveragePercent;
    if (development.trajectory.target.criticalGaps.length) withCriticalGaps++;
    if (development.trajectory.goal.source === "suggested_next_grade" || development.trajectory.goal.source === "current_role") withProvisionalGoals++;
    for (const gap of development.trajectory.target.skills) {
      if (!gap.gap) continue;
      const entry = skills.get(gap.skillId) ?? { skillId: gap.skillId, name: skillNames.get(gap.skillId) ?? gap.skillId, people: 0, criticalPeople: 0, missingLevels: 0 };
      entry.people++;
      entry.missingLevels += gap.gap;
      if (gap.critical) entry.criticalPeople++;
      skills.set(gap.skillId, entry);
    }
    for (const activity of development.activities) {
      if (!activity.available || activity.impact.targetGapReduction <= 0) continue;
      const event = eventMap.get(activity.eventId)!;
      const entry = opportunities.get(event.event_id) ?? { eventId: event.event_id, title: event.title, format: event.format,
        durationHours: event.duration_hours, people: 0, gapReduction: 0 };
      entry.people++;
      entry.gapReduction += activity.impact.targetGapReduction;
      opportunities.set(event.event_id, entry);
    }
  }

  const asOfDate = dataset.meta.as_of_date;
  const windowStart = new Date(Date.parse(`${asOfDate}T00:00:00Z`) - 365 * 86400000).toISOString().slice(0, 10);
  const recent = dataset.activity_history.filter((record) => selectedIds.has(record.employee_id)
    && (record.completed_at ?? record.date) >= windowStart && (record.completed_at ?? record.date) <= asOfDate);
  const voluntary = recent.filter((record) => !eventMap.get(record.event_id)?.mandatory);
  const completed = voluntary.filter((record) => record.status === "completed");
  const active = dataset.activity_history.filter((record) => selectedIds.has(record.employee_id)
    && record.date <= asOfDate && !eventMap.get(record.event_id)?.mandatory && record.status === "in_progress");
  const notFinished = voluntary.filter((record) => record.status === "dropped" || record.status === "no_show" || record.status === "declined");
  const overdueMandatory = dataset.activity_history.filter((record) => selectedIds.has(record.employee_id)
    && record.date <= asOfDate && record.status === "overdue" && eventMap.get(record.event_id)?.mandatory);

  return {
    asOfDate, windowStart, people: people.length,
    averageCoverage: people.length ? Math.round(coverage / people.length) : 0,
    withCriticalGaps, withProvisionalGoals,
    completed: completed.length,
    completedPeople: new Set(completed.map((record) => record.employee_id)).size,
    activePeople: new Set(active.map((record) => record.employee_id)).size,
    notFinished: notFinished.length,
    overdueMandatory: overdueMandatory.length,
    skills: [...skills.values()].sort((a, b) => b.people - a.people || b.criticalPeople - a.criticalPeople || b.missingLevels - a.missingLevels || a.name.localeCompare(b.name)),
    opportunities: [...opportunities.values()].sort((a, b) => b.people - a.people || b.gapReduction - a.gapReduction || a.eventId.localeCompare(b.eventId)),
  };
}
