import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { importDataset } from "../core/dataset/import.ts";
import { createUserStore } from "../stores/career-store.ts";
import { createDevelopmentSelector, selectPreferences, selectProfile } from "../stores/selectors.ts";
import { completeActivity } from "../core/activities/complete.ts";

const read = (name) => readFileSync(new URL(`../career_quest_dataset/${name}`, import.meta.url), "utf8");
const base = importDataset({ employees: read("employees.json"), events: read("events.json"), skills: read("skills.json"), activityHistoryCsv: read("activity_history.csv") });
function fixture() {
  const dataset = structuredClone(base);
  const employee = dataset.employees[0];
  employee.last_review_date = "2026-09-20";
  employee.skills.SK_SYSTEM_DESIGN = 1;
  employee.skills.SK_API_DESIGN = 1;
  dataset.activity_history = dataset.activity_history.filter((item) => item.employee_id !== employee.employee_id);
  dataset.activity_history.push({ record_id: "ACTIVE", employee_id: employee.employee_id, event_id: "EV_005", date: "2026-09-01", due_date: null, status: "in_progress", completion_pct: 40, score: null, feedback_rating: null, assigned_by: "self" });
  return dataset;
}

test("completion after assessment counts old enrollment once and keeps enrollment date", () => {
  const input = fixture();
  const original = JSON.stringify(input);
  const store = createUserStore(input);
  const select = createDevelopmentSelector();
  const employeeId = store.getState().selectedEmployeeId;
  const before = select(store.getState());
  assert.equal(store.getState().completeActivity(employeeId, "ACTIVE").ok, true);
  const after = select(store.getState());
  assert.equal(after.skills.levels.SK_SYSTEM_DESIGN, before.skills.levels.SK_SYSTEM_DESIGN + 1);
  assert.ok(after.trajectory.target.gapPoints < before.trajectory.target.gapPoints);
  const completed = store.getState().dataset.activity_history.find((item) => item.record_id === "ACTIVE");
  assert.equal(completed.date, "2026-09-01");
  assert.equal(completed.completed_at, "2026-10-01");
  assert.equal(after.skills.contributions.find((item) => item.recordId === "ACTIVE").dateSource, "completed_at");
  const state = store.getState();
  assert.equal(state.completeActivity(employeeId, "ACTIVE").ok, true);
  assert.equal(store.getState(), state);
  assert.equal(select(store.getState()), after);
  assert.equal(JSON.stringify(input), original);
});

test("profiles retain their own preferences and progress, selectors are referentially stable", () => {
  const store = createUserStore(fixture());
  const select = createDevelopmentSelector();
  const [first, second] = store.getState().dataset.employees;
  store.getState().updatePreferences({ interests: "Architecture", careerGoal: "grow" });
  const firstPreferences = selectPreferences(store.getState());
  assert.equal(firstPreferences.targetGoal.target_grade, first.grade);
  const development = select(store.getState());
  assert.equal(select(store.getState()), development);
  store.getState().selectEmployee(second.employee_id);
  assert.equal(selectProfile(store.getState()).employee_id, second.employee_id);
  assert.equal(selectPreferences(store.getState()).interests, "");
  store.getState().selectEmployee(first.employee_id);
  assert.equal(selectPreferences(store.getState()), firstPreferences);
  const state = store.getState();
  store.getState().selectEmployee("UNKNOWN");
  assert.equal(store.getState(), state);
});

test("stale profile commands, another employee's participation and invalid transitions are rejected", () => {
  const store = createUserStore(fixture());
  const first = store.getState().selectedEmployeeId;
  const second = store.getState().dataset.employees[1].employee_id;
  assert.equal(store.getState().completeActivity(first, "MISSING").ok, false);
  store.getState().selectEmployee(second);
  assert.equal(store.getState().completeActivity(first, "ACTIVE").ok, false);
  assert.equal(store.getState().completeActivity(second, "ACTIVE").ok, false);
  const declined = fixture();
  declined.activity_history.find((item) => item.record_id === "ACTIVE").status = "declined";
  assert.throws(() => completeActivity(declined, first, "ACTIVE"), /Only active/);
  assert.equal(store.getState().dataRevision, 0);
});

test("starting is idempotent; mandatory and future sessions cannot be self-started", () => {
  const input = fixture();
  input.activity_history = input.activity_history.filter((item) => item.record_id !== "ACTIVE");
  const event = input.events.find((item) => item.event_id === "EV_005");
  event.format = "self_paced";
  event.upcoming_sessions = [];
  const store = createUserStore(input);
  const id = store.getState().selectedEmployeeId;
  const result = store.getState().startActivity(id, event.event_id);
  assert.equal(result.ok, true);
  assert.deepEqual(store.getState().startActivity(id, event.event_id), result);
  assert.equal(store.getState().dataRevision, 1);
  assert.equal(store.getState().completeActivity(id, result.recordId).ok, true);
  assert.equal(store.getState().startActivity(id, event.event_id).ok, false);
  assert.equal(store.getState().startActivity(id, "EV_001").ok, false);
  event.format = "online";
  event.upcoming_sessions = ["2026-11-01"];
  assert.equal(createUserStore(input).getState().startActivity(id, event.event_id).ok, false);
});

test("store instances are isolated and invalid goals fail without updating state", () => {
  const first = createUserStore(base);
  const second = createUserStore(base);
  first.getState().updatePreferences({ interests: "Testing" });
  assert.equal(selectPreferences(second.getState()).interests, "");
  const state = first.getState();
  assert.throws(() => state.updatePreferences({ targetGoal: { target_role: "UNKNOWN", target_grade: "Lead" } }), /Unknown target/);
  assert.equal(first.getState(), state);
});

test("new same-day completion is counted; legacy same-day history remains assessed", () => {
  const input = fixture();
  input.employees[0].last_review_date = input.meta.as_of_date;
  const store = createUserStore(input);
  const select = createDevelopmentSelector();
  const before = select(store.getState());
  store.getState().completeActivity(store.getState().selectedEmployeeId, "ACTIVE");
  assert.equal(select(store.getState()).skills.levels.SK_SYSTEM_DESIGN, before.skills.levels.SK_SYSTEM_DESIGN + 1);
});

test("another completed participation prevents duplicate awards from an older active record", () => {
  const input = fixture();
  const active = input.activity_history.find((item) => item.record_id === "ACTIVE");
  input.activity_history.push({ ...active, record_id: "ALREADY_DONE", status: "completed", completion_pct: 100 });
  const store = createUserStore(input);
  const state = store.getState();
  assert.equal(state.completeActivity(state.selectedEmployeeId, "ACTIVE").ok, false);
  assert.equal(store.getState(), state);
});
