// Spotify Types
export interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
  image?: string | undefined;
  externalUrl?: string;
}

export interface SpotifyUserToken {
  accessToken: string;
  refreshToken?: string | undefined;
  expiresAt: number;
}

export interface SpotifyAuthResponse {
  isPlaying: boolean;
  message?: string;
  authenticated?: boolean;
}

// Riot Games Types
export interface RiotSummoner {
  name: string;
  level: number;
  id: string;
  puuid: string;
}

export interface RiotRank {
  tier: string;
  division: string;
  lp: number;
  wins: number;
  losses: number;
  winRate: string;
  queue: string;
  season?: string;
}

export interface RiotMastery {
  championId: string;
  championName: string;
  masteryLevel: number;
  masteryPoints: number;
}

export interface RiotResponse {
  region: string;
  riotId: string;
  puuid: string;
  platform: string;
  summonerLevel: number;
  rank?: RiotRank | undefined;
  icon?: string;
  topMastery: RiotMastery;
}


// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: boolean;
  message: string;
  details?: string;
  status?: number;
}

// Environment Variables
export interface EnvConfig {
  RIOT_API_KEY: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  REDIRECT_URI: string;
  SESSION_SECRET: string;
  PORT: number;
  NODE_ENV: string;
}
