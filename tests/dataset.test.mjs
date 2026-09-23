import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { importDataset, importSupplement } from "../core/dataset/import.ts";
import { createDatasetIndexes } from "../core/dataset/indexes.ts";
import { parseActivityCsv } from "../core/dataset/csv.ts";
import { DatasetValidationError } from "../core/dataset/errors.ts";

const read = (name) => readFileSync(new URL(`../career_quest_dataset/${name}`, import.meta.url), "utf8");
const original = { employees: read("employees.json"), events: read("events.json"), skills: read("skills.json"), activityHistoryCsv: read("activity_history.csv") };
const base = importDataset(original);
const employeeInput = () => JSON.parse(original.employees);
const eventInput = () => JSON.parse(original.events);
const skillInput = () => JSON.parse(original.skills);
const header = original.activityHistoryCsv.split(/\r?\n/)[0];
const invalid = (fn, message) => assert.throws(fn, (error) => error instanceof DatasetValidationError && error.issues.some((issue) => issue.message.includes(message)));

test("full starter dataset loads without fixed-size assumptions and indexes all records", () => {
  assert.deepEqual([base.employees.length, base.events.length, base.skills.length, base.role_profiles.length, base.activity_history.length], [200, 40, 60, 32, 2743]);
  assert.equal(base.meta.as_of_date, "2026-10-01");
  assert.equal(base.warnings.length, 544);
  assert.ok(base.warnings.every((warning) => warning.message.startsWith("Mandatory compliance")));
  const indexes = createDatasetIndexes(base);
  assert.equal(indexes.activityById.size, 2743);
  assert.equal([...indexes.historyByEmployee.values()].flat().length, 2743);
  assert.equal([...indexes.historyByEvent.values()].flat().length, 2743);
});

test("CSV accepts BOM, CRLF, quoted fields, reordered columns, and empty optional values", () => {
  const columns = header.split(",").reverse();
  const values = { record_id: 'R"1', employee_id: "E0001", event_id: "EV_001", date: "2026-09-30", due_date: "", status: "completed", completion_pct: "100", score: "", feedback_rating: "", assigned_by: "hr" };
  const csv = `\uFEFF${columns.join(",")}\r\n${columns.map((key) => `"${values[key].replaceAll('"', '""')}"`).join(",")}\r\n`;
  const [record] = parseActivityCsv(csv);
  assert.equal(record.record_id, 'R"1');
  assert.equal(record.score, null);
  assert.equal(record.due_date, null);
  assert.equal(record.completion_pct, 100);
  assert.deepEqual(parseActivityCsv(header), []);
});

test("CSV rejects broken quotes, missing or duplicate columns and ragged rows", () => {
  invalid(() => parseActivityCsv(`${header}\n"broken`), "Unterminated");
  invalid(() => parseActivityCsv(header.replace("score", "status")), "Expected exactly");
  invalid(() => parseActivityCsv(`${header}\n1,2`), "Column count");
  invalid(() => parseActivityCsv(`${header}\n"value"oops`), "Malformed");
});

test("schema and JSON errors include source and field path", () => {
  invalid(() => importDataset({ ...original, employees: "{" }), "Invalid JSON");
  const employees = employeeInput();
  employees.employees[0].skills.SK_PYTHON = 6;
  assert.throws(() => importDataset({ ...original, employees }), (error) => error.issues.some((issue) => issue.source === "employees.json" && issue.path === "employees.0.skills.SK_PYTHON"));
  const badCsv = `${header}\nR_TEST,E0001,EV_001,2026-09-30,,completed,0,,,hr`;
  invalid(() => importDataset({ ...original, activityHistoryCsv: badCsv }), "Completion percentage");
});

