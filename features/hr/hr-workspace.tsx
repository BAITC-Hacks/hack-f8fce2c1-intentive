"use client";

import { useMemo, useState } from "react";
import { AlertCircle, BookOpenCheck, CalendarDays, ChartNoAxesCombined, CircleCheck, Compass, Filter, GraduationCap, UsersRound } from "lucide-react";
import { useUserStore } from "@/components/providers/user-store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL, createHROverview, type HRFilters } from "@/core/hr/overview";

const gradeOrder = ["Junior", "Middle", "Senior", "Lead"];
const formatLabel: Record<string, string> = { self_paced: "В своём темпе", online: "Онлайн", offline: "Очно" };

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const items = [{ value: ALL, label: "Все" }, ...options.map((option) => ({ value: option, label: option }))];
  return <div className="min-w-0 space-y-2"><span className="text-xs font-medium text-muted-foreground">{label}</span>
    <Select items={items} value={value} onValueChange={(next) => { if (next) onChange(next); }}>
      <SelectTrigger aria-label={label} className="h-10 w-full rounded-xl bg-background px-3"><SelectValue /></SelectTrigger>
      <SelectContent>{items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}

function Metric({ icon: Icon, value, label, hint }: { icon: typeof UsersRound; value: string | number; label: string; hint: string }) {
  return <Card className="rounded-2xl [--card-spacing:--spacing(5)]"><CardContent className="space-y-4">
    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
    <div><p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p><p className="mt-1 text-sm font-medium">{label}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p></div>
  </CardContent></Card>;
}

