import type { TranslationKey } from '@/i18n/types'

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string

export function formatPlayedAgo(playedAt: string, t: Translate): string {
  const diffInMinutes = Math.floor((Date.now() - new Date(playedAt).getTime()) / 60_000)

  if (diffInMinutes < 1) return t('stats.spotify.playedJustNow')
  if (diffInMinutes < 60) return t('stats.spotify.playedMinutesAgo', { count: diffInMinutes })

  const hours = Math.floor(diffInMinutes / 60)
  if (hours < 24) return t('stats.spotify.playedHoursAgo', { count: hours })

  const days = Math.floor(diffInMinutes / 1440)
  return t('stats.spotify.playedDaysAgo', { count: days })
}
