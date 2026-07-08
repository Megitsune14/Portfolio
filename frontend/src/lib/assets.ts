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
