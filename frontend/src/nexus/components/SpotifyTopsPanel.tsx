import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Disc3, Mic2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useFetch } from '@/hooks/useFetch'
import { getSpotifyPeriods, getSpotifyTops, getSpotifyWrapped } from '../api/nexusApi'
import type {
  NexusSpotifyTopItem,
  NexusSpotifyWrapped,
  NexusSpotifyWrappedItem,
  SpotifyPeriodSelection,
} from '../types/nexus'

const MONTH_LABELS = [
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

const CURRENT_YEAR = new Date().getFullYear()
const SELECT_CLASS =
  'flex h-9 w-full min-w-[10rem] rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

type TopKind = 'tracks' | 'artists'
type SpotifyRange = 'short_term' | 'medium_term' | 'long_term'

type ViewId =
  | 'local-tracks'
  | 'local-artists'
  | `spotify-tracks-${SpotifyRange}`
  | `spotify-artists-${SpotifyRange}`

type RankItem = {
  id: string
  name: string
  subtitle?: string
  image?: string
  count?: number
}

const SPOTIFY_RANGE_LABELS: Record<SpotifyRange, string> = {
  short_term: '4 semaines',
  medium_term: '6 mois',
  long_term: 'Toujours',
}

const TRACK_VIEWS: { id: ViewId; label: string }[] = [
  { id: 'local-tracks', label: 'Actuellement' },
  { id: 'spotify-tracks-short_term', label: '4 semaines' },
  { id: 'spotify-tracks-medium_term', label: '6 mois' },
  { id: 'spotify-tracks-long_term', label: 'Toujours' },
]

const ARTIST_VIEWS: { id: ViewId; label: string }[] = [
  { id: 'local-artists', label: 'Actuellement' },
  { id: 'spotify-artists-short_term', label: '4 semaines' },
  { id: 'spotify-artists-medium_term', label: '6 mois' },
  { id: 'spotify-artists-long_term', label: 'Toujours' },
]

function defaultSelection(): SpotifyPeriodSelection {
  return { mode: 'year', year: CURRENT_YEAR, month: 'current' }
}

function normalizeWrappedItems(
  items: NexusSpotifyWrappedItem[],
  kind: TopKind,
): RankItem[] {
  return items.map((item, index) => ({
    id: item.trackId ?? item.artistId ?? item.id ?? `${kind}-${index}`,
    name: item.name,
    subtitle: kind === 'tracks' ? item.artist : undefined,
    image: item.image,
    count: item.count,
  }))
}

function normalizeSpotifyItems(items: NexusSpotifyTopItem[], kind: TopKind): RankItem[] {
  return items.map((item, index) => ({
    id: item.id ?? `spotify-${index}`,
    name: item.name,
    subtitle: kind === 'tracks' ? item.artist : undefined,
    image: item.image,
    count: item.count,
  }))
}

function TopRankList({ items, kind }: { items: RankItem[]; kind: TopKind }) {
  const isTracks = kind === 'tracks'

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucune donnée pour ce classement.
      </p>
    )
  }

  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li
          key={item.id}
          className={cn(
            'flex items-center gap-3 rounded-xl border px-3 py-2.5',
            isTracks ? 'border-accent/30 bg-accent/5' : 'border-primary/30 bg-primary/5',
          )}
        >
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg font-heading text-sm font-bold',
              index === 0
                ? 'bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-(--gold)'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {index + 1}
          </span>
          {item.image ? (
            <img src={item.image} alt="" className="size-10 shrink-0 rounded-md object-cover" />
          ) : (
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-md',
                isTracks ? 'bg-accent/15 text-accent' : 'bg-primary/15 text-primary',
              )}
            >
              {isTracks ? <Disc3 className="size-4" /> : <Mic2 className="size-4" />}
            </div>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{item.name}</span>
            {item.subtitle && (
              <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
            )}
          </span>
          {item.count != null && (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {item.count} écoute{item.count > 1 ? 's' : ''}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

function ViewGroup({
  title,
  views,
  itemsByView,
  selectedId,
  onSelect,
  kind,
}: {
  title: string
  views: { id: ViewId; label: string }[]
  itemsByView: Record<string, RankItem[]>
  selectedId: ViewId
  onSelect: (id: ViewId) => void
  kind: TopKind
}) {
  const isTracks = kind === 'tracks'

  return (
    <div className="space-y-1">
      <p className="px-3 pt-2 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      {views.map((view) => {
        const active = selectedId === view.id
        const count = itemsByView[view.id]?.length ?? 0

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onSelect(view.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
              active
                ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                : 'text-foreground hover:bg-muted',
            )}
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg',
                isTracks ? 'bg-accent/15 text-accent' : 'bg-primary/15 text-primary',
              )}
            >
              {isTracks ? <Disc3 className="size-4" /> : <Mic2 className="size-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{view.label}</span>
              <span className="block text-xs text-muted-foreground">
                {count} entrée{count > 1 ? 's' : ''}
              </span>
            </span>
            <ChevronRight
              className={cn('size-4 shrink-0 transition-transform', active && 'translate-x-0.5')}
            />
          </button>
        )
      })}
    </div>
  )
}

