import type { ApiResponse } from '@/types/api'
import { getApiBaseUrl } from '@/lib/apiBase'

const BASE = getApiBaseUrl()

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  const json = (await res.json()) as ApiResponse<T>

  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.message ?? json.error ?? `Request failed: ${path}`)
  }

  return json.data
}

export function getDiscordProfile() {
  return fetchApi<import('@/types/api').DiscordProfileResponse>('/discord/profile')
}

export function getRiotStats() {
  return fetchApi<import('@/types/api').RiotResponse>('/riot/Megitsune/0014')
}

export function getSpotifyNowPlaying() {
  return fetchApi<import('@/types/api').SpotifyNowPlaying>(
    '/spotify/currently-playing/me',
  )
}

export function getSpotifyRecent(limit = 3) {
  return fetchApi<import('@/types/api').SpotifyRecentlyPlayedResponse>(
    `/spotify/recently-played/me?limit=${limit}`,
  )
}

export function getPortfolioProjects() {
  return fetchApi<{ projects: import('@/data/projects').Project[] }>('/portfolio/projects').then(
    (data) => data.projects,
  )
}

export function getPortfolioSocial() {
  return fetchApi<{ links: import('@/data/social').SocialLink[] }>('/portfolio/social').then(
    (data) => data.links,
  )
}

export function getPortfolioBrandIcons() {
  return fetchApi<{ icons: Partial<Record<'spotify' | 'discord' | 'riot' | 'lol', string>> }>(
    '/portfolio/brand-icons',
  ).then((data) => data.icons)
}

export async function trackVisit(path: string) {
  try {
    await fetch(`${BASE}/nexus/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
  } catch {
    // fire-and-forget
  }
}
