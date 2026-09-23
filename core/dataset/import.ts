import { z } from "zod";
import { activitySchema, employeeDatasetSchema, eventDatasetSchema, skillDatasetSchema, type CareerDataset } from "../domain/schemas";
import { parseActivityCsv } from "./csv";
import { DatasetValidationError, type DatasetIssue } from "./errors";
import { validateDatasetRelations } from "./validate";

export interface DatasetInput {
  employees: unknown;
  events: unknown;
  skills: unknown;
  activityHistoryCsv: string;
}

export type ImportedDataset = CareerDataset & { warnings: DatasetIssue[] };

function parse<T>(schema: z.ZodType<T>, value: unknown, source: string): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new DatasetValidationError(result.error.issues.map((issue) => ({
    source, path: issue.path.join("."), message: issue.message,
  })));
  return result.data;
}

function json(value: unknown, source: string): unknown {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value.replace(/^\uFEFF/, "")); }
  catch { throw new DatasetValidationError([{ source, path: "", message: "Invalid JSON" }]); }
}

function sameMetadata(actual: CareerDataset["meta"], expected: CareerDataset["meta"], source: string) {
  if (actual.dataset !== expected.dataset || actual.version !== expected.version || actual.as_of_date !== expected.as_of_date) {
    throw new DatasetValidationError([{ source, path: "meta", message: "Dataset name, version and snapshot must match across files" }]);
  }
}

/** Parses fresh objects; no mutation or I/O. Throws structured diagnostics on failure. */
export function importDataset(input: DatasetInput): ImportedDataset {
  const employees = parse(employeeDatasetSchema, json(input.employees, "employees.json"), "employees.json");
  const events = parse(eventDatasetSchema, json(input.events, "events.json"), "events.json");
  const skills = parse(skillDatasetSchema, json(input.skills, "skills.json"), "skills.json");
  sameMetadata(employees.meta, skills.meta, "employees.json");
  sameMetadata(events.meta, skills.meta, "events.json");
  const activity_history = parse(z.array(activitySchema), parseActivityCsv(input.activityHistoryCsv), "activity_history.csv");
  const dataset: CareerDataset = { ...skills, employees: employees.employees, events: events.events, activity_history };
  return { ...dataset, warnings: validateDatasetRelations(dataset) };
}

export interface SupplementInput {
  employees?: unknown;
  activityHistoryCsv?: string;
}

/** Merge jury profiles/history into an already validated dataset, then validate the whole result. */
export function importSupplement(base: CareerDataset, input: SupplementInput, conflicts: "reject" | "replace" = "reject"): ImportedDataset {
  if (input.employees === undefined && input.activityHistoryCsv === undefined) {
    throw new DatasetValidationError([{ source: "supplement", path: "", message: "Provide employees or activity history" }]);
  }
  const additions = input.employees === undefined ? undefined
    : parse(employeeDatasetSchema, json(input.employees, "employees.json"), "employees.json");
  if (additions) sameMetadata(additions.meta, base.meta, "employees.json");
  const history = input.activityHistoryCsv === undefined ? []
    : parse(z.array(activitySchema), parseActivityCsv(input.activityHistoryCsv), "activity_history.csv");
  const issues: DatasetIssue[] = [];
  function merge<T>(existing: T[], incoming: T[], key: (item: T) => string, source: string): T[] {
    const map = new Map(existing.map((item) => [key(item), item]));
    const seen = new Set<string>();
    incoming.forEach((item, index) => {
      const id = key(item);
      if (seen.has(id) || (conflicts === "reject" && map.has(id))) {
        issues.push({ source, path: `[${index}]`, message: `Duplicate or conflicting ID: ${id}` });
      }
      seen.add(id);
      map.set(id, item);
    });
    return [...map.values()];
  }
  const dataset = structuredClone({
    ...base,
    employees: merge(base.employees, additions?.employees ?? [], (v) => v.employee_id, "employees.json"),
    activity_history: merge(base.activity_history, history, (v) => v.record_id, "activity_history.csv"),
  });
  if (issues.length) throw new DatasetValidationError(issues);
  return { ...dataset, warnings: validateDatasetRelations(dataset) };
}
