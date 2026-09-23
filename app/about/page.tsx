"use client";

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { useUserStore } from '@/components/providers/user-store-provider'

// ==========================================
// DICTIONARIES / ЛОКАЛИЗАЦИЯ
// ==========================================
const translations = {
  ru: {
    hero: {
      badge: {
        bank: 'HALYK BANK',
        hackathon: 'HACKALEM AI',
      },
      titleLine1: 'Умная эволюция',
      titleLine2: 'карьерного трека',
      descriptionText:
        'Платформа, которая превращает хаотичные мероприятия по управлению персоналом в понятный и предсказуемый вектор профессионального роста каждого сотрудника.',
    },
    stats: {
      item1: {
        code: '01 / Анализ',
        title: 'Многофакторный анализ',
        desc: 'Искусственный интеллект подбирает шаги, сопоставляя навыки, текущую квалификацию, историю проектов и личные амбиции сотрудника.',
      },
      item2: {
        code: '02 / Ясность',
        title: 'Прозрачность решений',
        desc: 'Каждый рекомендованный шаг сопровождается исчерпывающим аргументом: почему и зачем его проходить.',
      },
      item3: {
        code: '03 / Данные',
        title: 'Срез для работы с персоналом',
        desc: 'Автоматическое выявление дефицита компетенций по отделу в реальном времени без ручных опросов.',
      },
    },
    philosophy: {
      badge: 'ФИЛОСОФИЯ',
      title: 'Отказ от принуждения в пользу прозрачности',
      description:
        'Главная причина провала корпоративного обучения — обязательность и оторванность от практической выгоды. Мы превращаем развитие в понятный инструмент капитализации навыков.',
      cards: [
        {
          code: '01',
          title: 'Принцип добровольности',
          desc: 'Сотрудник самостоятельно управляет темпом роста. Система предлагает кратчайшие пути к повышению.',
        },
        {
          code: '02',
          title: 'Понятный искусственный интеллект',
          desc: 'Полное отсутствие скрытых механизмов. Каждая рекомендация содержит понятные логические обоснования.',
        },
        {
          code: '03',
          title: 'Приватность и доверие',
          desc: 'Данные о динамике развития защищены и недоступны сторонним лицам без явно выраженного согласия.',
        },
        {
          code: '04',
          title: 'Аналитика для руководителей',
          desc: 'Руководители получают точный срез дефицита компетенций по отделу вместо поверхностных отчетов.',
        },
      ],
    },
    howItWorks: {
      badge: 'Архитектура процессов',
      title: 'Как функционирует система',
      subtitle: 'Автоматизированный цикл от первичных данных до обновления квалификационного уровня.',
      steps: [
        {
          phase: 'Этап // 01',
          title: 'Цифровой профиль',
          desc: 'Агрегация матрицы навыков, текущих квалификационных уровней и реальной истории активности. Без формализма и ручного заполнения.',
        },
        {
          phase: 'Этап // 02',
          title: 'Интеллектуальный сопоставитель',
          desc: 'Выявление пробелов между текущей квалификацией и требованиями следующего уровня на основе реальных кейсов.',
        },
        {
          phase: 'Этап // 03',
          title: 'Персональный вектор',
          desc: 'Формирование 1–3 точечных рекомендаций. При их выполнении прогресс профиля пересчитывается автоматически.',
        },
      ],
    },
  },
  en: {
    hero: {
      badge: {
        bank: 'HALYK BANK',
        hackathon: 'HACKALEM AI',
      },
      titleLine1: 'Smart evolution of',
      titleLine2: 'career track',
      descriptionText:
        'A platform that turns chaotic personnel management events into a clear and predictable vector of professional growth for every employee.',
    },
    stats: {
      item1: {
        code: '01 / Multi',
        title: 'Multifactor Analysis',
        desc: 'Artificial intelligence selects steps by matching skills, current grade, project history, and personal ambitions of the employee.',
      },
      item2: {
        code: '02 / Clear',
        title: 'Decision Transparency',
        desc: 'Every recommended step is accompanied by an exhaustive argument: why and for what purpose to take it.',
      },
      item3: {
        code: '03 / Data',
        title: 'Personnel Insights',
        desc: 'Automatic real-time identification of competency gaps across departments without manual surveys.',
      },
    },
    philosophy: {
      badge: 'PHILOSOPHY',
      title: 'Shift from coercion to transparency',
      description:
        'The main reason for corporate learning failure is mandatory compliance and lack of practical value. We turn development into a clear tool for skill capitalization.',
      cards: [
        {
          code: '01',
          title: 'Voluntary Principle',
          desc: 'Employees manage their own pace of growth. The system offers the shortest paths to promotion.',
        },
        {
          code: '02',
          title: 'Explainable AI',
          desc: 'No hidden algorithms. Every recommendation contains clear logical reasoning.',
        },
        {
          code: '03',
          title: 'Privacy and Trust',
          desc: 'Data on growth dynamics is secure and inaccessible to third parties without explicit consent.',
        },
        {
          code: '04',
          title: 'Analytics for Management',
          desc: 'Managers receive a precise gap analysis per department instead of superficial reports.',
        },
      ],
    },
    howItWorks: {
      badge: 'Process Architecture',
      title: 'How the System Works',
      subtitle: 'An automated cycle from raw data to qualification updates.',
      steps: [
        {
          phase: 'Step // 01',
          title: 'Digital Profile',
          desc: 'Aggregation of skill matrices, current grades, and real activity history. No bureaucracy or manual entry.',
        },
        {
          phase: 'Step // 02',
          title: 'Smart Matching System',
          desc: 'Identifying skill gaps between current qualifications and requirements for the next level based on real cases.',
        },
        {
          phase: 'Step // 03',
          title: 'Personal Vector',
          desc: 'Generating 1–3 targeted recommendations. Upon completion, profile progress updates automatically.',
        },
      ],
    },
  },
}

