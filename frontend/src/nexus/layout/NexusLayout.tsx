import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { SiteContainer } from '@/components/layout/SiteContainer'
import { NexusHeader } from './NexusHeader'
import { NexusSidebar } from './NexusSidebar'

export function NexusLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-svh bg-background">
      <NexusSidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />
      <div className="flex min-h-svh flex-col lg:pl-64">
        <NexusHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <SiteContainer>
            <Outlet />
          </SiteContainer>
        </main>
      </div>
    </div>
  )
}
