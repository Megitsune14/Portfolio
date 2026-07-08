import type { Locale } from '@/i18n/types'

export type LocalizedString = { en: string; fr: string }

export type LocalizedStringOptional = { en?: string; fr?: string }

export const emptyLocalized = (): LocalizedString => ({ en: '', fr: '' })

export function pickLocalized(value: LocalizedString, locale: Locale): string {
  return value[locale]?.trim() || value.en?.trim() || value.fr?.trim() || ''
}

export function pickOptionalLocalized(
  value: LocalizedStringOptional | undefined,
  locale: Locale,
): string | undefined {
  if (!value) return undefined
  const picked = value[locale]?.trim() || value.en?.trim() || value.fr?.trim()
  return picked || undefined
}
