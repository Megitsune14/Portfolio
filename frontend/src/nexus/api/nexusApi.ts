import { nexusFetch, getNexusToken } from './nexusClient'
import type { ApiResponse } from '@/types/api'
import type {
  NexusGender,
  NexusGoal,
  NexusGoalsDashboard,
  NexusProfile,
  NexusProject,
  NexusSocialLink,
  NexusAsset,
  AssetFolder,
  NexusSpotifyPeriods,
  NexusSpotifyStatus,
  NexusSpotifyTops,
  NexusSpotifyWrapped,
  NexusVisitorStats,
  NexusVisitorsResponse,
  NexusWeightEntry,
  SpotifyPeriodSelection,
} from '../types/nexus'

export function getVisitorStats() {
  return nexusFetch<NexusVisitorStats>('/visitors/stats')
}

export function getVisitors(page = 1, limit = 25) {
  return nexusFetch<NexusVisitorsResponse>(`/visitors?page=${page}&limit=${limit}`)
}

export function getGoalsDashboard() {
  return nexusFetch<NexusGoalsDashboard>('/goals/dashboard')
}

export function getGoalsProfile() {
  return nexusFetch<{ profile: NexusProfile | null }>('/goals/profile')
}

export function putGoalsProfile(data: {
  gender: NexusGender
  weightKg: number
  heightCm: number
  targetWeightKg?: number
}) {
  return nexusFetch<{ profile: NexusProfile }>('/goals/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function getWeights() {
  return nexusFetch<{ entries: NexusWeightEntry[] }>('/goals/weights')
}

export function postWeight(data: { weightKg: number; note?: string; measuredAt?: string }) {
  return nexusFetch<{ entry: NexusWeightEntry }>('/goals/weights', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function putWeight(id: string, data: { weightKg?: number; note?: string; measuredAt?: string }) {
  return nexusFetch<{ entry: NexusWeightEntry }>(`/goals/weights/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteWeight(id: string) {
  return nexusFetch<{ deleted: boolean }>(`/goals/weights/${id}`, { method: 'DELETE' })
}

export function getGoals() {
  return nexusFetch<{ goals: NexusGoal[] }>('/goals')
}

export function postGoal(data: {
  title: string
  description?: string
  targetWeightKg?: number
}) {
  return nexusFetch<{ goal: NexusGoal }>('/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function putGoal(
  id: string,
  data: {
    title: string
    description?: string
    targetWeightKg?: number
    status?: 'active' | 'completed'
  },
) {
  return nexusFetch<{ goal: NexusGoal }>(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteGoal(id: string) {
  return nexusFetch<{ deleted: boolean }>(`/goals/${id}`, { method: 'DELETE' })
}

export function postSubGoal(goalId: string, data: { title: string; description?: string }) {
  return nexusFetch<{ goal: NexusGoal; subGoal: NexusGoal['subGoals'][number] }>(
    `/goals/${goalId}/subgoals`,
    { method: 'POST', body: JSON.stringify(data) },
  )
}

export function putSubGoal(
  goalId: string,
  subGoalId: string,
  data: { title?: string; description?: string; status?: 'active' | 'completed' },
) {
  return nexusFetch<{ goal: NexusGoal }>(`/goals/${goalId}/subgoals/${subGoalId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteSubGoal(goalId: string, subGoalId: string) {
  return nexusFetch<{ goal: NexusGoal }>(`/goals/${goalId}/subgoals/${subGoalId}`, {
    method: 'DELETE',
  })
}

export function getSpotifyStatus() {
  return nexusFetch<NexusSpotifyStatus>('/spotify/status')
}

export function getSpotifyPeriods() {
  return nexusFetch<NexusSpotifyPeriods>('/spotify/periods')
}

function buildWrappedPath(selection: SpotifyPeriodSelection): string {
  if (selection.mode === 'all-time') {
    return '/spotify/wrapped/all-time'
  }

  if (selection.month === 'full-year') {
    return `/spotify/wrapped?period=year&year=${selection.year}`
  }

  if (selection.month === 'current') {
    return `/spotify/wrapped?period=month&year=${selection.year}&month=current`
  }

  return `/spotify/wrapped?period=month&year=${selection.year}&month=${selection.month}`
}

export function getSpotifyWrapped(selection: SpotifyPeriodSelection) {
  return nexusFetch<NexusSpotifyWrapped>(buildWrappedPath(selection))
}

export function getSpotifyTops() {
  return nexusFetch<NexusSpotifyTops>('/spotify/tops')
}

export function postSpotifySync(backfill = false) {
  return nexusFetch<NexusSpotifyStatus>(`/spotify/sync?backfill=${backfill}`, { method: 'POST' })
}

export type { AssetFolder }

export function getAssets(folder: AssetFolder) {
  return nexusFetch<{ assets: NexusAsset[] }>(`/assets?folder=${folder}`)
}

export async function uploadAsset(file: File, folder: AssetFolder) {
  const token = getNexusToken()
  const formData = new FormData()
  formData.append('file', file)

  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'
  const res = await fetch(`${BASE}/nexus/assets?folder=${folder}`, {
    method: 'POST',
    headers,
    body: formData,
  })
  const json = (await res.json()) as ApiResponse<{ asset: NexusAsset }>

  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message ?? json.error ?? 'Upload failed')
  }

  return json.data
}

export async function deleteAsset(folder: AssetFolder, assetPath: string) {
  const token = getNexusToken()
  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'
  const params = new URLSearchParams({ folder, path: assetPath })
  const res = await fetch(`${BASE}/nexus/assets?${params}`, {
    method: 'DELETE',
    headers,
  })
  const json = (await res.json()) as ApiResponse<{ deleted: boolean; path: string }>

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? json.error ?? 'Delete failed')
  }

  return json.data as { deleted: boolean; path: string }
}

export function getProjects() {
  return nexusFetch<{ projects: NexusProject[] }>('/projects')
}

export function postProject(data: Omit<NexusProject, 'id' | 'order'> & { order?: number }) {
  return nexusFetch<{ project: NexusProject }>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function putProject(id: string, data: Partial<Omit<NexusProject, 'id'>>) {
  return nexusFetch<{ project: NexusProject }>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteProject(id: string) {
  return nexusFetch<{ deleted: boolean }>(`/projects/${id}`, { method: 'DELETE' })
}

export function getSocialLinks() {
  return nexusFetch<{ links: NexusSocialLink[] }>('/social')
}

export function postSocialLink(data: Omit<NexusSocialLink, 'id' | 'order'> & { order?: number }) {
  return nexusFetch<{ link: NexusSocialLink }>('/social', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function putSocialLink(id: string, data: Partial<Omit<NexusSocialLink, 'id'>>) {
  return nexusFetch<{ link: NexusSocialLink }>(`/social/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteSocialLink(id: string) {
  return nexusFetch<{ deleted: boolean }>(`/social/${id}`, { method: 'DELETE' })
}
