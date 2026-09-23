"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, CircleAlert, Clock3, LoaderCircle, Sparkles, Target } from "lucide-react";
import { useRecommendations, useUserStore } from "@/components/providers/user-store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getAIMessages, getEmptyMessages, formatLabels, shortDate } from "./presentation";
import { useDashboardLanguage } from "@/features/dashboard-language";

export function AICoach() {
  const { language, text } = useDashboardLanguage();
  const formatLabel = formatLabels[language];
  const calculated = useRecommendations();
  const ai = useUserStore((state) => state.ai);
  const requestAI = useUserStore((state) => state.requestAIRecommendations);
  const events = useUserStore((state) => state.dataset.events);
  const resultRef = useRef<HTMLDivElement>(null);
  const loading = ai.status === "loading";
  const isAI = ai.response?.source === "ai";
  const feedback = isAI ? ai.response?.feedback : null;
  const response = ai.response?.result ?? calculated;
  const error = ai.response?.fallbackReason ? getAIMessages(language)[ai.response.fallbackReason] : ai.error ? { title: text("Не удалось завершить AI-подбор", "Could not complete AI recommendations"), detail: ai.error } : null;
  useEffect(() => {
    if (ai.status === "ready" || ai.status === "error") resultRef.current?.focus({ preventScroll: true });
  }, [ai.status]);

  return <section id="ai-coach" className="scroll-mt-6 space-y-5" aria-labelledby="coach-heading">
    <Card className="rounded-2xl ring-primary/20 [--card-spacing:--spacing(6)]">
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-5" /></span><div><h2 id="coach-heading" className="font-semibold">{text("AI-наставник", "AI coach")}</h2><p className="mt-0.5 text-xs text-muted-foreground">{text("Следующий шаг с понятным обоснованием", "A next step with a clear explanation")}</p></div></div>
          <Badge variant="outline" className="gap-1.5 rounded-full px-2.5 py-1">{loading ? <LoaderCircle className="size-3 motion-safe:animate-spin" /> : isAI ? <Check className="size-3" /> : error ? <CircleAlert className="size-3" /> : <span className="size-1.5 rounded-full bg-muted-foreground/50" />}{loading ? text("Идёт анализ", "Analyzing") : isAI ? text("Ответ получен", "Response received") : error ? text("Нужна проверка", "Needs review") : text("Ожидает запроса", "Awaiting request")}</Badge>
        </div>
        <div ref={resultRef} tabIndex={-1} className="outline-none" aria-live="polite" aria-atomic="true">
          <h3 className="text-xl leading-snug font-semibold tracking-tight">{loading ? text("Ищу шаг, который подходит именно вам", "Finding a step that fits you") : isAI ? text("Ваш следующий шаг — готов", "Your next step is ready") : error ? error.title : text("На чём сосредоточиться дальше?", "What should you focus on next?")}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{loading ? text("AI готовит разбор вашей цели, объяснение выбора и практический первый шаг. Ответ появится прямо в этом блоке.", "AI is reviewing your goal, explaining its choices, and preparing a practical first step. The response will appear here.") : isAI ? text("Разбор вашего маршрута от AI", "AI review of your path") : error ? error.detail : text("Получите персональный разбор: что развивать в первую очередь, почему эти активности подходят вам и с чего начать.", "Get a personal review of what to develop first, why these activities fit, and where to start.")}</p>
          {feedback && <div className="mt-4 space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="whitespace-pre-line break-words text-sm leading-7">{feedback.summary}</p><p className="text-xs text-muted-foreground">{text("Комментарий AI на основе профиля. Расчётные показатели показаны отдельно в карточках.", "AI commentary based on your profile. Calculated metrics are shown separately in the cards.")}</p></div>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="h-10 rounded-xl px-4" disabled={loading || calculated.candidateCount === 0} onClick={() => void requestAI()}>{loading ? <LoaderCircle className="size-4 motion-safe:animate-spin" /> : <Sparkles className="size-4" />}{loading ? text("Подбираем шаг…", "Finding a step…") : isAI ? text("Обновить ответ AI", "Refresh AI response") : error ? text("Попробовать снова", "Try again") : text("Подобрать шаг с AI", "Find a step with AI")}</Button>
          <span className="text-xs text-muted-foreground">{loading ? text("Готовим объяснение и первый шаг", "Preparing the explanation and first step") : isAI ? text("Персональный разбор · OpenAI", "Personal review · OpenAI") : text("Запрос только по вашему нажатию", "Requested only when you click")}</span>
        </div>
        {loading && <div className="flex flex-wrap gap-2 border-t pt-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Check className="size-3 text-primary" />{text("Профиль и цель", "Profile and goal")}</span><span className="px-1">·</span><span className="flex items-center gap-1.5"><Check className="size-3 text-primary" />{text("Доступные активности", "Available activities")}</span><span className="px-1">·</span><span className="flex items-center gap-1.5"><LoaderCircle className="size-3 motion-safe:animate-spin" />{text("Ожидаем ответ AI", "Waiting for AI")}</span></div>}
      </CardContent>
    </Card>

    <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{isAI ? text("Ответ AI: выберите свой следующий квест", "AI response: choose your next quest") : text("Базовый подбор · доступен без AI", "Baseline recommendations · available without AI")}</h3><span className="text-xs text-muted-foreground">{response.recommendations.length} {text("варианта", "options")}</span></div>
    {response.emptyReason && <div className="rounded-2xl border border-dashed p-6 text-sm leading-relaxed text-muted-foreground">{getEmptyMessages(language)[response.emptyReason]}</div>}
    <div className="space-y-3">
      {response.recommendations.map((recommendation, index) => {
        const event = events.find((item) => item.event_id === recommendation.eventId)!;
        const evidence = recommendation.evidence;
        const history = evidence.history;
        const outcomes = history.completed + history.noShow + history.dropped + history.declined;
        const commentary = feedback?.choices.find((choice) => choice.eventId === recommendation.eventId);
        return <Card key={event.event_id} className={`rounded-2xl [--card-spacing:--spacing(5)] ${isAI && index === 0 ? "ring-primary/40" : ""}`}>
          <CardContent>
            <div className="flex items-start gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-semibold tabular-nums">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap gap-2">{index === 0 && <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">{isAI ? text("Приоритет AI", "AI priority") : text("Первый вариант", "First option")}</span>}</div><h4 className="text-base leading-snug font-semibold">{event.title}</h4><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="size-3" />{event.duration_hours} {text("ч", "h")}</span><span>{formatLabel[event.format]}</span>{evidence.nextSessionDate && <span>{shortDate(evidence.nextSessionDate, language)}</span>}</div></div></div>
            {commentary && <div className="mt-5 space-y-4">
              <div><h5 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary"><Sparkles className="size-3.5" />{text("Почему AI рекомендует это вам", "Why AI recommends this")}</h5><p className="whitespace-pre-line break-words text-sm leading-7">{commentary.explanation}</p></div>
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-4"><h5 className="mb-2 text-xs font-semibold">{text("С чего начать · совет AI", "Where to start · AI advice")}</h5><p className="whitespace-pre-line break-words text-sm leading-relaxed">{commentary.firstStep}</p></div>
            </div>}
            <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3.5">
              <p className="mb-3 text-xs text-muted-foreground">{text("Ожидаемый прирост · расчёт ядра", "Expected gains · core calculation")}</p>
              {evidence.skillGaps.slice(0, 2).map((gap) => <div key={gap.skillId} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="flex items-center gap-2"><Target className="size-3.5 shrink-0 text-primary" />{gap.name}</span><span className="shrink-0 text-xs tabular-nums"><span className="text-muted-foreground">{gap.current}</span><span className="px-2 text-primary">→</span><strong>{gap.after}</strong><span className="ml-2 text-muted-foreground">/ {text("цель", "target")} {gap.required}</span></span></div>)}
            </div>
            <Accordion className="mt-2"><AccordionItem value="why"><AccordionTrigger className="text-xs text-muted-foreground">{text("Данные, на которые опирается подбор", "Data behind these recommendations")}</AccordionTrigger><AccordionContent><ul className="space-y-2 text-xs leading-relaxed text-muted-foreground"><li>{text("Цель:", "Goal:")} {evidence.target.target_grade} · {evidence.target.target_role}. {text("Активность доступна для вашей текущей роли и грейда.", "This activity is available for your current role and grade.")}</li><li>{evidence.skillGaps.some((gap) => gap.critical) ? text("Развивает критичный для цели навык.", "Develops a critical skill for your goal.") : text("Сокращает разрыв в навыках выбранной цели.", "Reduces a skill gap for the selected goal.")} {text(`После завершения покрытие требований составит ${Math.round(recommendation.projectedCoveragePercent)}%.`, `After completion, requirements coverage will be ${Math.round(recommendation.projectedCoveragePercent)}%.`)}</li><li>{outcomes ? text(`В похожих добровольных активностях с ${shortDate(history.windowStart, language)}: завершено ${history.completed}, пропущено ${history.noShow}, прекращено ${history.dropped}, отказов ${history.declined}.`, `In similar voluntary activities since ${shortDate(history.windowStart, language)}: ${history.completed} completed, ${history.noShow} missed, ${history.dropped} dropped, ${history.declined} declined.`) : text("Истории завершений или пропусков похожих активностей за выбранный период нет — этот фактор нейтрален.", "There is no completion or missed-session history for similar activities in the selected period; this factor is neutral.")}</li>{evidence.estimatedWeeks !== null && <li>{text(`При вашем темпе понадобится примерно ${Math.ceil(evidence.estimatedWeeks)} нед. Расписание курса может отличаться.`, `At your pace, this may take about ${Math.ceil(evidence.estimatedWeeks)} weeks. The course schedule may differ.`)}</li>}</ul></AccordionContent></AccordionItem></Accordion>
            <Button nativeButton={false} variant="outline" className="mt-3 h-9 w-full rounded-lg" render={<Link href={`/activities#${event.event_id}`} />}>{text("Открыть активность", "Open activity")}<ArrowRight className="ml-auto size-3.5" /></Button>
          </CardContent>
        </Card>;
      })}
    </div>
  </section>;
}
