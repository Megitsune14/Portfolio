import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatDivider } from '@/components/stats/StatCardUi'
import { useFetch } from '@/hooks/useFetch'
import { getGoalsDashboard } from '../../api/nexusApi'
import { useNexusPageTitle } from '../../layout/useNexusPageTitle'
import { WeightJourneyChart } from '../../goals/WeightJourneyChart'
import { formatImcValue, getImcCategoryLabel } from '@/lib/goals/imc'

export function GoalsDashboardPage() {
  useNexusPageTitle('Dashboard')
  const { data, loading } = useFetch(getGoalsDashboard)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    )
  }

  const summary = data?.summary

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading tracking-tight">Dashboard Goals</h2>
        <p className="mt-1 text-sm text-muted-foreground">Vue d’ensemble de ta progression</p>
      </div>

      {!data?.profile && (
        <Card className="glass border-accent/35">
          <CardContent className="py-4 text-sm text-accent">
            Profil non configuré.{' '}
            <Link to="/nexus/goals/configuration" className="underline">
              Configurer maintenant
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Poids actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-heading text-(--gold)">
              {summary?.currentWeight != null ? `${summary.currentWeight} kg` : '-'}
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Taille</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-heading text-primary">
              {summary?.heightCm != null ? `${summary.heightCm} cm` : '-'}
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">IMC</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-heading text-accent">
              {formatImcValue(summary?.bmi)}
            </p>
            {getImcCategoryLabel(summary?.bmi) ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {getImcCategoryLabel(summary?.bmi)}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Objectifs actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-heading text-primary">
              {summary?.activeGoalsCount ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <StatDivider />

      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-heading">Parcours de poids</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightJourneyChart
            weightHistory={data?.weightHistory ?? []}
            weightTargets={data?.weightTargets}
          />
        </CardContent>
      </Card>
    </div>
  )
}
