import { MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  StatDivider,
  StatGrid,
  StatItem,
  StatSection,
  StatTag,
  statCardClass,
} from '@/components/stats/StatCardUi'
import { useFetch } from '@/hooks/useFetch'
import { useTranslation } from '@/i18n/I18nProvider'
import { getDiscordProfile } from '@/lib/api'
import { cn } from '@/lib/utils'

/** Bannière Discord : pleine largeur, 240px de hauteur */
const bannerClass = 'relative h-[240px] w-full shrink-0 overflow-hidden'

export function DiscordCard() {
  const { t, locale } = useTranslation()
  const { data, error, loading } = useFetch(getDiscordProfile)

  if (loading) {
    return (
      <Card className={cn(statCardClass, 'gap-0 overflow-hidden pt-0')}>
        <Skeleton className={cn(bannerClass, 'rounded-none')} />
        <CardHeader>
          <Skeleton className="h-11 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className={statCardClass}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/40">
              <MessageCircle className="size-5 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold">{t('stats.discord.title')}</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('stats.discord.unavailable')}</p>
        </CardContent>
      </Card>
    )
  }

  const createdAt = new Date(data.accountCreatedAt).toLocaleDateString(
    locale === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )

  return (
    <Card className={cn(statCardClass, 'gap-0 overflow-hidden pt-0')}>
      <div className="relative w-full shrink-0">
        <div
          className={bannerClass}
          style={{ backgroundColor: data.accentColor ?? 'var(--primary)' }}
        >
          {data.bannerUrl && (
            <img
              src={data.bannerUrl}
              alt=""
              className="absolute inset-0 size-full object-cover object-top"
            />
          )}
        </div>
        <div className="absolute bottom-0 left-4 z-10 translate-y-1/2 md:left-6">
          <div className="avatar-triad size-16 md:size-20">
            <div className="avatar-triad-inner">
              <img
                src={data.avatarUrl}
                alt={data.displayName}
                className="size-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pb-6 pt-12 md:pt-14">
        <div className="min-w-0">
          <h3 className="font-heading text-xl font-semibold tracking-tight text-gradient">
            {data.displayName}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{data.handle}</p>
          {data.premiumLabel && data.premiumType !== 'none' && (
            <p className="mt-2 text-sm text-accent">{data.premiumLabel}</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        <StatGrid>
          <StatItem label={t('stats.discord.created')} value={createdAt} tone="primary" />
          {data.primaryGuildTag && (
            <StatItem
              label={t('stats.discord.guildTag')}
              value={data.primaryGuildTag}
              tone="accent"
            />
          )}
        </StatGrid>

        {data.badges.length > 0 && (
          <>
            <StatDivider />
            <StatSection title={t('stats.discord.badges')}>
              <div className="flex flex-wrap gap-2">
                {data.badges.map((badge) => (
                  <StatTag key={badge.id}>{badge.label}</StatTag>
                ))}
              </div>
            </StatSection>
          </>
        )}
      </CardContent>
    </Card>
  )
}
