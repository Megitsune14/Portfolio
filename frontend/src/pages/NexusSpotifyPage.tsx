import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { NexusPageHeader } from '@/components/nexus/NexusPageHeader';
import { NexusStatCard } from '@/components/nexus/NexusStatCard';
import { NexusLoadingState } from '@/components/nexus/NexusStates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  SpotifyNexusStatus,
  SpotifySnapshot,
  WrappedAllTime,
  WrappedSummary,
} from '@/types/spotify-wrapped';
import { spotifyApiRequest, triggerSpotifySync } from '@/utils/nexus-spotify-api';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const TIME_RANGE_LABELS: Record<string, string> = {
  short_term: '4 semaines',
  medium_term: '6 mois',
  long_term: 'Depuis toujours',
};

function TopList({
  title,
  items,
  showArtist = false,
}: {
  title: string;
  items: { name: string; count?: number; artist?: string; image?: string }[];
  showArtist?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune donnée pour le moment.</p>
        ) : (
          <ol className="space-y-3">
            {items.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex items-center gap-3">
                <span className="w-6 text-sm font-semibold text-primary">{index + 1}</span>
                {item.image ? (
                  <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-secondary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  {showArtist && item.artist ? (
                    <p className="truncate text-xs text-muted-foreground">{item.artist}</p>
                  ) : null}
                </div>
                {item.count != null ? (
                  <span className="text-xs text-muted-foreground">{item.count} écoutes</span>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function formatSyncDate(iso: string | null): string {
  if (!iso) return 'Jamais';
  return new Date(iso).toLocaleString('fr-FR');
}

function WrappedStats({ data }: { data: WrappedSummary | WrappedAllTime }) {
  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NexusStatCard label="Écoutes" value={String(data.totalPlays)} />
        <NexusStatCard label="Morceaux uniques" value={String(data.uniqueTracks)} />
        <NexusStatCard label="Artistes uniques" value={String(data.uniqueArtists)} />
        <NexusStatCard label="Temps estimé" value={data.estimatedListeningTime} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <NexusStatCard label="Mois le plus actif" value={data.mostActiveMonth?.label ?? '—'} />
        <NexusStatCard label="Jour le plus actif" value={data.mostActiveDay?.label ?? '—'} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <TopList
          title="Top artistes"
          items={data.topArtists.map((a) => ({ name: a.name, count: a.count }))}
        />
        <TopList
          title="Top morceaux"
          showArtist
          items={data.topTracks.map((t) => ({
            name: t.name,
            artist: t.artist,
            image: t.image,
            count: t.count,
          }))}
        />
      </div>
    </>
  );
}

export default function NexusSpotifyPage() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  const statusQuery = useQuery({
    queryKey: ['nexus-spotify-status'],
    queryFn: () => spotifyApiRequest<SpotifyNexusStatus>('/status'),
  });

  const wrappedYearQuery = useQuery({
    queryKey: ['nexus-spotify-wrapped', currentYear],
    queryFn: () => spotifyApiRequest<WrappedSummary>(`/wrapped?year=${currentYear}`),
    enabled: statusQuery.data?.connected === true,
  });

  const wrappedAllTimeQuery = useQuery({
    queryKey: ['nexus-spotify-wrapped-all-time'],
    queryFn: () => spotifyApiRequest<WrappedAllTime>('/wrapped/all-time'),
    enabled: statusQuery.data?.connected === true,
  });

  const snapshotsQuery = useQuery({
    queryKey: ['nexus-spotify-top'],
    queryFn: () => spotifyApiRequest<SpotifySnapshot[]>('/top'),
    enabled: statusQuery.data?.connected === true,
  });

  const syncMutation = useMutation({
    mutationFn: () => triggerSpotifySync(false),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['nexus-spotify-status'] });
      void queryClient.invalidateQueries({ queryKey: ['nexus-spotify-wrapped'] });
      void queryClient.invalidateQueries({ queryKey: ['nexus-spotify-wrapped-all-time'] });
      void queryClient.invalidateQueries({ queryKey: ['nexus-spotify-top'] });
    },
  });

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
          description="Statistiques d'écoute — wrapped annuel, historique et tops Spotify."
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

  const snapshots = snapshotsQuery.data ?? [];

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

      <Tabs defaultValue="year" className="mb-8">
        <TabsList role="tablist" aria-label="Période des statistiques">
          <TabsTrigger value="year" role="tab">
            Année {currentYear}
          </TabsTrigger>
          <TabsTrigger value="all-time" role="tab">
            Tout l&apos;historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="year" className="mt-6">
          {wrappedYearQuery.isLoading ? (
            <NexusLoadingState />
          ) : !wrappedYearQuery.data ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Aucune statistique disponible. Lance une synchronisation ou écoute de la musique pour
                commencer à accumuler des données.
              </CardContent>
            </Card>
          ) : (
            <WrappedStats data={wrappedYearQuery.data} />
          )}
        </TabsContent>

        <TabsContent value="all-time" className="mt-6">
          {wrappedAllTimeQuery.isLoading ? (
            <NexusLoadingState />
          ) : !wrappedAllTimeQuery.data ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Aucune statistique disponible pour l&apos;historique complet.
              </CardContent>
            </Card>
          ) : (
            <>
              {wrappedAllTimeQuery.data.firstPlayAt && wrappedAllTimeQuery.data.lastPlayAt ? (
                <p className="mb-4 text-sm text-muted-foreground">
                  Du {new Date(wrappedAllTimeQuery.data.firstPlayAt).toLocaleDateString('fr-FR')} au{' '}
                  {new Date(wrappedAllTimeQuery.data.lastPlayAt).toLocaleDateString('fr-FR')}
                </p>
              ) : null}
              <WrappedStats data={wrappedAllTimeQuery.data} />
            </>
          )}
        </TabsContent>
      </Tabs>

      <section className="space-y-6">
        <h2 className="font-jp text-xl font-bold text-foreground">Tops Spotify</h2>
        {snapshotsQuery.isLoading ? (
          <NexusLoadingState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {(['top_artists', 'top_tracks'] as const).flatMap((type) =>
              (['short_term', 'medium_term', 'long_term'] as const).map((range) => {
                const snapshot = snapshots.find((s) => s.type === type && s.timeRange === range);
                const title =
                  type === 'top_artists'
                    ? `Artistes — ${TIME_RANGE_LABELS[range]}`
                    : `Morceaux — ${TIME_RANGE_LABELS[range]}`;

                return (
                  <TopList
                    key={`${type}-${range}`}
                    title={title}
                    showArtist={type === 'top_tracks'}
                    items={(snapshot?.items ?? []).map((item) => ({
                      name: item.name,
                      artist: item.artist,
                      image: item.image,
                    }))}
                  />
                );
              }),
            )}
          </div>
        )}
      </section>
    </>
  );
}
