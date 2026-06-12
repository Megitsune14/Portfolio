import { runRiotSync } from '../services/RiotSyncService.js';

const DEFAULT_INTERVAL_MS = 3 * 60 * 60 * 1000;

export function startRiotScheduler(): void {
  const intervalMs = parseInt(process.env.RIOT_SYNC_INTERVAL_MS ?? String(DEFAULT_INTERVAL_MS), 10);

  console.log(`🎮 Riot sync scheduler - intervalle ${intervalMs / 1000 / 60 / 60} h`);

  void runRiotSync();

  setInterval(() => {
    void runRiotSync();
  }, intervalMs);
}
