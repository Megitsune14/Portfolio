import { useEffect } from 'react'
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
      <Navbar />
      <main>
        <HeroSection />
        <ProjectsSection />
        <SocialSection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}
