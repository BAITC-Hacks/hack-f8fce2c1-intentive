"use client";

import { selectProfile, selectEmployees } from "@/stores/selectors";
import { useId, useMemo, useState } from "react";
import { BriefcaseBusiness, Building2, CalendarClock, Languages, MapPin, UserRound } from "lucide-react";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUserStore } from "@/components/providers/user-store-provider";
import { isHrEmployee } from "@/lib/employees";
import { useSettingsI18n } from "../i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AccountTab() {
  const id = useId();
  const { t } = useSettingsI18n();
  const profile = useUserStore(selectProfile);
  const employees = useUserStore(selectEmployees);
  const selectEmployee = useUserStore((state) => state.selectEmployee);
  const [employeeGroup, setEmployeeGroup] = useState<"all" | "regular" | "hr">("all");

  const filteredEmployees = useMemo(() => employees.filter((employee) => {
    const isHrDepartment = employee.department.trim().toLowerCase() === "human resources";
    return employeeGroup === "all" || (employeeGroup === "hr" ? isHrDepartment : !isHrDepartment);
  }), [employees, employeeGroup]);

  const options = useMemo(() => filteredEmployees.map((employee) => ({
    value: employee.employee_id,
    label: `${employee.full_name} · ${employee.employee_id}`,
  })), [filteredEmployees]);

  const selected = options.find((option) => option.value === profile.employee_id) ?? null;
  const accountType = isHrEmployee(profile) ? "HR" : t.employee;
  const initials = profile.full_name.split(" ").slice(0, 2).map((part) => part[0]).join("");

  const details = [
    { label: t.department, value: profile.department, icon: Building2 },
    { label: t.role, value: profile.role, icon: BriefcaseBusiness },
    { label: t.workFormat, value: { office: t.office, hybrid: t.hybrid, remote: t.remote }[profile.work_format], icon: MapPin },
    { label: t.tenureLabel, value: t.tenure(profile.tenure_months), icon: CalendarClock },
    { label: t.language, value: { kk: t.kazakh, ru: t.russian, en: t.english }[profile.preferred_language], icon: Languages },
  ];

  return (
    <div className="space-y-6">
      {/* Текст отдельно на верхнем уровне */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{t.testProfile}</h3>
        <p className="text-xs text-muted-foreground">{t.searchEmployees(filteredEmployees.length)}</p>
      </div>

      {/* Элементы управления отдельной строкой снизу */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select 
          value={employeeGroup} 
          onValueChange={(value) => { if (value) setEmployeeGroup(value as typeof employeeGroup); }}
        >
          <SelectTrigger aria-label={t.employeeGroup} className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allEmployees}</SelectItem>
            <SelectItem value="regular">{t.regularEmployees}</SelectItem>
            <SelectItem value="hr">{t.hrDepartment}</SelectItem>
          </SelectContent>
        </Select>

        <Combobox items={options} value={selected} onValueChange={(option) => { if (option) selectEmployee(option.value); }}>
          <ComboboxInput 
            id={`${id}-employee`} 
            aria-label={t.findEmployee} 
            placeholder={t.employeePlaceholder} 
            className="w-full sm:w-72" 
          />
          <ComboboxContent>
            <ComboboxEmpty>{t.noEmployees}</ComboboxEmpty>
            <ComboboxList>
              {(option: { value: string; label: string }) => (
                <ComboboxItem key={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

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
            <p className="text-[11px] text-muted-foreground">{t.careerGoal}</p>
            <p className="mt-1 text-sm font-medium">
              {profile.career_goal ? `${profile.career_goal.target_grade} · ${profile.career_goal.target_role}` : t.notSet}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}