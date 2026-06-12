import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TYPE_LABELS, TIME_RANGE_LABELS } from '@/lib/spotify/labels';
import type { SpotifyTopBubble } from '@/types/spotify-wrapped';

type Props = {
  bubble: SpotifyTopBubble | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SpotifyTopDetailSheet({ bubble, open, onOpenChange }: Props) {
  if (!bubble) return null;

  const isArtists = bubble.type === 'top_artists';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {TYPE_LABELS[bubble.type]} - {TIME_RANGE_LABELS[bubble.timeRange]}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={bubble.source === 'spotify' ? 'secondary' : 'outline'}>
            {bubble.source === 'spotify' ? 'Spotify' : 'Écoutes locales'}
          </Badge>
          <Badge variant="outline">{bubble.items.length} éléments</Badge>
          {bubble.fetchedAt ? (
            <span className="text-xs text-muted-foreground">
              {new Date(bubble.fetchedAt).toLocaleString('fr-FR')}
            </span>
          ) : null}
        </div>

        {bubble.items.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Aucune donnée pour le moment.</p>
        ) : (
          <ol className="mt-6 max-h-[calc(100vh-12rem)] space-y-4 overflow-y-auto pr-1">
            {bubble.items.map((item, index) => (
              <li key={`${item.id}-${index}`} className="flex items-start gap-3">
                <span className="w-6 pt-1 text-sm font-semibold text-primary">{index + 1}</span>
                {item.image ? (
                  <img src={item.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-secondary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  {!isArtists && item.artist ? (
                    <p className="truncate text-xs text-muted-foreground">{item.artist}</p>
                  ) : null}
                  {isArtists && item.genres && item.genres.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.genres.slice(0, 3).map((genre) => (
                        <Badge key={genre} variant="outline" className="text-[10px]">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {item.popularity != null ? (
                    <p className="mt-1 text-xs text-muted-foreground">Popularité {item.popularity}</p>
                  ) : null}
                </div>
                {item.count != null ? (
                  <span className="shrink-0 text-xs text-muted-foreground">{item.count} écoutes</span>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </SheetContent>
    </Sheet>
  );
}
