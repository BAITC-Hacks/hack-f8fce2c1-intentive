import type { CareerDataset } from "../domain/schemas";

/** Complete an existing participation; repeat commands are a no-op. */
export function completeActivity(dataset: CareerDataset, employeeId: string, recordId: string): CareerDataset {
  const record = dataset.activity_history.find((item) => item.record_id === recordId);
  if (!record || record.employee_id !== employeeId) throw new Error("Participation not found for this employee");
  if (record.status === "completed") return dataset;
  if (record.status !== "in_progress" && record.status !== "overdue") throw new Error("Only active participation can be completed");
  const event = dataset.events.find((item) => item.event_id === record.event_id);
  if (!event) throw new Error("Activity not found");
  const repeatable = event.event_id === "EV_036" || (event.mandatory && event.type === "compliance");
  if (!repeatable && dataset.activity_history.some((item) => item.employee_id === employeeId && item.event_id === record.event_id && item.status === "completed")) {
    throw new Error("This activity has already been completed in another participation");
  }
  if (record.date > dataset.meta.as_of_date) throw new Error("A future session cannot be completed");
  return { ...dataset, activity_history: dataset.activity_history.map((item) => item.record_id === recordId
    ? { ...item, status: "completed", completion_pct: 100, completed_at: dataset.meta.as_of_date } : item) };
}
