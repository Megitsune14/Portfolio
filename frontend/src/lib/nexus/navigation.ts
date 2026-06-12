export type NexusNavItem = {
  title: string;
  href: string;
  icon: string;
};

export type NexusGoalsNavItem = {
  title: string;
  href: string;
};

export const mainNavItems = [
  { title: 'Accueil', href: '/nexus', icon: 'LayoutDashboard' },
  { title: 'Analytics', href: '/nexus/analytics', icon: 'BarChart3' },
] as const;

export const spotifyNavItem = {
  title: 'Spotify',
  href: '/nexus/spotify',
  icon: 'Music2',
} as const;

export const goalsNavItems: NexusGoalsNavItem[] = [
  { title: 'Dashboard', href: '/nexus/goals/dashboard' },
  { title: 'Pesées', href: '/nexus/goals/measures' },
  { title: 'Objectifs', href: '/nexus/goals' },
  { title: 'Profil', href: '/nexus/goals/profile' },
];

export const goalsOnboardingItem: NexusGoalsNavItem = {
  title: 'Configuration',
  href: '/nexus/goals/onboarding',
};

export function getPageTitle(pathname: string): string {
  if (pathname === '/nexus') return 'Accueil';
  if (pathname === '/nexus/analytics') return 'Analytics';
  if (pathname === '/nexus/spotify') return 'Spotify';
  if (pathname === '/nexus/goals/onboarding') return 'Configuration Goals';
  if (pathname === '/nexus/goals/dashboard') return 'Dashboard Goals';
  if (pathname === '/nexus/goals/measures') return 'Pesées';
  if (pathname === '/nexus/goals') return 'Objectifs';
  if (pathname === '/nexus/goals/profile') return 'Profil Goals';
  return 'Nexus';
}
