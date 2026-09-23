import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { importDataset } from "../core/dataset/import.ts";
import { calculateSkillSnapshot, projectEventImpact } from "../core/skills/calculate.ts";
import { calculateRequirementProgress, calculateTrajectory, resolveCareerGoal } from "../core/trajectory/calculate.ts";
import { evaluateActivityAvailability } from "../core/activities/availability.ts";
import { createDevelopmentCalculator } from "../core/development.ts";
import { roleProfileKey } from "../core/dataset/validate.ts";

const read = (name) => readFileSync(new URL(`../career_quest_dataset/${name}`, import.meta.url), "utf8");
const dataset = importDataset({ employees: read("employees.json"), events: read("events.json"), skills: read("skills.json"), activityHistoryCsv: read("activity_history.csv") });
const employee = { ...dataset.employees[0], skills: { SK_SYSTEM_DESIGN: 2 }, last_review_date: "2026-09-01" };
const event = { ...dataset.events.find((item) => item.event_id === "EV_005"), prerequisites: {}, upcoming_sessions: ["2026-10-20", "2026-10-01"] };
const record = (id, overrides = {}) => ({ record_id: id, employee_id: employee.employee_id, event_id: event.event_id,
  date: "2026-09-10", due_date: null, status: "completed", completion_pct: 100, score: null, feedback_rating: null, assigned_by: "self", ...overrides });
const snapshot = (history, events = [event]) => calculateSkillSnapshot(employee, dataset.skills, new Map(events.map((item) => [item.event_id, item])), history, "2026-10-01");
const profile = { role: employee.role, grade: "Middle", required_skills: { SK_SYSTEM_DESIGN: 4, SK_PUBLIC_SPEAKING: 2 }, critical_skills: ["SK_SYSTEM_DESIGN"] };
const available = (changes = {}, history = [], levels = {}) => evaluateActivityAvailability(employee, levels, { ...event, ...changes }, history, "2026-10-01");
const codes = (result) => result.blockers.map((blocker) => blocker.code);

test("replay excludes assessed, same-day, incomplete, future and other employee activity", () => {
  const history = [
    record("before", { date: "2026-08-31" }), record("same", { date: employee.last_review_date }),
    record("incomplete", { status: "in_progress", completion_pct: 80 }), record("future", { date: "2026-10-02" }),
    record("other", { employee_id: "OTHER" }), record("eligible"),
  ];
  const result = snapshot(history);
  assert.equal(result.levels.SK_SYSTEM_DESIGN, 3);
  assert.equal(result.baseline.SK_SYSTEM_DESIGN, 2);
  assert.equal(result.levels.SK_PUBLIC_SPEAKING, 0);
  assert.deepEqual(result.contributions.map((item) => item.recordId), ["eligible"]);
  assert.equal(result.contributions[0].dateSource, "activity_date_proxy");
});

test("gain respects event caps and never reduces existing higher skills", () => {
  const result = projectEventImpact({ SK_SYSTEM_DESIGN: 5, SK_API_DESIGN: 2 }, event);
  assert.equal(result.levels.SK_SYSTEM_DESIGN, 5);
  assert.equal(result.changes.find((item) => item.skillId === "SK_SYSTEM_DESIGN").gain, 0);
  assert.equal(result.levels.SK_API_DESIGN, 3);
});

test("history replays chronologically with deterministic ties and does not mutate inputs", () => {
  const lower = { ...event, event_id: "LOW", develops_skills: [{ skill_id: "SK_SYSTEM_DESIGN", gain: 1, max_level: 3 }] };
  const higher = { ...event, event_id: "HIGH", develops_skills: [{ skill_id: "SK_SYSTEM_DESIGN", gain: 1, max_level: 5 }] };
  const history = [record("B", { event_id: "HIGH" }), record("A", { event_id: "LOW" })];
  const before = JSON.stringify({ history, employee, lower, higher });
  const result = snapshot(history, [lower, higher]);
  assert.equal(result.levels.SK_SYSTEM_DESIGN, 4);
  assert.deepEqual(result.contributions.map((item) => item.recordId), ["A", "B"]);
  assert.deepEqual(snapshot(history, [lower, higher]), result);
  assert.equal(JSON.stringify({ history, employee, lower, higher }), before);
});

test("recurring club contributes per participation and compliance grants no skills", () => {
  const club = { ...event, event_id: "EV_036", develops_skills: [{ skill_id: "SK_SYSTEM_DESIGN", gain: 1, max_level: 5 }] };
  const compliance = { ...dataset.events[0] };
  const result = snapshot([record("A", { event_id: club.event_id }), record("B", { event_id: club.event_id }), record("C", { event_id: compliance.event_id })], [club, compliance]);
  assert.equal(result.levels.SK_SYSTEM_DESIGN, 4);
  assert.deepEqual(result.contributions[2].changes, []);
});

test("explicit goal, profile goal, provisional next grade and Lead fallback are distinct", () => {
  assert.equal(resolveCareerGoal(employee).source, "profile");
  const selected = { target_role: "Data Analyst", target_grade: "Senior" };
  assert.deepEqual(resolveCareerGoal(employee, selected), { target: selected, source: "selected" });
  assert.equal(resolveCareerGoal(employee, null).source, "suggested_next_grade");
  assert.deepEqual(resolveCareerGoal({ ...employee, grade: "Lead", career_goal: null }), {
    target: { target_role: employee.role, target_grade: "Lead" }, source: "current_role",
  });
  const profiles = new Map(dataset.role_profiles.map((item) => [roleProfileKey(item.role, item.grade), item]));
  assert.throws(() => calculateTrajectory(employee, {}, profiles, { target_role: "Unknown", target_grade: "Lead" }), /No requirements/);
});

