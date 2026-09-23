"use client";

import { useState } from "react";
import { useDevelopment, useUserStore } from "@/components/providers/user-store-provider";
import { selectProfile } from "@/stores/selectors";
import type { ActionResult } from "@/stores/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ActivitiesWorkspace() {
  const profile = useUserStore(selectProfile);
  // Remount local feedback when switching profiles; store progress remains employee-specific.
  return <EmployeeActivities key={profile.employee_id} />;
}

function EmployeeActivities() {
  const profile = useUserStore(selectProfile);
  const dataset = useUserStore((state) => state.dataset);
  const start = useUserStore((state) => state.startActivity);
  const complete = useUserStore((state) => state.completeActivity);
  const development = useDevelopment();
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const history = dataset.activity_history.filter((record) => record.employee_id === profile.employee_id);
  const active = history.filter((record) => record.status === "in_progress" || record.status === "overdue");
  const completed = history.filter((record) => record.status === "completed").sort((a, b) => (b.completed_at ?? b.date).localeCompare(a.completed_at ?? a.date));
  const available = development.activities.filter((item) => item.available);
  const report = (result: ActionResult, message: string) => setFeedback({ text: result.ok ? message : result.error, error: !result.ok });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">{profile.full_name}</p>
        <h1 className="text-2xl font-semibold">Activities</h1>
        <p className="text-sm text-muted-foreground">Start learning, complete your activities and see your skills progress.</p>
        <p className="text-xs text-muted-foreground">Demo session · {dataset.meta.as_of_date} · Changes reset on page reload.</p>
      </header>
      <section className="rounded-xl border p-5" aria-label="Career progress">
        <p className="text-sm text-muted-foreground">{development.trajectory.goal.target.target_grade} · {development.trajectory.goal.target.target_role}</p>
        <p className="mt-2 text-2xl font-semibold">{Math.round(development.trajectory.target.coveragePercent)}% <span className="text-sm font-normal text-muted-foreground">of skill requirements covered</span></p>
        <p className="mt-1 text-sm text-muted-foreground">{development.trajectory.target.criticalGaps.length} critical skill gaps</p>
        {development.trajectory.goal.source === "suggested_next_grade" && <p className="mt-2 text-xs text-muted-foreground">Suggested trajectory · no career goal selected.</p>}
        {development.trajectory.goal.source === "current_role" && <p className="mt-2 text-xs text-muted-foreground">Current role development · no career goal selected.</p>}
      </section>
      <div aria-live="polite" role="status" className={feedback?.error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{feedback?.text}</div>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">In progress</h2>
        {active.length === 0 && <p className="text-sm text-muted-foreground">No active activities. Choose an available activity below.</p>}
        {active.map((record) => {
          const event = dataset.events.find((item) => item.event_id === record.event_id)!;
          return <div key={record.record_id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
            <div className="space-y-1"><p className="font-medium">{event.title}</p><p className="text-sm text-muted-foreground">{record.completion_pct}% complete · {event.duration_hours} hours</p>{event.mandatory && <Badge variant="secondary">Required</Badge>}</div>
            <Button variant="outline" onClick={() => report(complete(profile.employee_id, record.record_id), `${event.title} completed. Your progress has been recalculated.`)}>Mark completed</Button>
          </div>;
        })}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Available activities</h2>
        {available.length === 0 && <p className="text-sm text-muted-foreground">No activities currently meet your participation requirements.</p>}
        {available.map((item) => {
          const event = dataset.events.find((event) => event.event_id === item.eventId)!;
          const canStart = event.format === "self_paced" || item.nextSessionDate === dataset.meta.as_of_date;
          return <div key={event.event_id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
            <div className="max-w-xl space-y-1"><p className="font-medium">{event.title}</p><p className="text-sm text-muted-foreground">{event.description}</p><p className="text-xs text-muted-foreground">{event.duration_hours} hours · {item.nextSessionDate ? `Next session: ${item.nextSessionDate}` : "Self-paced"}</p></div>
            <Button variant="outline" disabled={!canStart} onClick={() => report(start(profile.employee_id, event.event_id), `${event.title} started.`)}>{canStart ? "Start activity" : "Upcoming"}</Button>
          </div>;
        })}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recently completed</h2>
        {completed.length === 0 && <p className="text-sm text-muted-foreground">No completed activities yet.</p>}
        {completed.slice(0, 5).map((record) => <div key={record.record_id} className="space-y-2 border-b py-3 text-sm">
          <div className="flex justify-between gap-4"><span>{dataset.events.find((item) => item.event_id === record.event_id)?.title}</span><span className="text-muted-foreground">{record.completed_at ?? record.date}</span></div>
          <div className="flex flex-wrap gap-2">{development.skills.contributions.find((item) => item.recordId === record.record_id)?.changes.filter((change) => change.gain > 0).map((change) =>
            <Badge key={change.skillId} variant="secondary">{dataset.skills.find((skill) => skill.skill_id === change.skillId)?.name}: {change.before} → {change.after}</Badge>
          )}</div>
        </div>)}
      </section>
    </div>
  );
}
