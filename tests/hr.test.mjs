import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { importDataset } from "../core/dataset/import.ts";
import { createDevelopmentCalculator } from "../core/development.ts";
import { createHROverview, ALL } from "../core/hr/overview.ts";
import { createUserStore } from "../stores/career-store.ts";

const read = (name) => readFileSync(new URL(`../career_quest_dataset/${name}`, import.meta.url), "utf8");
const dataset = importDataset({ employees: read("employees.json"), events: read("events.json"), skills: read("skills.json"), activityHistoryCsv: read("activity_history.csv") });
const all = { department: ALL, role: ALL, grade: ALL };

test("HR filters use the intersection of department, role and grade and expose aggregates only", () => {
  const overview = createHROverview(dataset, all);
  assert.equal(overview.people, dataset.employees.length);
  assert.ok(overview.averageCoverage >= 0 && overview.averageCoverage <= 100);
  assert.ok(overview.completedPeople <= overview.people);
  assert.ok(!JSON.stringify(overview).includes(dataset.employees[0].full_name));
  const sample = dataset.employees[0];
  const filters = { department: sample.department, role: sample.role, grade: sample.grade };
  assert.equal(createHROverview(dataset, filters).people, dataset.employees.filter((person) =>
    person.department === filters.department && person.role === filters.role && person.grade === filters.grade).length);
  const empty = createHROverview(dataset, { ...all, department: "No such department" });
  assert.equal(empty.people, 0);
  assert.equal(empty.averageCoverage, 0);
  assert.deepEqual(empty.opportunities, []);
});

test("HR learning totals reflect recent voluntary participation and mandatory overdue separately", () => {
  const overview = createHROverview(dataset, all);
  const voluntary = dataset.activity_history.filter((record) => {
    const event = dataset.events.find((item) => item.event_id === record.event_id);
    const date = record.completed_at ?? record.date;
    return !event.mandatory && date >= overview.windowStart && date <= overview.asOfDate;
  });
  assert.equal(overview.completed, voluntary.filter((record) => record.status === "completed").length);
  assert.equal(overview.notFinished, voluntary.filter((record) => ["dropped", "no_show", "declined"].includes(record.status)).length);
  assert.equal(overview.overdueMandatory, dataset.activity_history.filter((record) => record.status === "overdue"
    && record.date <= overview.asOfDate && dataset.events.find((event) => event.event_id === record.event_id).mandatory).length);
});

test("HR opportunities respect actual availability and recalculate after local completion", () => {
  const overview = createHROverview(dataset, all);
  const calculator = createDevelopmentCalculator(dataset);
  for (const opportunity of overview.opportunities) {
    assert.ok(!dataset.events.find((event) => event.event_id === opportunity.eventId).mandatory);
    assert.ok(opportunity.people > 0 && opportunity.people <= dataset.employees.length);
    assert.ok(dataset.employees.some((person) => calculator.calculateEmployee(person.employee_id, person.career_goal ?? null)
      .activities.some((activity) => activity.eventId === opportunity.eventId && activity.available && activity.impact.targetGapReduction > 0)));
  }
  const candidate = dataset.employees.flatMap((person) => {
    const activity = calculator.calculateEmployee(person.employee_id, person.career_goal ?? null).activities
      .find((item) => item.available && item.impact.targetGapReduction > 0
        && dataset.events.find((event) => event.event_id === item.eventId).format === "self_paced");
    return activity ? [{ person, activity }] : [];
  })[0];
  assert.ok(candidate);
  const store = createUserStore(dataset);
  store.getState().selectEmployee(candidate.person.employee_id);
  const started = store.getState().startActivity(candidate.person.employee_id, candidate.activity.eventId);
  assert.equal(started.ok, true);
  assert.equal(store.getState().completeActivity(candidate.person.employee_id, started.recordId).ok, true);
  const after = createHROverview(store.getState().dataset, all);
  assert.equal(after.completed, overview.completed + 1);
  assert.ok(after.averageCoverage >= overview.averageCoverage);
});