test("coverage caps each skill and exposes critical blockers without asserting promotion", () => {
  const result = calculateRequirementProgress({ SK_SYSTEM_DESIGN: 5 }, profile);
  assert.equal(result.coveredPoints, 4);
  assert.equal(result.gapPoints, 2);
  assert.equal(result.coveragePercent, 4 / 6 * 100);
  assert.equal(result.criticalRequirementsMet, true);
  assert.equal(result.allRequirementsMet, false);
  const blocked = calculateRequirementProgress({ SK_SYSTEM_DESIGN: 3, SK_PUBLIC_SPEAKING: 5 }, profile);
  assert.equal(blocked.criticalGaps[0].gap, 1);
  assert.equal(blocked.criticalRequirementsMet, false);
  assert.equal(calculateRequirementProgress({}, { ...profile, required_skills: {}, critical_skills: [] }).coveragePercent, 100);
});

test("availability reports every hard constraint with prerequisite evidence", () => {
  const result = available({ mandatory: true, target_roles: ["Other"], target_grades: ["Lead"], prerequisites: { SK_SYSTEM_DESIGN: 3 }, upcoming_sessions: [] });
  assert.equal(result.available, false);
  assert.deepEqual(codes(result), ["mandatory", "role_mismatch", "grade_mismatch", "prerequisite_gap", "no_future_session"]);
  assert.deepEqual(result.blockers[3], { code: "prerequisite_gap", skillId: "SK_SYSTEM_DESIGN", current: 0, required: 3 });
});

test("scheduling includes snapshot day and self-paced events need no session", () => {
  assert.equal(available().nextSessionDate, "2026-10-01");
  assert.equal(available({ upcoming_sessions: ["2026-09-30"] }).available, false);
  const result = available({ format: "self_paced", upcoming_sessions: [] });
  assert.equal(result.available, true);
  assert.equal(result.nextSessionDate, null);
});

test("completion and active participation block a new step; past declines do not", () => {
  assert.ok(codes(available({}, [record("complete")])).includes("already_completed"));
  assert.ok(codes(available({}, [record("active", { status: "in_progress" })])).includes("already_in_progress"));
  for (const status of ["declined", "dropped", "no_show"]) assert.equal(available({}, [record(status, { status })]).available, true);
  assert.equal(available({}, [record("other", { employee_id: "OTHER" })]).available, true);
  assert.equal(available({ event_id: "EV_036" }, [record("club", { event_id: "EV_036" })]).available, true);
  assert.equal(available({ event_id: "EV_036" }, [record("club", { event_id: "EV_036", status: "in_progress" })]).available, false);
});

test("current employee audience applies even when the target role/grade is different", () => {
  assert.equal(available({ target_grades: ["Senior"] }).available, false);
  assert.equal(available({ target_roles: ["Data Analyst"] }).available, false);
  assert.equal(available({ prerequisites: { SK_SYSTEM_DESIGN: 3 } }, [], { SK_SYSTEM_DESIGN: 3 }).available, true);
});

test("all 200 real profiles calculate deterministically with bounded progress and no mutation", () => {
  const before = JSON.stringify(dataset);
  const calculator = createDevelopmentCalculator(dataset);
  for (const person of dataset.employees) {
    const result = calculator.calculateEmployee(person.employee_id);
    assert.equal(result.activities.length, 40);
    assert.equal(Object.keys(result.skills.levels).length, 60);
    for (const value of Object.values(result.skills.levels)) assert.ok(value >= 0 && value <= 5);
    for (const value of [result.trajectory.current, result.trajectory.target]) assert.ok(value.coveragePercent >= 0 && value.coveragePercent <= 100);
    for (const activity of result.activities) {
      assert.ok(activity.impact.targetGapReduction >= 0);
      if (activity.available) assert.equal(dataset.events.find((item) => item.event_id === activity.eventId).mandatory, false);
    }
    assert.deepEqual(calculator.calculateEmployee(person.employee_id), result);
  }
  assert.equal(JSON.stringify(dataset), before);
  assert.throws(() => calculator.calculateEmployee("MISSING"), /Unknown employee/);
});

test("recalculation after completion updates gaps; repeated calculation cannot award twice", () => {
  const demo = structuredClone(dataset);
  demo.employees = [employee];
  demo.activity_history = [];
  const before = createDevelopmentCalculator(demo).calculateEmployee(employee.employee_id);
  demo.activity_history.push(record("NEW"));
  const calculator = createDevelopmentCalculator(demo);
  const after = calculator.calculateEmployee(employee.employee_id);
  assert.equal(after.skills.levels.SK_SYSTEM_DESIGN, before.skills.levels.SK_SYSTEM_DESIGN + 1);
  assert.ok(after.trajectory.target.gapPoints < before.trajectory.target.gapPoints);
  assert.ok(after.activities.find((item) => item.eventId === event.event_id).blockers.some((item) => item.code === "already_completed"));
  assert.deepEqual(calculator.calculateEmployee(employee.employee_id), after);
});
