"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Compass, Flag, Focus, Layers3, Sparkles, Target } from "lucide-react";
import { useDevelopment, useUserStore } from "@/components/providers/user-store-provider";
import { selectProfile } from "@/stores/selectors";
import type { Skill } from "@/core/domain/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillMeter } from "./skill-meter";

type Progress = ReturnType<typeof useDevelopment>["trajectory"]["target"];

function SkillBoard({ progress, skills, context }: { progress: Progress; skills: Map<string, Skill>; context: "target" | "current" }) {
  const gaps = progress.skills.filter((skill) => skill.gap > 0);
  const priorities = gaps.slice(0, 3);
  const next = gaps.slice(3);
  const ready = progress.skills.filter((skill) => skill.gap === 0);
  const label = context === "target" ? "для цели" : "для роли";

  return <div className="space-y-6">
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="rounded-2xl bg-primary/[0.06] ring-primary/15 [--card-spacing:--spacing(5)]"><CardContent><p className="text-xs text-muted-foreground">Покрытие требований</p><p className="mt-2 text-3xl font-semibold tabular-nums">{Math.round(progress.coveragePercent)}%</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Сумма достигнутых уровней по требованиям роли</p></CardContent></Card>
      <Card className="rounded-2xl [--card-spacing:--spacing(5)]"><CardContent><p className="text-xs text-muted-foreground">Уже соответствует</p><p className="mt-2 text-3xl font-semibold tabular-nums">{progress.metSkills}<span className="ml-1 text-lg font-normal text-muted-foreground">/ {progress.totalSkills}</span></p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Навыков на нужном уровне или выше</p></CardContent></Card>
      <Card className="rounded-2xl [--card-spacing:--spacing(5)]"><CardContent><p className="text-xs text-muted-foreground">Критичный фокус</p><p className="mt-2 text-3xl font-semibold tabular-nums">{progress.criticalGaps.length}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Ключевых навыков с разрывом</p></CardContent></Card>
    </div>

    <section aria-labelledby={`${context}-priorities`} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary"><Focus className="size-3.5" />С чего начать</p><h2 id={`${context}-priorities`} className="text-xl font-semibold tracking-tight">Главные навыки в фокусе</h2></div><Badge variant="outline" className="rounded-full">{gaps.length} навыков требуют внимания</Badge></div>
      {priorities.length ? <div className="grid gap-4 lg:grid-cols-3">{priorities.map((gap, index) => {
        const skill = skills.get(gap.skillId)!;
        return <Card key={gap.skillId} className="rounded-2xl [--card-spacing:--spacing(5)]"><CardContent className="flex h-full flex-col gap-5">
          <div className="flex items-start justify-between gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">{String(index + 1).padStart(2, "0")}</div>{gap.critical && <Badge variant="secondary" className="rounded-full">Критичный</Badge>}</div>
          <div className="flex-1"><p className="mb-1 text-[11px] text-muted-foreground">{skill.category}</p><h3 className="text-lg font-semibold tracking-tight">{skill.name}</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{skill.description}</p></div>
          <div className="border-t pt-4"><SkillMeter name={skill.name} current={gap.current} required={gap.required} critical={false} contextLabel={label} /><p className="mt-3 text-xs text-muted-foreground">До требования осталось {gap.gap} {gap.gap === 1 ? "уровень" : gap.gap < 5 ? "уровня" : "уровней"}</p></div>
        </CardContent></Card>;
      })}</div> : <Card className="rounded-2xl bg-primary/[0.04] [--card-spacing:--spacing(6)]"><CardContent className="flex items-center gap-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Check className="size-5" /></span><div><h3 className="font-semibold">Разрывов для этого ориентира нет</h3><p className="mt-1 text-sm text-muted-foreground">Можно выбрать другую цель или продолжить развитие в удобном темпе.</p></div></CardContent></Card>}
    </section>

    {next.length > 0 && <section aria-labelledby={`${context}-next`} className="space-y-4"><div><p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Layers3 className="size-3.5" />Остальные разрывы</p><h2 id={`${context}-next`} className="text-xl font-semibold tracking-tight">Развивать дальше</h2></div><div className="grid gap-3 sm:grid-cols-2">{next.map((gap) => <Card key={gap.skillId} className="rounded-2xl [--card-spacing:--spacing(4)]"><CardContent className="space-y-4"><div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{skills.get(gap.skillId)?.category}</span>{gap.critical && <Badge variant="secondary" className="rounded-full">Критичный</Badge>}</div><SkillMeter name={skills.get(gap.skillId)!.name} current={gap.current} required={gap.required} contextLabel={label} /></CardContent></Card>)}</div></section>}

    {ready.length > 0 && <details className="group rounded-2xl border bg-card px-5 py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center gap-2"><Check className="size-4 text-primary" />Уже соответствует требованиям <span className="text-xs font-normal text-muted-foreground">{ready.length}</span></span><ArrowRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" /></summary><div className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3">{ready.map((gap) => <div key={gap.skillId} className="rounded-xl bg-muted/45 p-4"><SkillMeter name={skills.get(gap.skillId)!.name} current={gap.current} required={gap.required} contextLabel={label} /></div>)}</div></details>}

    <Card className="rounded-2xl bg-secondary/35 [--card-spacing:--spacing(5)]"><CardContent className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm font-semibold">Как сократить разрывы?</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">AI-наставник покажет доступные шаги и объяснит, почему они подходят вашему маршруту.</p></div></div><Button nativeButton={false} render={<Link href="/#ai-coach" />} className="h-9 rounded-xl">Перейти к рекомендациям<ArrowRight className="size-4" /></Button></CardContent></Card>
  </div>;
}

export function TrajectoryWorkspace() {
  const development = useDevelopment();
  const profile = useUserStore(selectProfile);
  const skills = useUserStore((state) => state.dataset.skills);
  const skillsById = new Map(skills.map((skill) => [skill.skill_id, skill]));
  const goal = development.trajectory.goal;
  const provisional = goal.source === "suggested_next_grade" || goal.source === "current_role";

  return <div className="mx-auto max-w-6xl space-y-7 font-[Arial,Helvetica,sans-serif]">
    <header className="space-y-4 pt-1"><Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Моё развитие</Link><div><p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Compass className="size-3.5" />Ваш маршрут</p><h1 className="text-3xl font-semibold tracking-tight">Карта навыков<span className="text-primary">.</span></h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Сначала — навыки с разрывом. Уже освоенные можно раскрыть ниже.</p></div></header>
    <Card className="rounded-2xl bg-secondary/40 [--card-spacing:--spacing(6)]"><CardContent className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><Flag className="size-3.5" />Ваш ориентир{provisional && <Badge variant="outline" className="rounded-full text-[10px]">Предварительный</Badge>}</p><div className="flex flex-wrap items-center gap-2 text-sm"><span className="rounded-lg bg-background px-3 py-2">{profile.grade} · {profile.role}</span><ArrowRight className="size-4 text-primary" /><span className="rounded-lg bg-primary/10 px-3 py-2 font-semibold text-primary">{goal.target.target_grade} · {goal.target.target_role}</span></div><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Покрытие навыков помогает планировать развитие и не означает автоматического повышения.</p></div><span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Target className="size-6" /></span></CardContent></Card>
    <Tabs defaultValue="target" className="space-y-5"><TabsList className="w-full sm:w-fit"><TabsTrigger value="target" className="min-w-0 px-3 sm:px-5">Карьерная цель</TabsTrigger><TabsTrigger value="current" className="min-w-0 px-3 sm:px-5">Текущая роль</TabsTrigger></TabsList><TabsContent value="target"><SkillBoard progress={development.trajectory.target} skills={skillsById} context="target" /></TabsContent><TabsContent value="current"><SkillBoard progress={development.trajectory.current} skills={skillsById} context="current" /></TabsContent></Tabs>
    <p className="text-xs leading-relaxed text-muted-foreground">Уровни навыков: 0–5. Завершённое обучение после последней оценки учитывается в текущем уровне.</p>
  </div>;
}
