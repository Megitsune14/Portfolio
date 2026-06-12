import { Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from '@/hooks/use-theme';
import { getPageTitle } from '@/lib/nexus/navigation';

export function NexusTopBar() {
  const location = useLocation();
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
      </div>
    </header>
  );
}
