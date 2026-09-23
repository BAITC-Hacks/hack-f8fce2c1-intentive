import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur-sm py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Название и статус */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium tracking-tight">Career Quest</span>
            <span className="text-border">|</span>
            <span className="text-xs text-muted-foreground font-light">Halyk Bank • HackAlem AI</span>
          </div>

          {/* Быстрые ссылки */}
          <nav className="flex items-center gap-6 text-xs text-muted-foreground font-light">
            <Link href="/about" className="hover:text-foreground transition-colors">
              О проекте
            </Link>
            <Link href="/features" className="hover:text-foreground transition-colors">
              Возможности
            </Link>
          </nav>

          {/* Авторство */}
          <div className="text-xs text-muted-foreground font-light">
            Сделано командой <span className="font-medium text-foreground tracking-wide">Intentive</span>
          </div>

        </div>
      </div>
    </footer>
  )
}