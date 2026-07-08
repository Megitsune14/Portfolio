import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { getSpotifyStatus, postSpotifySync } from '../api/nexusApi'
import { SpotifyTopsPanel } from '../components/SpotifyTopsPanel'
import { useNexusPageTitle } from '../layout/useNexusPageTitle'

export function NexusSpotifyPage() {
  useNexusPageTitle('Spotify')
  const status = useFetch(getSpotifyStatus)
  const [syncing, setSyncing] = useState(false)
  const [topsRefreshKey, setTopsRefreshKey] = useState(0)

  async function handleSync() {
    setSyncing(true)
    try {
      await postSpotifySync(false)
      status.refetch()
      setTopsRefreshKey((k) => k + 1)
    } finally {
      setSyncing(false)
    }
  }

  const s = status.data

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            {status.loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className={`font-semibold ${s?.connected ? 'text-primary' : 'text-muted-foreground'}`}>
                {s?.connected ? `Connecté · ${s.displayName ?? 'Compte'}` : 'Non connecté'}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total écoutes</CardTitle>
          </CardHeader>
          <CardContent>
            {status.loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold font-heading text-accent">
                {s?.totalPlays?.toLocaleString() ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Dernière sync</CardTitle>
          </CardHeader>
          <CardContent>
            {status.loading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <p className="text-sm">
                {s?.sync.lastSyncAt
                  ? new Date(s.sync.lastSyncAt).toLocaleString('fr-FR')
                  : 'Jamais'}
                {s?.sync.lastSyncStatus && (
                  <span className="ml-2 text-muted-foreground">({s.sync.lastSyncStatus})</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {s?.sync.lastSyncError && (
        <Card className="glass border-destructive/40">
          <CardContent className="py-4 text-sm text-destructive">{s.sync.lastSyncError}</CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="font-heading text-lg font-semibold">Tops</h3>
        <SpotifyTopsPanel refreshKey={topsRefreshKey} />
      </div>
    </div>
  )
}
