import type { RiotResponse } from '../../types/index.js';

// Types pour les réponses API Riot
interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface RiotSummoner {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

interface RiotLeagueEntry {
  leagueId: string;
  summonerId: string;
  summonerName: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

interface RiotChampionMastery {
  puuid: string;
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  tokensEarned: number;
  summonerId: string;
}

interface DataDragonChampion {
  version: string;
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: any;
  image: any;
  tags: string[];
  partype: string;
  stats: any;
}

interface DataDragonChampions {
  type: string;
  format: string;
  version: string;
  data: { [key: string]: DataDragonChampion };
}

const REGION_MAPPING = {
  'euw1': 'europe',
  'eun1': 'europe', 
  'tr1': 'europe',
  'ru': 'europe',
  'na1': 'americas',
  'br1': 'americas',
  'la1': 'americas',
  'la2': 'americas',
  'kr': 'asia',
  'jp1': 'asia'
};

// Fonction utilitaire pour faire des requêtes avec gestion d'erreurs
async function makeRiotRequest(url: string, retries = 2): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': process.env.RIOT_API_KEY!
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
      if (retries > 0) {
        console.log(`Rate limited, retrying after ${retryAfter}s...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return makeRiotRequest(url, retries - 1);
      }
      throw new Error('Rate limit exceeded');
    }

    if (response.status === 403) {
      throw new Error('Invalid Riot API key');
    }

    if (response.status === 404) {
      throw new Error('Player not found');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Fonction pour récupérer le PUUID à partir du Riot ID
async function getPuuidByRiotId(gameName: string, tag: string): Promise<{ puuid: string; region: string }> {
  const regions = ['europe', 'americas', 'asia'];
  
  for (const region of regions) {
    try {
      const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tag)}`;
      const account: RiotAccount = await makeRiotRequest(url);
      return { puuid: account.puuid, region };
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        continue; // Essayer la région suivante
      }
      throw error;
    }
  }
  
  throw new Error('Player not found in any region');
}

