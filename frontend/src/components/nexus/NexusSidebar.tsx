import { useQuery } from '@tanstack/react-query';
import { BarChart3, ChevronDown, ExternalLink, LayoutDashboard, LogOut, Music2, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  goalsNavItems,
  goalsOnboardingItem,
  mainNavItems,
  spotifyNavItem,
} from '@/lib/nexus/navigation';
import { useNexusAuth } from '@/components/nexus/NexusAuthProvider';
import { goalsApiRequest } from '@/utils/nexus-goals-api';
import type { Profile } from '@/types/goals';

const iconMap = {
  LayoutDashboard,
  BarChart3,
} as const;

export function NexusSidebar() {
  const location = useLocation();
  const { logout } = useNexusAuth();

  const profileQuery = useQuery({
    queryKey: ['nexus-goals-profile'],
    queryFn: () => goalsApiRequest<{ profile: Profile | null }>('/profile'),
  });

  const hasProfile = !!profileQuery.data?.profile;
  const isOnboarding = location.pathname === '/nexus/goals/onboarding';
  const isGoalsSection = location.pathname.startsWith('/nexus/goals');
  const goalsExpanded = isGoalsSection || isOnboarding;

  const isActive = (href: string) => {
    if (href === '/nexus') return location.pathname === '/nexus';
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/nexus" className="flex items-center gap-2 px-2 py-1">
          <span className="font-jp text-xl font-bold text-sidebar-foreground">Nexus</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.href} aria-current={active ? 'page' : undefined}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isGoalsSection} data-state={goalsExpanded ? 'open' : 'closed'}>
                  <Target />
                  <span>Goals</span>
                  <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/menu-item:rotate-180" />
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {!hasProfile && !profileQuery.isLoading ? (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={location.pathname === goalsOnboardingItem.href}
                      >
                        <Link
                          to={goalsOnboardingItem.href}
                          aria-current={
                            location.pathname === goalsOnboardingItem.href ? 'page' : undefined
                          }
                        >
                          <span>{goalsOnboardingItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ) : (
                    goalsNavItems.map((item) => {
                      const active = location.pathname === item.href;
                      return (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton asChild isActive={active}>
                            <Link to={item.href} aria-current={active ? 'page' : undefined}>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })
                  )}
                </SidebarMenuSub>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(spotifyNavItem.href)}>
                  <Link
                    to={spotifyNavItem.href}
                    aria-current={isActive(spotifyNavItem.href) ? 'page' : undefined}
                  >
                    <Music2 />
                    <span>{spotifyNavItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <ExternalLink />
                <span>Retour au portfolio</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="text-primary hover:text-primary">
              <LogOut />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
