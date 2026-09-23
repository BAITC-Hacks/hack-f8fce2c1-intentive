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
    <div className="mx-auto max-w-6xl space-y-8 font-[Arial,Helvetica,sans-serif]">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">{profile.full_name}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Мои активности</h1>
        <p className="text-sm text-muted-foreground">Выберите следующий квест, завершайте обучение и наблюдайте, как растут навыки.</p>
        <p className="text-xs text-muted-foreground">Демосессия · {dataset.meta.as_of_date} · Изменения сбрасываются после перезагрузки.</p>
      </header>
      <section className="rounded-2xl border bg-secondary/45 p-6" aria-label="Career progress">
        <p className="text-sm text-muted-foreground">{development.trajectory.goal.target.target_grade} · {development.trajectory.goal.target.target_role}</p>
        <p className="mt-2 text-2xl font-semibold">{Math.round(development.trajectory.target.coveragePercent)}% <span className="text-sm font-normal text-muted-foreground">требований к навыкам покрыто</span></p>
        <p className="mt-1 text-sm text-muted-foreground">{development.trajectory.target.criticalGaps.length} критических разрывов по навыкам</p>
        {development.trajectory.goal.source === "suggested_next_grade" && <p className="mt-2 text-xs text-muted-foreground">Предварительная траектория · карьерная цель не выбрана.</p>}
        {development.trajectory.goal.source === "current_role" && <p className="mt-2 text-xs text-muted-foreground">Развитие в текущей роли · карьерная цель не выбрана.</p>}
      </section>
      <div aria-live="polite" role="status" className={feedback?.error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{feedback?.text}</div>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Сейчас в работе</h2>
        {active.length === 0 && <p className="text-sm text-muted-foreground">Пока нет активного обучения. Выберите доступный квест ниже.</p>}
        {active.map((record) => {
          const event = dataset.events.find((item) => item.event_id === record.event_id)!;
          return <div key={record.record_id} className="scroll-mt-24 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5">
            <div className="space-y-1"><p className="font-medium">{event.title}</p><p className="text-sm text-muted-foreground">{record.completion_pct}% завершено · {event.duration_hours} ч</p>{event.mandatory && <Badge variant="secondary">Обязательное</Badge>}</div>
            <Button variant="outline" onClick={() => report(complete(profile.employee_id, record.record_id), `${event.title} завершено. Прогресс пересчитан.`)}>Завершить</Button>
          </div>;
        })}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Выберите следующий квест</h2>
        {available.length === 0 && <p className="text-sm text-muted-foreground">Пока нет мероприятий, доступных по условиям участия.</p>}
        {available.map((item) => {
          const event = dataset.events.find((event) => event.event_id === item.eventId)!;
          const canStart = event.format === "self_paced" || item.nextSessionDate === dataset.meta.as_of_date;
          return <div id={event.event_id} key={event.event_id} className="scroll-mt-24 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5">
            <div className="max-w-xl space-y-1"><p className="font-medium">{event.title}</p><p className="text-sm text-muted-foreground">{event.description}</p><p className="text-xs text-muted-foreground">{event.duration_hours} ч · {item.nextSessionDate ? `Ближайшая сессия: ${item.nextSessionDate}` : "В своём темпе"}</p></div>
            <Button variant="outline" disabled={!canStart} onClick={() => report(start(profile.employee_id, event.event_id), `${event.title} начато.`)}>{canStart ? "Начать квест" : "Сессия впереди"}</Button>
          </div>;
        })}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Ваши завершённые шаги</h2>
        {completed.length === 0 && <p className="text-sm text-muted-foreground">Здесь появятся ваши завершённые активности.</p>}
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
