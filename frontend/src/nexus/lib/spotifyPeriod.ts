import type { SpotifyPeriodSelection } from '../types/nexus'

export const SPOTIFY_CURRENT_YEAR = new Date().getFullYear()

export const SPOTIFY_MONTH_LABELS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export const SPOTIFY_SELECT_CLASS =
  'flex h-9 w-full min-w-[10rem] rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function defaultSpotifyPeriodSelection(): SpotifyPeriodSelection {
  return { mode: 'year', year: SPOTIFY_CURRENT_YEAR, month: 'current' }
}

export function periodPlaysLabel(
  selection: SpotifyPeriodSelection,
  periodLabel?: string,
): string {
  if (selection.mode === 'all-time') return 'Écoutes · Depuis le début'
  if (selection.mode === 'year' && selection.month === 'current') return 'Écoutes ce mois-ci'
  if (selection.mode === 'year' && selection.month === 'full-year') {
    return `Écoutes · ${selection.year}`
  }
  if (periodLabel) return `Écoutes · ${periodLabel}`
  return 'Écoutes · Période'
}

/** Hours with total minutes in parentheses, e.g. "2 (120)". */
export function formatListeningHoursMinutes(ms: number): string {
  const totalMinutes = Math.floor(Math.max(0, ms) / 60000)
  const hours = Math.floor(totalMinutes / 60)
  if (hours > 0) return `${hours} (${totalMinutes})`
  return String(totalMinutes)
}
