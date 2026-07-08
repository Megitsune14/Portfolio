import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import {
  SPOTIFY_CURRENT_YEAR,
  SPOTIFY_MONTH_LABELS,
  SPOTIFY_SELECT_CLASS,
} from '../lib/spotifyPeriod'
import type { NexusSpotifyPeriods, SpotifyPeriodSelection } from '../types/nexus'

export function SpotifyPeriodFilters({
  selection,
  onSelectionChange,
  periods,
}: {
  selection: SpotifyPeriodSelection
  onSelectionChange: (selection: SpotifyPeriodSelection) => void
  periods: NexusSpotifyPeriods | null
}) {
  const years = useMemo(() => {
    const fromApi = periods?.years ?? []
    const merged = new Set([SPOTIFY_CURRENT_YEAR, ...fromApi])
    return [...merged].sort((a, b) => b - a)
  }, [periods?.years])

  const monthOptions = useMemo(() => {
    if (selection.mode !== 'year') return []

    const options: { value: string; label: string }[] = []

    if (selection.year === SPOTIFY_CURRENT_YEAR) {
      options.push({ value: 'current', label: 'Ce mois-ci' })
    }

    options.push({ value: 'full-year', label: "Toute l'année" })

    const months = periods?.monthsByYear[String(selection.year)] ?? []
    for (const month of months) {
      if (selection.year === SPOTIFY_CURRENT_YEAR && month === new Date().getUTCMonth() + 1) {
        continue
      }
      options.push({
        value: String(month),
        label: SPOTIFY_MONTH_LABELS[month - 1] ?? `Mois ${month}`,
      })
    }

    return options
  }, [selection, periods?.monthsByYear])

  const yearSelectValue = selection.mode === 'all-time' ? 'all-time' : String(selection.year)

  const monthSelectValue =
    selection.mode === 'year'
      ? selection.month === 'current'
        ? 'current'
        : selection.month === 'full-year'
          ? 'full-year'
          : String(selection.month)
      : 'full-year'

  function onYearChange(value: string) {
    if (value === 'all-time') {
      onSelectionChange({ mode: 'all-time' })
      return
    }
    const year = Number(value)
    onSelectionChange({
      mode: 'year',
      year,
      month: year === SPOTIFY_CURRENT_YEAR ? 'current' : 'full-year',
    })
  }

  function onMonthChange(value: string) {
    if (selection.mode !== 'year') return
    const month =
      value === 'current' ? 'current' : value === 'full-year' ? 'full-year' : Number(value)
    onSelectionChange({ mode: 'year', year: selection.year, month })
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label htmlFor="spotify-year">Période</Label>
        <select
          id="spotify-year"
          className={SPOTIFY_SELECT_CLASS}
          value={yearSelectValue}
          onChange={(e) => onYearChange(e.target.value)}
        >
          <option value="all-time">Depuis le début</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {selection.mode === 'year' && (
        <div className="space-y-2">
          <Label htmlFor="spotify-month">Mois</Label>
          <select
            id="spotify-month"
            className={SPOTIFY_SELECT_CLASS}
            value={monthSelectValue}
            onChange={(e) => onMonthChange(e.target.value)}
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
