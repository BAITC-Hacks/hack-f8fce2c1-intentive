'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MenuIcon, Globe } from 'lucide-react'
import { motion, useScroll, useMotionValueEvent } from 'motion/react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList
} from '@/components/ui/navigation-menu'

import { cn } from '@/lib/utils'
import { useUserStore } from '@/components/providers/user-store-provider'

// ==========================================
// DICTIONARIES / ЛОКАЛИЗАЦИЯ НАВИГАЦИИ
// ==========================================
const translations = {
  ru: {
    nav: [
      { title: 'О нас', href: '/about' },
      { title: 'Возможности', href: '/features' },
      { title: 'Центр помощи', href: '/help' },
    ],
  },
  en: {
    nav: [
      { title: 'About', href: '/about' },
      { title: 'Features', href: '/features' },
      { title: 'Help Center', href: '/help' },
    ],
  },
}

interface HeaderProps {
  className?: string
}

const Header = ({ className }: HeaderProps) => {
  const pathname = usePathname()
  const { scrollY } = useScroll()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastDirectionChangeY = useRef(0)

  // Текущий язык (по умолчанию русский)
  const lang = useUserStore((state) => state.language)
  const setLanguage = useUserStore((state) => state.setLanguage)
  const navItems = translations[lang].nav

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    const scrollDelta = latest - previous
    const isScrollingDown = scrollDelta > 0

    setIsScrolled(latest > 20)

    if (isScrollingDown) {
      if (latest > 150) setIsVisible(false)
      lastDirectionChangeY.current = latest
    } else {
      const distanceScrolledUp = lastDirectionChangeY.current - latest

      if (distanceScrolledUp > 50 || latest < 10) {
        setIsVisible(true)
      }
    }
  })

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: -100 },
      }}
      animate={isVisible ? 'visible' : 'hidden'}
      transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
      style={{ paddingRight: 'var(--removed-body-scroll-bar-size, 0px)' }}
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 h-14 w-[calc(100%-2rem)] max-w-2xl rounded-full border transition-colors duration-200',
        isScrolled
          ? 'bg-background/70 backdrop-blur-md border-border/80 shadow-sm'
          : 'bg-background/90 backdrop-blur-sm border-border/40',
        className
      )}
    >
      <div className="flex h-full items-center justify-between gap-2 sm:gap-4 px-4 sm:px-5">
        {/* Логотип продукта */}
        <Link href="/" className="shrink-0 text-base font-semibold tracking-tight">
          Career Quest
        </Link>

        {/* Desktop navigation */}
        <NavigationMenu className="max-md:hidden">
          <NavigationMenuList className="gap-1">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative px-3.5 py-1.5 text-sm font-medium rounded-full transition-colors block',
                    isActive(item.href)
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  {item.title}

                  {mounted && isActive(item.href) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 2 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 1000,
                        damping: 20,
                        duration: 0.3
                      }}
                      className="absolute inset-0 bg-secondary -z-10 rounded-full"
                    />
                  )}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Правый блок: Языковой переключатель и Мобильное меню */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Кнопка-переключатель RU / EN */}
          <button
            type="button"
            onClick={() => setLanguage(lang === 'ru' ? 'en' : 'ru')}
            aria-label={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
            className="group flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/60 bg-muted/40 hover:bg-secondary text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-all duration-200"
            title={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          >
            <Globe className="h-3.5 w-3.5 text-muted-foreground/80 group-hover:text-primary transition-colors" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            {!mounted ? (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MenuIcon className="size-4" />
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" />}>
                  <MenuIcon className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl mt-2">
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.href} nativeButton={false} render={<Link href={item.href} className="rounded-xl" />}>
                      <span className={cn('w-full text-sm', isActive(item.href) && 'font-semibold text-primary')}>
                        {item.title}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
