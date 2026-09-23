import Header from '@/components/layout/header' // Скоректируй путь к Header при необходимости

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            About Intentive
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are building tools designed to streamline your workflow and help
            you focus on what truly matters. Simple, intuitive, and effective.
          </p>
        </section>
        <section className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            About Intentive
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are building tools designed to streamline your workflow and help
            you focus on what truly matters. Simple, intuitive, and effective.
          </p>
        </section>
                <section className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            About Intentive
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are building tools designed to streamline your workflow and help
            you focus on what truly matters. Simple, intuitive, and effective.
          </p>
        </section>
                <section className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            About Intentive
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are building tools designed to streamline your workflow and help
            you focus on what truly matters. Simple, intuitive, and effective.
          </p>
        </section>
        {/* Сетка с ключевыми фактами/преимуществами */}
        <section className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
            <p className="text-sm text-muted-foreground">
              Empowering creators and teams to turn ideas into reality without friction.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Simplicity First</h2>
            <p className="text-sm text-muted-foreground">
              Every detail is engineered to minimize clutter and maximize productivity.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm sm:col-span-2 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-2">Built for Growth</h2>
            <p className="text-sm text-muted-foreground">
              Designed with flexibility in mind, ready to adapt as your project evolves.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}