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
}

export interface WrappedTopTrack {
  trackId: string;
  name: string;
  artist: string;
  image?: string;
  count: number;
}

export interface WrappedSummary {
  periodLabel: string;
  totalPlays: number;
  uniqueTracks: number;
  uniqueArtists: number;
  estimatedListeningTime: string;
  estimatedListeningMs: number;
  topArtists: WrappedTopArtist[];
  topTracks: WrappedTopTrack[];
  mostActiveMonth: { label: string; count: number } | null;
  mostActiveDay: { label: string; count: number } | null;
}

export interface WrappedAllTime extends WrappedSummary {
  firstPlayAt: string | null;
  lastPlayAt: string | null;
}

export interface SpotifySnapshotItem {
  id: string;
  name: string;
  artist?: string;
  image?: string;
  popularity?: number;
  externalUrl?: string;
}

export interface SpotifySnapshot {
  type: 'top_tracks' | 'top_artists';
  timeRange: 'short_term' | 'medium_term' | 'long_term';
  fetchedAt: string;
  items: SpotifySnapshotItem[];
}
