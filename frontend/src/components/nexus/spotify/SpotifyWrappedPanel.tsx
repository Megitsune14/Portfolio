import { NexusStatCard } from '@/components/nexus/NexusStatCard';
import type { WrappedAllTime, WrappedSummary } from '@/types/spotify-wrapped';

type Props = {
  data: WrappedSummary | WrappedAllTime;
  showMostActiveMonth: boolean;
};

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

      <div className={`grid gap-4 ${showMostActiveMonth ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
        {showMostActiveMonth ? (
          <NexusStatCard label="Mois le plus actif" value={data.mostActiveMonth?.label ?? '-'} />
        ) : null}
        <NexusStatCard label="Jour le plus actif" value={data.mostActiveDay?.label ?? '-'} />
      </div>
    </div>
  );
}
