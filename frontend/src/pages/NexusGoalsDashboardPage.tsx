import { useQuery } from '@tanstack/react-query';
import { GoalsPageLayout } from '../components/goals/GoalsPageLayout';
import { WeightChart } from '../components/goals/WeightChart';
import type { DashboardResponse } from '../types/goals';
import { goalsApiRequest } from '../utils/nexus-goals-api';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-jp text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function NexusGoalsDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['nexus-goals-dashboard'],
    queryFn: () => goalsApiRequest<DashboardResponse>('/dashboard'),
  });

  if (dashboardQuery.isLoading) {
    return (
      <GoalsPageLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-(--primary)" />
        </div>
      </GoalsPageLayout>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <GoalsPageLayout>
        <div className="surface-panel flex-1 p-6 text-foreground">Impossible de charger le dashboard.</div>
      </GoalsPageLayout>
    );
  }

  const { summary, profile, weightHistory } = dashboardQuery.data;

  return (
    <GoalsPageLayout>
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Poids actuel" value={summary.currentWeight != null ? `${summary.currentWeight} kg` : '—'} />
        <StatCard label="IMC" value={summary.bmi != null ? String(summary.bmi) : '—'} />
        <StatCard label="Taille" value={summary.heightCm != null ? `${summary.heightCm} cm` : '—'} />
        <StatCard label="Objectifs actifs" value={String(summary.activeGoalsCount)} />
      </section>

      <section className="surface-panel flex min-h-0 flex-1 flex-col p-6">
        <h2 className="mb-4 font-jp text-xl font-bold text-foreground">Évolution du poids</h2>
        <div className="flex min-h-0 flex-1">
          <WeightChart entries={weightHistory} targetWeightKg={profile?.targetWeightKg} className="min-h-72 flex-1" />
        </div>
      </section>
    </GoalsPageLayout>
  );
}
