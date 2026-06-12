export interface SpotifyNexusStatus {
  connected: boolean;
  displayName?: string;
  totalPlays: number;
  sync: {
    lastSyncAt: string | null;
    lastSyncStatus: 'idle' | 'running' | 'success' | 'error';
    lastSyncError?: string;
    updatedAt: string;
  };
}

export interface WrappedTopArtist {
  name: string;
  count: number;
  artistId?: string;
  image?: string;
  genres?: string[];
}

export interface WrappedTopTrack {
  trackId: string;
  name: string;
  artist: string;
  image?: string;
  count: number;
}

export interface WrappedDayStats {
  count: number;
  estimatedListeningTime: string;
  estimatedListeningMs: number;
}

export interface WrappedSummary {
  period: 'all-time' | 'year' | 'month';
  year: number | null;
  month: number | 'current' | null;
  periodLabel: string;
  totalPlays: number;
  uniqueTracks: number;
  uniqueArtists: number;
  estimatedListeningTime: string;
  estimatedListeningMs: number;
  topArtists: WrappedTopArtist[];
  topTracks: WrappedTopTrack[];
  mostActiveMonth: { label: string; count: number } | null;
  mostActiveDay: (WrappedDayStats & { label: string }) | null;
  todayPlays: WrappedDayStats;
}

export interface WrappedAllTime extends WrappedSummary {
  firstPlayAt: string | null;
  lastPlayAt: string | null;
}

export interface SpotifyPeriods {
  years: number[];
  monthsByYear: Record<string, number[]>;
}

export interface SpotifySnapshotItem {
  id: string;
  name: string;
  artist?: string;
  image?: string;
  popularity?: number;
  externalUrl?: string;
  genres?: string[];
  artistIds?: string[];
  album?: string;
  durationMs?: number;
  count?: number;
}

export type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term' | 'current_month';
export type SpotifySnapshotType = 'top_artists' | 'top_tracks';
export type SpotifyTopSource = 'spotify' | 'local';

export interface SpotifyTopBubble {
  id: string;
  type: SpotifySnapshotType;
  timeRange: SpotifyTimeRange;
  source: SpotifyTopSource;
  fetchedAt: string | null;
  items: SpotifySnapshotItem[];
}

export interface SpotifyTopsPanel {
  bubbles: SpotifyTopBubble[];
}

export interface SpotifySnapshot {
  type: SpotifySnapshotType;
  timeRange: 'short_term' | 'medium_term' | 'long_term';
  fetchedAt: string;
  items: SpotifySnapshotItem[];
}

export type WrappedPeriodSelection =
  | { kind: 'all-time' }
  | { kind: 'year'; year: number }
  | { kind: 'month'; year: number; month: number | 'current' };
