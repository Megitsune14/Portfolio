import { SiteContainer, SiteSection } from '@/components/layout/SiteContainer'
import { DiscordCard } from '@/components/stats/DiscordCard'
import { LoLCard } from '@/components/stats/LoLCard'
import { SpotifyCard } from '@/components/stats/SpotifyCard'
import { useTranslation } from '@/i18n/I18nProvider'

export function StatsSection() {
  const { t } = useTranslation()

  return (
    <SiteSection id="stats" className="section-alt">
      <SiteContainer>
        <div className="text-center">
          <h2 className="text-2xl font-bold font-heading tracking-tight sm:text-3xl">
            {t('stats.title')}
          </h2>
        </div>

        <div className="mt-14 flex flex-col gap-6">
          <DiscordCard />
          <SpotifyCard />
          <LoLCard />
        </div>
      </SiteContainer>
    </SiteSection>
  )
}
