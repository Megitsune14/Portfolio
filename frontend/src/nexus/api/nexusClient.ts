import type { ApiResponse } from '@/types/api'

const BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'
const TOKEN_KEY = 'nexus_token'

export function getNexusToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setNexusToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearNexusToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class NexusApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function nexusFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, ...init } = options
  const headers = new Headers(init.headers)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getNexusToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const res = await fetch(`${BASE}/nexus${path}`, { ...init, headers })
  const json = (await res.json()) as ApiResponse<T>

  if (!res.ok || !json.success) {
    throw new NexusApiError(json.message ?? json.error ?? 'Request failed', res.status)
  }

  return json.data as T
}

export async function nexusLogin(password: string): Promise<string> {
  const data = await nexusFetch<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
    auth: false,
  })
  setNexusToken(data.token)
  return data.token
}

export async function nexusMe(): Promise<{ authenticated: boolean }> {
  return nexusFetch<{ authenticated: boolean }>('/auth/me')
}
