import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatGrid, StatItem } from '@/components/stats/StatCardUi'
import { SpotifyMoodCards } from './SpotifyMoodCards'
import {
  formatListeningHoursMinutes,
  isCurrentMonthSelection,
  periodPlaysLabel,
} from '../lib/spotifyPeriod'
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
  const todayPlays = wrapped?.todayPlays
  const showTodayPlays = isCurrentMonthSelection(selection)

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base">Statistiques · {periodLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div
              className={`grid gap-3 sm:grid-cols-2 ${showTodayPlays ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-4'}`}
            >
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              {showTodayPlays ? <Skeleton className="h-20 rounded-xl" /> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <StatGrid cols={showTodayPlays ? 5 : 4}>
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
              {showTodayPlays ? (
                <StatItem
                  label="Écoutes d'aujourd'hui"
                  value={
                    todayPlays ? (
                      <span className="block space-y-1">
                        <span className="block">{todayPlays.count.toLocaleString('fr-FR')}</span>
                        {todayPlays.estimatedListeningMs > 0 ? (
                          <span className="block text-base font-medium text-muted-foreground">
                            {formatListeningHoursMinutes(todayPlays.estimatedListeningMs)}
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      '—'
                    )
                  }
                  tone="primary"
                />
              ) : null}
            </StatGrid>
            <SpotifyMoodCards />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
