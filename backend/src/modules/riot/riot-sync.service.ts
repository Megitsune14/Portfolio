import { saveRiotStats } from './riot-stats.repository.js';
import { fetchSummonerInfoFromApi } from './riot-api.service.js';
import Logger from '../../shared/utils/logger.js';

let syncInProgress = false;

export async function runRiotSync(): Promise<void> {
  if (syncInProgress) {
    Logger.debug('Riot sync - already running, skipped');
    return;
  }

  const gameName = process.env.RIOT_GAME_NAME;
  const tag = process.env.RIOT_TAG;
  const apiKey = process.env.RIOT_API_KEY;

  if (!gameName || !tag || !apiKey) {
    Logger.debug('Riot sync - skipped (RIOT_GAME_NAME, RIOT_TAG or RIOT_API_KEY missing)');
    return;
  }

  syncInProgress = true;
  const riotId = `${gameName}#${tag}`;
  const start = Date.now();

  try {
    const data = await fetchSummonerInfoFromApi(gameName, tag);
    await saveRiotStats(data);
    Logger.success(`Riot sync - OK (${riotId}) in ${Date.now() - start} ms`);
  } catch (error) {
    const message = (error as { message?: string })?.message ?? String(error);
    Logger.error(`Riot sync - error (${riotId})`, message);
  } finally {
    syncInProgress = false;
  }
}
