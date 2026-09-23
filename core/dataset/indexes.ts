import type { CareerDataset } from "../domain/schemas";
import { roleProfileKey } from "./validate";

/** Derived indexes are rebuilt after successful imports; never persisted separately. */
export function createDatasetIndexes(dataset: CareerDataset) {
  const historyByEmployee = new Map<string, CareerDataset["activity_history"]>();
  const historyByEvent = new Map<string, CareerDataset["activity_history"]>();
  for (const record of dataset.activity_history) {
    for (const [index, key] of [[historyByEmployee, record.employee_id], [historyByEvent, record.event_id]] as const) {
      const records = index.get(key) ?? [];
      records.push(record);
      index.set(key, records);
    }
  }
  for (const records of historyByEmployee.values()) records.sort((a, b) => a.date.localeCompare(b.date) || a.record_id.localeCompare(b.record_id));
  return {
    employeesById: new Map(dataset.employees.map((v) => [v.employee_id, v])),
    skillsById: new Map(dataset.skills.map((v) => [v.skill_id, v])),
    eventsById: new Map(dataset.events.map((v) => [v.event_id, v])),
    roleProfilesByKey: new Map(dataset.role_profiles.map((v) => [roleProfileKey(v.role, v.grade), v])),
    activityById: new Map(dataset.activity_history.map((v) => [v.record_id, v])),
    historyByEmployee,
    historyByEvent,
  };
}
