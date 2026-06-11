import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { NexusPageLayout } from '../components/nexus/NexusPageLayout';
import { btnGhost, btnPrimary } from '../lib/goals/ui';
import type {
  SpotifyNexusStatus,
  SpotifySnapshot,
  WrappedAllTime,
  WrappedSummary,
} from '../types/spotify-wrapped';
import { spotifyApiRequest, triggerSpotifySync } from '../utils/nexus-spotify-api';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type Period = 'year' | 'all-time';

const TIME_RANGE_LABELS: Record<string, string> = {
  short_term: '4 semaines',
  medium_term: '6 mois',
  long_term: 'Depuis toujours',
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-jp text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function TopList({
  title,
  items,
  showArtist = false,
}: {
  title: string;
  items: { name: string; count?: number; artist?: string; image?: string }[];
  showArtist?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="surface-panel p-6">
        <h3 className="mb-4 font-jp text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted">Aucune donnée pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="surface-panel p-6">
      <h3 className="mb-4 font-jp text-lg font-bold text-foreground">{title}</h3>
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-3">
            <span className="w-6 text-sm font-semibold text-(--primary)">{index + 1}</span>
            {item.image ? (
              <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-(--secondary)" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
              {showArtist && item.artist && (
                <p className="truncate text-xs text-muted">{item.artist}</p>
              )}
            </div>
            {item.count != null && (
              <span className="text-xs text-muted">{item.count} écoutes</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function formatSyncDate(iso: string | null): string {
  if (!iso) return 'Jamais';
  return new Date(iso).toLocaleString('fr-FR');
}

export default function NexusSpotifyPage() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [activePeriod, setActivePeriod] = useState<Period>('year');

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
      <NexusPageLayout title="Spotify">
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-(--primary)" />
        </div>
      </NexusPageLayout>
    );
  }

  const status = statusQuery.data;

  if (!status?.connected) {
    return (
      <NexusPageLayout title="Spotify">
        <div className="surface-panel mx-auto max-w-lg p-8 text-center">
          <h2 className="font-jp text-xl font-bold text-foreground">Spotify non connecté</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Connecte ton compte Spotify depuis la section Stats du portfolio pour activer la
            synchronisation en arrière-plan. Les statistiques apparaîtront ici une fois la première
            sync effectuée.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={`${API_BASE}/spotify/auth/login`} className={btnPrimary}>
              Connecter Spotify
            </a>
            <Link to="/#stats" className={btnGhost}>
              Aller aux Stats
            </Link>
          </div>
        </div>
      </NexusPageLayout>
    );
  }

  const wrappedLoading =
    activePeriod === 'year' ? wrappedYearQuery.isLoading : wrappedAllTimeQuery.isLoading;
  const wrappedData =
    activePeriod === 'year' ? wrappedYearQuery.data : wrappedAllTimeQuery.data;
  const snapshots = snapshotsQuery.data ?? [];

  return (
    <NexusPageLayout title="Spotify Wrapped">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-muted">
          {status.displayName && (
            <span className="font-medium text-foreground">{status.displayName}</span>
          )}
          {status.displayName && ' · '}
          Dernière sync : {formatSyncDate(status.sync.lastSyncAt)}
          {status.sync.lastSyncStatus === 'error' && status.sync.lastSyncError && (
            <span className="ml-2 text-(--primary)">({status.sync.lastSyncError})</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending || status.sync.lastSyncStatus === 'running'}
          className={btnPrimary}
        >
          {syncMutation.isPending ? 'Synchronisation…' : 'Synchroniser'}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActivePeriod('year')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            activePeriod === 'year'
              ? 'bg-(--primary) text-(--primary-foreground)'
              : 'border border-theme text-muted hover:bg-(--secondary)'
          }`}
        >
          Année {currentYear}
        </button>
        <button
          type="button"
          onClick={() => setActivePeriod('all-time')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            activePeriod === 'all-time'
              ? 'bg-(--primary) text-(--primary-foreground)'
              : 'border border-theme text-muted hover:bg-(--secondary)'
          }`}
        >
          Tout l&apos;historique
        </button>
      </div>

      {wrappedLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-(--primary)" />
        </div>
      ) : !wrappedData ? (
        <div className="surface-panel p-6 text-sm text-muted">
          Aucune statistique disponible. Lance une synchronisation ou écoute de la musique pour
          commencer à accumuler des données.
        </div>
      ) : (
        <>
          {activePeriod === 'all-time' && wrappedAllTimeQuery.data && (
            <p className="mb-4 text-sm text-muted">
              {wrappedAllTimeQuery.data.firstPlayAt && wrappedAllTimeQuery.data.lastPlayAt
                ? `Du ${new Date(wrappedAllTimeQuery.data.firstPlayAt).toLocaleDateString('fr-FR')} au ${new Date(wrappedAllTimeQuery.data.lastPlayAt).toLocaleDateString('fr-FR')}`
                : 'Historique en cours de constitution'}
            </p>
          )}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Écoutes" value={String(wrappedData.totalPlays)} />
            <StatCard label="Morceaux uniques" value={String(wrappedData.uniqueTracks)} />
            <StatCard label="Artistes uniques" value={String(wrappedData.uniqueArtists)} />
            <StatCard label="Temps estimé" value={wrappedData.estimatedListeningTime} />
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <StatCard label="Mois le plus actif" value={wrappedData.mostActiveMonth?.label ?? '—'} />
            <StatCard label="Jour le plus actif" value={wrappedData.mostActiveDay?.label ?? '—'} />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <TopList
              title="Top artistes"
              items={wrappedData.topArtists.map((a) => ({ name: a.name, count: a.count }))}
            />
            <TopList
              title="Top morceaux"
              showArtist
              items={wrappedData.topTracks.map((t) => ({
                name: t.name,
                artist: t.artist,
                image: t.image,
                count: t.count,
              }))}
            />
          </div>
        </>
      )}

      {snapshotsQuery.isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-(--primary)" />
        </div>
      ) : (
        <section className="mt-8 space-y-6">
          <h2 className="font-jp text-xl font-bold text-foreground">Tops Spotify</h2>
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
        </section>
      )}
    </NexusPageLayout>
  );
}
