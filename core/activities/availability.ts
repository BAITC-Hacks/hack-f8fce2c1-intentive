import type { ActivityRecord, DevelopmentEvent, Employee } from "../domain/schemas";

export type ActivityBlocker =
  | { code: "mandatory" | "role_mismatch" | "grade_mismatch" | "already_completed" | "already_in_progress" | "no_future_session" }
  | { code: "prerequisite_gap"; skillId: string; current: number; required: number };

export interface ActivityAvailability {
  eventId: string;
  available: boolean;
  blockers: ActivityBlocker[];
  nextSessionDate: string | null;
}

/** Availability for a voluntary NEXT step, not permission to complete an existing assignment. */
export function evaluateActivityAvailability(
  employee: Employee,
  levels: Readonly<Record<string, number>>,
  event: DevelopmentEvent,
  history: readonly ActivityRecord[],
  asOfDate: string,
): ActivityAvailability {
  const blockers: ActivityBlocker[] = [];
  const participation = history.filter((record) => record.employee_id === employee.employee_id
    && record.event_id === event.event_id && record.date <= asOfDate);
  if (event.mandatory) blockers.push({ code: "mandatory" });
  if (!event.target_roles.includes(employee.role)) blockers.push({ code: "role_mismatch" });
  if (!event.target_grades.includes(employee.grade)) blockers.push({ code: "grade_mismatch" });
  if (event.event_id !== "EV_036" && participation.some((record) => record.status === "completed")) blockers.push({ code: "already_completed" });
  if (participation.some((record) => record.status === "in_progress" || record.status === "overdue")) blockers.push({ code: "already_in_progress" });
  for (const [skillId, required] of Object.entries(event.prerequisites)) {
    const current = levels[skillId] ?? 0;
    if (current < required) blockers.push({ code: "prerequisite_gap", skillId, current, required });
  }
  const nextSessionDate = event.format === "self_paced" ? null
    : [...event.upcoming_sessions].filter((date) => date >= asOfDate).sort()[0] ?? null;
  if (event.format !== "self_paced" && !nextSessionDate) blockers.push({ code: "no_future_session" });
  return { eventId: event.event_id, available: blockers.length === 0, blockers, nextSessionDate };
}
