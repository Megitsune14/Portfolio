import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Music, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { getGoalsDashboard, getSpotifyStatus, getVisitorStats } from '../api/nexusApi'
import { useGoalsProfile } from '../goals/GoalsProfileProvider'
import { useNexusPageTitle } from '../layout/useNexusPageTitle'

function SummaryCard({
  title,
  icon,
  href,
  children,
  loading,
}: {
  title: string
  icon: React.ReactNode
  href: string
  children: React.ReactNode
  loading?: boolean
}) {
  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          {icon}
          {title}
        </CardTitle>
        <Link
          to={href}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Voir tout
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

export function NexusHomePage() {
  useNexusPageTitle('Home')
  const { isConfigured } = useGoalsProfile()

  const stats = useFetch(getVisitorStats)
  const goals = useFetch(getGoalsDashboard, { enabled: isConfigured })
  const spotify = useFetch(getSpotifyStatus)

  const goalsHref = isConfigured ? '/nexus/goals/dashboard' : '/nexus/goals/configuration'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading tracking-tight">
          <span className="text-gradient">Accueil</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Résumé Analytics, Goals et Spotify
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Analytics"
          icon={<BarChart3 className="size-4 text-primary" />}
          href="/nexus/analytics"
          loading={stats.loading}
        >
          <p className="text-3xl font-bold font-heading text-primary">
            {stats.data?.totalVisits ?? 0}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            visites · {stats.data?.uniqueIps ?? 0} IP uniques
          </p>
        </SummaryCard>

        <SummaryCard
          title="Goals"
          icon={<Target className="size-4 text-(--gold)" />}
          href={goalsHref}
          loading={isConfigured && goals.loading}
        >
          {!isConfigured ? (
            <p className="text-sm text-muted-foreground">
              Configuration requise pour accéder au module Goals.
            </p>
          ) : (
            <>
              <p className="text-3xl font-bold font-heading text-(--gold)">
                {goals.data?.summary.currentWeight != null
                  ? `${goals.data.summary.currentWeight} kg`
                  : '-'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                BMI {goals.data?.summary.bmi ?? '-'} ·{' '}
                {goals.data?.summary.activeGoalsCount ?? 0} objectifs actifs
              </p>
            </>
          )}
        </SummaryCard>

        <SummaryCard
          title="Spotify"
          icon={<Music className="size-4 text-accent" />}
          href="/nexus/spotify"
          loading={spotify.loading}
        >
          <p className="text-3xl font-bold font-heading text-accent">
            {spotify.data?.totalPlays?.toLocaleString() ?? 0}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {spotify.data?.connected
              ? `Connecté · ${spotify.data.displayName ?? 'Compte'}`
              : 'Non connecté'}
          </p>
        </SummaryCard>
      </div>
    </div>
  )
}
