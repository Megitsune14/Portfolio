import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { NexusPageHeader } from '@/components/nexus/NexusPageHeader';
import { NexusLoadingState } from '@/components/nexus/NexusStates';
import { SpotifyTopPanel } from '@/components/nexus/spotify/SpotifyTopPanel';
import { SpotifyWrappedPanel } from '@/components/nexus/spotify/SpotifyWrappedPanel';
import { SpotifyWrappedPeriodSelect } from '@/components/nexus/spotify/SpotifyWrappedPeriodSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { WrappedPeriodSelection } from '@/types/spotify-wrapped';
import {
  fetchSpotifyPeriods,
  fetchSpotifyTops,
  fetchSpotifyWrapped,
  spotifyApiRequest,
  triggerSpotifySync,
} from '@/utils/nexus-spotify-api';
import type { SpotifyNexusStatus } from '@/types/spotify-wrapped';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function formatSyncDate(iso: string | null): string {
  if (!iso) return 'Jamais';
  return new Date(iso).toLocaleString('fr-FR');
}

function wrappedQueryKey(selection: WrappedPeriodSelection) {
  if (selection.kind === 'all-time') return ['nexus-spotify-wrapped', 'all-time'] as const;
  if (selection.kind === 'year') return ['nexus-spotify-wrapped', 'year', selection.year] as const;
  return ['nexus-spotify-wrapped', 'month', selection.year, selection.month] as const;
}

export default function NexusSpotifyPage() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [periodSelection, setPeriodSelection] = useState<WrappedPeriodSelection>({
    kind: 'year',
    year: currentYear,
  });

  const statusQuery = useQuery({
    queryKey: ['nexus-spotify-status'],
    queryFn: () => spotifyApiRequest<SpotifyNexusStatus>('/status'),
  });

  const periodsQuery = useQuery({
    queryKey: ['nexus-spotify-periods'],
    queryFn: fetchSpotifyPeriods,
    enabled: statusQuery.data?.connected === true,
  });

  const wrappedQuery = useQuery({
    queryKey: wrappedQueryKey(periodSelection),
    queryFn: () => fetchSpotifyWrapped(periodSelection),
    enabled: statusQuery.data?.connected === true,
  });

  const topsQuery = useQuery({
    queryKey: ['nexus-spotify-tops'],
    queryFn: fetchSpotifyTops,
    enabled: statusQuery.data?.connected === true,
  });

  const syncMutation = useMutation({
    mutationFn: () => triggerSpotifySync(false),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['nexus-spotify-status'] });
      void queryClient.invalidateQueries({ queryKey: ['nexus-spotify-periods'] });
      void queryClient.invalidateQueries({ queryKey: ['nexus-spotify-wrapped'] });
      void queryClient.invalidateQueries({ queryKey: ['nexus-spotify-tops'] });
    },
  });

  const bubbles = useMemo(() => topsQuery.data?.bubbles ?? [], [topsQuery.data]);

  if (statusQuery.isLoading) {
    return (
      <>
        <NexusPageHeader title="Spotify" />
        <NexusLoadingState />
      </>
    );
  }

  const status = statusQuery.data;

  if (!status?.connected) {
    return (
      <>
        <NexusPageHeader
          title="Spotify"
          description="Statistiques d'écoute — wrapped, tops et historique synchronisés."
        />
        <Card className="mx-auto max-w-lg text-center">
          <CardContent className="space-y-4 p-8">
            <h2 className="font-jp text-xl font-bold text-foreground">Spotify non connecté</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Connecte ton compte Spotify depuis la section Stats du portfolio pour activer la
              synchronisation en arrière-plan.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <a href={`${API_BASE}/spotify/auth/login`}>Connecter Spotify</a>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/#stats">Aller aux Stats</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <NexusPageHeader
        title="Spotify Wrapped"
        description="Statistiques d'écoute synchronisées depuis ton compte Spotify."
        actions={
          <>
            <Badge variant={status.sync.lastSyncStatus === 'error' ? 'destructive' : 'secondary'}>
              {status.displayName ?? 'Connecté'}
            </Badge>
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending || status.sync.lastSyncStatus === 'running'}
            >
              {syncMutation.isPending ? 'Synchronisation…' : 'Synchroniser'}
            </Button>
          </>
        }
      />

      <p className="mb-6 text-sm text-muted-foreground">
        Dernière sync : {formatSyncDate(status.sync.lastSyncAt)}
        {status.sync.lastSyncStatus === 'error' && status.sync.lastSyncError ? (
          <span className="ml-2 text-primary">({status.sync.lastSyncError})</span>
        ) : null}
      </p>

      <section className="mb-8 space-y-4">
        <SpotifyWrappedPeriodSelect
          periods={periodsQuery.data}
          selection={periodSelection}
          onChange={setPeriodSelection}
        />

        {wrappedQuery.isLoading ? (
          <NexusLoadingState />
        ) : !wrappedQuery.data ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Aucune statistique disponible. Lance une synchronisation ou écoute de la musique pour
              commencer à accumuler des données.
            </CardContent>
          </Card>
        ) : (
          <SpotifyWrappedPanel data={wrappedQuery.data} />
        )}
      </section>

      <section>
        {topsQuery.isLoading ? (
          <NexusLoadingState />
        ) : (
          <SpotifyTopPanel bubbles={bubbles} />
        )}
      </section>
    </>
  );
}
