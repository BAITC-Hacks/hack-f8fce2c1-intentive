import type { ActivityRecord, DevelopmentEvent, Employee, Skill } from "../domain/schemas";

export interface SkillChange {
  skillId: string;
  before: number;
  after: number;
  gain: number;
}

/** The same formula is used for historical progress and hypothetical event impact. */
export function projectEventImpact(levels: Readonly<Record<string, number>>, event: DevelopmentEvent) {
  const next = { ...levels };
  const changes: SkillChange[] = [];
  for (const development of event.develops_skills) {
    const before = levels[development.skill_id] ?? 0;
    const after = Math.max(before, Math.min(5, development.max_level, before + development.gain));
    next[development.skill_id] = after;
    changes.push({ skillId: development.skill_id, before, after, gain: after - before });
  }
  return { levels: next, changes };
}

export interface SkillSnapshot {
  employeeId: string;
  asOfDate: string;
  reviewDate: string;
  baseline: Record<string, number>;
  levels: Record<string, number>;
  contributions: {
    recordId: string;
    eventId: string;
    effectiveDate: string;
    dateSource: "activity_date_proxy" | "completed_at";
    changes: SkillChange[];
  }[];
}

/** Inputs must come from a validated dataset. Replay always starts from the assessment. */
export function calculateSkillSnapshot(
  employee: Employee,
  skills: readonly Skill[],
  eventsById: ReadonlyMap<string, DevelopmentEvent>,
  history: readonly ActivityRecord[],
  asOfDate: string,
): SkillSnapshot {
  if (asOfDate < employee.last_review_date) throw new Error("Cannot reconstruct skills before the last assessment");
  const baseline = Object.fromEntries(skills.map((skill) => [skill.skill_id, employee.skills[skill.skill_id] ?? 0]));
  let levels = { ...baseline };
  const contributions: SkillSnapshot["contributions"] = [];
  const effectiveDate = (record: ActivityRecord) => record.completed_at ?? record.date;
  const completed = history.filter((record) => record.employee_id === employee.employee_id
    && record.status === "completed"
    && (record.completed_at ? effectiveDate(record) >= employee.last_review_date : effectiveDate(record) > employee.last_review_date)
    && effectiveDate(record) <= asOfDate)
    .sort((a, b) => effectiveDate(a).localeCompare(effectiveDate(b)) || a.record_id.localeCompare(b.record_id));
  for (const record of completed) {
    const event = eventsById.get(record.event_id);
    if (!event) throw new Error(`Unknown event: ${record.event_id}`);
    const impact = projectEventImpact(levels, event);
    levels = impact.levels;
    contributions.push({ recordId: record.record_id, eventId: record.event_id, effectiveDate: effectiveDate(record),
      dateSource: record.completed_at ? "completed_at" : "activity_date_proxy", changes: impact.changes });
  }
  return { employeeId: employee.employee_id, asOfDate, reviewDate: employee.last_review_date, baseline, levels, contributions };
}