// Fonction pour déterminer la plateforme à partir du PUUID
async function getPlatformByPuuid(puuid: string): Promise<string> {
  const platforms = Object.keys(REGION_MAPPING);
  
  for (const platform of platforms) {
    try {
      const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
      await makeRiotRequest(url);
      return platform;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Summoner not found on any platform');
}

// Fonction pour récupérer la version Data Dragon
async function getDataDragonVersion(): Promise<string> {
  try {
    const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions: string[] = await versionsResponse.json();
    return versions[0];
  } catch (error) {
    console.error('Error fetching Data Dragon version:', error);
    return '13.24.1'; // Version de fallback
  }
}

// Fonction pour récupérer les données des champions depuis Data Dragon
async function getChampionData(): Promise<{ [key: string]: string }> {
  try {
    const version = await getDataDragonVersion();

    // Récupérer les données des champions
    const championsResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
    const championsData: DataDragonChampions = await championsResponse.json();
    
    const championMap: { [key: string]: string } = {};
    Object.values(championsData.data).forEach(champion => {
      championMap[champion.key] = champion.name;
    });
    
    return championMap;
  } catch (error) {
    console.error('Error fetching champion data:', error);
    return {};
  }
}

// Fonction principale pour récupérer les informations du summoner
export async function getSummonerInfo(gameName: string, tag: string, apiKey: string): Promise<RiotResponse> {
  try {
    // 1. Récupérer le PUUID
    const { puuid, region: accountRegion } = await getPuuidByRiotId(gameName, tag);
    
    // 2. Déterminer la plateforme
    const platform = await getPlatformByPuuid(puuid);
    
    // 3. Récupérer les informations du summoner
    const summonerUrl = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summoner: RiotSummoner = await makeRiotRequest(summonerUrl);
    
    // 4. Récupérer le rang (SoloQ prioritaire, fallback Flex)
    let rankData = null;
    try {
      const leagueUrl = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
      const leagueEntries: RiotLeagueEntry[] = await makeRiotRequest(leagueUrl);
      
      // Chercher SoloQ d'abord, puis Flex
      const soloQ = leagueEntries.find(entry => entry.queueType === 'RANKED_SOLO_5x5');
      const flex = leagueEntries.find(entry => entry.queueType === 'RANKED_FLEX_SR');
      const selectedRank = soloQ || flex;
      
      if (selectedRank) {
        const winRate = Math.round((selectedRank.wins / (selectedRank.wins + selectedRank.losses)) * 100);
        rankData = {
          tier: selectedRank.tier,
          division: selectedRank.rank,
          lp: selectedRank.leaguePoints,
          wins: selectedRank.wins,
          losses: selectedRank.losses,
          winRate: `${winRate}%`,
          queue: selectedRank.queueType
        };
      }
    } catch (error) {
      console.log('No rank data found');
    }
    
    // 5. Récupérer le top champion mastery
    const masteryUrl = `https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=1`;
    const masteryEntries: RiotChampionMastery[] = await makeRiotRequest(masteryUrl);
    const topMastery = masteryEntries[0];
    
    // 6. Récupérer le nom du champion et la version Data Dragon
    const [championData, version] = await Promise.all([
      getChampionData(),
      getDataDragonVersion()
    ]);
    const championName = championData[topMastery.championId.toString()] || `Champion ${topMastery.championId}`;
    
    // 7. Générer l'URL de l'icône
    const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${summoner.profileIconId}.png`;
    
    return {
      region: accountRegion,
      riotId: `${gameName}#${tag}`,
      puuid,
      platform,
      summonerLevel: summoner.summonerLevel,
      rank: rankData,
      icon: iconUrl,
      topMastery: {
        championId: topMastery.championId.toString(),
        championName,
        masteryLevel: topMastery.championLevel,
        masteryPoints: topMastery.championPoints,
      },
    };
  } catch (error) {
    console.error('Riot API Error:', error);
    const status = (error as any)?.status ?? 500;
    throw {
      status,
      message: (error as any)?.message ?? 'Une erreur est survenue lors de la récupération des données Riot.',
    };
  }
}

// Fonction pour tester la clé API Riot
export async function testApiKey(apiKey: string): Promise<{ status: string; message: string; keyPreview?: string; help?: any }> {
  if (!apiKey) {
    return {
      status: 'error',
      message: 'RIOT_API_KEY not configured',
      help: {
        steps: [
          '1. Go to https://developer.riotgames.com/',
          '2. Sign in with your Riot Games account',
          '3. Go to "Personal API Key" section',
          '4. Generate a new API key',
          '5. Copy the key and add it to your .env file as RIOT_API_KEY=your_key_here'
        ]
      }
    };
  }

  try {
    // Test avec un appel simple
    const testResponse = await fetch(
      'https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations',
      {
        headers: { 'X-Riot-Token': apiKey }
      }
    );

    console.log(`Test API URL: https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations`);
    console.log(`Test API Key: ${apiKey.substring(0, 8)}...`);

    if (testResponse.ok) {
      return {
        status: 'success',
        message: 'Riot API key is valid',
        keyPreview: apiKey.substring(0, 8) + '...'
      };
    } else {
      const errorText = await testResponse.text();
      let errorMessage = `Riot API key is invalid (${testResponse.status})`;
      let help = null;

      if (testResponse.status === 401) {
        errorMessage = 'Riot API key is unknown or invalid';
        help = {
          steps: [
            '1. Go to https://developer.riotgames.com/',
            '2. Sign in with your Riot Games account',
            '3. Go to "Personal API Key" section',
            '4. Generate a new API key',
            '5. Copy the key and add it to your .env file as RIOT_API_KEY=your_key_here',
            '6. Restart the server'
          ]
        };
      }

      return {
        status: 'error',
        message: errorMessage,
        help: help
      };
    }
  } catch (error) {
      return {
        status: 'error',
        message: 'Failed to test Riot API key'
      };
  }
}
