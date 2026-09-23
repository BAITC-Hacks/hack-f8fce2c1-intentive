import { z } from "zod";

const text = z.string().trim().min(1);
const level = z.number().int().min(0).max(5);
const skillLevels = z.record(text, level);
const uniqueStrings = z.array(text).refine((items) => new Set(items).size === items.length, "Duplicate values");
export const grades = ["Junior", "Middle", "Senior", "Lead"] as const;
export const gradeSchema = z.enum(grades);
export const metadataSchema = z.object({
  dataset: text,
  version: text,
  as_of_date: z.iso.date(),
});

export const employeeSchema = z.object({
  employee_id: text,
  full_name: text,
  department: text,
  role: text,
  grade: gradeSchema,
  manager_id: text.nullable(),
  hire_date: z.iso.date(),
  tenure_months: z.number().int().nonnegative(),
  work_format: z.enum(["office", "hybrid", "remote"]),
  preferred_language: z.enum(["kk", "ru", "en"]),
  career_goal: z.object({ target_role: text, target_grade: gradeSchema }).nullable(),
  skills: skillLevels,
  last_review_date: z.iso.date(),
});

export const skillSchema = z.object({
  skill_id: text,
  name: text,
  type: z.enum(["hard", "soft"]),
  category: text,
  description: text,
});

export const roleProfileSchema = z.object({
  role: text,
  grade: gradeSchema,
  required_skills: skillLevels,
  critical_skills: uniqueStrings,
});

export const eventSchema = z.object({
  event_id: text,
  title: text,
  description: text,
  type: z.enum(["compliance", "onboarding", "course", "workshop", "mentoring", "certification", "meetup"]),
  format: z.enum(["online", "offline", "self_paced"]),
  duration_hours: z.number().positive(),
  mandatory: z.boolean(),
  target_roles: uniqueStrings.nonempty(),
  target_grades: z.array(gradeSchema).nonempty().refine((items) => new Set(items).size === items.length, "Duplicate grades"),
  develops_skills: z.array(z.object({ skill_id: text, gain: z.number().int().min(1).max(5), max_level: level })),
  prerequisites: skillLevels,
  upcoming_sessions: z.array(z.iso.date()).refine((items) => new Set(items).size === items.length, "Duplicate sessions"),
});

export const activitySchema = z.object({
  record_id: text,
  employee_id: text,
  event_id: text,
  date: z.iso.date(),
  completed_at: z.iso.date().optional(),
  due_date: z.iso.date().nullable(),
  status: z.enum(["completed", "in_progress", "dropped", "no_show", "declined", "overdue"]),
  completion_pct: z.number().int().min(0).max(100),
  score: z.number().int().min(0).max(100).nullable(),
  feedback_rating: z.number().int().min(1).max(5).nullable(),
  assigned_by: z.enum(["self", "manager", "hr"]),
}).superRefine((record, ctx) => {
  if (record.completed_at && (record.status !== "completed" || record.completed_at < record.date)) {
    ctx.addIssue({ code: "custom", path: ["completed_at"], message: "Completion date requires completed status and cannot precede participation" });
  }
  const p = record.completion_pct;
  const valid = record.status === "completed" ? p === 100
    : record.status === "no_show" || record.status === "declined" ? p === 0
    : record.status === "dropped" ? p >= 5 && p <= 95 : p <= 95;
  if (!valid) ctx.addIssue({ code: "custom", path: ["completion_pct"], message: "Completion percentage does not match status" });
  if (record.status === "declined" && record.assigned_by === "self") {
    ctx.addIssue({ code: "custom", path: ["assigned_by"], message: "Only manager or HR assignments can be declined" });
  }
});

export const employeeDatasetSchema = z.object({
  meta: metadataSchema,
  employees: z.array(employeeSchema).min(1).refine(
    (employees) => new Set(employees.map((employee) => employee.employee_id)).size === employees.length,
    "Employee IDs must be unique",
  ),
});
export const eventDatasetSchema = z.object({ meta: metadataSchema, events: z.array(eventSchema).min(1) });
export const skillDatasetSchema = z.object({
  meta: metadataSchema,
  proficiency_scale: z.object({ "0": text, "1": text, "2": text, "3": text, "4": text, "5": text }),
  skills: z.array(skillSchema).min(1),
  role_profiles: z.array(roleProfileSchema).min(1),
});

export type Employee = z.infer<typeof employeeSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type RoleProfile = z.infer<typeof roleProfileSchema>;
export type DevelopmentEvent = z.infer<typeof eventSchema>;
export type ActivityRecord = z.infer<typeof activitySchema>;
export type DatasetMetadata = z.infer<typeof metadataSchema>;
export type CareerDataset = z.infer<typeof skillDatasetSchema> & {
  employees: Employee[];
  events: DevelopmentEvent[];
  activity_history: ActivityRecord[];
};
