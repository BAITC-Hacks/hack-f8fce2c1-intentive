"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, CircleAlert, Clock3, LoaderCircle, Sparkles, Target } from "lucide-react";
import { useRecommendations, useUserStore } from "@/components/providers/user-store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { aiMessages, emptyMessages, formatLabel, shortDate } from "./presentation";

export function AICoach() {
  const calculated = useRecommendations();
  const ai = useUserStore((state) => state.ai);
  const requestAI = useUserStore((state) => state.requestAIRecommendations);
  const events = useUserStore((state) => state.dataset.events);
  const resultRef = useRef<HTMLDivElement>(null);
  const loading = ai.status === "loading";
  const isAI = ai.response?.source === "ai";
  const response = ai.response?.result ?? calculated;
  const error = ai.response?.fallbackReason ? aiMessages[ai.response.fallbackReason] : ai.error ? { title: "Не удалось завершить AI-подбор", detail: ai.error } : null;
  useEffect(() => {
    if (ai.status === "ready" || ai.status === "error") resultRef.current?.focus({ preventScroll: true });
  }, [ai.status]);

  return <section id="ai-coach" className="scroll-mt-6 space-y-5" aria-labelledby="coach-heading">
    <Card className="rounded-2xl ring-primary/20 [--card-spacing:--spacing(6)]">
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-5" /></span><div><h2 id="coach-heading" className="font-semibold">AI-наставник</h2><p className="mt-0.5 text-xs text-muted-foreground">Следующий шаг с понятным обоснованием</p></div></div>
          <Badge variant="outline" className="gap-1.5 rounded-full px-2.5 py-1">{loading ? <LoaderCircle className="size-3 motion-safe:animate-spin" /> : isAI ? <Check className="size-3" /> : error ? <CircleAlert className="size-3" /> : <span className="size-1.5 rounded-full bg-muted-foreground/50" />}{loading ? "Идёт анализ" : isAI ? "Ответ получен" : error ? "Нужна проверка" : "Ожидает запроса"}</Badge>
        </div>
        <div ref={resultRef} tabIndex={-1} className="outline-none" aria-live="polite" aria-atomic="true">
          <h3 className="text-xl leading-snug font-semibold tracking-tight">{loading ? "Ищу шаг, который подходит именно вам" : isAI ? "Ваш следующий шаг — готов" : error ? error.title : "На чём сосредоточиться дальше?"}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{loading ? "Сопоставляем карьерную цель, разрывы по навыкам и историю участия. Ответ появится прямо в этом блоке." : isAI ? `AI выбрал ${response.recommendations.length} варианта. Ниже — ответ и проверенные факты, на которые опирается выбор. Совпадение с базовым подбором тоже может быть верным результатом.` : error ? error.detail : "Нажмите кнопку — AI рассмотрит ваш профиль и предложит до трёх полезных активностей. Подключённый API-ключ сам по себе не запускает запрос."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="h-10 rounded-xl px-4" disabled={loading || calculated.candidateCount === 0} onClick={() => void requestAI()}>{loading ? <LoaderCircle className="size-4 motion-safe:animate-spin" /> : <Sparkles className="size-4" />}{loading ? "Подбираем шаг…" : isAI ? "Обновить ответ AI" : error ? "Попробовать снова" : "Подобрать шаг с AI"}</Button>
          <span className="text-xs text-muted-foreground">{loading ? "Базовые варианты остаются доступными ниже" : isAI ? "OpenAI · факты проверены ядром" : "Запрос только по вашему нажатию"}</span>
        </div>
        {loading && <div className="flex flex-wrap gap-2 border-t pt-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Check className="size-3 text-primary" />Профиль и цель</span><span className="px-1">·</span><span className="flex items-center gap-1.5"><Check className="size-3 text-primary" />Доступные активности</span><span className="px-1">·</span><span className="flex items-center gap-1.5"><LoaderCircle className="size-3 motion-safe:animate-spin" />Ожидаем ответ AI</span></div>}
      </CardContent>
    </Card>

    <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{isAI ? "Ответ AI: выберите свой следующий квест" : "Базовый подбор · доступен без AI"}</h3><span className="text-xs text-muted-foreground">{response.recommendations.length} варианта</span></div>
    {response.emptyReason && <div className="rounded-2xl border border-dashed p-6 text-sm leading-relaxed text-muted-foreground">{emptyMessages[response.emptyReason]}</div>}
    <div className="space-y-3">
      {response.recommendations.map((recommendation, index) => {
        const event = events.find((item) => item.event_id === recommendation.eventId)!;
        const evidence = recommendation.evidence;
        const history = evidence.history;
        const outcomes = history.completed + history.noShow + history.dropped + history.declined;
        return <Card key={event.event_id} className={`rounded-2xl [--card-spacing:--spacing(5)] ${isAI && index === 0 ? "ring-primary/40" : ""}`}>
          <CardContent>
            <div className="flex items-start gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-semibold tabular-nums">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap gap-2">{index === 0 && <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">{isAI ? "Приоритет AI" : "Первый вариант"}</span>}</div><h4 className="text-base leading-snug font-semibold">{event.title}</h4><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="size-3" />{event.duration_hours} ч</span><span>{formatLabel[event.format]}</span>{evidence.nextSessionDate && <span>{shortDate(evidence.nextSessionDate)}</span>}</div></div></div>
            <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3.5">
              {evidence.skillGaps.slice(0, 2).map((gap) => <div key={gap.skillId} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="flex items-center gap-2"><Target className="size-3.5 shrink-0 text-primary" />{gap.name}</span><span className="shrink-0 text-xs tabular-nums"><span className="text-muted-foreground">{gap.current}</span><span className="px-2 text-primary">→</span><strong>{gap.after}</strong><span className="ml-2 text-muted-foreground">/ цель {gap.required}</span></span></div>)}
            </div>
            <Accordion className="mt-2"><AccordionItem value="why"><AccordionTrigger className="text-xs text-muted-foreground">Почему этот шаг подходит</AccordionTrigger><AccordionContent><ul className="space-y-2 text-xs leading-relaxed text-muted-foreground"><li>Цель: {evidence.target.target_grade} · {evidence.target.target_role}. Активность доступна для вашей текущей роли и грейда.</li><li>{evidence.skillGaps.some((gap) => gap.critical) ? "Развивает критичный для цели навык." : "Сокращает разрыв в навыках выбранной цели."} После завершения покрытие требований составит {Math.round(recommendation.projectedCoveragePercent)}%.</li><li>{outcomes ? `В похожих добровольных активностях с ${shortDate(history.windowStart)}: завершено ${history.completed}, пропущено ${history.noShow}, прекращено ${history.dropped}, отказов ${history.declined}.` : "Истории завершений или пропусков похожих активностей за выбранный период нет — этот фактор нейтрален."}</li>{evidence.estimatedWeeks !== null && <li>При вашем темпе понадобится примерно {Math.ceil(evidence.estimatedWeeks)} нед. Расписание курса может отличаться.</li>}</ul></AccordionContent></AccordionItem></Accordion>
            <Button nativeButton={false} variant="outline" className="mt-3 h-9 w-full rounded-lg" render={<Link href={`/activities#${event.event_id}`} />}>Открыть активность<ArrowRight className="ml-auto size-3.5" /></Button>
          </CardContent>
        </Card>;
      })}
    </div>
  </section>;
}
