import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_ICON = '3.5rem';

type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(next);
      } else {
        _setOpen(next);
      }
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((o) => !o);
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (!isMobile) {
      setOpen(true);
      setOpenMobile(false);
    }
  }, [isMobile, setOpen]);

  const state: 'expanded' | 'collapsed' = isMobile || open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = 'left',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { side?: 'left' | 'right' }) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side={side} className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Nexus</SheetTitle>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state="expanded"
      data-side={side}
    >
      <div className="relative h-svh w-(--sidebar-width) bg-transparent" />
      <div
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) md:flex',
          side === 'left' ? 'left-0' : 'right-0',
          className,
        )}
        {...props}
      >
        <div
          className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar"
          data-sidebar="sidebar"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { isMobile, toggleSidebar } = useSidebar();

  if (!isMobile) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('size-9', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Basculer la sidebar</span>
    </Button>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2 p-4', className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-2 py-2', className)} {...props} />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('relative flex w-full min-w-0 flex-col p-2', className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex h-8 shrink-0 items-center rounded-lg px-2 text-xs font-semibold text-sidebar-foreground/70',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('w-full text-sm', className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('group/menu-item relative', className)} {...props} />;
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-active={isActive}
      className={cn(
        'flex w-full items-center gap-2 overflow-hidden rounded-xl px-2 py-2 text-left text-sm font-medium text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5', className)}
      {...props}
    />
  );
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('group/menu-sub-item relative', className)} {...props} />;
}

function SidebarMenuSubButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      data-active={isActive}
      className={cn(
        'flex h-8 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-lg px-2 text-sm text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      className={cn(
        'relative flex min-h-svh flex-1 flex-col bg-background',
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
