import { runSpotifySync } from './sync.service.js';
import Logger from '../../../shared/utils/logger.js';

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;

export function startSpotifyScheduler(): void {
  const intervalMs = parseInt(process.env.SPOTIFY_SYNC_INTERVAL_MS ?? String(DEFAULT_INTERVAL_MS), 10);
  const intervalMin = intervalMs / 1000 / 60;

  void runSpotifySync();

  setInterval(() => {
    void runSpotifySync();
  }, intervalMs);

  Logger.success(`Spotify sync scheduler started (interval ${intervalMin} min)`);
}
