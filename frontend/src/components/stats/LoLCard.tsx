import { Swords } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  StatCardHeader,
  StatChampionRow,
  StatDivider,
  StatGrid,
  StatItem,
  StatPanel,
  StatRankBanner,
  StatSection,
  statCardClass,
} from '@/components/stats/StatCardUi'
import { useFetch } from '@/hooks/useFetch'
import { useTranslation } from '@/i18n/I18nProvider'
import { getRiotStats } from '@/lib/api'
import { formatRankLabel } from '@/lib/lol'

export function LoLCard() {
  const { t } = useTranslation()
  const { data, error, loading } = useFetch(getRiotStats)

  if (loading) {
    return (
      <Card className={statCardClass}>
        <CardHeader>
          <Skeleton className="h-11 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className={statCardClass}>
        <CardHeader>
          <StatCardHeader
            icon={<Swords className="size-5 text-primary" />}
            title={t('stats.lol.title')}
          />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('stats.lol.unavailable')}</p>
        </CardContent>
      </Card>
    )
  }

  const topChampions = data.topMastery.champions.slice(0, 3)

  return (
    <Card className={statCardClass}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <StatCardHeader
            accent="gold"
            icon={
              data.icon ? (
                <img src={data.icon} alt="" className="size-full object-cover" />
              ) : (
                <Swords className="size-5 text-(--gold)" />
              )
            }
            title={t('stats.lol.title')}
            subtitle={data.riotId}
          />
          <div className="shrink-0 text-right">
            <p className="text-xs text-muted-foreground">{t('stats.lol.level')}</p>
            <p className="text-2xl font-bold font-heading text-(--gold)">
              {data.summonerLevel}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        <StatDivider />

        <StatSection title={t('stats.lol.mastery')}>
          <StatGrid>
            <StatItem
              label={t('stats.lol.masteryLevels')}
              value={data.topMastery.totalLevel.toLocaleString()}
              highlight
              tone="gold"
            />
            <StatItem
              label={t('stats.lol.masteryPoints')}
              value={data.topMastery.totalPoints.toLocaleString()}
              tone="accent"
            />
          </StatGrid>
        </StatSection>

        {topChampions.length > 0 && (
          <>
            <StatDivider />
            <StatSection title={t('stats.lol.topChampions')}>
              <ul className="space-y-3">
                {topChampions.map((champion, index) => (
                  <StatChampionRow
                    key={champion.championId}
                    rank={index + 1}
                    name={champion.championName}
                    masteryLevel={champion.masteryLevel}
                    masteryPoints={champion.masteryPoints}
                    masteryLabel={t('stats.lol.championMastery')}
                    pointsLabel={t('stats.lol.championPoints')}
                  />
                ))}
              </ul>
            </StatSection>
          </>
        )}

        <StatDivider />

        {data.rank ? (
          <StatRankBanner
            label={t('stats.lol.rank')}
            rank={formatRankLabel(data.rank)}
            lp={data.rank.lp}
            record={`${data.rank.wins} / ${data.rank.losses}`}
            winRate={data.rank.winRate}
            lpLabel={t('stats.lol.lp')}
            recordLabel={t('stats.lol.record')}
            winRateLabel={t('stats.lol.winRate')}
          />
        ) : (
          <StatPanel className="border-primary/30" tone="primary">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t('stats.lol.rank')}
            </p>
            <p className="mt-1 text-2xl font-bold font-heading text-muted-foreground">
              {t('stats.lol.unranked')}
            </p>
          </StatPanel>
        )}
      </CardContent>
    </Card>
  )
}
