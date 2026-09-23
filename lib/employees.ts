import type { Employee } from "@/core/domain/schemas";

// Compatibility exports for existing UI; domain schemas have a single owner.
export { employeeSchema, employeeDatasetSchema, type Employee } from "@/core/domain/schemas";

export function isHrEmployee(employee: Employee): boolean {
  return employee.department.trim().toLowerCase() === "human resources"
    || employee.role.trim().toLowerCase().startsWith("hr ");
}
