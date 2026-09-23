'use client'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Accordion } from '@base-ui/react/accordion'
import { ChevronDown } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary flex flex-col justify-between">
      <Header />

      <main className="pt-28 pb-32">
        {/* HERO HEADER */}
        <section className="mx-auto max-w-4xl text-center px-4 pt-8 pb-12 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary/50 px-3.5 py-1 text-xs font-mono text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>HELP CENTER & FAQ</span>
          </div>

          <h1 className="text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl leading-[1.12]">
            Часто задаваемые <br />
            <span className="font-serif italic font-normal text-primary">
              вопросы
            </span>
          </h1>

          <p className="mt-6 text-base text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
            Всё, что нужно знать о работе платформы Career Quest, алгоритмах рекомендаций и учете прогресса.
          </p>
        </section>

        {/* BASE UI ACCORDION SECTION */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-4">
          <Accordion.Root multiple={false} className="w-full space-y-3">
            
            {/* Item 1 */}
            <Accordion.Item 
              value="item-1" 
              className="border border-border rounded-xl px-6 bg-card/40 transition-colors data-[open]:bg-card/80 data-[open]:border-primary/30"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between py-5 text-sm font-medium text-left transition-colors hover:text-primary group">
                  <span>Как AI-алгоритм формирует персональные рекомендации?</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="text-xs text-muted-foreground font-light leading-relaxed pb-5 pt-1">
                Система анализирует разрыв (gap) между вашими текущими компетенциями и требованиями целевого грейда. Учитываются пройденные курсы, история проектов и подтвержденные навыки, исключая неподходящие или продублированные активности.
              </Accordion.Panel>
            </Accordion.Item>

            {/* Item 2 */}
            <Accordion.Item 
              value="item-2" 
              className="border border-border rounded-xl px-6 bg-card/40 transition-colors data-[open]:bg-card/80 data-[open]:border-primary/30"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between py-5 text-sm font-medium text-left transition-colors hover:text-primary group">
                  <span>Обязательно ли проходить все рекомендованные шаги?</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="text-xs text-muted-foreground font-light leading-relaxed pb-5 pt-1">
                Нет, система построена на принципе добровольности. Вы можете пропускать рекомендации, выбирать альтернативные задачи или расти в удобном для вас темпе. Платформа лишь покажет кратчайший путь к цели.
              </Accordion.Panel>
            </Accordion.Item>

            {/* Item 3 */}
            <Accordion.Item 
              value="item-3" 
              className="border border-border rounded-xl px-6 bg-card/40 transition-colors data-[open]:bg-card/80 data-[open]:border-primary/30"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between py-5 text-sm font-medium text-left transition-colors hover:text-primary group">
                  <span>Как обновляется шкала навыков после прохождения интенсива?</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="text-xs text-muted-foreground font-light leading-relaxed pb-5 pt-1">
                После завершения мероприятия или воркшопа вы запрашиваете подтверждение или прикрепляете результат. Прогресс в матрице компетенций пересчитывается автоматически сразу после валидации.
              </Accordion.Panel>
            </Accordion.Item>

            {/* Item 4 */}
            <Accordion.Item 
              value="item-4" 
              className="border border-border rounded-xl px-6 bg-card/40 transition-colors data-[open]:bg-card/80 data-[open]:border-primary/30"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between py-5 text-sm font-medium text-left transition-colors hover:text-primary group">
                  <span>Видят ли коллеги или HR мой личный прогресс и активности?</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="text-xs text-muted-foreground font-light leading-relaxed pb-5 pt-1">
                HR-специалисты и руководители видят обезличенную депортированную аналитику по навыкам команды. Ваши персональные действия и история развития защищены приватностью.
              </Accordion.Panel>
            </Accordion.Item>

            {/* Item 5 */}
            <Accordion.Item 
              value="item-5" 
              className="border border-border rounded-xl px-6 bg-card/40 transition-colors data-[open]:bg-card/80 data-[open]:border-primary/30"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between py-5 text-sm font-medium text-left transition-colors hover:text-primary group">
                  <span>Что делать, если в системе нет нужного мне навыка или роли?</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="text-xs text-muted-foreground font-light leading-relaxed pb-5 pt-1">
                Вы можете отправить запрос на добавление новой компетенции или роли через форму обратной связи в профиле. Матрица регулярно актуализируется совместно с экспертами направлений.
              </Accordion.Panel>
            </Accordion.Item>

          </Accordion.Root>
        </section>

        {/* FOOTER NOTE */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-16">
          <p className="text-[11px] text-muted-foreground/60 font-mono tracking-widest uppercase">
            CAREER QUEST — SUPPORT SYSTEM
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
