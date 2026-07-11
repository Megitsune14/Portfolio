import { getApiBaseUrl } from './apiBase'

/** Public asset paths (served from /) */
export const ASSETS = {
  profileImage: '/profil-picture.png',
  favicon: '/favicon.png',
} as const

/**
 * Build a public URL for an asset in frontend/public/.
 * @example asset('/assets/my-app.png') → '/assets/my-app.png'
 */
export function asset(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

/** Uploaded portfolio assets are stored and served by the API. */
export function resolvePublicAssetUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path

  const normalized = asset(path)
  if (normalized.startsWith('/assets/')) {
    return `${getApiBaseUrl()}${normalized}`
  }

  return normalized
}
