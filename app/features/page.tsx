import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="pt-28 pb-32">
        
        {/* HERO SECTION */}
        <section className="mx-auto max-w-5xl text-center px-4 pt-8 pb-16 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary/50 px-3.5 py-1 text-xs font-mono text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>PLATFORM CAPABILITIES</span>
          </div>
          
          <h1 className="text-4xl font-light tracking-tight sm:text-6xl lg:text-7xl leading-[1.12]">
            Всё для понятного и <br />
            <span className="font-serif italic font-normal text-primary">
              уверенного роста
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            Никакой лишней бюрократии и формальных курсов. Платформа визуализирует вектор движения и формирует измеримую ценность каждого шага.
          </p>
        </section>

        {/* FOR EMPLOYEES SECTION */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-primary">Для сотрудников</span>
              <h2 className="text-2xl sm:text-3xl font-light mt-1">Твоя личная карта развития</h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono max-w-xs">
              Прозрачность возможностей и абсолютный контроль над собственным грейдом.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl border border-border bg-card/40 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">01 // SKILLS</span>
                <h3 className="text-lg font-medium">Наглядный профиль навыков</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  Все навыки и сильные стороны структурированы в единой системе. Ты точно знаешь свой текущий статус и видишь разрыв до следующего грейда.
                </p>
              </div>
              <div className="h-0.5 w-8 bg-border" />
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl border border-primary/30 bg-primary/[0.03] flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-primary uppercase">02 // CONTEXT</span>
                <h3 className="text-lg font-medium">Подсказки с аргументацией</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  Система рекомендует только актуальные интенсивы и проекты, сразу объясняя причинно-следственную связь каждого шага.
                </p>
              </div>
              <div className="h-0.5 w-8 bg-primary/40" />
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl border border-border bg-card/40 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">03 // PROGRESS</span>
                <h3 className="text-lg font-medium">Мгновенный прогресс</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  Завершение воркшопа или таски фиксируется в один клик. Шкала компетенций обновляется мгновенно, приближая целевое повышение.
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
                  <span>CORE MANIFESTO</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-light leading-tight tracking-tight">
                  Обучение без принуждения и обязаловок
                </h2>

                <p className="text-xs sm:text-sm text-background/70 font-light leading-relaxed max-w-md">
                  Развитие должно быть осознанным выбором каждого. Сотрудники учатся не ради дедлайна, а из понимания, как каждый шаг капитализирует их квалификацию.
                </p>
              </div>

              {/* Правая акцентная карточка с тиснением */}
              <div className="lg:col-span-7">
                <div className="p-8 sm:p-10 rounded-xl bg-background/5 border border-background/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] space-y-6">
                  <div className="flex items-center justify-between border-b border-background/10 pb-4">
                    <span className="text-[11px] font-mono text-background/50 uppercase tracking-widest">Principles // 2026</span>
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl sm:text-2xl font-light text-background leading-snug">
                      «Осознанность побеждает формализм»
                    </h3>
                    <p className="text-xs sm:text-sm text-background/70 font-light leading-relaxed">
                      Мы убираем барьеры между стремлением человека расти и сложными корпоративными регламентами. Каждая активность внутри Career Quest — это прямой вклад в рост грейда, прозрачно видимый обеим сторонам.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-6 text-[11px] font-mono text-background/40">
                    <div>[01] ZERO BUREAUCRACY</div>
                    <div>[02] REAL IMPACT</div>
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
              <span className="text-xs font-mono uppercase tracking-widest text-primary">Для HR и руководителей</span>
              <h2 className="text-2xl sm:text-3xl font-light mt-1">Аналитика без ручного управления</h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono max-w-xs">
              Автоматическое выявление слепых зон и превентивная поддержка специалистов.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HR Feature 1 */}
            <div className="p-8 rounded-xl border border-border bg-background space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">MANAGEMENT // 01</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <h3 className="text-lg font-medium">Карта проседающих компетенций</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Наглядный срез дефицита навыков по командам и департаментам. Позволяет инвестировать бюджет развития исключительно в критически важные направления.
              </p>
            </div>

            {/* HR Feature 2 */}
            <div className="p-8 rounded-xl border border-border bg-background space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">MANAGEMENT // 02</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <h3 className="text-lg font-medium">Превентивный фокус (Retention)</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Алгоритм подсвечивает сотрудников, давно не обновлявших компетенции или выпавших из траектории роста, помогая вовремя предложить точечную поддержку.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER NOTE */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-16">
          <p className="text-[11px] text-muted-foreground/60 font-mono tracking-widest uppercase">
            CAREER QUEST — TRANSPARENT GROWTH SYSTEM
          </p>
        </section>

      </main>
      <Footer />
    </div>
  )
}