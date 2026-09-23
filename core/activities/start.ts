import type { CareerDataset } from "../domain/schemas";
import { createDevelopmentCalculator } from "../development";

export function startActivity(dataset: CareerDataset, employeeId: string, eventId: string, recordId: string): CareerDataset {
  if (dataset.activity_history.some((record) => record.record_id === recordId)) throw new Error("Participation ID already exists");
  const event = dataset.events.find((item) => item.event_id === eventId);
  if (!event) throw new Error("Activity not found");
  const availability = createDevelopmentCalculator(dataset).calculateEmployee(employeeId).activities.find((item) => item.eventId === eventId)!;
  if (!availability.available) throw new Error("Activity is not available");
  if (event.format !== "self_paced" && availability.nextSessionDate !== dataset.meta.as_of_date) throw new Error("This session has not started yet");
  return { ...dataset, activity_history: [...dataset.activity_history, {
    record_id: recordId, employee_id: employeeId, event_id: eventId, date: dataset.meta.as_of_date,
    due_date: null, status: "in_progress", completion_pct: 0, score: null, feedback_rating: null, assigned_by: "self",
  }] };
}
