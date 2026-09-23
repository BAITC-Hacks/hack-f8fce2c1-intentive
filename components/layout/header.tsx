'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MenuIcon } from 'lucide-react'
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

const NAVIGATION = [
  { title: 'About', href: '/about' },
  { title: 'Features', href: '/features' },
  { title: 'Help Center', href: '/help' }
]

interface HeaderProps {
  className?: string
}

const Header = ({ className }: HeaderProps) => {
  const pathname = usePathname()
  const { scrollY } = useScroll()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastDirectionChangeY = useRef(0)

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
        hidden: { y: '-100%' },
      }}
      animate={isVisible ? 'visible' : 'hidden'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ paddingRight: 'var(--removed-body-scroll-bar-size, 0px)' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300',
        isScrolled
          ? 'h-16 bg-background/80 backdrop-blur-sm md:backdrop-blur-md'
          : 'h-16 bg-background border-transparent',
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Логотип текстом */}
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
          Intentive
        </Link>

        {/* Desktop navigation */}
        <NavigationMenu className="max-md:hidden">
          <NavigationMenuList className="gap-1">
            {NAVIGATION.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative px-3 py-1.5 text-base font-medium rounded-md transition-colors block',
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

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center">
          {!mounted ? (
            <Button variant="outline" size="icon">
              <MenuIcon className="size-5" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
                <MenuIcon className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {NAVIGATION.map((item) => (
                  <DropdownMenuItem key={item.href} render={<Link href={item.href} />}>
                    <span className={cn('w-full', isActive(item.href) && 'font-semibold text-primary')}>
                      {item.title}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Header