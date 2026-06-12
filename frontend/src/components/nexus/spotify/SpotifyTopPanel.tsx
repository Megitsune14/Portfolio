import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SpotifyTopBubble as SpotifyTopBubbleType } from '@/types/spotify-wrapped';
import { SpotifyTopBubble } from './SpotifyTopBubble';
import { SpotifyTopDetailSheet } from './SpotifyTopDetailSheet';

const COLUMN_ORDER = ['current_month', 'short_term', 'medium_term', 'long_term'] as const;

type Props = {
  bubbles: SpotifyTopBubbleType[];
};

export function SpotifyTopPanel({ bubbles }: Props) {
  const [selectedBubble, setSelectedBubble] = useState<SpotifyTopBubbleType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const artistBubbles = useMemo(
    () =>
      COLUMN_ORDER.map((range) => bubbles.find((b) => b.type === 'top_artists' && b.timeRange === range))
        .filter((b): b is SpotifyTopBubbleType => Boolean(b)),
    [bubbles],
  );

  const trackBubbles = useMemo(
    () =>
      COLUMN_ORDER.map((range) => bubbles.find((b) => b.type === 'top_tracks' && b.timeRange === range))
        .filter((b): b is SpotifyTopBubbleType => Boolean(b)),
    [bubbles],
  );

  const openBubble = (bubble: SpotifyTopBubbleType) => {
    setSelectedBubble(bubble);
    setSheetOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Top Spotify</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trackBubbles.map((bubble) => (
              <SpotifyTopBubble key={bubble.id} bubble={bubble} onClick={() => openBubble(bubble)} />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {artistBubbles.map((bubble) => (
              <SpotifyTopBubble key={bubble.id} bubble={bubble} onClick={() => openBubble(bubble)} />
            ))}
          </div>
        </CardContent>
      </Card>

      <SpotifyTopDetailSheet
        bubble={selectedBubble}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
