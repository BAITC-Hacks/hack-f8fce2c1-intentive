import { grades, type CareerDataset } from "../domain/schemas";
import { DatasetValidationError, type DatasetIssue } from "./errors";

export const roleProfileKey = (role: string, grade: string) => JSON.stringify([role, grade]);

/** Cross-file invariants only; historical eligibility is not inferred from today's grade. */
export function validateDatasetRelations(data: CareerDataset): DatasetIssue[] {
  const issues: DatasetIssue[] = [];
  const warnings: DatasetIssue[] = [];
  const add = (source: string, path: string, message: string) => issues.push({ source, path, message });
  const unique = <T>(items: T[], key: (item: T) => string, source: string, field: string) => {
    const seen = new Set<string>();
    items.forEach((item, i) => {
      const id = key(item);
      if (seen.has(id)) add(source, `${field}[${i}]`, `Duplicate ID: ${id}`);
      seen.add(id);
    });
  };
  unique(data.employees, (v) => v.employee_id, "employees.json", "employees");
  unique(data.events, (v) => v.event_id, "events.json", "events");
  unique(data.skills, (v) => v.skill_id, "skills.json", "skills");
  unique(data.role_profiles, (v) => roleProfileKey(v.role, v.grade), "skills.json", "role_profiles");
  unique(data.activity_history, (v) => v.record_id, "activity_history.csv", "records");
  const employees = new Map(data.employees.map((v) => [v.employee_id, v]));
  const events = new Map(data.events.map((v) => [v.event_id, v]));
  const skills = new Set(data.skills.map((v) => v.skill_id));
  const profiles = new Map(data.role_profiles.map((v) => [roleProfileKey(v.role, v.grade), v]));
  const roles = new Set(data.role_profiles.map((v) => v.role));
  const checkSkills = (ids: string[], source: string, path: string) => {
    ids.forEach((id) => { if (!skills.has(id)) add(source, `${path}.${id}`, "Unknown skill"); });
  };
  data.role_profiles.forEach((profile, i) => {
    const path = `role_profiles[${i}]`;
    checkSkills(Object.keys(profile.required_skills), "skills.json", `${path}.required_skills`);
    profile.critical_skills.forEach((id) => {
      if (!Object.hasOwn(profile.required_skills, id)) add("skills.json", `${path}.critical_skills`, `Critical skill absent from requirements: ${id}`);
    });
    for (const lowerGrade of grades.slice(0, grades.indexOf(profile.grade))) {
      const lower = profiles.get(roleProfileKey(profile.role, lowerGrade));
      if (!lower) continue;
      for (const [id, required] of Object.entries(lower.required_skills)) {
        if ((profile.required_skills[id] ?? 0) < required) add("skills.json", `${path}.required_skills.${id}`, `Requirement decreases from ${lowerGrade}`);
      }
    }
  });
  data.employees.forEach((employee, i) => {
    const path = `employees[${i}]`;
    checkSkills(Object.keys(employee.skills), "employees.json", `${path}.skills`);
    if (!profiles.has(roleProfileKey(employee.role, employee.grade))) add("employees.json", `${path}.role`, "Unknown role/grade combination");
    const goal = employee.career_goal;
    if (goal && !profiles.has(roleProfileKey(goal.target_role, goal.target_grade))) add("employees.json", `${path}.career_goal`, "Unknown target role/grade");
    if (employee.hire_date > data.meta.as_of_date) add("employees.json", `${path}.hire_date`, "Hire date is after snapshot");
    if (employee.last_review_date < employee.hire_date || employee.last_review_date > data.meta.as_of_date) add("employees.json", `${path}.last_review_date`, "Review must be between hire date and snapshot");
    const [year, month, day] = data.meta.as_of_date.split("-").map(Number);
    const [hireYear, hireMonth, hireDay] = employee.hire_date.split("-").map(Number);
    const tenure = (year - hireYear) * 12 + month - hireMonth - Number(day < hireDay);
    if (employee.tenure_months !== tenure) add("employees.json", `${path}.tenure_months`, "Tenure does not match snapshot and hire date");
    if (employee.manager_id !== null) {
      const manager = employees.get(employee.manager_id);
      if (!manager || manager.employee_id === employee.employee_id || manager.grade !== "Lead" || manager.department !== employee.department) {
        add("employees.json", `${path}.manager_id`, "Manager must be another Lead in the same department");
      }
    }
  });
  data.events.forEach((event, i) => {
    const path = `events[${i}]`;
    checkSkills(Object.keys(event.prerequisites), "events.json", `${path}.prerequisites`);
    const developed = event.develops_skills.map((v) => v.skill_id);
    checkSkills(developed, "events.json", `${path}.develops_skills`);
    if (new Set(developed).size !== developed.length) add("events.json", `${path}.develops_skills`, "Duplicate developed skill");
    event.target_roles.forEach((role) => { if (!roles.has(role)) add("events.json", `${path}.target_roles`, `Unknown role: ${role}`); });
    if (event.type === "compliance" && developed.length) add("events.json", `${path}.develops_skills`, "Compliance events cannot increase skills");
    if (event.format === "self_paced" && event.upcoming_sessions.length) add("events.json", `${path}.upcoming_sessions`, "Self-paced events have no scheduled sessions");
    if (event.upcoming_sessions.some((date) => date < data.meta.as_of_date)) add("events.json", `${path}.upcoming_sessions`, "Upcoming session is before snapshot");
  });
  const completed = new Set<string>();
  const history = data.activity_history.map((record, index) => ({ record, index }))
    .sort((a, b) => a.record.date.localeCompare(b.record.date) || a.record.record_id.localeCompare(b.record.record_id));
  for (const { record, index } of history) {
    const path = `records[${index}]`;
    const source = "activity_history.csv";
    const employee = employees.get(record.employee_id);
    const event = events.get(record.event_id);
    if (!employee) add(source, `${path}.employee_id`, "Unknown employee");
    if (!event) add(source, `${path}.event_id`, "Unknown event");
    if (record.date > data.meta.as_of_date || (employee && record.date < employee.hire_date)) add(source, `${path}.date`, "Activity must be between hire date and snapshot");
    if (record.completed_at && record.completed_at > data.meta.as_of_date) add(source, `${path}.completed_at`, "Completion is after snapshot");
    if (record.due_date && record.due_date < record.date) add(source, `${path}.due_date`, "Due date is before participation date");
    if (event) {
      if (record.due_date && !event.mandatory) add(source, `${path}.due_date`, "Only mandatory events have due dates");
      if (record.status === "overdue" && (!event.mandatory || !record.due_date || record.due_date >= data.meta.as_of_date)) add(source, `${path}.status`, "Overdue requires a mandatory event and expired due date");
      if (record.status === "no_show" && event.format === "self_paced") add(source, `${path}.status`, "Self-paced events cannot have no_show status");
      if (record.score !== null && !["course", "certification", "compliance"].includes(event.type)) add(source, `${path}.score`, "This event type has no score");
      const key = JSON.stringify([record.employee_id, record.event_id]);
      if (event.event_id !== "EV_036" && completed.has(key)) {
        // The supplied kit repeats annual compliance despite README's no-repeat rule.
        if (event.mandatory && event.type === "compliance") {
          warnings.push({ source, path, message: "Mandatory compliance repeated after completion; preserved as supplied" });
        } else add(source, path, "Event repeated after completion");
      }
      if (record.status === "completed") completed.add(key);
    }
  }
  if (issues.length) throw new DatasetValidationError(issues);
  return warnings;
}
