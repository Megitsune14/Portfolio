import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  FolderKanban,
  Home,
  LayoutDashboard,
  LogOut,
  Music,
  Scale,
  Settings,
  Share2,
  Target,
  User,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useGoalsProfile } from '../goals/GoalsProfileProvider'
import { useNexusAuth } from '../auth/NexusAuthProvider'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface NavSection {
  label: string
  items: NavItem[]
}

const CONFIGURATION_HREF = '/nexus/goals/configuration'

const mainItems: NavItem[] = [
  { label: 'Accueil', href: '/nexus', icon: <Home className="size-4" /> },
  { label: 'Analytics', href: '/nexus/analytics', icon: <BarChart3 className="size-4" /> },
  { label: 'Spotify', href: '/nexus/spotify', icon: <Music className="size-4" /> },
]

const goalsConfigurationItem: NavItem = {
  label: 'Configuration',
  href: CONFIGURATION_HREF,
  icon: <Settings className="size-4" />,
}

const goalsAppItems: NavItem[] = [
  { label: 'Dashboard', href: '/nexus/goals/dashboard', icon: <LayoutDashboard className="size-4" /> },
  { label: 'Pesées', href: '/nexus/goals/weights', icon: <Scale className="size-4" /> },
  { label: 'Objectifs', href: '/nexus/goals/objectives', icon: <Target className="size-4" /> },
  { label: 'Profil', href: '/nexus/goals/profile', icon: <User className="size-4" /> },
]

const configItems: NavItem[] = [
  { label: 'Projects', href: '/nexus/config/projects', icon: <FolderKanban className="size-4" /> },
  { label: 'Social', href: '/nexus/config/social', icon: <Share2 className="size-4" /> },
]

function getGoalsSection(isConfigured: boolean): NavSection {
  return {
    label: 'Goals',
    items: isConfigured ? goalsAppItems : [goalsConfigurationItem],
  }
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const active = pathname === item.href

  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {item.icon}
      {item.label}
    </Link>
  )
}

function NavSectionBlock({
  section,
  onNavigate,
}: {
  section: NavSection
  onNavigate?: () => void
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 pt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {section.label}
      </p>
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  )
}

function NexusSidebarContent({
  onNavigate,
  showClose,
  onClose,
}: {
  onNavigate?: () => void
  showClose?: boolean
  onClose?: () => void
}) {
  const { isConfigured } = useGoalsProfile()
  const { logout } = useNexusAuth()
  const goalsSection = getGoalsSection(isConfigured)
  const configSection: NavSection = { label: 'Configuration', items: configItems }

  function handleLogout() {
    onNavigate?.()
    logout()
    window.location.replace('/')
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <Link to="/nexus" className="font-heading text-lg font-semibold" onClick={onNavigate}>
          <span className="text-gradient">Nexus</span>
        </Link>
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="space-y-0.5">
          {mainItems.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={onNavigate} />
          ))}
        </div>
        <NavSectionBlock section={goalsSection} onNavigate={onNavigate} />
        <NavSectionBlock section={configSection} onNavigate={onNavigate} />
      </nav>
      <div className="space-y-0.5 border-t border-border/60 p-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Portfolio
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Déconnexion
        </button>
      </div>
    </>
  )
}

interface NexusSidebarProps {
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

export function NexusSidebar({ mobileOpen, onMobileOpenChange }: NexusSidebarProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    onMobileOpenChange(false)
  }, [pathname, onMobileOpenChange])

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  const closeMobile = () => onMobileOpenChange(false)

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          aria-label="Fermer le menu"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          'glass fixed inset-y-0 left-0 z-50 flex h-svh w-64 flex-col border-r border-border/60 transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-hidden={!mobileOpen}
      >
        <NexusSidebarContent onNavigate={closeMobile} showClose onClose={closeMobile} />
      </aside>

      <aside className="glass fixed inset-y-0 left-0 z-40 hidden h-svh w-64 flex-col border-r border-border/60 lg:flex">
        <NexusSidebarContent />
      </aside>
    </>
  )
}
