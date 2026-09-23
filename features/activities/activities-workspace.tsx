"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Check, CheckCircle2, Clock3, Compass, GraduationCap, Search, Sparkles, Target } from "lucide-react";
import { useDevelopment, useRecommendations, useUserStore } from "@/components/providers/user-store-provider";
import { selectProfile } from "@/stores/selectors";
import type { ActionResult } from "@/stores/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatLabels, shortDate } from "@/features/development/presentation";
import { useDashboardLanguage } from "@/features/dashboard-language";

type FormatFilter = "all" | "self_paced" | "scheduled";

const activityErrorsRu: Record<string, string> = {
  "The selected employee has changed. Try again.": "Выбран другой сотрудник. Повторите действие.",
  "Activity not found": "Активность не найдена.",
  "Activity is not available": "Активность недоступна.",
  "This session has not started yet": "Сессия ещё не началась.",
  "Participation ID already exists": "Участие с таким ID уже существует.",
  "Participation not found for this employee": "Участие этого сотрудника не найдено.",
  "Only active participation can be completed": "Можно завершить только активное участие.",
  "This activity has already been completed in another participation": "Эта активность уже завершена в другом участии.",
  "A future session cannot be completed": "Будущую сессию нельзя завершить.",
  "Unable to start activity": "Не удалось начать активность.",
  "Unable to complete activity": "Не удалось завершить активность.",
};

export function ActivitiesWorkspace() {
  const profile = useUserStore(selectProfile);
  return <EmployeeActivities key={profile.employee_id} />;
}

