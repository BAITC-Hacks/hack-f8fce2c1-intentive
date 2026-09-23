import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { importDataset } from "../core/dataset/import.ts";
import { createRecommendationEngine } from "../core/recommendations/recommend.ts";
import { developmentPolicy } from "../core/config.ts";
import { createGoalPolicy } from "../core/policies/goal.ts";
import { createDevelopmentCalculator } from "../core/development.ts";
import { createUserStore } from "../stores/career-store.ts";
import { createRecommendationSelector } from "../stores/selectors.ts";

const read = (name) => readFileSync(new URL(`../career_quest_dataset/${name}`, import.meta.url), "utf8");
const base = importDataset({ employees: read("employees.json"), events: read("events.json"), skills: read("skills.json"), activityHistoryCsv: read("activity_history.csv") });
function fixture() {
  const data = structuredClone(base);
  const employee = data.employees[0];
  employee.skills = { SK_SYSTEM_DESIGN: 2, SK_PUBLIC_SPEAKING: 0 };
  employee.career_goal = { target_role: employee.role, target_grade: "Middle" };
  employee.last_review_date = "2026-09-01";
  data.employees = [employee];
  data.role_profiles = [
    { role: employee.role, grade: "Junior", required_skills: { SK_SYSTEM_DESIGN: 1 }, critical_skills: [] },
    { role: employee.role, grade: "Middle", required_skills: { SK_SYSTEM_DESIGN: 4, SK_PUBLIC_SPEAKING: 2 }, critical_skills: ["SK_SYSTEM_DESIGN"] },
  ];
  const event = { ...data.events.find((item) => item.event_id === "EV_005"), prerequisites: {}, target_roles: [employee.role], target_grades: ["Junior"], upcoming_sessions: ["2026-10-08"] };
  data.events = [
    { ...event, event_id: "SYSTEM", develops_skills: [{ skill_id: "SK_SYSTEM_DESIGN", gain: 1, max_level: 4 }] },
    { ...event, event_id: "SPEAKING", type: "mentoring", develops_skills: [{ skill_id: "SK_PUBLIC_SPEAKING", gain: 1, max_level: 4 }] },
  ];
  data.activity_history = [1, 2, 3].map((i) => ({ record_id: `SKIP${i}`, employee_id: employee.employee_id, event_id: "SPEAKING", date: `2026-09-0${i}`, status: "no_show", completion_pct: 0, due_date: null, score: null, feedback_rating: null, assigned_by: "self" }));
  return data;
}
const policies = (patch = {}) => ({ ...developmentPolicy, recommendations: { ...developmentPolicy.recommendations, ...patch } });

test("critical goal gap wins over the lowest skill with three missed similar activities", () => {
  const data = fixture();
  const result = createRecommendationEngine(data).recommend(data.employees[0].employee_id);
  assert.equal(result.recommendations[0].eventId, "SYSTEM");
  const speaking = result.recommendations.find((item) => item.eventId === "SPEAKING");
  assert.equal(speaking.evidence.history.noShow, 3);
  assert.equal(speaking.factors.historyAffinity, -1);
  assert.ok(result.recommendations.every((item) => item.reasons.length >= 3));
  const first = result.recommendations[0];
  assert.equal(first.evidence.skillGaps[0].current, 2);
  assert.equal(first.evidence.skillGaps[0].required, 4);
  assert.equal(first.evidence.skillGaps[0].after, 3);
  assert.equal(result.mode, "deterministic");
});

test("policy weights and an alternative scoring function change ranking without changing callers", () => {
  const data = fixture();
  const custom = policies({ version: "preferences-first-test", limit: 1, weights: { ...developmentPolicy.recommendations.weights, preferenceMatch: 50 } });
  const result = createRecommendationEngine(data, custom).recommend(data.employees[0].employee_id, undefined, { preferredType: "mentoring" });
  assert.deepEqual(result.recommendations.map((item) => item.eventId), ["SPEAKING"]);
  assert.equal(result.policyVersion, "preferences-first-test");
  const other = createRecommendationEngine(data, policies({ score: (factors) => -factors.criticalGapReduction })).recommend(data.employees[0].employee_id);
  assert.equal(other.recommendations[0].eventId, "SPEAKING");
  assert.equal(createRecommendationEngine(data).recommend(data.employees[0].employee_id).recommendations[0].eventId, "SYSTEM");
});

test("fallback goal is replaceable consistently for trajectory and recommendations; explicit goals win", () => {
  const data = fixture();
  data.employees[0].career_goal = null;
  const alternate = { ...developmentPolicy, goal: createGoalPolicy("current_role") };
  const id = data.employees[0].employee_id;
  const recommendations = createRecommendationEngine(data, alternate).recommend(id);
  const development = createDevelopmentCalculator(data, alternate.goal).calculateEmployee(id);
  assert.deepEqual(recommendations.goal, development.trajectory.goal);
  assert.equal(recommendations.emptyReason, "goal_requirements_met");
  assert.equal(recommendations.goal.source, "current_role");
  assert.equal(createRecommendationEngine(data).recommend(id).goal.source, "suggested_next_grade");
  const explicit = { target_role: data.employees[0].role, target_grade: "Middle" };
  assert.deepEqual(createRecommendationEngine(data, alternate).recommend(id, explicit).goal.target, explicit);
});

