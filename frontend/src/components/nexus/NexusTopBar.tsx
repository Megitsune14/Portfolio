import { ExternalLink, LogOut, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from '@/hooks/use-theme';
import { useNexusAuth } from '@/components/nexus/NexusAuthProvider';
import { getPageTitle } from '@/lib/nexus/navigation';

export function NexusTopBar() {
  const location = useLocation();
  const { logout } = useNexusAuth();
  const { theme, setTheme } = useTheme();
  const pageTitle = getPageTitle(location.pathname);
  const isHome = location.pathname === '/nexus';

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/60 px-4 backdrop-blur-md sm:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="hidden h-6 md:hidden" />

      <Breadcrumb className="hidden min-w-0 flex-1 sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/nexus">Nexus</BreadcrumbLink>
          </BreadcrumbItem>
          {!isHome ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/" className="flex items-center gap-2">
                <ExternalLink />
                Retour au portfolio
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-primary">
              <LogOut />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
