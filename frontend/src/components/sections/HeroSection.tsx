import { SiteContainer } from '@/components/layout/SiteContainer'
import { useTranslation } from '@/i18n/I18nProvider'
import { BIRTH_DATE, getAge } from '@/lib/age'
import { ASSETS } from '@/lib/assets'

export function HeroSection() {
  const { t } = useTranslation()
  const age = getAge(BIRTH_DATE)

  return (
    <section id="home" className="relative flex min-h-svh items-center">
      <SiteContainer className="grid w-full items-center gap-12 py-24 pt-32 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold font-heading tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient">{t('hero.title')}</span>
          </h1>
          <p className="mt-4 text-xl font-heading text-gradient-subtle sm:text-2xl">
            {t('hero.subtitle')}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground lg:mx-0">
            {t('hero.bio', { age })}
          </p>
        </div>

        <div className="animate-float mx-auto w-full max-w-xs lg:max-w-md">
          <div className="avatar-triad hero-avatar mx-auto aspect-square w-full max-w-xs lg:max-w-md">
            <div className="avatar-triad-inner">
              <img
                src={ASSETS.profileImage}
                alt={t('hero.avatarAlt')}
                className="size-full object-cover"
              />
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  )
}
