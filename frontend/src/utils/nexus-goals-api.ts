import { getNexusToken } from './nexus-api';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function goalsUrl(path: string): string {
  const suffix = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}/nexus/goals${suffix}`;
}

export async function goalsApiRequest<T = unknown>(
  path: string,
  options: { method?: string; body?: string } = {},
): Promise<T> {
  const token = getNexusToken();
  const headers = new Headers();

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(goalsUrl(path), {
    method: options.method ?? 'GET',
    headers,
    body: options.body,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data.data as T;
}
