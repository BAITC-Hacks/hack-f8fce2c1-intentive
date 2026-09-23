"use client";

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { useUserStore } from '@/components/providers/user-store-provider'

// ==========================================
// DICTIONARIES / ЛОКАЛИЗАЦИЯ
// ==========================================
// ==========================================
// DICTIONARIES / ЛОКАЛИЗАЦИЯ
// ==========================================
const translations = {
  ru: {
    hero: {
      badge: 'ВОЗМОЖНОСТИ ПЛАТФОРМЫ',
      titleLine1: 'Всё для понятного и',
      titleLine2: 'уверенного роста',
      description:
        'Никакой лишней бюрократии и формальных курсов. Платформа визуализирует вектор движения и формирует измеримую ценность каждого шага.',
    },
    forEmployees: {
      badge: 'Для сотрудников',
      title: 'Твоя личная карта развития',
      subtitle:
        'Прозрачность возможностей и абсолютный контроль над собственным грейдом.',
      items: [
        {
          code: '01 // НАВЫКИ',
          title: 'Наглядный профиль навыков',
          desc: 'Все навыки и сильные стороны структурированы в единой системе. Ты точно знаешь свой текущий статус и видишь разрыв до следующего грейда.',
        },
        {
          code: '02 // КОНТЕКСТ',
          title: 'Подсказки с аргументацией',
          desc: 'Система рекомендует только актуальные интенсивы и проекты, сразу объясняя причинно-следственную связь каждого шага.',
        },
        {
          code: '03 // ПРОГРЕСС',
          title: 'Мгновенный прогресс',
          desc: 'Завершение воркшопа или таски фиксируется в один клик. Шкала компетенций обновляется мгновенно, приближая целевое повышение.',
        },
      ],
    },
    manifesto: {
      badge: 'КЛЮЧЕВОЙ МАНИФЕСТ',
      title: 'Обучение без принуждения и обязаловок',
      description:
        'Развитие должно быть осознанным выбором каждого. Сотрудники учатся не ради дедлайна, а из понимания, как каждый шаг капитализирует их квалификацию.',
      card: {
        badge: 'Принципы // 2026',
        title: '«Осознанность побеждает формализм»',
        description:
          'Мы убираем барьеры между стремлением человека расти и сложными корпоративными регламентами. Каждая активность внутри Career Quest — это прямой вклад в рост грейда, прозрачно видимый обеим сторонам.',
        footerTags: ['[01] БЕЗ БЮРОКРАТИИ', '[02] РЕАЛЬНЫЙ РЕЗУЛЬТАТ'],
      },
    },
    forHr: {
      badge: 'Для HR и руководителей',
      title: 'Аналитика без ручного управления',
      subtitle:
        'Автоматическое выявление слепых зон и превентивная поддержка специалистов.',
      items: [
        {
          code: 'УПРАВЛЕНИЕ // 01',
          title: 'Карта проседающих компетенций',
          desc: 'Наглядный срез дефицита навыков по командам и департаментам. Позволяет инвестировать бюджет развития исключительно в критически важные направления.',
        },
        {
          code: 'УПРАВЛЕНИЕ // 02',
          title: 'Превентивный фокус (Удержание сотрудников)',
          desc: 'Алгоритм подсвечивает сотрудников, давно не обновлявших компетенции или выпавших из траектории роста, помогая вовремя предложить точечную поддержку.',
        },
      ],
    },
    footerNote: 'CAREER QUEST — СИСТЕМА ПРОЗРАЧНОГО РОСТА',
  },
  en: {
    hero: {
      badge: 'PLATFORM CAPABILITIES',
      titleLine1: 'Everything for clear and',
      titleLine2: 'confident growth',
      description:
        'No unnecessary bureaucracy or formal courses. The platform visualizes your growth vector and creates measurable value for every step.',
    },
    forEmployees: {
      badge: 'For Employees',
      title: 'Your Personal Growth Map',
      subtitle:
        'Transparency of opportunities and complete control over your own grade.',
      items: [
        {
          code: '01 // SKILLS',
          title: 'Visual Skill Profile',
          desc: 'All skills and strengths are structured in a unified system. You know your current status and see the exact gap to the next grade.',
        },
        {
          code: '02 // CONTEXT',
          title: 'Argumented Guidance',
          desc: 'The system recommends only relevant intensives and projects, explaining the cause-and-effect relationship of every action.',
        },
        {
          code: '03 // PROGRESS',
          title: 'Instant Progress',
          desc: 'Completing a workshop or task takes one click. Your competency bar updates instantly, bringing you closer to your promotion.',
        },
      ],
    },
    manifesto: {
      badge: 'CORE MANIFESTO',
      title: 'Learning without coercion or obligation',
      description:
        'Growth should be a conscious choice for everyone. Employees learn not for deadlines, but out of understanding how each step capitalizes their skills.',
      card: {
        badge: 'Principles // 2026',
        title: '"Mindfulness beats formalism"',
        description:
          'We remove barriers between a person\'s desire to grow and complex corporate regulations. Every activity within Career Quest is a direct contribution to grade advancement, visible to both sides.',
        footerTags: ['[01] ZERO BUREAUCRACY', '[02] REAL IMPACT'],
      },
    },
    forHr: {
      badge: 'For HR & Managers',
      title: 'Analytics without manual overhead',
      subtitle:
        'Automatic detection of skill blind spots and preventive specialist support.',
      items: [
        {
          code: 'MANAGEMENT // 01',
          title: 'Competency Gap Map',
          desc: 'A clear overview of skill deficits across teams and departments. Allows investing training budgets strictly into critical areas.',
        },
        {
          code: 'MANAGEMENT // 02',
          title: 'Preventive Focus (Retention)',
          desc: 'The algorithm highlights employees who haven\'t updated skills recently or fell off their growth trajectory, helping offer timely support.',
        },
      ],
    },
    footerNote: 'CAREER QUEST — TRANSPARENT GROWTH SYSTEM',
  },
}

