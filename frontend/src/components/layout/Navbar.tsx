import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteContainer } from '@/components/layout/SiteContainer'
import { BadAppleTrigger } from '@/components/easter-egg/BadAppleEasterEgg'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { useNexusSession } from '@/hooks/useNexusSession'
import { useTranslation } from '@/i18n/I18nProvider'
import { cn } from '@/lib/utils'

const navItems = [
  { key: 'nav.home' as const, href: '#home' },
  { key: 'nav.projects' as const, href: '#projects' },
  { key: 'nav.social' as const, href: '#social' },
  { key: 'nav.stats' as const, href: '#stats' },
]

function NexusNavLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { t } = useTranslation()

  return (
    <Link
      to="/nexus"
      onClick={onClick}
      className={cn(
        'text-sm font-medium text-foreground/80 transition-colors hover:text-foreground',
        className,
      )}
    >
      <span className="text-gradient font-semibold">{t('nav.nexus')}</span>
    </Link>
  )
}

export function Navbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isLoading } = useNexusSession()
  const showNexus = !isLoading && isAuthenticated

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <SiteContainer>
        <nav className="navbar-shell mt-4 flex w-full flex-col rounded-2xl px-4 py-3 sm:px-6">
          <div className="flex w-full items-center justify-between">
            <a
              href="#home"
              className="font-bold font-heading tracking-tight"
            >
              <span className="text-gradient text-xl sm:text-2xl">{t('hero.title')}</span>
            </a>

            <div className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                >
                  {t(item.key)}
                </a>
              ))}
              {showNexus && <NexusNavLink />}
            </div>

            <div className="flex items-center gap-1">
              <BadAppleTrigger />
              <ThemeToggle />
              <LanguageToggle />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t('nav.menu')}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
            </div>
          </div>

          <div
            className={cn(
              'overflow-hidden transition-all duration-300 md:hidden',
              open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0',
            )}
          >
            <div className="flex flex-col gap-2 pt-4 pb-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {t(item.key)}
                </a>
              ))}
              {showNexus && (
                <NexusNavLink
                  className="rounded-lg px-2 py-2 hover:bg-muted"
                  onClick={() => setOpen(false)}
                />
              )}
            </div>
          </div>
        </nav>
      </SiteContainer>
    </header>
  )
}