export function SpotifyTopsPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const periods = useFetch(getSpotifyPeriods)
  const tops = useFetch(getSpotifyTops)
  const [selection, setSelection] = useState<SpotifyPeriodSelection>(defaultSelection)
  const [selectedView, setSelectedView] = useState<ViewId>('local-tracks')

  const wrapped = useFetch(() => getSpotifyWrapped(selection), { deps: [selection] })

  useEffect(() => {
    if (refreshKey > 0) {
      void wrapped.refetch()
      void tops.refetch()
    }
  }, [refreshKey])

  const years = useMemo(() => {
    const fromApi = periods.data?.years ?? []
    const merged = new Set([CURRENT_YEAR, ...fromApi])
    return [...merged].sort((a, b) => b - a)
  }, [periods.data?.years])

  const monthOptions = useMemo(() => {
    if (selection.mode !== 'year') return []

    const options: { value: string; label: string }[] = []

    if (selection.year === CURRENT_YEAR) {
      options.push({ value: 'current', label: 'Ce mois-ci' })
    }

    options.push({ value: 'full-year', label: 'Toute l\'année' })

    const months = periods.data?.monthsByYear[String(selection.year)] ?? []
    for (const month of months) {
      if (selection.year === CURRENT_YEAR && month === new Date().getUTCMonth() + 1) {
        continue
      }
      options.push({
        value: String(month),
        label: MONTH_LABELS[month - 1] ?? `Mois ${month}`,
      })
    }

    return options
  }, [selection, periods.data?.monthsByYear])

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
      setSelection({ mode: 'all-time' })
      return
    }
    const year = Number(value)
    setSelection({
      mode: 'year',
      year,
      month: year === CURRENT_YEAR ? 'current' : 'full-year',
    })
  }

  function onMonthChange(value: string) {
    if (selection.mode !== 'year') return
    const month =
      value === 'current' ? 'current' : value === 'full-year' ? 'full-year' : Number(value)
    setSelection({ mode: 'year', year: selection.year, month })
  }

  const wrappedData: NexusSpotifyWrapped | null = wrapped.data

  const itemsByView = useMemo(() => {
    const map: Record<string, RankItem[]> = {
      'local-tracks': normalizeWrappedItems(wrappedData?.topTracks ?? [], 'tracks'),
      'local-artists': normalizeWrappedItems(wrappedData?.topArtists ?? [], 'artists'),
    }

    const ranges: SpotifyRange[] = ['short_term', 'medium_term', 'long_term']
    for (const range of ranges) {
      const trackBubble = tops.data?.bubbles.find(
        (b) => b.type === 'top_tracks' && b.timeRange === range && b.source === 'spotify',
      )
      const artistBubble = tops.data?.bubbles.find(
        (b) => b.type === 'top_artists' && b.timeRange === range && b.source === 'spotify',
      )
      map[`spotify-tracks-${range}`] = normalizeSpotifyItems(trackBubble?.items ?? [], 'tracks')
      map[`spotify-artists-${range}`] = normalizeSpotifyItems(artistBubble?.items ?? [], 'artists')
    }

    return map
  }, [wrappedData, tops.data?.bubbles])

  const activeItems = itemsByView[selectedView] ?? []
  const activeKind: TopKind = selectedView.includes('artists') ? 'artists' : 'tracks'

  const detailMeta = useMemo(() => {
    if (selectedView.startsWith('local-')) {
      return {
        title: `${activeKind === 'tracks' ? 'Morceaux' : 'Artistes'} · Actuellement`,
        subtitle: `${wrappedData?.periodLabel ?? '-'} · Historique local${wrappedData != null ? ` · ${wrappedData.totalPlays} écoutes` : ''}`,
      }
    }

    const range = selectedView.split('-').pop() as SpotifyRange
    const bubble = tops.data?.bubbles.find(
      (b) =>
        b.type === (activeKind === 'tracks' ? 'top_tracks' : 'top_artists') &&
        b.timeRange === range &&
        b.source === 'spotify',
    )

    return {
      title: `${activeKind === 'tracks' ? 'Morceaux' : 'Artistes'} · ${SPOTIFY_RANGE_LABELS[range]}`,
      subtitle: `Compte Spotify${bubble?.fetchedAt ? ` · ${new Date(bubble.fetchedAt).toLocaleDateString('fr-FR')}` : ''}`,
    }
  }, [selectedView, activeKind, wrappedData, tops.data?.bubbles])

  const loading = periods.loading || wrapped.loading || tops.loading

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="spotify-year">Période</Label>
          <select
            id="spotify-year"
            className={SELECT_CLASS}
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
              className={SELECT_CLASS}
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

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,300px)_1fr]">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,300px)_1fr]">
          <Card className="glass h-fit lg:sticky lg:top-6">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-base">Classements</CardTitle>
              <p className="text-xs text-muted-foreground">
                Actuellement = période sélectionnée · autres = tops Spotify
              </p>
            </CardHeader>
            <CardContent className="space-y-2 p-2 pt-0">
              <ViewGroup
                title="Morceaux"
                views={TRACK_VIEWS}
                itemsByView={itemsByView}
                selectedId={selectedView}
                onSelect={setSelectedView}
                kind="tracks"
              />
              <ViewGroup
                title="Artistes"
                views={ARTIST_VIEWS}
                itemsByView={itemsByView}
                selectedId={selectedView}
                onSelect={setSelectedView}
                kind="artists"
              />
            </CardContent>
          </Card>

          <Card className="glass min-h-[320px]">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="font-heading text-lg">{detailMeta.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{detailMeta.subtitle}</p>
            </CardHeader>
            <CardContent className="pt-4">
              <TopRankList items={activeItems} kind={activeKind} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
