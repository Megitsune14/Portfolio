import type { SpotifySnapshotType, SpotifyTimeRange } from '@/types/spotify-wrapped';

export const TIME_RANGE_LABELS: Record<SpotifyTimeRange, string> = {
  short_term: '4 semaines',
  medium_term: '6 mois',
  long_term: 'Depuis toujours',
  current_month: 'Ce mois-ci',
};

export const TYPE_LABELS: Record<SpotifySnapshotType, string> = {
  top_artists: 'Artistes',
  top_tracks: 'Morceaux',
};

export const MONTH_LABELS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
] as const;
