import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="pt-28 pb-32">
        
        {/* HERO SECTION */}
        <section className="mx-auto max-w-5xl text-center px-4 pt-8 pb-16 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary/50 px-3.5 py-1 text-xs font-mono text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>HALYK BANK</span>
            <span className="text-border">•</span>
            <span>HACKALEM AI</span>
          </div>
          
          <h1 className="text-4xl font-light tracking-tight sm:text-6xl lg:text-7xl leading-[1.12]">
            Умная эволюция <br />
            <span className="font-serif italic font-normal text-primary">
              карьерного трека
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            <strong className="font-medium text-foreground">Career Quest</strong> — платформа, которая превращает хаотичные HR-события в понятный и предсказуемый вектор профессионального роста каждого сотрудника.
          </p>
        </section>

        {/* STATS / HIGHLIGHTS */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-8">
          <div className="grid grid-cols-1 md:grid-cols-3 border border-border rounded-2xl divide-y md:divide-y-0 md:divide-x divide-border bg-card/40">
            <div className="flex flex-col p-8 space-y-3">
              <span className="text-3xl sm:text-4xl font-light tracking-tight text-foreground font-mono">01 / Multi</span>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">Многофакторный анализ</span>
              <p className="text-xs text-muted-foreground font-light leading-relaxed pt-1">
                AI подбирает шаги, сопоставляя навыки, текущий грейд, историю проектов и личные амбиции сотрудника.
              </p>
            </div>

            <div className="flex flex-col p-8 space-y-3">
              <span className="text-3xl sm:text-4xl font-light tracking-tight text-foreground font-mono">02 / Clear</span>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">Прозрачность решений</span>
              <p className="text-xs text-muted-foreground font-light leading-relaxed pt-1">
                Каждый рекомендованный шаг сопровождается исчерпывающим аргументом: почему и зачем его проходить.
              </p>
            </div>

            <div className="flex flex-col p-8 space-y-3">
              <span className="text-3xl sm:text-4xl font-light tracking-tight text-foreground font-mono">03 / Data</span>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">Срез для HR</span>
              <p className="text-xs text-muted-foreground font-light leading-relaxed pt-1">
                Автоматическое выявление дефицита компетенций по департаментам в реальном времени без ручных опросов.
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
                  <span>PHILOSOPHY</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-light leading-tight tracking-tight">
                  Отказ от принуждения в пользу прозрачности
                </h2>

                <p className="text-xs sm:text-sm text-background/70 font-light leading-relaxed max-w-md">
                  Главная причина провала корпоративного обучения — обязательность и оторванность от практической выгоды. Мы превращаем развитие в понятный инструмент капитализации навыков.
                </p>
              </div>

              {/* Сетка карточек с эффектом матового тиснения (Debossed Cards) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Карточка 1 */}
                <div className="p-6 rounded-lg bg-background/5 border border-background/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-background/50">01</span>
                    <span className="h-1 w-1 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-background">Принцип добровольности</h3>
                  <p className="text-xs text-background/60 font-light leading-relaxed">
                    Сотрудник самостоятельно управляет темпом роста. Система предлагает кратчайшие пути к повышению.
                  </p>
                </div>

                {/* Карточка 2 */}
                <div className="p-6 rounded-lg bg-background/5 border border-background/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-background/50">02</span>
                    <span className="h-1 w-1 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-background">Объяснимый AI</h3>
                  <p className="text-xs text-background/60 font-light leading-relaxed">
                    Полное отсутствие «черных ящиков». Каждая рекомендация содержит понятные логические обоснования.
                  </p>
                </div>

                {/* Карточка 3 */}
                <div className="p-6 rounded-lg bg-background/5 border border-background/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-background/50">03</span>
                    <span className="h-1 w-1 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-background">Приватность и доверие</h3>
                  <p className="text-xs text-background/60 font-light leading-relaxed">
                    Данные о динамике развития защищены и недоступны сторонним лицам без явно выраженного согласия.
                  </p>
                </div>

                {/* Карточка 4 */}
                <div className="p-6 rounded-lg bg-background/5 border border-background/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-background/50">04</span>
                    <span className="h-1 w-1 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-background">Аналитика для HR</h3>
                  <p className="text-xs text-background/60 font-light leading-relaxed">
                    Руководители получают точный срез дефицита компетенций по отделу вместо поверхностных отчетов.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-primary">Архитектура процессов</span>
              <h2 className="text-2xl sm:text-3xl font-light mt-1">Как функционирует система</h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono max-w-xs">
              Автоматизированный цикл от первичных данных до обновления грейда.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-8 rounded-xl border border-border bg-background flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">Phase // 01</span>
                <h3 className="text-lg font-medium">Цифровой профиль</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  Агрегация матрицы навыков, текущих грейдов и реальной истории активности. Без формализма и ручного заполнения.
                </p>
              </div>
              <div className="h-0.5 w-8 bg-border" />
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-xl border border-primary/30 bg-primary/[0.03] flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-primary uppercase">Phase // 02</span>
                <h3 className="text-lg font-medium">AI-Сопоставитель</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  Выявление разрывов (gaps) между текущей квалификацией и требованиями следующего грейда на основе реальных кейсов.
                </p>
              </div>
              <div className="h-0.5 w-8 bg-primary/40" />
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-xl border border-border bg-background flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono text-muted-foreground/60 uppercase">Phase // 03</span>
                <h3 className="text-lg font-medium">Персональный вектор</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  Формирование 1–3 точечных рекомендаций. При их выполнении прогресс профиля пересчитывается автоматически.
                </p>
              </div>
              <div className="h-0.5 w-8 bg-border" />
            </div>
          </div>
        </section>

        {/* FOOTER NOTE */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-12">
          <p className="text-[11px] text-muted-foreground/60 font-mono tracking-widest uppercase">
            CAREER QUEST — HALYK BANK HACKATHON
          </p>
        </section>

      </main>
      <Footer />
    </div>
  )
}