export default function AboutPage() {
  // Заглушка текущего языка (по умолчанию 'ru')
  const lang = useUserStore((state) => state.language)
  const t = translations[lang]

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="pt-28 pb-32">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-5xl text-center px-4 pt-8 pb-16 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary/50 px-3.5 py-1 text-xs font-mono text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{t.hero.badge.bank}</span>
            <span className="text-border">•</span>
            <span>{t.hero.badge.hackathon}</span>
          </div>

          <h1 className="text-4xl font-light tracking-tight sm:text-6xl lg:text-7xl leading-[1.12]">
            {t.hero.titleLine1} <br />
            <span className="font-serif italic font-normal text-primary">
              {t.hero.titleLine2}
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            {t.hero.descriptionText}
          </p>
        </section>

        {/* STATS / HIGHLIGHTS */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-8">
          <div className="grid grid-cols-1 md:grid-cols-3 border border-border rounded-2xl divide-y md:divide-y-0 md:divide-x divide-border bg-card/40">
            <div className="flex flex-col p-8 space-y-3">
              <span className="text-3xl sm:text-4xl font-light tracking-tight text-foreground font-mono">
                {t.stats.item1.code}
              </span>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                {t.stats.item1.title}
              </span>
              <p className="text-xs text-muted-foreground font-light leading-relaxed pt-1">
                {t.stats.item1.desc}
              </p>
            </div>

            <div className="flex flex-col p-8 space-y-3">
              <span className="text-3xl sm:text-4xl font-light tracking-tight text-foreground font-mono">
                {t.stats.item2.code}
              </span>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                {t.stats.item2.title}
              </span>
              <p className="text-xs text-muted-foreground font-light leading-relaxed pt-1">
                {t.stats.item2.desc}
              </p>
            </div>

            <div className="flex flex-col p-8 space-y-3">
              <span className="text-3xl sm:text-4xl font-light tracking-tight text-foreground font-mono">
                {t.stats.item3.code}
              </span>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                {t.stats.item3.title}
              </span>
              <p className="text-xs text-muted-foreground font-light leading-relaxed pt-1">
                {t.stats.item3.desc}
              </p>
            </div>
          </div>
        </section>

        {/* EMBOSSED DARK ACCENT BAND (ПОСЕРЕДИНЕ СТРАНИЦЫ) */}
        <section className="w-full my-16 bg-foreground text-background py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Левый заголовок */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-background/10 text-background text-[11px] font-mono border border-background/20">
                  <span>{t.philosophy.badge}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-light leading-tight tracking-tight">
                  {t.philosophy.title}
                </h2>

                <p className="text-xs sm:text-sm text-background/70 font-light leading-relaxed max-w-md">
                  {t.philosophy.description}
                </p>
              </div>

              {/* Сетка карточек с эффектом матового тиснения (Debossed Cards) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {t.philosophy.cards.map((card, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-lg bg-background/5 border border-background/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-background/50">
                        {card.code}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-primary" />
                    </div>
                    <h3 className="text-sm font-medium text-background">
                      {card.title}
                    </h3>
                    <p className="text-xs text-background/60 font-light leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-primary">
                {t.howItWorks.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-light mt-1">
                {t.howItWorks.title}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono max-w-xs">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-8 rounded-xl border border-border bg-background flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">
                  {t.howItWorks.steps[0].phase}
                </span>
                <h3 className="text-lg font-medium">
                  {t.howItWorks.steps[0].title}
                </h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {t.howItWorks.steps[0].desc}
                </p>
              </div>
              <div className="h-0.5 w-8 bg-border" />
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-xl border border-primary/30 bg-primary/[0.03] flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-primary uppercase">
                  {t.howItWorks.steps[1].phase}
                </span>
                <h3 className="text-lg font-medium">
                  {t.howItWorks.steps[1].title}
                </h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {t.howItWorks.steps[1].desc}
                </p>
              </div>
              <div className="h-0.5 w-8 bg-primary/40" />
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-xl border border-border bg-background flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">
                  {t.howItWorks.steps[2].phase}
                </span>
                <h3 className="text-lg font-medium">
                  {t.howItWorks.steps[2].title}
                </h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {t.howItWorks.steps[2].desc}
                </p>
              </div>
              <div className="h-0.5 w-8 bg-border" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
