'use client'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Accordion } from '@base-ui/react/accordion'
import { ChevronDown } from 'lucide-react'
import { useUserStore } from '@/components/providers/user-store-provider'

// ==========================================
// DICTIONARIES / ЛОКАЛИЗАЦИЯ
// ==========================================
const translations = {
  ru: {
    hero: {
      badge: 'Центр поддержки',
      titleLine1: 'Часто задаваемые',
      titleLine2: 'вопросы',
      description:
        'Всё, что нужно знать о работе платформы Career Quest, алгоритмах рекомендаций и учете прогресса.',
    },
    faq: [
      {
        id: 'item-1',
        question: 'Как AI-алгоритм формирует персональные рекомендации?',
        answer:
          'Система анализирует разрыв между вашими текущими компетенциями и требованиями целевого грейда. Учитываются пройденные курсы, история проектов и подтвержденные навыки, исключая неподходящие или продублированные активности.',
      },
      {
        id: 'item-2',
        question: 'Обязательно ли проходить все рекомендованные шаги?',
        answer:
          'Нет, система построена на принципе добровольности. Вы можете пропускать рекомендации, выбирать альтернативные задачи или расти в удобном для вас темпе. Платформа лишь покажет кратчайший путь к цели.',
      },
      {
        id: 'item-3',
        question:
          'Как обновляется шкала навыков после прохождения интенсива?',
        answer:
          'После завершения мероприятия или воркшопа вы запрашиваете подтверждение или прикрепляете результат. Прогресс в матрице компетенций пересчитывается автоматически сразу после валидации.',
      },
      {
        id: 'item-4',
        question:
          'Видят ли коллеги или HR мой личный прогресс и активности?',
        answer:
          'HR-специалисты и руководители видят обезличенную депортированную аналитику по навыкам команды. Ваши персональные действия и история развития защищены приватностью.',
      },
      {
        id: 'item-5',
        question:
          'Что делать, если в системе нет нужного мне навыка или роли?',
        answer:
          'Вы можете отправить запрос на добавление новой компетенции или роли через форму обратной связи в профиле. Матрица регулярно актуализируется совместно с экспертами направлений.',
      },
    ],
    footerNote: 'CAREER QUEST — Центр поддержки',
  },
  en: {
    hero: {
      badge: 'HELP CENTER & FAQ',
      titleLine1: 'Frequently asked',
      titleLine2: 'questions',
      description:
        'Everything you need to know about Career Quest platform, recommendation algorithms, and progress tracking.',
    },
    faq: [
      {
        id: 'item-1',
        question: 'How does the AI algorithm generate personalized recommendations?',
        answer:
          'The system analyzes the gap between your current competencies and target grade requirements. It takes into account completed courses, project history, and verified skills, excluding irrelevant or duplicated activities.',
      },
      {
        id: 'item-2',
        question: 'Is it mandatory to complete all recommended steps?',
        answer:
          'No, the system is built on the principle of voluntariness. You can skip recommendations, choose alternative tasks, or grow at your own pace. The platform simply shows the shortest path to your goal.',
      },
      {
        id: 'item-3',
        question:
          'How is the skill scale updated after completing an intensive?',
        answer:
          'After completing an event or workshop, you request confirmation or attach proof. Competency matrix progress is automatically recalculated immediately after validation.',
      },
      {
        id: 'item-4',
        question: 'Can colleagues or HR see my personal progress and activities?',
        answer:
          'HR specialists and managers see aggregated, anonymized skill analytics for the team. Your personal actions and growth history are protected by privacy.',
      },
      {
        id: 'item-5',
        question:
          'What if the required skill or role is missing from the system?',
        answer:
          'You can submit a request to add a new competency or role via the feedback form in your profile. The matrix is regularly updated together with domain experts.',
      },
    ],
    footerNote: 'CAREER QUEST — SUPPORT SYSTEM',
  },
}

export default function HelpPage() {
  // Заглушка текущего языка (по умолчанию 'ru')
  const lang = useUserStore((state) => state.language)
  const t = translations[lang]

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary flex flex-col justify-between">
      <Header />

      <main className="pt-28 pb-32">
        {/* HERO HEADER */}
        <section className="mx-auto max-w-4xl text-center px-4 pt-8 pb-12 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary/50 px-3.5 py-1 text-xs font-mono text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl leading-[1.12]">
            {t.hero.titleLine1} <br />
            <span className="font-serif italic font-normal text-primary">
              {t.hero.titleLine2}
            </span>
          </h1>

          <p className="mt-6 text-base text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
            {t.hero.description}
          </p>
        </section>

        {/* BASE UI ACCORDION SECTION */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-4">
          <Accordion.Root multiple={false} className="w-full space-y-3">
            {t.faq.map((item) => (
              <Accordion.Item
                key={item.id}
                value={item.id}
                className="border border-border rounded-xl px-6 bg-card/40 transition-colors data-[open]:bg-card/80 data-[open]:border-primary/30"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between py-5 text-sm font-medium text-left transition-colors hover:text-primary group">
                    <span>{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="text-xs text-muted-foreground font-light leading-relaxed pb-5 pt-1">
                  {item.answer}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </section>

        {/* FOOTER NOTE */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-16">
          <p className="text-[11px] text-muted-foreground/60 font-mono tracking-widest uppercase">
            {t.footerNote}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
