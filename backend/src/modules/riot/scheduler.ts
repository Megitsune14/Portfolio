import { runRiotSync } from './riot-sync.service.js';
import Logger from '../../shared/utils/logger.js';

const DEFAULT_INTERVAL_MS = 3 * 60 * 60 * 1000;

export function startRiotScheduler(): void {
  const intervalMs = parseInt(process.env.RIOT_SYNC_INTERVAL_MS ?? String(DEFAULT_INTERVAL_MS), 10);
  const intervalHours = intervalMs / 1000 / 60 / 60;

  void runRiotSync();

  setInterval(() => {
    void runRiotSync();
  }, intervalMs);

  Logger.success(`Riot sync scheduler started (interval ${intervalHours} h)`);
}
