export const NEXUS_PAGE_TITLES: Record<string, string> = {
  '/nexus': 'Home',
  '/nexus/analytics': 'Analytics',
  '/nexus/goals/configuration': 'Configuration',
  '/nexus/goals/dashboard': 'Dashboard',
  '/nexus/goals/weights': 'Pesées',
  '/nexus/goals/objectives': 'Objectifs',
  '/nexus/goals/profile': 'Profil',
  '/nexus/spotify': 'Spotify',
  '/nexus/config/projects': 'Projects',
  '/nexus/config/social': 'Social',
}

export function getNexusPageTitle(pathname: string): string {
  return NEXUS_PAGE_TITLES[pathname] ?? 'Nexus'
}