test("hard availability gates cannot be overridden by extreme ranking weights", () => {
  const data = fixture();
  data.events[0].mandatory = true;
  data.events[1].prerequisites = { SK_PUBLIC_SPEAKING: 5 };
  const result = createRecommendationEngine(data, policies({ score: () => 1e9 })).recommend(data.employees[0].employee_id);
  assert.equal(result.recommendations.length, 0);
  assert.equal(result.emptyReason, "no_available_activity");
  assert.ok(result.exclusions.some((item) => item.blockers.some((blocker) => blocker.code === "mandatory")));
});

test("no available goal benefit is explicit; no fabricated recommendation fills empty slots", () => {
  const data = fixture();
  for (const event of data.events) event.develops_skills = [];
  const result = createRecommendationEngine(data).recommend(data.employees[0].employee_id);
  assert.equal(result.emptyReason, "no_goal_improving_activity");
  assert.equal(result.recommendations.length, 0);
  assert.equal(result.candidateCount, 0);
});

test("history window, unrelated activities and no history do not produce invented claims", () => {
  const data = fixture();
  for (const record of data.activity_history) record.date = "2025-09-01";
  const result = createRecommendationEngine(data).recommend(data.employees[0].employee_id);
  assert.ok(result.recommendations.every((item) => item.factors.historyAffinity === 0 && item.evidence.history.recordIds.length === 0));
  data.activity_history = [];
  const neutral = createRecommendationEngine(data).recommend(data.employees[0].employee_id);
  assert.ok(neutral.recommendations.every((item) => item.reasons[2].includes("neutral")));
});

test("weekly hours affect effort preference, never exclude a longer course", () => {
  const data = fixture();
  data.events[0].duration_hours = 16;
  const result = createRecommendationEngine(data).recommend(data.employees[0].employee_id, undefined, { weeklyHours: 2, interestSkillIds: ["SK_SYSTEM_DESIGN"] });
  const system = result.recommendations.find((item) => item.eventId === "SYSTEM");
  assert.equal(system.evidence.estimatedWeeks, 8);
  assert.equal(system.factors.interestMatch, 1);
  assert.ok(system.reasons.some((reason) => reason.includes("schedule may differ")));
});

test("results for all employees are deterministic, bounded and do not mutate inputs", () => {
  const before = JSON.stringify(base);
  const engine = createRecommendationEngine(base);
  for (const employee of base.employees) {
    const result = engine.recommend(employee.employee_id);
    assert.ok(result.recommendations.length <= 3);
    assert.equal(new Set(result.recommendations.map((item) => item.eventId)).size, result.recommendations.length);
    assert.deepEqual(engine.recommend(employee.employee_id), result);
    for (const recommendation of result.recommendations) {
      assert.ok(Number.isFinite(recommendation.score));
      assert.ok(recommendation.factors.gapReduction > 0);
      assert.equal(base.events.find((event) => event.event_id === recommendation.eventId).mandatory, false);
    }
  }
  assert.equal(JSON.stringify(base), before);
});

test("store selector stays stable and invalidates after preferences and completion", () => {
  const data = fixture();
  data.events[0].format = "self_paced";
  data.events[0].upcoming_sessions = [];
  const store = createUserStore(data);
  const select = createRecommendationSelector();
  const initial = select(store.getState());
  assert.equal(select(store.getState()), initial);
  store.getState().updatePreferences({ weeklyHours: "2" });
  assert.notEqual(select(store.getState()), initial);
  const id = store.getState().selectedEmployeeId;
  const started = store.getState().startActivity(id, "SYSTEM");
  assert.equal(started.ok, true);
  assert.ok(!select(store.getState()).recommendations.some((item) => item.eventId === "SYSTEM"));
  store.getState().completeActivity(id, started.recordId);
  assert.ok(!select(store.getState()).recommendations.some((item) => item.eventId === "SYSTEM"));
});

test("invalid policies, budgets and non-finite scoring fail explicitly", () => {
  const data = fixture();
  assert.throws(() => createRecommendationEngine(data, policies({ limit: 4 })), /Invalid recommendation policy/);
  assert.throws(() => createRecommendationEngine(data, policies({ score: () => NaN })).recommend(data.employees[0].employee_id), /non-finite/);
  assert.throws(() => createRecommendationEngine(data).recommend(data.employees[0].employee_id, undefined, { weeklyHours: 0 }), /positive/);
});
