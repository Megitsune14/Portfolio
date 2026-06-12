import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BarChart3, Music2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NexusPageHeader } from '@/components/nexus/NexusPageHeader';
import { NexusStatCard } from '@/components/nexus/NexusStatCard';
import { NexusLoadingState, NexusStatCardSkeleton } from '@/components/nexus/NexusStates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardResponse } from '@/types/goals';
import type { SpotifyNexusStatus, WrappedSummary } from '@/types/spotify-wrapped';
import { fetchVisitorStats } from '@/utils/nexus-api';
import { goalsApiRequest } from '@/utils/nexus-goals-api';
import { spotifyApiRequest } from '@/utils/nexus-spotify-api';

function formatSyncDate(iso: string | null): string {
  if (!iso) return 'Jamais';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NexusHomePage() {
  const currentYear = new Date().getFullYear();

  const statsQuery = useQuery({
    queryKey: ['nexus-visitor-stats'],
    queryFn: fetchVisitorStats,
  });

  const goalsQuery = useQuery({
    queryKey: ['nexus-goals-dashboard'],
    queryFn: () => goalsApiRequest<DashboardResponse>('/dashboard'),
  });

  const spotifyStatusQuery = useQuery({
    queryKey: ['nexus-spotify-status'],
    queryFn: () => spotifyApiRequest<SpotifyNexusStatus>('/status'),
  });

  const spotifyWrappedQuery = useQuery({
    queryKey: ['nexus-spotify-wrapped', currentYear],
    queryFn: () => spotifyApiRequest<WrappedSummary>(`/wrapped?year=${currentYear}`),
    enabled: spotifyStatusQuery.data?.connected === true,
  });

  const isLoading =
    statsQuery.isLoading || goalsQuery.isLoading || spotifyStatusQuery.isLoading;

  if (isLoading) {
    return (
      <>
        <NexusPageHeader title="Accueil" description="Vue d'ensemble de ton back-office Nexus." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <NexusStatCardSkeleton />
          <NexusStatCardSkeleton />
          <NexusStatCardSkeleton />
        </div>
        <NexusLoadingState />
      </>
    );
  }

  const goalsSummary = goalsQuery.data?.summary;
  const spotifyStatus = spotifyStatusQuery.data;
  const topTrack = spotifyWrappedQuery.data?.topTracks[0];

  return (
    <>
      <NexusPageHeader
        title="Accueil"
        description="Vue d'ensemble de ton back-office Nexus — visites, objectifs et écoute Spotify."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                Analytics
              </CardTitle>
              <CardDescription>Visites du portfolio</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/nexus/analytics">
                Voir tout
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <NexusStatCard
              label="Visites totales"
              value={statsQuery.data?.totalVisits ?? 0}
              className="shadow-none"
            />
            <NexusStatCard
              label="IPs uniques"
              value={statsQuery.data?.uniqueIps ?? 0}
              className="shadow-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Goals
              </CardTitle>
              <CardDescription>Suivi du poids et des objectifs</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/nexus/goals/dashboard">
                Voir tout
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {goalsQuery.isError || !goalsSummary ? (
              <p className="text-sm text-muted-foreground sm:col-span-2">
                Profil non configuré —{' '}
                <Link to="/nexus/goals/onboarding" className="text-primary underline-offset-4 hover:underline">
                  commencer l&apos;onboarding
                </Link>
              </p>
            ) : (
              <>
                <NexusStatCard
                  label="Poids actuel"
                  value={
                    goalsSummary.currentWeight != null ? `${goalsSummary.currentWeight} kg` : '—'
                  }
                  className="shadow-none"
                />
                <NexusStatCard
                  label="Objectifs actifs"
                  value={goalsSummary.activeGoalsCount}
                  className="shadow-none"
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Music2 className="size-5 text-primary" />
                Spotify
              </CardTitle>
              <CardDescription>Statistiques d&apos;écoute</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/nexus/spotify">
                Voir tout
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {!spotifyStatus?.connected ? (
              <p className="text-sm text-muted-foreground">
                Spotify non connecté — connecte ton compte depuis la section Stats du portfolio.
              </p>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {spotifyStatus.displayName ?? 'Compte connecté'}
                  </span>
                  <br />
                  Dernière sync : {formatSyncDate(spotifyStatus.sync.lastSyncAt)}
                </div>
                {topTrack ? (
                  <div className="rounded-xl border border-border bg-secondary/30 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Top morceau {currentYear}
                    </p>
                    <p className="mt-1 font-medium text-foreground">{topTrack.name}</p>
                    <p className="text-sm text-muted-foreground">{topTrack.artist}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune donnée pour l&apos;instant.</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
