import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  FolderKanban,
  Info,
  Music,
  Share2,
  Target,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { formatImcValue, getImcCategoryLabel } from '@/lib/goals/imc'
import {
  getGoalsDashboard,
  getProjects,
  getSocialLinks,
  getSpotifyStatus,
  getSpotifyWrapped,
  getVisitorStats,
  getVisitors,
} from '../api/nexusApi'
import { useGoalsProfile } from '../goals/GoalsProfileProvider'
import { WeightJourneyChart } from '../goals/WeightJourneyChart'
import { useNexusPageTitle } from '../layout/useNexusPageTitle'
import { defaultSpotifyPeriodSelection, formatListeningHoursMinutes } from '../lib/spotifyPeriod'
import type { NexusSpotifyRecentPlay, NexusVisitor } from '../types/nexus'

const RECENT_VISITS_LIMIT = 5

function formatSyncDate(iso: string | null): string {
  if (!iso) return 'Jamais'
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatVisitDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

function HomeAlerts({
  goalsConfigured,
  spotifyConnected,
  spotifySyncError,
}: {
  goalsConfigured: boolean
  spotifyConnected: boolean
  spotifySyncError: string | null
}) {
  const alerts: { tone: 'info' | 'warning' | 'error'; message: React.ReactNode }[] = []

  if (!goalsConfigured) {
    alerts.push({
      tone: 'info',
      message: (
        <>
          Le module Goals n'est pas configuré.{' '}
          <Link to="/nexus/goals/configuration" className="font-medium underline underline-offset-4">
            Configurer le profil
          </Link>
        </>
      ),
    })
  }

  if (!spotifyConnected) {
    alerts.push({
      tone: 'info',
      message: "Spotify n'est pas connecté — les statistiques d'écoute sont indisponibles.",
    })
  }

  if (spotifySyncError) {
    alerts.push({
      tone: 'error',
      message: (
        <>
          Erreur de synchronisation Spotify : <span className="font-medium">{spotifySyncError}</span>
        </>
      ),
    })
  }

  if (alerts.length === 0) return null

  const toneStyles = {
    info: 'border-primary/35 bg-primary/8 text-foreground',
    warning: 'border-(--gold)/35 bg-[color-mix(in_srgb,var(--gold)_8%,transparent)] text-foreground',
    error: 'border-destructive/40 bg-destructive/8 text-destructive',
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Card key={index} className={`glass ${toneStyles[alert.tone]}`}>
          <CardContent className="flex items-start gap-3 py-3 text-sm">
            {alert.tone === 'error' ? (
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            ) : (
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            )}
            <p>{alert.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RecentVisitsPanel({
  visitors,
  loading,
}: {
  visitors: NexusVisitor[]
  loading: boolean
}) {
  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-base">Visites récentes</CardTitle>
        <Link
          to="/nexus/analytics"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Voir tout
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {loading ? (
          <div className="space-y-2 p-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : visitors.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Aucune visite enregistrée.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Lieu</th>
                <th className="px-4 py-3 font-medium">Navigateur</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Appareil</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr key={visitor.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatVisitDate(visitor.createdAt)}
                  </td>
                  <td className="px-4 py-3">{visitor.location}</td>
                  <td className="px-4 py-3">{visitor.browser ?? '—'}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">{visitor.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}

function ConfigSummaryCard({
  projectsCount,
  socialCount,
  loading,
}: {
  projectsCount: number
  socialCount: number
  loading: boolean
}) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-heading text-base">Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : (
          <>
            <Link
              to="/nexus/config/projects"
              className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/8 px-4 py-3 transition-colors hover:bg-primary/12"
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="size-4 text-primary" />
                <div>
                  <p className="font-medium">Projets</p>
                  <p className="text-sm text-muted-foreground">
                    {projectsCount === 1
                      ? '1 projet publié'
                      : `${projectsCount} projets publiés`}
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              to="/nexus/config/social"
              className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/8 px-4 py-3 transition-colors hover:bg-accent/12"
            >
              <div className="flex items-center gap-3">
                <Share2 className="size-4 text-accent" />
                <div>
                  <p className="font-medium">Réseaux sociaux</p>
                  <p className="text-sm text-muted-foreground">
                    {socialCount} lien{socialCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function SpotifyRecentPlays({
  plays,
  loading,
}: {
  plays: NexusSpotifyRecentPlay[]
  loading: boolean
}) {
  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-base">Dernières écoutes</CardTitle>
        <Link
          to="/nexus/spotify"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Voir tout
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : plays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune écoute récente ce mois-ci.</p>
        ) : (
          <ul className="space-y-2">
            {plays.slice(0, 5).map((play) => (
              <li
                key={`${play.trackId}-${play.playedAt}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{play.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{play.artist}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatVisitDate(play.playedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function NexusHomePage() {
  useNexusPageTitle('Home')
  const { isConfigured } = useGoalsProfile()

  const stats = useFetch(getVisitorStats)
  const visitors = useFetch(() => getVisitors(1, RECENT_VISITS_LIMIT))
  const goals = useFetch(getGoalsDashboard, { enabled: isConfigured })
  const spotify = useFetch(getSpotifyStatus)
  const spotifyWrapped = useFetch(() => getSpotifyWrapped(defaultSpotifyPeriodSelection()), {
    enabled: spotify.data?.connected === true,
  })
  const projects = useFetch(getProjects)
  const social = useFetch(getSocialLinks)

  const goalsHref = isConfigured ? '/nexus/goals/dashboard' : '/nexus/goals/configuration'
  const recentVisitors = visitors.data?.visitors ?? []
  const lastVisit = recentVisitors[0]
  const topTrack = spotifyWrapped.data?.topTracks[0]
  const lastWeightEntry = goals.data?.weightHistory.at(-1)
  const showWeightChart =
    isConfigured && goals.data != null && goals.data.weightHistory.length > 0
  const showRecentPlays =
    spotify.data?.connected === true &&
    (spotifyWrapped.loading || (spotifyWrapped.data?.recentPlays?.length ?? 0) > 0)
  const showActivityRow = showWeightChart || showRecentPlays
  const activityRowSingle =
    (showWeightChart ? 1 : 0) + (showRecentPlays ? 1 : 0) === 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading tracking-tight">
          <span className="text-gradient">Accueil</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d'ensemble — analytics, goals, Spotify et configuration
        </p>
      </div>

      <HomeAlerts
        goalsConfigured={isConfigured}
        spotifyConnected={spotify.data?.connected === true}
        spotifySyncError={spotify.data?.sync.lastSyncError ?? null}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Analytics"
          icon={<BarChart3 className="size-4 text-primary" />}
          href="/nexus/analytics"
          loading={stats.loading}
        >
          <p className="text-3xl font-bold font-heading text-primary">
            {(stats.data?.totalVisits ?? 0).toLocaleString('fr-FR')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            visites · {(stats.data?.uniqueIps ?? 0).toLocaleString('fr-FR')} IP uniques
          </p>
          {lastVisit ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Dernière visite : {formatVisitDate(lastVisit.createdAt)}
              {lastVisit.location !== 'Inconnu' ? ` · ${lastVisit.location}` : ''}
            </p>
          ) : null}
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
                  : '—'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                IMC {formatImcValue(goals.data?.summary.bmi)}
                {getImcCategoryLabel(goals.data?.summary.bmi)
                  ? ` · ${getImcCategoryLabel(goals.data?.summary.bmi)}`
                  : ''}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {(goals.data?.summary.activeGoalsCount ?? 0) === 1
                  ? '1 objectif actif'
                  : `${goals.data?.summary.activeGoalsCount ?? 0} objectifs actifs`}
                {lastWeightEntry
                  ? ` · dernière pesée ${formatVisitDate(lastWeightEntry.measuredAt)}`
                  : ''}
              </p>
            </>
          )}
        </SummaryCard>

        <SummaryCard
          title="Spotify"
          icon={<Music className="size-4 text-accent" />}
          href="/nexus/spotify"
          loading={spotify.loading || (spotify.data?.connected === true && spotifyWrapped.loading)}
        >
          {!spotify.data?.connected ? (
            <>
              <p className="text-3xl font-bold font-heading text-muted-foreground">—</p>
              <p className="mt-1 text-sm text-muted-foreground">Non connecté</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold font-heading text-accent">
                {(spotifyWrapped.data?.totalPlays ?? 0).toLocaleString('fr-FR')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                écoutes ce mois-ci · {spotify.data.displayName ?? 'Compte'}
              </p>
              {spotifyWrapped.data?.todayPlays ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Aujourd'hui : {spotifyWrapped.data.todayPlays.count.toLocaleString('fr-FR')}{' '}
                  écoute{spotifyWrapped.data.todayPlays.count > 1 ? 's' : ''}
                  {spotifyWrapped.data.todayPlays.estimatedListeningMs > 0
                    ? ` · ${formatListeningHoursMinutes(spotifyWrapped.data.todayPlays.estimatedListeningMs)}`
                    : ''}
                </p>
              ) : null}
              {topTrack ? (
                <div className="mt-3 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Top morceau du mois
                  </p>
                  <p className="mt-0.5 truncate font-medium">{topTrack.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{topTrack.artist}</p>
                </div>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {(spotify.data.totalPlays ?? 0).toLocaleString('fr-FR')} écoutes au total · sync{' '}
                {formatSyncDate(spotify.data.sync.lastSyncAt)}
              </p>
            </>
          )}
        </SummaryCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <RecentVisitsPanel visitors={recentVisitors} loading={visitors.loading} />
        <ConfigSummaryCard
          projectsCount={projects.data?.projects.length ?? 0}
          socialCount={social.data?.links.length ?? 0}
          loading={projects.loading || social.loading}
        />
      </div>

      {showActivityRow ? (
        <div className={`grid gap-5 ${activityRowSingle ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
          {showWeightChart && goals.data ? (
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-base">Parcours de poids</CardTitle>
                <Link
                  to="/nexus/goals/dashboard"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Voir tout
                  <ArrowRight className="size-3" />
                </Link>
              </CardHeader>
              <CardContent>
                <WeightJourneyChart
                  weightHistory={goals.data.weightHistory}
                  weightTargets={goals.data.weightTargets}
                />
              </CardContent>
            </Card>
          ) : null}

          {showRecentPlays ? (
            <SpotifyRecentPlays
              plays={spotifyWrapped.data?.recentPlays ?? []}
              loading={spotifyWrapped.loading}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
