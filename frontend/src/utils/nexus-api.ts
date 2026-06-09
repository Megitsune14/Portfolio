const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'nexus_token';

export function getNexusToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setNexusToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearNexusToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function nexusFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getNexusToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}/nexus${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data.data as T;
}

export async function loginNexus(password: string): Promise<string> {
  const data = await nexusFetch<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

  setNexusToken(data.token);
  return data.token;
}

export async function checkNexusAuth(): Promise<boolean> {
  const token = getNexusToken();
  if (!token) return false;

  try {
    await nexusFetch<{ authenticated: boolean }>('/auth/me');
    return true;
  } catch {
    clearNexusToken();
    return false;
  }
}

export interface VisitorRecord {
  id: string;
  ip: string;
  userAgent: string;
  referrer: string | null;
  path: string;
  createdAt: string;
}

export interface VisitorStats {
  totalVisits: number;
  uniqueIps: number;
}

export interface VisitorsResponse {
  visitors: VisitorRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchVisitors(page = 1, limit = 50): Promise<VisitorsResponse> {
  return nexusFetch<VisitorsResponse>(`/visitors?page=${page}&limit=${limit}`);
}

export async function fetchVisitorStats(): Promise<VisitorStats> {
  return nexusFetch<VisitorStats>('/visitors/stats');
}

export function trackVisit(path: string): void {
  const payload = JSON.stringify({ path });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(`${API_BASE}/nexus/track`, blob);
    return;
  }

  fetch(`${API_BASE}/nexus/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
