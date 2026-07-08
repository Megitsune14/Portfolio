export interface SpotifyTrack {
  name: string
  artist: string
  album: string
  isPlaying: boolean
  progress: number
  duration: number
  image?: string
  externalUrl?: string
  playedAt?: string
}

export interface SpotifyNowPlaying {
  isPlaying: boolean
  message?: string
  authenticated?: boolean
  name?: string
  artist?: string
  album?: string
  progress?: number
  duration?: number
  image?: string
  externalUrl?: string
}

export interface SpotifyRecentlyPlayedResponse {
  tracks: SpotifyTrack[]
  authenticated: boolean
  message?: string
}

export interface RiotRank {
  tier: string
  division: string
  lp: number
  wins: number
  losses: number
  winRate: string
  queue: string
}

export interface RiotMastery {
  championId: string
  championName: string
  masteryLevel: number
  masteryPoints: number
}

export interface RiotResponse {
  region: string
  riotId: string
  puuid: string
  platform: string
  summonerLevel: number
  rank?: RiotRank
  icon?: string
  topMastery: {
    champions: RiotMastery[]
    totalLevel: number
    totalPoints: number
  }
}

export interface DiscordProfileBadge {
  id: string
  label: string
}

export interface DiscordProfileResponse {
  id: string
  displayName: string
  username: string
  discriminator: string
  handle: string
  avatarUrl: string
  bannerUrl: string | null
  accentColor: string | null
  accountCreatedAt: string
  premiumType: 'none' | 'nitro_classic' | 'nitro' | 'nitro_basic'
  premiumLabel: string
  badges: DiscordProfileBadge[]
  avatarDecorationAsset: string | null
  primaryGuildTag: string | null
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
