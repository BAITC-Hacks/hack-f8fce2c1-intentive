"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Award, BookOpen, Check, Compass, Flag, Leaf, LockKeyhole, MoveUpRight, Settings2, Sparkles } from "lucide-react";
import { useDevelopment, useUserStore } from "@/components/providers/user-store-provider";
import { selectProfile } from "@/stores/selectors";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsDialog } from "@/components/settings";
import { AICoach } from "./ai-coach";
import { SkillMeter } from "./skill-meter";
import { getPersonalMilestones, shortDate } from "./presentation";

export function DevelopmentWorkspace() {
  const profile = useUserStore(selectProfile);
  const dataset = useUserStore((state) => state.dataset);
  const development = useDevelopment();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const progress = development.trajectory.target;
  const goal = development.trajectory.goal;
  const percent = Math.round(progress.coveragePercent);
  const personal = getPersonalMilestones(dataset, profile.employee_id);
  const active = dataset.activity_history.filter((record) => record.employee_id === profile.employee_id && (record.status === "in_progress" || record.status === "overdue"));
  const grown = Object.keys(development.skills.levels).filter((id) => development.skills.levels[id] > development.skills.baseline[id]).length;
  const focus = progress.skills.filter((skill) => skill.gap > 0).slice(0, 3);

  return <div className="mx-auto max-w-6xl space-y-7 font-[Arial,Helvetica,sans-serif]">
    <header className="flex flex-wrap items-start justify-between gap-4 pt-1">
      <div><p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"><Compass className="size-3.5" />Ваш личный маршрут</p><h1 className="text-3xl font-semibold tracking-tight">Развитие в вашем ритме<span className="text-primary">.</span></h1><p className="mt-2 text-sm text-muted-foreground">{profile.full_name} <span className="px-1.5">/</span> {profile.grade} · {profile.role}</p></div>
      <Button variant="outline" className="rounded-xl" onClick={() => setSettingsOpen(true)}><Settings2 className="size-3.5" />Моя цель</Button>
    </header>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card className="rounded-2xl bg-secondary/45 [--card-spacing:--spacing(6)]">
        <CardContent className="flex h-full flex-wrap items-center justify-between gap-6">
          <div className="min-w-0 flex-1"><div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><Flag className="size-3.5" />Следующий ориентир{(goal.source === "suggested_next_grade" || goal.source === "current_role") && <Badge variant="outline" className="text-[10px]">Предварительная цель</Badge>}</div><h2 className="text-2xl font-semibold tracking-tight">{goal.target.target_grade}</h2><p className="mt-1 text-sm text-muted-foreground">{goal.target.target_role}</p><div className="mt-5 flex items-center gap-3 text-xs"><span className="rounded-md bg-background/70 px-2 py-1.5">{profile.grade}</span><span className="h-px w-9 bg-border" /><MoveUpRight className="size-4 text-primary" /><span className="font-medium text-primary">{goal.target.target_grade}</span></div><p className="mt-4 max-w-sm text-[11px] leading-relaxed text-muted-foreground">{progress.metSkills} из {progress.totalSkills} требований закрыто. Прогресс по навыкам — ориентир, а не обещание повышения.</p></div>
          <div className="relative flex size-32 shrink-0 items-center justify-center" role="img" aria-label={`Покрытие требований ${percent}%`}><svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="5" className="text-primary/10" /><circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray={`${progress.coveragePercent} 100`} className="text-primary" /></svg><div className="text-center"><p className="text-3xl font-semibold tabular-nums">{percent}<span className="text-lg">%</span></p><p className="mt-1 text-[10px] text-muted-foreground">на пути к цели</p></div></div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
        {[{ Icon: BookOpen, value: personal.completedCount, label: "квестов завершено", note: "Добровольное обучение" }, { Icon: Leaf, value: grown, label: "навыков выросло", note: "После последней оценки" }, { Icon: Sparkles, value: active.length, label: "активностей в работе", note: "Ваш текущий фокус" }].map(({ Icon, value, label, note }) => <Card key={label} className="rounded-2xl [--card-spacing:--spacing(4)]"><CardContent className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4"><Icon className="size-4 shrink-0 text-primary" /><div className="flex-1"><p className="text-xs font-medium"><span className="mr-1.5 text-lg tabular-nums">{value}</span>{label}</p><p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">{note}</p></div></CardContent></Card>)}
      </div>
    </div>

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <AICoach />
      <aside className="space-y-5">
        <Card className="rounded-2xl [--card-spacing:--spacing(5)]"><CardContent><div className="mb-5 flex items-center justify-between"><h2 className="text-sm font-semibold">Навыки в фокусе</h2><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">{progress.criticalGaps.length} ключевых разрывов</span></div><div className="space-y-5">{focus.map((skill) => <SkillMeter key={skill.skillId} name={dataset.skills.find((item) => item.skill_id === skill.skillId)!.name} current={skill.current} required={skill.required} critical={skill.critical} />)}{focus.length === 0 && <p className="text-sm text-muted-foreground">Все навыки цели соответствуют требованиям. Отличная точка для нового маршрута.</p>}</div><Link href="/trajectory" className="mt-5 flex items-center justify-between border-t pt-4 text-xs font-medium">Посмотреть всю траекторию<ArrowUpRight className="size-4" /></Link></CardContent></Card>
        <Card className="rounded-2xl [--card-spacing:--spacing(5)]"><CardContent><div className="mb-4 flex items-center gap-2"><Award className="size-4 text-primary" /><h2 className="text-sm font-semibold">Маленькие победы</h2></div><div className="space-y-4">{personal.badges.map((badge) => <div key={badge.title} className="flex items-center gap-3"><span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${badge.reached ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{badge.reached ? <Check className="size-4" /> : <LockKeyhole className="size-3.5" />}</span><div className="min-w-0 flex-1"><p className="text-xs font-medium">{badge.title}</p><p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{badge.description}</p></div><span className="text-[10px] tabular-nums text-muted-foreground">{Math.min(personal.completedCount, badge.target)}/{badge.target}</span></div>)}</div><p className="mt-5 border-t pt-3 text-[10px] leading-relaxed text-muted-foreground">Только ваш прогресс. Без сравнения с коллегами и наград за обязательное обучение.</p></CardContent></Card>
        <div className="px-1 text-[11px] leading-relaxed text-muted-foreground"><p>Демо · срез на {shortDate(dataset.meta.as_of_date)} {dataset.meta.as_of_date.slice(0, 4)}</p><p className="mt-1">Изменения сохраняются до перезагрузки страницы.</p></div>
      </aside>
    </div>
    <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} defaultTab="preferences" />
  </div>;
}
