import { useQuery } from '@tanstack/react-query';
import { NexusPageHeader } from '@/components/nexus/NexusPageHeader';
import { NexusStatCard } from '@/components/nexus/NexusStatCard';
import { NexusErrorState, NexusLoadingState } from '@/components/nexus/NexusStates';
import { WeightChart } from '@/components/goals/WeightChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardResponse } from '@/types/goals';
import { goalsApiRequest } from '@/utils/nexus-goals-api';

export default function NexusGoalsDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['nexus-goals-dashboard'],
    queryFn: () => goalsApiRequest<DashboardResponse>('/dashboard'),
  });

  if (dashboardQuery.isLoading) {
    return (
      <>
        <NexusPageHeader title="Dashboard Goals" description="Vue d'ensemble de ta progression." />
        <NexusLoadingState />
      </>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <>
        <NexusPageHeader title="Dashboard Goals" />
        <NexusErrorState message="Impossible de charger le dashboard." />
      </>
    );
  }

  const { summary, profile, weightHistory } = dashboardQuery.data;

  return (
    <>
      <NexusPageHeader
        title="Dashboard Goals"
        description="Poids, IMC et évolution de ta progression."
      />

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NexusStatCard
          label="Poids actuel"
          value={summary.currentWeight != null ? `${summary.currentWeight} kg` : '—'}
        />
        <NexusStatCard label="IMC" value={summary.bmi != null ? String(summary.bmi) : '—'} />
        <NexusStatCard
          label="Taille"
          value={summary.heightCm != null ? `${summary.heightCm} cm` : '—'}
        />
        <NexusStatCard label="Objectifs actifs" value={summary.activeGoalsCount} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Évolution du poids</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart
            entries={weightHistory}
            targetWeightKg={profile?.targetWeightKg}
            className="min-h-72 w-full"
          />
        </CardContent>
      </Card>
    </>
  );
}