export default function FeaturesPage() {
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
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl font-light tracking-tight sm:text-6xl lg:text-7xl leading-[1.12]">
            {t.hero.titleLine1} <br />
            <span className="font-serif italic font-normal text-primary">
              {t.hero.titleLine2}
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            {t.hero.description}
          </p>
        </section>

        {/* FOR EMPLOYEES SECTION */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-primary">
                {t.forEmployees.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-light mt-1">
                {t.forEmployees.title}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono max-w-xs">
              {t.forEmployees.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl border border-border bg-card/40 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">
                  {t.forEmployees.items[0].code}
                </span>
                <h3 className="text-lg font-medium">
                  {t.forEmployees.items[0].title}
                </h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {t.forEmployees.items[0].desc}
                </p>
              </div>
              <div className="h-0.5 w-8 bg-border" />
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl border border-primary/30 bg-primary/[0.03] flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-primary uppercase">
                  {t.forEmployees.items[1].code}
                </span>
                <h3 className="text-lg font-medium">
                  {t.forEmployees.items[1].title}
                </h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {t.forEmployees.items[1].desc}
                </p>
              </div>
              <div className="h-0.5 w-8 bg-primary/40" />
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl border border-border bg-card/40 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">
                  {t.forEmployees.items[2].code}
                </span>
                <h3 className="text-lg font-medium">
                  {t.forEmployees.items[2].title}
                </h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {t.forEmployees.items[2].desc}
                </p>
              </div>
              <div className="h-0.5 w-8 bg-border" />
            </div>
          </div>
        </section>

        {/* EMBOSSED DARK ACCENT BAND (ПОСЕРЕДИНЕ СТРАНИЦЫ) */}
        <section className="w-full my-16 bg-foreground text-background py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Левый заголовок */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-background/10 text-background text-[11px] font-mono border border-background/20">
                  <span>{t.manifesto.badge}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-light leading-tight tracking-tight">
                  {t.manifesto.title}
                </h2>

                <p className="text-xs sm:text-sm text-background/70 font-light leading-relaxed max-w-md">
                  {t.manifesto.description}
                </p>
              </div>

              {/* Правая акцентная карточка с тиснением */}
              <div className="lg:col-span-7">
                <div className="p-8 sm:p-10 rounded-xl bg-background/5 border border-background/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] space-y-6">
                  <div className="flex items-center justify-between border-b border-background/10 pb-4">
                    <span className="text-[11px] font-mono text-background/50 uppercase tracking-widest">
                      {t.manifesto.card.badge}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl sm:text-2xl font-light text-background leading-snug">
                      {t.manifesto.card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-background/70 font-light leading-relaxed">
                      {t.manifesto.card.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-6 text-[11px] font-mono text-background/40">
                    {t.manifesto.card.footerTags.map((tag, idx) => (
                      <div key={idx}>{tag}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOR HR SECTION */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-primary">
                {t.forHr.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-light mt-1">
                {t.forHr.title}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono max-w-xs">
              {t.forHr.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HR Feature 1 */}
            <div className="p-8 rounded-xl border border-border bg-background space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">
                  {t.forHr.items[0].code}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <h3 className="text-lg font-medium">
                {t.forHr.items[0].title}
              </h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                {t.forHr.items[0].desc}
              </p>
            </div>

            {/* HR Feature 2 */}
            <div className="p-8 rounded-xl border border-border bg-background space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">
                  {t.forHr.items[1].code}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <h3 className="text-lg font-medium">
                {t.forHr.items[1].title}
              </h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                {t.forHr.items[1].desc}
              </p>
            </div>
          </div>
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
