import { saveRiotStats } from './RiotStatsService.js';
import { fetchSummonerInfoFromApi } from './RiotService.js';

let syncInProgress = false;

export async function runRiotSync(): Promise<void> {
  if (syncInProgress) {
    console.log('🎮 Riot sync — déjà en cours, ignoré');
    return;
  }

  const gameName = process.env.RIOT_GAME_NAME;
  const tag = process.env.RIOT_TAG;
  const apiKey = process.env.RIOT_API_KEY;

  if (!gameName || !tag || !apiKey) {
    console.log('🎮 Riot sync — ignoré (RIOT_GAME_NAME, RIOT_TAG ou RIOT_API_KEY manquant)');
    return;
  }

  syncInProgress = true;
  const riotId = `${gameName}#${tag}`;
  const start = Date.now();

  try {
    const data = await fetchSummonerInfoFromApi(gameName, tag);
    await saveRiotStats(data);
    console.log(`🎮 Riot sync — OK (${riotId}) en ${Date.now() - start} ms`);
  } catch (error) {
    const message = (error as { message?: string })?.message ?? String(error);
    console.error(`🎮 Riot sync — erreur (${riotId}):`, message);
  } finally {
    syncInProgress = false;
  }
}
