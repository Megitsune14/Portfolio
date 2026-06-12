import { NexusStatCard } from '@/components/nexus/NexusStatCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WrappedAllTime, WrappedSummary } from '@/types/spotify-wrapped';

function TopArtistsList({
  items,
}: {
  items: WrappedSummary['topArtists'];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top artistes</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune donnée pour le moment.</p>
        ) : (
          <ol className="space-y-3">
            {items.map((item, index) => (
              <li key={`${item.artistId ?? item.name}-${index}`} className="flex items-start gap-3">
                <span className="w-6 text-sm font-semibold text-primary">{index + 1}</span>
                {item.image ? (
                  <img src={item.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-secondary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  {item.genres && item.genres.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.genres.slice(0, 2).map((genre) => (
                        <Badge key={genre} variant="outline" className="text-[10px]">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">{item.count} écoutes</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function TopTracksList({
  items,
}: {
  items: WrappedSummary['topTracks'];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top morceaux</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune donnée pour le moment.</p>
        ) : (
          <ol className="space-y-3">
            {items.map((item, index) => (
              <li key={`${item.trackId}-${index}`} className="flex items-center gap-3">
                <span className="w-6 text-sm font-semibold text-primary">{index + 1}</span>
                {item.image ? (
                  <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-secondary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.artist}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.count} écoutes</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

type Props = {
  data: WrappedSummary | WrappedAllTime;
};

export function SpotifyWrappedPanel({ data }: Props) {
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

      <div className="grid gap-4 sm:grid-cols-2">
        <NexusStatCard label="Mois le plus actif" value={data.mostActiveMonth?.label ?? '—'} />
        <NexusStatCard label="Jour le plus actif" value={data.mostActiveDay?.label ?? '—'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopArtistsList items={data.topArtists} />
        <TopTracksList items={data.topTracks} />
      </div>
    </div>
  );
}
