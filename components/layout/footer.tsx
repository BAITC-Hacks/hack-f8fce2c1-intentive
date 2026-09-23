'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'
import { useUserStore } from '@/components/providers/user-store-provider'

// ==========================================
// DICTIONARIES / ЛОКАЛИЗАЦИЯ
// ==========================================
const translations = {
  ru: {
    subtitle: 'Halyk Bank • HackAlem AI',
    nav: {
      about: 'О проекте',
      features: 'Возможности',
    },
    madeBy: 'Сделано командой',
  },
  en: {
    subtitle: 'Halyk Bank • HackAlem AI',
    nav: {
      about: 'About',
      features: 'Features',
    },
    madeBy: 'Made by',
  },
}

export default function Footer() {
  // Заглушка текущего языка
  const lang = useUserStore((state) => state.language)
  const setLanguage = useUserStore((state) => state.setLanguage)
  const t = translations[lang]

  return (
    <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur-sm py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Название и статус */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium tracking-tight">Career Quest</span>
            <span className="text-border">|</span>
            <span className="text-xs text-muted-foreground font-light">{t.subtitle}</span>
          </div>

          {/* Быстрые ссылки */}
          <nav className="flex items-center gap-6 text-xs text-muted-foreground font-light">
            <Link href="/about" className="hover:text-foreground transition-colors">
              {t.nav.about}
            </Link>
            <Link href="/features" className="hover:text-foreground transition-colors">
              {t.nav.features}
            </Link>
          </nav>

          {/* Правый блок: Авторство и Переключатель языка */}
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground font-light">
              {t.madeBy} <span className="font-medium text-foreground tracking-wide">Intentive</span>
            </div>

            {/* Визуальная кнопка переключения языка (Заглушка) */}
            <button
              type="button"
              onClick={() => setLanguage(lang === 'ru' ? 'en' : 'ru')}
              aria-label={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
              className="group flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/60 bg-muted/40 hover:bg-secondary text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground/80 group-hover:text-primary transition-colors" />
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>

        </div>
      </div>
    </footer>
  )
}
