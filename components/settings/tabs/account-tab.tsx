"use client";
import { selectProfile, selectEmployees } from "@/stores/selectors";

import { useId, useMemo } from "react";
import { BriefcaseBusiness, Building2, CalendarClock, Languages, MapPin, UserRound } from "lucide-react";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUserStore } from "@/components/providers/user-store-provider";
import { isHrEmployee } from "@/lib/employees";

export function AccountTab() {
  const id = useId();
  const profile = useUserStore(selectProfile);
  const employees = useUserStore(selectEmployees);
  const selectEmployee = useUserStore((state) => state.selectEmployee);
  const options = useMemo(() => employees.map((employee) => ({
    value: employee.employee_id,
    label: `${employee.full_name} · ${employee.employee_id}`,
  })), [employees]);
  const selected = options.find((option) => option.value === profile.employee_id) ?? null;
  const accountType = isHrEmployee(profile) ? "HR" : "Employee";
  const initials = profile.full_name.split(" ").slice(0, 2).map((part) => part[0]).join("");
  const details = [
    { label: "Department", value: profile.department, icon: Building2 },
    { label: "Role", value: profile.role, icon: BriefcaseBusiness },
    { label: "Work format", value: { office: "Office", hybrid: "Hybrid", remote: "Remote" }[profile.work_format], icon: MapPin },
    { label: "Tenure", value: `${profile.tenure_months} months`, icon: CalendarClock },
    { label: "Language", value: { kk: "Қазақша", ru: "Русский", en: "English" }[profile.preferred_language], icon: Languages },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium">Test profile</p>
          <p className="text-xs text-muted-foreground">Search across {employees.length} employees.</p>
        </div>
        <Combobox items={options} value={selected} onValueChange={(option) => { if (option) selectEmployee(option.value); }}>
          <ComboboxInput id={`${id}-employee`} aria-label="Find test employee" placeholder="Name or employee ID" className="w-full sm:w-64" />
          <ComboboxContent>
            <ComboboxEmpty>No employees found.</ComboboxEmpty>
            <ComboboxList>
              {(option: { value: string; label: string }) => (
                <ComboboxItem key={option.value} value={option}>{option.label}</ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </section>
      <Card className="gap-0 py-0">
        <CardHeader className="flex-row items-center gap-4 border-b bg-muted/20 py-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-semibold text-primary" aria-hidden="true">
            {initials || <UserRound className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold">{profile.full_name}</p>
              <Badge variant={accountType === "HR" ? "default" : "secondary"}>{accountType}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{profile.grade} · {profile.role}</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{profile.employee_id}</p>
          </div>
        </CardHeader>
        <CardContent className="py-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex min-w-0 items-start gap-2.5">
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <dt className="text-[11px] text-muted-foreground">{label}</dt>
                  <dd className="truncate text-sm font-medium">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="mt-5 border-t border-border/50 pt-4">
            <p className="text-[11px] text-muted-foreground">Career goal</p>
            <p className="mt-1 text-sm font-medium">{profile.career_goal
              ? `${profile.career_goal.target_grade} · ${profile.career_goal.target_role}`
              : "Not set yet"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
