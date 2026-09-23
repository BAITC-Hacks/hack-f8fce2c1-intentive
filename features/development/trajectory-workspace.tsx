"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Flag } from "lucide-react";
import { useDevelopment, useUserStore } from "@/components/providers/user-store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillMeter } from "./skill-meter";

export function TrajectoryWorkspace() {
  const development = useDevelopment();
  const skills = useUserStore((state) => state.dataset.skills);
  const goal = development.trajectory.goal;
  return <div className="mx-auto max-w-6xl space-y-7 font-[Arial,Helvetica,sans-serif]">
    <header><Link href="/" className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground"><ArrowLeft className="size-3" />Моё развитие</Link><h1 className="text-3xl font-semibold tracking-tight">Карта ваших навыков</h1><p className="mt-2 text-sm text-muted-foreground">Что уже получается и что поможет приблизиться к следующему уровню.</p></header>
    <Card className="rounded-2xl bg-secondary/40 [--card-spacing:--spacing(6)]"><CardContent className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Flag className="size-5" /></span><div><p className="text-xs text-muted-foreground">Выбранный ориентир</p><h2 className="mt-1 text-lg font-semibold">{goal.target.target_grade} · {goal.target.target_role}</h2></div></div><Button nativeButton={false} variant="outline" render={<Link href="/#ai-coach" />}>Подобрать следующий шаг<ArrowUpRight className="size-4" /></Button></CardContent></Card>
    <Tabs defaultValue="target" className="space-y-5"><TabsList><TabsTrigger value="target" className="px-4">Для карьерной цели</TabsTrigger><TabsTrigger value="current" className="px-4">Для текущей роли</TabsTrigger></TabsList>
      {(["target", "current"] as const).map((type) => {
        const progress = development.trajectory[type];
        return <TabsContent key={type} value={type} className="space-y-5"><div className="flex flex-wrap items-center gap-3 text-sm"><strong className="text-2xl tabular-nums">{Math.round(progress.coveragePercent)}%</strong><span className="text-muted-foreground">требований покрыто</span><Badge variant="secondary">{progress.metSkills} / {progress.totalSkills} навыков соответствуют цели</Badge></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{progress.skills.map((skill) => <Card key={skill.skillId} className="rounded-2xl [--card-spacing:--spacing(5)]"><CardContent><SkillMeter name={skills.find((item) => item.skill_id === skill.skillId)!.name} current={skill.current} required={skill.required} critical={skill.critical} /><p className="mt-4 text-xs text-muted-foreground">{skill.gap > 0 ? `Осталось закрыть уровней: ${skill.gap}` : "Требование закрыто"}</p></CardContent></Card>)}</div></TabsContent>;
      })}
    </Tabs>
    <p className="text-xs leading-relaxed text-muted-foreground">Шкала навыка: 0–5. Прогресс учитывает завершённое обучение после оценки. Соответствие требованиям по навыкам не означает автоматического повышения.</p>
  </div>;
}
