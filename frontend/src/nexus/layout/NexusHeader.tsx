import { Menu, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { getNexusPageTitle } from './nexusRoutes'

interface NexusHeaderProps {
  onMenuClick: () => void
}

export function NexusHeader({ onMenuClick }: NexusHeaderProps) {
  const { pathname } = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const title = getNexusPageTitle(pathname)

  return (
    <header className="navbar-shell sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-4" />
        </Button>
        <h1 className="truncate font-heading text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={toggleTheme}
        aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    </header>
  )
}
