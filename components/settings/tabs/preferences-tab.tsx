"use client";

import { useId } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserStore } from "@/components/providers/user-store-provider";

const GOALS = [
  { value: "undecided", label: "Still exploring" },
  { value: "grow", label: "Grow in my current role" },
  { value: "promotion", label: "Prepare for the next grade" },
  { value: "change_role", label: "Explore a different role" },
];
const FORMATS = [
  { value: "any", label: "No preference" },
  { value: "self_paced", label: "Self-paced learning" },
  { value: "workshop", label: "Workshops" },
  { value: "mentoring", label: "Mentoring" },
];
const TIME = [
  { value: "undecided", label: "Not sure yet" },
  { value: "1", label: "Up to 1 hour" },
  { value: "2", label: "Up to 2 hours" },
  { value: "4", label: "Up to 4 hours" },
];

export function PreferencesTab() {
  const id = useId();
  const profile = useUserStore((state) => state.profile);
  const preferences = useUserStore((state) => state.preferences);
  const updatePreferences = useUserStore((state) => state.updatePreferences);

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">Preferences for <span className="font-medium text-foreground">{profile.full_name}</span></p>
      <section className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Your direction</h4>
        <div className="space-y-2">
          <label id={`${id}-goal`} className="text-xs font-medium">Career goal</label>
          <Select items={GOALS} value={preferences.careerGoal} onValueChange={(value) => { if (value) updatePreferences({ careerGoal: value }); }}>
            <SelectTrigger aria-labelledby={`${id}-goal`} className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{GOALS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-interests`} className="text-xs font-medium">Skills and interests</label>
          <Textarea id={`${id}-interests`} placeholder="What would you like to explore or improve?" value={preferences.interests} onChange={(event) => updatePreferences({ interests: event.target.value })} className="min-h-20 resize-y" />
        </div>
      </section>
      <section className="space-y-4 border-t border-border/40 pt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Your pace</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label id={`${id}-format`} className="text-xs font-medium">Learning format</label>
            <Select items={FORMATS} value={preferences.learningFormat} onValueChange={(value) => { if (value) updatePreferences({ learningFormat: value }); }}>
              <SelectTrigger aria-labelledby={`${id}-format`} className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{FORMATS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label id={`${id}-time`} className="text-xs font-medium">Time per week</label>
            <Select items={TIME} value={preferences.weeklyHours} onValueChange={(value) => { if (value) updatePreferences({ weeklyHours: value }); }}>
              <SelectTrigger aria-labelledby={`${id}-time`} className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{TIME.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </section>
      <p className="text-xs leading-relaxed text-muted-foreground">Preferences are kept separately for each employee during this session and reset on page reload. They do not change the original employee record.</p>
    </div>
  );
}
