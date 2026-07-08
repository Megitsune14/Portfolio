import type { LocalizedString, LocalizedStringOptional } from '@/lib/localized'

export interface SocialLink {
  id: string
  name: LocalizedString
  username?: LocalizedStringOptional
  url?: string
  icon?: string
}

export const socialLinks: SocialLink[] = []
