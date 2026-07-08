import type { ApiResponse } from '@/types/api'
import type { LocalizedString, LocalizedStringOptional } from '@/lib/localized'

export type NexusGender = 'Homme' | 'Femme' | 'MTF' | 'FTM'

export interface NexusProfile {
  _id: string
  gender: NexusGender
  weightKg: number
  heightCm: number
  targetWeightKg?: number
  createdAt: string
  updatedAt: string
}

export interface NexusWeightEntry {
  _id: string
  weightKg: number
  note?: string
  measuredAt: string
  createdAt: string
  updatedAt: string
}

export interface NexusSubGoal {
  _id: string
  title: string
  description?: string
  status: 'active' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface NexusGoal {
  _id: string
  title: string
  description?: string
  targetWeightKg?: number
  status: 'active' | 'completed'
  subGoals: NexusSubGoal[]
  createdAt: string
  updatedAt: string
}

export interface NexusGoalsDashboard {
  summary: {
    currentWeight: number | null
    heightCm: number | null
    bmi: number | null
    activeGoalsCount: number
  }
  profile: NexusProfile | null
  weightHistory: NexusWeightEntry[]
  weightTargets: {
    profile: number | null
    goals: { id: string; title: string; weightKg: number }[]
  }
}

export interface NexusVisitor {
  id: string
  ip: string
  createdAt: string
  country: string | null
  city: string | null
  browser: string | null
  location: string
  device: string
}

export interface NexusVisitorStats {
  totalVisits: number
  uniqueIps: number
}

export interface NexusVisitorsResponse {
  visitors: NexusVisitor[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface NexusSpotifyStatus {
  connected: boolean
  displayName?: string
  token: {
    spotifyUserId: string
    displayName: string
    connectedAt: string
    updatedAt: string
    expiresAt: number
  } | null
  sync: {
    lastSyncAt: string | null
    lastSyncStatus: string
    lastSyncError: string | null
    updatedAt: string
  }
  totalPlays: number
}

export interface NexusSpotifyTopItem {
  id: string
  name: string
  artist?: string
  image?: string
  count?: number
}

export interface NexusSpotifyTopBubble {
  id: string
  type: string
  timeRange: string
  source: string
  fetchedAt: string | null
  items: NexusSpotifyTopItem[]
}

export interface NexusSpotifyTops {
  bubbles: NexusSpotifyTopBubble[]
}

export interface NexusSpotifyPeriods {
  years: number[]
  monthsByYear: Record<string, number[]>
}

export interface NexusSpotifyWrappedItem {
  id?: string
  trackId?: string
  artistId?: string
  name: string
  artist?: string
  image?: string
  count: number
}

export interface NexusSpotifyRecentPlay {
  trackId: string
  name: string
  artist: string
  album?: string
  durationMs?: number
  playedAt: string
  image?: string
  externalUrl?: string
}

export interface NexusSpotifyWrapped {
  period: string
  year: number | null
  month: number | string | null
  periodLabel: string
  totalPlays: number
  uniqueTracks?: number
  uniqueArtists?: number
  estimatedListeningTime?: string
  estimatedListeningMs?: number
  topTracks: NexusSpotifyWrappedItem[]
  topArtists: NexusSpotifyWrappedItem[]
  recentPlays?: NexusSpotifyRecentPlay[]
  mostActiveMonth?: { label: string; count: number } | null
  mostActiveDay?: {
    label: string
    count: number
    estimatedListeningTime: string
    estimatedListeningMs: number
  } | null
  todayPlays?: {
    count: number
    estimatedListeningTime: string
    estimatedListeningMs: number
  }
  firstPlayAt?: string | null
  lastPlayAt?: string | null
}

export type SpotifyPeriodSelection =
  | { mode: 'all-time' }
  | { mode: 'year'; year: number; month: 'current' | 'full-year' | number }

export interface NexusProject {
  id: string
  title: LocalizedString
  description: LocalizedString
  techStack: LocalizedString
  url?: string
  links: { label: LocalizedString; url: string }[]
  imageUrl?: string
  order: number
}

export interface NexusSocialLink {
  id: string
  name: LocalizedString
  username?: LocalizedStringOptional
  url?: string
  icon?: string
  order: number
}

export type AssetFolder = 'projects' | 'social'

export interface NexusAsset {
  filename: string
  folder: AssetFolder
  path: string
}

export type { ApiResponse }