test("cross-file validation catches unknown references and metadata mismatch", () => {
  const employees = employeeInput();
  employees.employees[0].skills.UNKNOWN = 1;
  employees.employees[0].manager_id = "MISSING";
  invalid(() => importDataset({ ...original, employees }), "Unknown skill");
  invalid(() => importDataset({ ...original, employees }), "Manager must");
  employees.meta.as_of_date = "2026-10-02";
  invalid(() => importDataset({ ...original, employees }), "snapshot must match");
  invalid(() => importDataset({ ...original, activityHistoryCsv: `${header}\nR_TEST,MISSING,EV_001,2026-09-30,,completed,100,,,hr` }), "Unknown employee");
});

test("duplicate IDs, invalid critical skills and decreasing requirements are rejected", () => {
  const events = eventInput();
  events.events.push(events.events[0]);
  invalid(() => importDataset({ ...original, events }), "Duplicate ID");
  const skills = skillInput();
  skills.role_profiles[0].critical_skills.push("UNKNOWN");
  invalid(() => importDataset({ ...original, skills }), "Critical skill absent");
  const decreasing = skillInput();
  const junior = decreasing.role_profiles.find((v) => v.grade === "Junior");
  const lead = decreasing.role_profiles.find((v) => v.role === junior.role && v.grade === "Lead");
  const skill = Object.keys(junior.required_skills).find((key) => junior.required_skills[key] > 0);
  lead.required_skills[skill] = 0;
  invalid(() => importDataset({ ...original, skills: decreasing }), "Requirement decreases");
});

test("additional jury employee and history load atomically, keeping the base untouched", () => {
  const employee = { ...base.employees[0], employee_id: "JURY_001" };
  const snapshot = JSON.stringify(base);
  const next = importSupplement(base, {
    employees: { meta: base.meta, employees: [employee] },
    activityHistoryCsv: `${header}\nJURY_R1,JURY_001,EV_001,2026-09-30,,completed,100,,,hr`,
  });
  assert.equal(next.employees.length, 201);
  assert.equal(next.activity_history.length, 2744);
  assert.equal(JSON.stringify(base), snapshot);
  invalid(() => importSupplement(base, { employees: { meta: base.meta, employees: [{ ...employee, manager_id: "MISSING" }] } }), "Manager must");
  assert.equal(JSON.stringify(base), snapshot);
  next.employees[0].skills.SK_PYTHON = 0;
  assert.equal(JSON.stringify(base), snapshot);
});

test("conflicting IDs need explicit replacement; replacement is validated", () => {
  const employee = { ...base.employees[0], full_name: "Updated profile" };
  const supplement = { employees: { meta: base.meta, employees: [employee] } };
  invalid(() => importSupplement(base, supplement), "conflicting ID");
  const next = importSupplement(base, supplement, "replace");
  assert.equal(next.employees.length, base.employees.length);
  assert.equal(next.employees[0].full_name, "Updated profile");
  invalid(() => importSupplement(base, {}), "Provide employees");
  const row = "R_NEW,E0001,EV_001,2026-09-30,,completed,100,,,hr";
  invalid(() => importSupplement(base, { activityHistoryCsv: `${header}\n${row}\n${row}` }, "replace"), "Duplicate or conflicting");
});

test("event rules reject impossible statuses and repeated completion, but allow recurring club", () => {
  invalid(() => importDataset({ ...original, activityHistoryCsv: `${header}\nR_NEW,E0001,EV_001,2026-09-30,,no_show,0,,,self` }), "Self-paced");
  invalid(() => importDataset({ ...original, activityHistoryCsv: `${header}\nR_NEW,E0001,EV_005,2026-09-30,2026-09-30,overdue,10,,,hr` }), "Only mandatory");
  const rows = (event) => `${header}\nR_A,E0001,${event},2026-09-29,,completed,100,,,self\nR_B,E0001,${event},2026-09-30,,completed,100,,,self`;
  invalid(() => importDataset({ ...original, activityHistoryCsv: rows("EV_005") }), "repeated after completion");
  assert.equal(importDataset({ ...original, activityHistoryCsv: rows("EV_036") }).activity_history.length, 2);
});
