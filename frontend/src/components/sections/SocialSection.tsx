import { SiteContainer, SiteSection } from '@/components/layout/SiteContainer'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { useTranslation } from '@/i18n/I18nProvider'
import { getPortfolioSocial } from '@/lib/api'
import { pickLocalized, pickOptionalLocalized } from '@/lib/localized'
import { PortfolioSectionTitle, SocialCard, PortfolioEmptyState } from './PortfolioCardUi'

export function SocialSection() {
  const { t, locale } = useTranslation()
  const { data: socialLinks, loading, error } = useFetch(getPortfolioSocial)
  const list = socialLinks ?? []

  return (
    <SiteSection id="social">
      <SiteContainer>
        <PortfolioSectionTitle>{t('social.title')}</PortfolioSectionTitle>

        {loading ? (
          <div className="mt-14 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-18 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <PortfolioEmptyState message={t('social.unavailable')} />
        ) : list.length === 0 ? (
          <PortfolioEmptyState message={t('social.empty')} />
        ) : (
          <div className="mt-14 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((link, index) => (
              <SocialCard
                key={link.id}
                index={index}
                name={pickLocalized(link.name, locale)}
                username={pickOptionalLocalized(link.username, locale)}
                url={link.url}
                icon={link.icon}
              />
            ))}
          </div>
        )}
      </SiteContainer>
    </SiteSection>
  )
}
