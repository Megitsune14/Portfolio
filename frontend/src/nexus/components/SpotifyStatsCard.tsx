import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatGrid, StatItem } from '@/components/stats/StatCardUi'
import { formatListeningHoursMinutes, periodPlaysLabel } from '../lib/spotifyPeriod'
import type { NexusSpotifyWrapped, SpotifyPeriodSelection } from '../types/nexus'

export function SpotifyStatsCard({
  selection,
  wrapped,
  totalPlays,
  loading,
}: {
  selection: SpotifyPeriodSelection
  wrapped: NexusSpotifyWrapped | null
  totalPlays: number
  loading: boolean
}) {
  const periodLabel = wrapped?.periodLabel ?? '—'
  const periodPlays = wrapped?.totalPlays ?? 0
  const activeDay = wrapped?.mostActiveDay
  const listeningMs = wrapped?.estimatedListeningMs ?? 0

  const activeDayListeningMs = activeDay?.estimatedListeningMs ?? 0

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base">Statistiques · {periodLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : (
          <StatGrid cols={4}>
            <StatItem
              label="Total écoutes"
              value={totalPlays.toLocaleString('fr-FR')}
              tone="accent"
            />
            <StatItem
              label={periodPlaysLabel(selection, periodLabel)}
              value={periodPlays.toLocaleString('fr-FR')}
              tone="primary"
            />
            <StatItem
              label="Jour le plus actif"
              value={
                activeDay ? (
                  <span className="block space-y-1">
                    <span className="block">{activeDay.label}</span>
                    {activeDayListeningMs > 0 ? (
                      <span className="block text-base font-medium text-muted-foreground">
                        {formatListeningHoursMinutes(activeDayListeningMs)}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  '—'
                )
              }
              tone="gold"
            />
            <StatItem
              label="Temps d'écoute"
              value={listeningMs > 0 ? formatListeningHoursMinutes(listeningMs) : '—'}
              tone="accent"
            />
          </StatGrid>
        )}
      </CardContent>
    </Card>
  )
}
