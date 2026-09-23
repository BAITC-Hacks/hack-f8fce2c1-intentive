"use client";

import { useId, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useUserStore } from "@/components/providers/user-store-provider";

export function AccountTab() {
  const id = useId();
  const router = useRouter();
  const accountType = useUserStore((state) => state.accountType);
  const setAccountType = useUserStore((state) => state.setAccountType);
  const profile = useUserStore((state) => state.profile);
  const employees = useUserStore((state) => state.employees);
  const selectEmployee = useUserStore((state) => state.selectEmployee);
  const options = useMemo(() => employees.map((employee) => ({
    value: employee.employee_id,
    label: `${employee.full_name} · ${employee.employee_id}`,
  })), [employees]);
  const selected = options.find((option) => option.value === profile.employee_id) ?? null;
  const details = [
    ["Department", profile.department],
    ["Role", profile.role],
    ["Grade", profile.grade],
    ["Work format", { office: "Office", hybrid: "Hybrid", remote: "Remote" }[profile.work_format]],
    ["Tenure", `${profile.tenure_months} months`],
    ["Preferred language", { kk: "Қазақша", ru: "Русский", en: "English" }[profile.preferred_language]],
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs font-medium">Account type</p>
        <ButtonGroup aria-label="Account type" className="w-full">
          <Button
            type="button"
            variant={accountType === "employee" ? "default" : "outline"}
            className="flex-1"
            aria-pressed={accountType === "employee"}
            onClick={() => {
              setAccountType("employee");
              router.replace("/");
            }}
          >
            Employee
          </Button>
          <Button
            type="button"
            variant={accountType === "hr" ? "default" : "outline"}
            className="flex-1"
            aria-pressed={accountType === "hr"}
            onClick={() => {
              setAccountType("hr");
              router.replace("/hr");
            }}
          >
            HR
          </Button>
        </ButtonGroup>
        <p className="text-xs text-muted-foreground">Changes the available workspace sections for this demo session.</p>
      </section>
      <section className="space-y-2">
        <label htmlFor={`${id}-employee`} className="text-xs font-medium">Demo employee</label>
        <Combobox items={options} value={selected} onValueChange={(option) => { if (option) selectEmployee(option.value); }}>
          <ComboboxInput id={`${id}-employee`} placeholder="Search by name or employee ID" className="w-full" />
          <ComboboxContent>
            <ComboboxEmpty>No employees found.</ComboboxEmpty>
            <ComboboxList>
              {(option: { value: string; label: string }) => (
                <ComboboxItem key={option.value} value={option}>{option.label}</ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p className="text-xs text-muted-foreground">Explore {employees.length} synthetic profiles. This selector is for the demo, not sign-in.</p>
      </section>
      <section className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/25 p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserRound className="size-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-medium">{profile.full_name}</p>
          <p className="text-xs text-muted-foreground">{profile.grade} · {profile.role}</p>
        </div>
      </section>
      <section className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Employee details</h4>
        <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="space-y-1">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="space-y-1 border-t border-border/40 pt-4">
        <p className="text-xs text-muted-foreground">Career goal in employee profile</p>
        <p className="text-sm font-medium">{profile.career_goal
          ? `${profile.career_goal.target_grade} · ${profile.career_goal.target_role}`
          : "Not set yet"}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">Your personal direction can be adjusted in My preferences.</p>
      </section>
    </div>
  );
}
