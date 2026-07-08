import { Music } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  StatCardHeader,
  StatDivider,
  StatPanel,
  StatSection,
  statCardClass,
} from '@/components/stats/StatCardUi'
import { useFetch } from '@/hooks/useFetch'
import { useTranslation } from '@/i18n/I18nProvider'
import { getPortfolioBrandIcons, getSpotifyNowPlaying, getSpotifyRecent } from '@/lib/api'
import type { SpotifyNowPlaying } from '@/types/api'
import { cn } from '@/lib/utils'

function spotifyPollInterval(data: unknown) {
  const track = data as SpotifyNowPlaying | null
  return track?.isPlaying ? 5000 : undefined
}

export function SpotifyCard() {
  const { t } = useTranslation()
  const brandIcons = useFetch(getPortfolioBrandIcons)
  const nowPlaying = useFetch(getSpotifyNowPlaying, { refetchInterval: spotifyPollInterval })
  const recent = useFetch(() => getSpotifyRecent(3), { refetchInterval: 30000, deps: [] })

  const loading = nowPlaying.loading || recent.loading || brandIcons.loading
  const spotifyBrandIcon = brandIcons.data?.spotify
  const headerIcon = spotifyBrandIcon ? (
    <img src={spotifyBrandIcon} alt="" className="size-7 object-contain" />
  ) : (
    <Music className="size-5 text-accent" />
  )

  if (loading) {
    return (
      <Card className={statCardClass}>
        <CardHeader>
          <Skeleton className="h-11 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  const now = nowPlaying.data
  const tracks = recent.data?.tracks ?? []
  const fetchError = nowPlaying.error ?? recent.error

  if (fetchError) {
    return (
      <Card className={statCardClass}>
        <CardHeader>
          <StatCardHeader
            accent="accent"
            icon={headerIcon}
            iconVariant={spotifyBrandIcon ? 'brand' : 'default'}
            title={t('stats.spotify.title')}
          />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('stats.spotify.unavailable')}</p>
        </CardContent>
      </Card>
    )
  }

  const authenticated = now?.authenticated ?? recent.data?.authenticated ?? false

  if (!authenticated) {
    return (
      <Card className={statCardClass}>
        <CardHeader>
          <StatCardHeader
            accent="accent"
            icon={headerIcon}
            iconVariant={spotifyBrandIcon ? 'brand' : 'default'}
            title={t('stats.spotify.title')}
          />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('stats.spotify.notConnected')}</p>
        </CardContent>
      </Card>
    )
  }

  const hasTrack = Boolean(now?.name)
  const progress =
    now?.duration && now.progress !== undefined
      ? Math.min(100, (now.progress / now.duration) * 100)
      : 0

  return (
    <Card className={statCardClass}>
      <CardHeader>
        <StatCardHeader
          accent="accent"
          icon={headerIcon}
          iconVariant={spotifyBrandIcon ? 'brand' : 'default'}
          title={t('stats.spotify.title')}
        />
      </CardHeader>

      <CardContent className="space-y-5">
        <StatSection title={t('stats.spotify.nowPlaying')}>
          {hasTrack ? (
            <StatPanel tone="accent">
              <div className="flex gap-4">
                {now?.image && (
                  <img
                    src={now.image}
                    alt={now.name}
                    className="size-16 shrink-0 rounded-lg object-cover ring-1 ring-accent/40"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{now?.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{now?.artist}</p>
                  <p
                    className={cn(
                      'mt-1.5 text-xs',
                      now?.isPlaying ? 'text-accent' : 'text-muted-foreground',
                    )}
                  >
                    {now?.isPlaying
                      ? t('stats.spotify.nowPlaying')
                      : t('stats.spotify.paused')}
                  </p>
                  {now?.duration ? (
                    <Progress value={progress} className="mt-3 h-1.5" />
                  ) : null}
                </div>
              </div>
            </StatPanel>
          ) : (
            <p className="text-sm text-muted-foreground">{t('stats.spotify.nothingPlaying')}</p>
          )}
        </StatSection>

        {tracks.length > 0 && (
          <>
            <StatDivider />
            <StatSection title={t('stats.spotify.recent')}>
              <ul className="space-y-2">
                {tracks.map((track, index) => (
                  <li
                    key={`${track.name}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-primary/25 bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] px-3 py-2.5"
                  >
                    {track.image ? (
                      <img
                        src={track.image}
                        alt={track.name}
                        className="size-10 shrink-0 rounded object-cover ring-1 ring-primary/35"
                      />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded bg-accent/12 ring-1 ring-accent/30">
                        <Music className="size-4 text-accent" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{track.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </StatSection>
          </>
        )}
      </CardContent>
    </Card>
  )
}
