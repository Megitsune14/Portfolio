import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import {
  getSpotifyPeriods,
  getSpotifyStatus,
  getSpotifyWrapped,
  postSpotifySync,
} from '../api/nexusApi'
import { SpotifyPeriodFilters } from '../components/SpotifyPeriodFilters'
import { SpotifyStatsCard } from '../components/SpotifyStatsCard'
import { SpotifyTopsPanel } from '../components/SpotifyTopsPanel'
import { defaultSpotifyPeriodSelection } from '../lib/spotifyPeriod'
import { useNexusPageTitle } from '../layout/useNexusPageTitle'
import type { SpotifyPeriodSelection } from '../types/nexus'

export function NexusSpotifyPage() {
  useNexusPageTitle('Spotify')
  const status = useFetch(getSpotifyStatus)
  const periods = useFetch(getSpotifyPeriods)
  const [selection, setSelection] = useState<SpotifyPeriodSelection>(defaultSpotifyPeriodSelection)
  const wrapped = useFetch(() => getSpotifyWrapped(selection), { deps: [selection] })
  const [syncing, setSyncing] = useState(false)
  const [topsRefreshKey, setTopsRefreshKey] = useState(0)

  async function handleSync() {
    setSyncing(true)
    try {
      await postSpotifySync(false)
      await Promise.all([status.refetch(), periods.refetch(), wrapped.refetch()])
      setTopsRefreshKey((k) => k + 1)
    } finally {
      setSyncing(false)
    }
  }

  const s = status.data
  const displayName = s?.displayName ?? s?.token?.displayName

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading tracking-tight">Spotify</h2>
          <p className="mt-1 text-sm text-muted-foreground">Administration et statistiques</p>
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline">
          <RefreshCw className={`size-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Synchronisation…' : 'Synchroniser'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {status.loading ? (
          <Skeleton className="h-5 w-80 max-w-full" />
        ) : (
          <>
            <span className="text-muted-foreground">
              Connexion :{' '}
              <span className={s?.connected ? 'font-medium text-primary' : 'text-muted-foreground'}>
                {s?.connected
                  ? `Connecté · ${displayName ?? 'Compte'}`
                  : 'Non connecté'}
              </span>
            </span>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-muted-foreground">
              Dernière sync :{' '}
              {s?.sync.lastSyncAt
                ? new Date(s.sync.lastSyncAt).toLocaleString('fr-FR')
                : 'Jamais'}
              {s?.sync.lastSyncStatus ? (
                <span className="ml-1">({s.sync.lastSyncStatus})</span>
              ) : null}
            </span>
          </>
        )}
      </div>

      {s?.sync.lastSyncError && (
        <Card className="glass border-destructive/40">
          <CardContent className="py-4 text-sm text-destructive">{s.sync.lastSyncError}</CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <SpotifyPeriodFilters
          selection={selection}
          onSelectionChange={setSelection}
          periods={periods.data}
        />
        <SpotifyStatsCard
          selection={selection}
          wrapped={wrapped.data}
          totalPlays={s?.totalPlays ?? 0}
          loading={status.loading || wrapped.loading}
        />
      </div>

      <div className="space-y-3">
        <h3 className="font-heading text-lg font-semibold">Tops</h3>
        <SpotifyTopsPanel
          selection={selection}
          wrapped={wrapped.data}
          wrappedLoading={wrapped.loading}
          refreshKey={topsRefreshKey}
        />
      </div>
    </div>
  )
}
