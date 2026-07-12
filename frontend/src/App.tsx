import { useEffect } from 'react'
import {
  BadAppleContentWrapper,
  BadAppleOverlay,
  BadAppleProvider,
} from '@/components/easter-egg/BadAppleEasterEgg'
import { BackgroundEffects } from '@/components/layout/BackgroundEffects'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { SocialSection } from '@/components/sections/SocialSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { I18nProvider } from '@/i18n/I18nProvider'
import { trackVisit } from '@/lib/api'

function AppContent() {
  useEffect(() => {
    void trackVisit('/')
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <BackgroundEffects />
      <BadAppleContentWrapper>
        <Navbar />
        <main>
          <HeroSection />
          <ProjectsSection />
          <SocialSection />
          <StatsSection />
        </main>
        <Footer />
      </BadAppleContentWrapper>
      <BadAppleOverlay />
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <BadAppleProvider>
        <AppContent />
      </BadAppleProvider>
    </I18nProvider>
  )
}
