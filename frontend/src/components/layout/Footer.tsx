import { SiteContainer } from '@/components/layout/SiteContainer'
import { useTranslation } from '@/i18n/I18nProvider'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 py-6 sm:py-8">
      <SiteContainer>
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year })}
          </p>
        </div>
      </SiteContainer>
    </footer>
  )
}
