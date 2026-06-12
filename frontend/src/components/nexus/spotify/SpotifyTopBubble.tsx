import { Badge } from '@/components/ui/badge';
import { TYPE_LABELS, TIME_RANGE_LABELS } from '@/lib/spotify/labels';
import type { SpotifyTopBubble as SpotifyTopBubbleType } from '@/types/spotify-wrapped';

const PREVIEW_COUNT = 4;

type Props = {
  bubble: SpotifyTopBubbleType;
  onClick: () => void;
};

export function SpotifyTopBubble({ bubble, onClick }: Props) {
  const preview = bubble.items.slice(0, PREVIEW_COUNT);
  const isArtists = bubble.type === 'top_artists';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col rounded-xl border border-border bg-card/60 p-3 text-left transition-colors hover:border-primary/40 hover:bg-card"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {TYPE_LABELS[bubble.type]}
          </p>
          <p className="text-sm font-medium text-foreground">
            {TIME_RANGE_LABELS[bubble.timeRange]}
          </p>
        </div>
        <Badge variant={bubble.source === 'spotify' ? 'secondary' : 'outline'} className="shrink-0 text-[10px]">
          {bubble.source === 'spotify' ? 'Spotify' : 'Local'}
        </Badge>
      </div>

      {preview.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucune donnée</p>
      ) : (
        <div className="flex -space-x-2">
          {preview.map((item, index) =>
            item.image ? (
              <img
                key={`${item.id}-${index}`}
                src={item.image}
                alt=""
                title={item.name}
                className="h-9 w-9 rounded-full border-2 border-card object-cover"
              />
            ) : (
              <div
                key={`${item.id}-${index}`}
                title={item.name}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-secondary text-[10px] font-semibold text-muted-foreground"
              >
                {index + 1}
              </div>
            ),
          )}
        </div>
      )}

      <p className="mt-2 truncate text-xs text-muted-foreground">
        {preview.length > 0
          ? isArtists
            ? preview.map((item) => item.name).join(' · ')
            : preview.map((item) => item.name).join(' · ')
          : 'Synchronise pour remplir'}
      </p>
    </button>
  );
}
