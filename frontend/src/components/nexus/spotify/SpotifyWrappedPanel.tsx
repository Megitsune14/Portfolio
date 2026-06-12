import { NexusStatCard } from '@/components/nexus/NexusStatCard';
import type { WrappedAllTime, WrappedSummary } from '@/types/spotify-wrapped';

type Props = {
  data: WrappedSummary | WrappedAllTime;
  showMostActiveMonth: boolean;
};

function formatDayStats(stats: { count: number; estimatedListeningTime: string }): string {
  const listens = `${stats.count.toLocaleString('fr-FR')} écoute${stats.count > 1 ? 's' : ''}`;
  return `${listens} · ${stats.estimatedListeningTime}`;
}

export function SpotifyWrappedPanel({ data, showMostActiveMonth }: Props) {
  const allTime = 'firstPlayAt' in data ? data : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-jp text-xl font-bold text-foreground">{data.periodLabel}</h2>
        {allTime?.firstPlayAt && allTime.lastPlayAt ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Du {new Date(allTime.firstPlayAt).toLocaleDateString('fr-FR')} au{' '}
            {new Date(allTime.lastPlayAt).toLocaleDateString('fr-FR')}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NexusStatCard label="Écoutes" value={String(data.totalPlays)} />
        <NexusStatCard label="Morceaux uniques" value={String(data.uniqueTracks)} />
        <NexusStatCard label="Artistes uniques" value={String(data.uniqueArtists)} />
        <NexusStatCard label="Temps estimé" value={data.estimatedListeningTime} />
      </div>

      <div
        className={`grid gap-4 ${
          showMostActiveMonth ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'
        }`}
      >
        {showMostActiveMonth ? (
          <NexusStatCard label="Mois le plus actif" value={data.mostActiveMonth?.label ?? '-'} />
        ) : null}
        <NexusStatCard
          label="Jour le plus actif"
          value={data.mostActiveDay?.label ?? '-'}
          detail={data.mostActiveDay ? formatDayStats(data.mostActiveDay) : undefined}
        />
        <NexusStatCard
          label="Écoutes d'aujourd'hui"
          value={data.todayPlays.count.toLocaleString('fr-FR')}
          detail={data.todayPlays.estimatedListeningTime}
        />
      </div>
    </div>
  );
}
