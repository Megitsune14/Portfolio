import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Disc3, Mic2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useFetch } from '@/hooks/useFetch'
import { getSpotifyTops } from '../api/nexusApi'
import { SPOTIFY_CURRENT_YEAR } from '../lib/spotifyPeriod'
import type {
  NexusSpotifyRecentPlay,
  NexusSpotifyTopItem,
  NexusSpotifyWrapped,
  NexusSpotifyWrappedItem,
  SpotifyPeriodSelection,
} from '../types/nexus'

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

function formatPlayedAt(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RecentPlaysList({ items }: { items: NexusSpotifyRecentPlay[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucune écoute récente ce mois-ci.
      </p>
    )
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={`${item.trackId}-${item.playedAt}`}
          className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5"
        >
          {item.image ? (
            <img src={item.image} alt="" className="size-10 shrink-0 rounded-md object-cover" />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
              <Disc3 className="size-4" />
            </div>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{item.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{item.artist}</span>
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {formatPlayedAt(item.playedAt)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function TopRankList({ items, kind }: { items: RankItem[]; kind: TopKind }) {
  const isTracks = kind === 'tracks'

  if (items.length === 0) {
    return (
      <p className="flex flex-1 items-center justify-center py-8 text-center text-sm text-muted-foreground">
        Aucune donnée pour ce classement.
      </p>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
    </div>
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

export function SpotifyTopsPanel({
  selection,
  wrapped,
  wrappedLoading,
  refreshKey = 0,
}: {
  selection: SpotifyPeriodSelection
  wrapped: NexusSpotifyWrapped | null
  wrappedLoading: boolean
  refreshKey?: number
}) {
  const tops = useFetch(getSpotifyTops)
  const [selectedView, setSelectedView] = useState<ViewId>('local-tracks')
  const leftCardRef = useRef<HTMLDivElement>(null)
  const [cardHeight, setCardHeight] = useState(0)

  useEffect(() => {
    if (refreshKey > 0) {
      void tops.refetch()
    }
  }, [refreshKey])

  const itemsByView = useMemo(() => {
    const map: Record<string, RankItem[]> = {
      'local-tracks': normalizeWrappedItems(wrapped?.topTracks ?? [], 'tracks'),
      'local-artists': normalizeWrappedItems(wrapped?.topArtists ?? [], 'artists'),
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
  }, [wrapped, tops.data?.bubbles])

  const activeItems = itemsByView[selectedView] ?? []
  const activeKind: TopKind = selectedView.includes('artists') ? 'artists' : 'tracks'

  const detailMeta = useMemo(() => {
    if (selectedView.startsWith('local-')) {
      return {
        title: `${activeKind === 'tracks' ? 'Morceaux' : 'Artistes'} · Actuellement`,
        subtitle: `${wrapped?.periodLabel ?? '-'} · Historique local${wrapped != null ? ` · ${wrapped.totalPlays} écoutes` : ''}`,
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
  }, [selectedView, activeKind, wrapped, tops.data?.bubbles])

  const loading = wrappedLoading || tops.loading

  useEffect(() => {
    if (loading) return

    const leftCard = leftCardRef.current
    if (!leftCard) return

    const updateHeight = () => {
      setCardHeight(Math.round(leftCard.getBoundingClientRect().height))
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(leftCard)
    window.addEventListener('resize', updateHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [loading])

  const isCurrentMonth =
    selection.mode === 'year' &&
    selection.year === SPOTIFY_CURRENT_YEAR &&
    selection.month === 'current'

  const recentPlays = isCurrentMonth ? (wrapped?.recentPlays ?? []) : []

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,300px)_1fr]">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-start">
        <div ref={leftCardRef} className="lg:sticky lg:top-6">
          <Card className="glass flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-base">Classements</CardTitle>
              <p className="text-xs text-muted-foreground">
                Actuellement = période sélectionnée · autres = tops Spotify
              </p>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2 p-2 pt-0 pb-6">
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
        </div>

        <Card
          className="glass flex flex-col overflow-hidden"
          style={cardHeight > 0 ? { height: cardHeight } : undefined}
        >
          <CardHeader className="shrink-0 border-b border-border/40 pb-4">
            <CardTitle className="font-heading text-lg">{detailMeta.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{detailMeta.subtitle}</p>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4 pb-6">
            <TopRankList items={activeItems} kind={activeKind} />
          </CardContent>
        </Card>
      </div>

      {isCurrentMonth && (
        <Card className="glass">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="font-heading text-lg">10 dernières écoutes</CardTitle>
            <p className="text-sm text-muted-foreground">Ce mois-ci · historique local</p>
          </CardHeader>
          <CardContent className="pt-4">
            <RecentPlaysList items={recentPlays} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
