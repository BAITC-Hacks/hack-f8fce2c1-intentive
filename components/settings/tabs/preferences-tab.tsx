"use client";

import { selectProfile, selectPreferences } from "@/stores/selectors";
import { useId } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserStore } from "@/components/providers/user-store-provider";
import { useSettingsI18n } from "../i18n";

export function PreferencesTab() {
  const id = useId();
  const { t } = useSettingsI18n();
  const profile = useUserStore(selectProfile);
  const preferences = useUserStore(selectPreferences);
  const updatePreferences = useUserStore((state) => state.updatePreferences);
  const roleProfiles = useUserStore((state) => state.dataset.role_profiles);
  const goals = [{ value: "undecided", label: t.exploring }, { value: "grow", label: t.grow }, { value: "promotion", label: t.promotion }, { value: "change_role", label: t.changeRole }];
  const formats = [{ value: "any", label: t.any }, { value: "self_paced", label: t.selfPaced }, { value: "workshop", label: t.workshop }, { value: "mentoring", label: t.mentoring }];
  const times = [{ value: "undecided", label: t.unsure }, { value: "1", label: t.upToHour }, { value: "2", label: t.upToTwo }, { value: "4", label: t.upToFour }];
  const targetOptions = roleProfiles.filter((item) => item.role !== profile.role).map((item) => ({
    value: JSON.stringify([item.role, item.grade]), label: `${item.grade} · ${item.role}`,
  }));

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">{t.preferencesFor} <span className="font-medium text-foreground">{profile.full_name}</span></p>
      <section className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{t.direction}</h4>
        <div className="space-y-2">
          <label id={`${id}-goal`} className="text-xs font-medium">{t.goal}</label>
          <Select items={goals} value={preferences.careerGoal} onValueChange={(value) => { if (value) updatePreferences({ careerGoal: value }); }}>
            <SelectTrigger aria-labelledby={`${id}-goal`} className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{goals.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {preferences.careerGoal === "change_role" && <div className="space-y-2">
          <label id={`${id}-target`} className="text-xs font-medium">{t.targetRole}</label>
          <Select items={targetOptions} value={preferences.targetGoal ? JSON.stringify([preferences.targetGoal.target_role, preferences.targetGoal.target_grade]) : null}
            onValueChange={(value) => {
              const target = roleProfiles.find((item) => JSON.stringify([item.role, item.grade]) === value);
              if (target) updatePreferences({ targetGoal: { target_role: target.role, target_grade: target.grade } });
            }}>
            <SelectTrigger aria-labelledby={`${id}-target`} className="w-full"><SelectValue placeholder={t.chooseTarget} /></SelectTrigger>
            <SelectContent>{targetOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
          </Select>
          {!preferences.targetGoal && <p className="text-xs text-muted-foreground">{t.targetHint}</p>}
        </div>}
        <div className="space-y-2">
          <label htmlFor={`${id}-interests`} className="text-xs font-medium">{t.interests}</label>
          <Textarea id={`${id}-interests`} placeholder={t.interestsPlaceholder} value={preferences.interests} onChange={(event) => updatePreferences({ interests: event.target.value })} className="min-h-20 resize-y" />
        </div>
      </section>
      <section className="space-y-4 border-t border-border/40 pt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{t.pace}</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label id={`${id}-format`} className="text-xs font-medium">{t.format}</label>
            <Select items={formats} value={preferences.learningFormat} onValueChange={(value) => { if (value) updatePreferences({ learningFormat: value }); }}>
              <SelectTrigger aria-labelledby={`${id}-format`} className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{formats.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label id={`${id}-time`} className="text-xs font-medium">{t.weeklyTime}</label>
            <Select items={times} value={preferences.weeklyHours} onValueChange={(value) => { if (value) updatePreferences({ weeklyHours: value }); }}>
              <SelectTrigger aria-labelledby={`${id}-time`} className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{times.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </section>
      <p className="text-xs leading-relaxed text-muted-foreground">{t.sessionNote}</p>
    </div>
  );
}
