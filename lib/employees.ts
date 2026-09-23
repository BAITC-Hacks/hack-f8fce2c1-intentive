import { z } from "zod";

const gradeSchema = z.enum(["Junior", "Middle", "Senior", "Lead"]);
export const employeeSchema = z.object({
  employee_id: z.string().min(1),
  full_name: z.string().min(1),
  department: z.string().min(1),
  role: z.string().min(1),
  grade: gradeSchema,
  manager_id: z.string().nullable(),
  hire_date: z.iso.date(),
  tenure_months: z.number().int().nonnegative(),
  work_format: z.enum(["office", "hybrid", "remote"]),
  preferred_language: z.enum(["kk", "ru", "en"]),
  career_goal: z.object({ target_role: z.string().min(1), target_grade: gradeSchema }).nullable(),
  skills: z.record(z.string(), z.number().int().min(0).max(5)),
  last_review_date: z.iso.date(),
});
export const employeeDatasetSchema = z.object({
  meta: z.object({ as_of_date: z.iso.date() }),
  employees: z.array(employeeSchema).min(1).refine(
    (employees) => new Set(employees.map((employee) => employee.employee_id)).size === employees.length,
    "Employee IDs must be unique",
  ),
});
export type Employee = z.infer<typeof employeeSchema>;