function EmployeeActivities() {
  const { language, text } = useDashboardLanguage();
  const formatLabel = formatLabels[language];
  const profile = useUserStore(selectProfile);
  const dataset = useUserStore((state) => state.dataset);
  const start = useUserStore((state) => state.startActivity);
  const complete = useUserStore((state) => state.completeActivity);
  const ai = useUserStore((state) => state.ai.response);
  const development = useDevelopment();
  const calculated = useRecommendations();
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState<FormatFilter>("all");
  const events = new Map(dataset.events.map((event) => [event.event_id, event]));
  const skills = new Map(dataset.skills.map((skill) => [skill.skill_id, skill.name]));
  const history = dataset.activity_history.filter((record) => record.employee_id === profile.employee_id);
  const active = history.filter((record) => record.status === "in_progress" || record.status === "overdue");
  const completed = history.filter((record) => record.status === "completed")
    .sort((a, b) => (b.completed_at ?? b.date).localeCompare(a.completed_at ?? a.date));
  const recommendations = ai?.source === "ai" ? ai.result.recommendations : calculated.recommendations;
  const recommendedIds = recommendations.map((item) => item.eventId);
  const available = development.activities.filter((item) => item.available).sort((a, b) => {
    const rankA = recommendedIds.indexOf(a.eventId);
    const rankB = recommendedIds.indexOf(b.eventId);
    return (rankA < 0 ? 99 : rankA) - (rankB < 0 ? 99 : rankB)
      || events.get(a.eventId)!.title.localeCompare(events.get(b.eventId)!.title);
  });
  const visible = available.filter((item) => {
    const event = events.get(item.eventId)!;
    const query = search.trim().toLocaleLowerCase();
    const matchesText = !query || `${event.title} ${event.description} ${event.develops_skills.map((skill) => skills.get(skill.skill_id)).join(" ")}`.toLocaleLowerCase().includes(query);
    const matchesFormat = format === "all" || (format === "self_paced" ? event.format === "self_paced" : event.format !== "self_paced");
    return matchesText && matchesFormat;
  });
  const report = (result: ActionResult, message: string) => setFeedback({ text: result.ok ? message : language === "ru" ? activityErrorsRu[result.error] ?? result.error : result.error, error: !result.ok });
  const percent = Math.round(development.trajectory.target.coveragePercent);

  return <div className="mx-auto max-w-6xl space-y-7 font-[Arial,Helvetica,sans-serif]">
    <header className="space-y-2 pt-1"><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Compass className="size-3.5" />{text("Ваш темп развития", "Your development pace")}</p><h1 className="text-3xl font-semibold tracking-tight">{text("Мои активности", "My activities")}<span className="text-primary">.</span></h1><p className="text-sm leading-relaxed text-muted-foreground">{text("Выберите полезный шаг, продолжите начатое и увидьте, как меняются ваши навыки.", "Choose a useful step, continue what you started, and see how your skills grow.")}</p></header>

    <Card className="rounded-2xl bg-secondary/40 [--card-spacing:--spacing(6)]"><CardContent className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
      <div><p className="mb-1 text-xs text-muted-foreground">{text("Маршрут", "Path for")} {profile.full_name}</p><h2 className="text-xl font-semibold tracking-tight">{development.trajectory.goal.target.target_grade} · {development.trajectory.goal.target.target_role}</h2><p className="mt-2 text-sm text-muted-foreground">{text(`${percent}% требований к навыкам покрыто · ${development.trajectory.target.criticalGaps.length} критичных разрывов`, `${percent}% of skill requirements covered · ${development.trajectory.target.criticalGaps.length} critical gaps`)}</p><div className="mt-4 flex flex-wrap gap-2"><Badge variant="outline" className="rounded-full">{active.length} {text("в работе", "in progress")}</Badge><Badge variant="outline" className="rounded-full">{available.length} {text("доступны сейчас", "available now")}</Badge></div></div>
      <Button nativeButton={false} variant="outline" render={<Link href="/trajectory" />} className="h-10 rounded-xl">{text("Карта навыков", "Skills map")}<ArrowRight className="size-4" /></Button>
    </CardContent></Card>

    {feedback && <div role="status" aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm ${feedback.error ? "border-destructive/25 bg-destructive/5 text-destructive" : "border-primary/20 bg-primary/5 text-foreground"}`}>{feedback.text}</div>}

    <section aria-labelledby="active-heading" className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary"><BookOpen className="size-3.5" />{text("Текущий фокус", "Current focus")}</p><h2 id="active-heading" className="text-xl font-semibold tracking-tight">{text("Сейчас в работе", "In progress now")}</h2></div><span className="text-xs text-muted-foreground">{active.length} {text("активностей", "activities")}</span></div>
      {active.length ? <div className="grid gap-4 md:grid-cols-2">{active.map((record) => {
        const event = events.get(record.event_id)!;
        return <Card key={record.record_id} className="rounded-2xl [--card-spacing:--spacing(5)]"><CardContent className="flex h-full flex-col gap-5"><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary" className="rounded-full">{record.status === "overdue" ? text("Просрочено", "Overdue") : text("В процессе", "In progress")}</Badge>{event.mandatory && <span className="text-xs text-muted-foreground">{text("Обязательное", "Mandatory")}</span>}</div><div className="flex-1"><h3 className="text-base font-semibold leading-snug">{event.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{event.description}</p></div><div className="space-y-3"><div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{text("Выполнено", "Completed")}</span><strong className="tabular-nums">{record.completion_pct}%</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-secondary" role="img" aria-label={text(`Завершено ${record.completion_pct}%`, `${record.completion_pct}% complete`)}><div className="h-full rounded-full bg-primary" style={{ width: `${record.completion_pct}%` }} /></div><Button variant="outline" className="h-9 w-full rounded-xl" onClick={() => report(complete(profile.employee_id, record.record_id), text(`${event.title} завершено. Прогресс пересчитан.`, `${event.title} completed. Progress has been recalculated.`))}>{text("Отметить завершение", "Mark as completed")}<Check className="ml-auto size-4" /></Button></div></CardContent></Card>;
      })}</div> : <Card className="rounded-2xl border-dashed [--card-spacing:--spacing(5)]"><CardContent className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><BookOpen className="size-4" /></span><div><p className="text-sm font-medium">{text("Пока ничего не начато", "Nothing started yet")}</p><p className="mt-1 text-xs text-muted-foreground">{text("Ниже — активности, которые доступны для вашего профиля.", "Available activities for your profile are listed below.")}</p></div></CardContent></Card>}
    </section>

    <section aria-labelledby="catalog-heading" className="scroll-mt-8 space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary"><Sparkles className="size-3.5" />{text("Следующий шаг", "Next step")}</p><h2 id="catalog-heading" className="text-xl font-semibold tracking-tight">{text("Выберите подходящий квест", "Choose a suitable quest")}</h2></div><span className="text-xs text-muted-foreground">{text(`${visible.length} из ${available.length} доступных`, `${visible.length} of ${available.length} available`)}</span></div>
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><label className="relative block min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text("Найти активность или навык", "Find an activity or skill")} aria-label={text("Найти активность или навык", "Find an activity or skill")} className="h-10 rounded-xl pl-9" /></label><div className="flex flex-wrap gap-1.5" role="group" aria-label={text("Формат активности", "Activity format")}>{([{ value: "all", label: text("Все", "All") }, { value: "self_paced", label: text("В своём темпе", "Self-paced") }, { value: "scheduled", label: text("По расписанию", "Scheduled") }] as const).map((option) => <Button key={option.value} size="sm" variant={format === option.value ? "secondary" : "ghost"} aria-pressed={format === option.value} className="rounded-lg" onClick={() => setFormat(option.value)}>{option.label}</Button>)}</div></div>
      {visible.length ? <div className="grid gap-4 md:grid-cols-2">{visible.map((item) => {
        const event = events.get(item.eventId)!;
        const rank = recommendedIds.indexOf(event.event_id);
        const canStart = event.format === "self_paced" || item.nextSessionDate === dataset.meta.as_of_date;
        const gains = item.impact.changes.filter((change) => change.gain > 0);
        return <Card id={event.event_id} key={event.event_id} className={`scroll-mt-24 rounded-2xl [--card-spacing:--spacing(5)] ${rank >= 0 ? "ring-primary/25" : ""}`}><CardContent className="flex h-full flex-col gap-4"><div className="flex flex-wrap items-center gap-2"><Badge variant={rank >= 0 ? "default" : "outline"} className="rounded-full">{rank >= 0 ? `${ai?.source === "ai" ? text("Выбор AI", "AI pick") : text("Подходит для цели", "Fits your goal")} · ${rank + 1}` : formatLabel[event.format]}</Badge>{rank >= 0 && <span className="text-xs text-muted-foreground">{formatLabel[event.format]}</span>}</div><div className="flex-1"><h3 className="text-lg font-semibold tracking-tight">{event.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p></div><div className="space-y-3 border-t pt-4"><div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{event.duration_hours} {text("ч", "h")}</span>{item.nextSessionDate && <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{shortDate(item.nextSessionDate, language)}</span>}{item.impact.targetGapReduction > 0 && <span className="flex items-center gap-1.5 text-primary"><Target className="size-3.5" />{text("Вклад в цель", "Helps your goal")}</span>}</div>{gains.length > 0 && <div className="flex flex-wrap gap-1.5">{gains.slice(0, 3).map((change) => <span key={change.skillId} className="rounded-md bg-secondary px-2 py-1 text-[11px] text-secondary-foreground">{skills.get(change.skillId)} +{change.gain}</span>)}</div>}<Button className="h-9 w-full rounded-xl" disabled={!canStart} onClick={() => report(start(profile.employee_id, event.event_id), text(`${event.title} начато.`, `${event.title} started.`))}>{canStart ? text("Начать активность", "Start activity") : text(`Откроется ${item.nextSessionDate ? shortDate(item.nextSessionDate, language) : "позже"}`, `Opens ${item.nextSessionDate ? shortDate(item.nextSessionDate, language) : "later"}`)}<ArrowRight className="ml-auto size-4" /></Button></div></CardContent></Card>;
      })}</div> : <Card className="rounded-2xl border-dashed [--card-spacing:--spacing(6)]"><CardContent className="text-center"><Search className="mx-auto size-5 text-muted-foreground" /><h3 className="mt-3 font-semibold">{text("Нет совпадений", "No matches")}</h3><p className="mt-1 text-sm text-muted-foreground">{text("Измените поиск или формат, чтобы увидеть доступные активности.", "Change the search or format to see available activities.")}</p><Button variant="outline" className="mt-4 rounded-xl" onClick={() => { setSearch(""); setFormat("all"); }}>{text("Сбросить фильтры", "Reset filters")}</Button></CardContent></Card>}
    </section>

    <section aria-labelledby="history-heading" className="space-y-4"><div><p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><GraduationCap className="size-3.5" />{text("Ваш результат", "Your results")}</p><h2 id="history-heading" className="text-xl font-semibold tracking-tight">{text("Завершённые шаги", "Completed steps")}</h2></div>{completed.length ? <details className="group rounded-2xl border bg-card px-5 py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="size-4 text-primary" />{text("Посмотреть историю", "View history")} <span className="text-xs font-normal text-muted-foreground">{completed.length} {text("завершений", "completions")}</span></span><ArrowRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" /></summary><div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">{completed.slice(0, 8).map((record) => <div key={record.record_id} className="rounded-xl bg-muted/40 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="max-w-xs text-sm font-medium">{events.get(record.event_id)?.title}</h3><span className="text-xs text-muted-foreground">{shortDate(record.completed_at ?? record.date, language)}</span></div><div className="mt-3 flex flex-wrap gap-1.5">{development.skills.contributions.find((item) => item.recordId === record.record_id)?.changes.filter((change) => change.gain > 0).map((change) => <span key={change.skillId} className="rounded-md bg-background px-2 py-1 text-[11px] text-primary">{skills.get(change.skillId)}: {change.before} → {change.after}</span>)}{!development.skills.contributions.some((item) => item.recordId === record.record_id && item.changes.some((change) => change.gain > 0)) && <span className="text-xs text-muted-foreground">{text("Без прироста навыков после последней оценки", "No skill gains since the last review")}</span>}</div></div>)}</div>{completed.length > 8 && <p className="mt-4 text-xs text-muted-foreground">{text("Показаны последние 8 завершений.", "Showing the latest 8 completions.")}</p>}</details> : <Card className="rounded-2xl border-dashed [--card-spacing:--spacing(5)]"><CardContent className="text-sm text-muted-foreground">{text("После первого завершения здесь появится история и прирост навыков.", "Your history and skill gains will appear here after the first completion.")}</CardContent></Card>}</section>
    <p className="text-xs text-muted-foreground">{text("Демосессия · срез на", "Demo session · snapshot as of")} {shortDate(dataset.meta.as_of_date, language)} {dataset.meta.as_of_date.slice(0, 4)} · {text("Изменения сбрасываются после перезагрузки.", "Changes reset after reload.")}</p>
  </div>;
}
