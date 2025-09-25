// Spotify API Types
export interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  image: string;
  progress: number;
  duration: number;
  isPlaying: boolean;
  playedAt?: string; // For recently played tracks
}

export interface SpotifyResponse {
  name?: string;
  artist?: string;
  album?: string;
  image?: string;
  progress?: number;
  duration?: number;
  isPlaying?: boolean;
  authenticated?: boolean;
  message?: string;
  trackId?: string;
}

export interface SpotifyRecentlyPlayedResponse {
  tracks: SpotifyTrack[];
  authenticated: boolean;
  message?: string;
}

// Riot API Types
export interface RiotRank {
  tier: string;
  division: string;
  lp: number;
  wins: number;
  losses: number;
  winRate: string;
  queue: string;
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
  rank?: RiotRank;
  icon?: string;
  topMastery: {
    champions: RiotMastery[];
    totalLevel: number;
    totalPoints: number;
  };
}

// Social Media Types
export interface SocialLink {
  name: string;
  username: string;
  url: string;
  icon: string;
  color: string;
}

// Project Types
export interface Project {
  title: string;
  description: string;
  tags: string[];
  techStack?: {
    backend?: string[];
    frontend?: string[];
  };
  links: {
    repository?: string;
    app?: string;
    support?: string;
  };
  icon: string;
}
