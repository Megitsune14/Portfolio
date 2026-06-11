import { runSpotifySync } from '../services/SpotifySyncService.js';

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;

export function startSpotifyScheduler(): void {
  const intervalMs = parseInt(process.env.SPOTIFY_SYNC_INTERVAL_MS ?? String(DEFAULT_INTERVAL_MS), 10);

  console.log(`🎵 Spotify sync scheduler — intervalle ${intervalMs / 1000 / 60} min`);

  void runSpotifySync();

  setInterval(() => {
    void runSpotifySync();
  }, intervalMs);
}