export function HRWorkspace() {
  const dataset = useUserStore((state) => state.dataset);
  const [filters, setFilters] = useState<HRFilters>({ department: ALL, role: ALL, grade: ALL });
  const departments = useMemo(() => [...new Set(dataset.employees.map((employee) => employee.department))].sort(), [dataset]);
  const roles = useMemo(() => [...new Set(dataset.employees.filter((employee) => filters.department === ALL || employee.department === filters.department)
    .map((employee) => employee.role))].sort(), [dataset, filters.department]);
  const grades = gradeOrder.filter((grade) => dataset.employees.some((employee) =>
    (filters.department === ALL || employee.department === filters.department)
    && (filters.role === ALL || employee.role === filters.role) && employee.grade === grade));
  const overview = useMemo(() => createHROverview(dataset, filters), [dataset, filters]);
  const change = (key: keyof HRFilters, value: string) => setFilters((current) => ({
    ...current, [key]: value,
    ...(key === "department" ? { role: ALL, grade: ALL } : key === "role" ? { grade: ALL } : {}),
  }));
  const date = new Intl.DateTimeFormat("ru", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${overview.asOfDate}T00:00:00Z`));

  return <div className="mx-auto max-w-6xl space-y-7 font-[Arial,Helvetica,sans-serif]">
    <header className="flex flex-wrap items-start justify-between gap-4 pt-1">
      <div><p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"><Compass className="size-3.5" />Картина развития</p>
        <h1 className="text-3xl font-semibold tracking-tight">Обзор команды<span className="text-primary">.</span></h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Где команде нужна поддержка, как идёт обучение и какие мероприятия могут закрыть разрывы в навыках.</p>
      </div>
      <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1.5 text-xs"><CalendarDays className="size-3.5" />Срез на {date}</Badge>
    </header>

    <Card className="rounded-2xl bg-secondary/35 [--card-spacing:--spacing(5)]"><CardContent>
      <div className="mb-4 flex items-center gap-2"><Filter className="size-4 text-primary" /><h2 className="text-sm font-semibold">Выберите группу</h2></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <FilterSelect label="Отдел" value={filters.department} options={departments} onChange={(value) => change("department", value)} />
        <FilterSelect label="Роль" value={filters.role} options={roles} onChange={(value) => change("role", value)} />
        <FilterSelect label="Грейд" value={filters.grade} options={grades} onChange={(value) => change("grade", value)} />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Показатели ниже пересчитаны для выбранной группы. Цель без указания сотрудником отмечается как предварительная.</p>
    </CardContent></Card>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={UsersRound} value={overview.people} label="сотрудников" hint="В выбранной группе" />
      <Metric icon={ChartNoAxesCombined} value={`${overview.averageCoverage}%`} label="среднее покрытие" hint="Требований личной или предварительной цели" />
      <Metric icon={AlertCircle} value={overview.withCriticalGaps} label="с критичными разрывами" hint="Есть хотя бы один незакрытый критичный навык" />
      <Metric icon={GraduationCap} value={overview.activePeople} label="учатся сейчас" hint="Уникальных участников добровольных активностей" />
    </div>

    {overview.people === 0 ? <Card className="rounded-2xl [--card-spacing:--spacing(6)]"><CardContent className="py-8 text-center"><h2 className="font-semibold">В этой группе нет сотрудников</h2><p className="mt-2 text-sm text-muted-foreground">Измените отдел, роль или грейд.</p></CardContent></Card> : <>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <Card className="rounded-2xl [--card-spacing:--spacing(6)]"><CardContent>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Навыки, которым нужна поддержка</h2><Badge variant="secondary">Топ {Math.min(6, overview.skills.length)}</Badge></div>
          <p className="mb-6 text-xs leading-relaxed text-muted-foreground">Сколько человек не достигли требуемого уровня для своей цели. Один сотрудник может входить в несколько строк.</p>
          <div className="space-y-5">{overview.skills.slice(0, 6).map((skill) => <div key={skill.skillId} className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-sm font-medium">{skill.name}</p><p className="text-xs text-muted-foreground"><strong className="text-foreground tabular-nums">{skill.people}</strong> из {overview.people} чел.</p></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary" role="img" aria-label={`${skill.name}: разрыв у ${skill.people} из ${overview.people}`}><div className="h-full rounded-full bg-primary" style={{ width: `${skill.people / overview.people * 100}%` }} /></div>
            {skill.criticalPeople > 0 && <p className="text-[11px] text-muted-foreground">Для {skill.criticalPeople} чел. навык критичен</p>}
          </div>)}{overview.skills.length === 0 && <p className="text-sm text-muted-foreground">У выбранной группы нет разрывов по навыкам целей.</p>}</div>
          {overview.withProvisionalGoals > 0 && <p className="mt-6 border-t pt-4 text-xs leading-relaxed text-muted-foreground">У {overview.withProvisionalGoals} чел. нет указанной карьерной цели; для расчёта использовано предварительное направление.</p>}
        </CardContent></Card>

        <Card className="rounded-2xl [--card-spacing:--spacing(6)]"><CardContent>
          <h2 className="text-lg font-semibold">Как идёт обучение</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Добровольные активности за 365 дней до даты среза. Считаются участия, если не сказано иначе.</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b pb-4"><span className="flex items-center gap-2 text-sm"><CircleCheck className="size-4 text-primary" />Завершено</span><strong className="text-lg tabular-nums">{overview.completed}</strong></div>
            <div className="flex items-center justify-between gap-3 border-b pb-4"><span className="text-sm">Людей с завершением</span><strong className="text-lg tabular-nums">{overview.completedPeople}</strong></div>
            <div className="flex items-center justify-between gap-3 border-b pb-4"><span className="text-sm">Прервано, пропущено или отклонено</span><strong className="text-lg tabular-nums">{overview.notFinished}</strong></div>
            <div className="flex items-center justify-between gap-3"><span className="text-sm">Просрочено обязательных</span><strong className="text-lg tabular-nums">{overview.overdueMandatory}</strong></div>
          </div>
          <p className="mt-5 rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">Статусы помогают увидеть потребность в поддержке. Они не используются здесь для оценки или ранжирования сотрудников.</p>
        </CardContent></Card>
      </div>

      <Card className="rounded-2xl [--card-spacing:--spacing(6)]"><CardContent>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Возможности для команды</h2><p className="mt-1 text-xs text-muted-foreground">Доступные добровольные мероприятия, которые сокращают разрыв до целей участников группы.</p></div><BookOpenCheck className="size-5 text-primary" /></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{overview.opportunities.slice(0, 6).map((item) => <div key={item.eventId} className="flex flex-col justify-between gap-4 rounded-xl border bg-background p-4">
          <div><div className="mb-2 flex items-center gap-2"><span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">{item.people} чел. могут участвовать</span></div><h3 className="text-sm font-semibold leading-snug">{item.title}</h3><p className="mt-2 text-xs text-muted-foreground">{formatLabel[item.format] ?? item.format} · {item.durationHours} ч</p></div>
          <div className="space-y-2 border-t pt-3"><div className="flex justify-between gap-2 text-[11px] text-muted-foreground"><span>Доступно и полезно</span><span className="tabular-nums">{Math.round(item.people / overview.people * 100)}% группы</span></div><div className="h-1.5 overflow-hidden rounded-full bg-secondary" role="img" aria-label={`${item.people} из ${overview.people} сотрудников могут участвовать с пользой для цели`}><div className="h-full rounded-full bg-primary" style={{ width: `${item.people / overview.people * 100}%` }} /></div></div>
        </div>)}{overview.opportunities.length === 0 && <p className="text-sm text-muted-foreground">Сейчас нет доступных мероприятий, которые уменьшают разрывы выбранной группы.</p>}</div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Число людей показывает соответствие условиям участия и возможный вклад в цель. Это не запись сотрудников на мероприятие.</p>
      </CardContent></Card>
    </>}

    <p className="px-1 text-xs leading-relaxed text-muted-foreground">Демонстрационные синтетические данные · локальные действия сохраняются до перезагрузки страницы. Переключение демопрофиля не является авторизацией HR.</p>
  </div>;
}
