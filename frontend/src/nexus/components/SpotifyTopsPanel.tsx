import { Disc3, Mic2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { SPOTIFY_CURRENT_YEAR } from '../lib/spotifyPeriod'
import type {
  NexusSpotifyRecentPlay,
  NexusSpotifyWrapped,
  NexusSpotifyWrappedItem,
  SpotifyPeriodSelection,
} from '../types/nexus'

const VISIBLE_TOP_ITEMS = 8
const TOP_ITEM_ROW_PX = 52
const TOP_ITEM_GAP_PX = 8
const TOP_LIST_MAX_HEIGHT =
  VISIBLE_TOP_ITEMS * TOP_ITEM_ROW_PX + (VISIBLE_TOP_ITEMS - 1) * TOP_ITEM_GAP_PX

type TopKind = 'tracks' | 'artists'

type RankItem = {
  id: string
  name: string
  subtitle?: string
  image?: string
  count?: number
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
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucune donnée pour ce classement.
      </p>
    )
  }

  return (
    <div
      className="overflow-y-auto pr-1"
      style={{ maxHeight: TOP_LIST_MAX_HEIGHT }}
    >
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

export function SpotifyTopsPanel({
  selection,
  wrapped,
  wrappedLoading,
}: {
  selection: SpotifyPeriodSelection
  wrapped: NexusSpotifyWrapped | null
  wrappedLoading: boolean
}) {
  const periodLabel = wrapped?.periodLabel ?? '—'
  const trackItems = normalizeWrappedItems(wrapped?.topTracks ?? [], 'tracks')
  const artistItems = normalizeWrappedItems(wrapped?.topArtists ?? [], 'artists')

  const isCurrentMonth =
    selection.mode === 'year' &&
    selection.year === SPOTIFY_CURRENT_YEAR &&
    selection.month === 'current'

  const recentPlays = isCurrentMonth ? (wrapped?.recentPlays ?? []) : []

  if (wrappedLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <Card className="glass flex h-full flex-col">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="font-heading text-lg">Morceaux · {periodLabel}</CardTitle>
            <p className="text-sm text-muted-foreground">Historique local</p>
          </CardHeader>
          <CardContent className="pt-4">
            <TopRankList items={trackItems} kind="tracks" />
          </CardContent>
        </Card>

        <Card className="glass flex h-full flex-col">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="font-heading text-lg">Artistes · {periodLabel}</CardTitle>
            <p className="text-sm text-muted-foreground">Historique local</p>
          </CardHeader>
          <CardContent className="pt-4">
            <TopRankList items={artistItems} kind="artists" />
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
