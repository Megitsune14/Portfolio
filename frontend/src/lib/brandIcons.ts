import type { SocialLink } from '@/data/social'

export type BrandIconKey = 'spotify' | 'discord' | 'riot' | 'lol'

export const BRAND_ICON_STATIC_FALLBACKS: Record<BrandIconKey, string> = {
  spotify: '/assets/social/spotify.png',
  discord: '/assets/social/discord.png',
  riot: '/assets/social/riot.png',
  lol: '/assets/social/league-of-legends.png',
}

const BRAND_SOCIAL_MATCHERS: Record<BrandIconKey, string[]> = {
  spotify: ['spotify'],
  discord: ['discord'],
  riot: ['riot'],
  lol: ['league of legends', 'league-of-legends', 'lol'],
}

function matchesBrand(name: string, keys: string[]) {
  const normalized = name.toLowerCase()
  return keys.some((key) => normalized.includes(key) || normalized === key)
}

export function mergeBrandIcons(
  fromApi: Partial<Record<BrandIconKey, string>>,
  socialLinks: SocialLink[] = [],
): Partial<Record<BrandIconKey, string>> {
  const icons: Partial<Record<BrandIconKey, string>> = { ...fromApi }

  for (const key of Object.keys(BRAND_ICON_STATIC_FALLBACKS) as BrandIconKey[]) {
    if (icons[key]) continue

    const socialIcon = socialLinks.find((link) => {
      const en = link.name.en ?? ''
      const fr = link.name.fr ?? ''
      return matchesBrand(en, BRAND_SOCIAL_MATCHERS[key]) || matchesBrand(fr, BRAND_SOCIAL_MATCHERS[key])
    })?.icon

    icons[key] = socialIcon || BRAND_ICON_STATIC_FALLBACKS[key]
  }

  return icons
}
