import { logAnalytics } from './analyticsLogger';

function resolveApiBase(): string {
  if (import.meta.env.DEV) {
    return '/api';
  }

  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
}

const API_BASE = resolveApiBase();

export async function trackVisit(path: string): Promise<void> {
  if (!API_BASE) {
    logAnalytics('Enregistrement visite — échec: VITE_API_BASE_URL non défini', { path });
    return;
  }

  const url = `${API_BASE}/nexus/visit?path=${encodeURIComponent(path)}`;
  const payload = JSON.stringify({ path });

  logAnalytics('Enregistrement visite — envoi', { path, url });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });

    const data = (await response.json().catch(() => null)) as {
      success?: boolean;
      data?: { id?: string };
      message?: string;
      error?: string;
    } | null;

    if (!response.ok || !data?.success) {
      logAnalytics('Enregistrement visite — erreur serveur', {
        path,
        status: response.status,
        message: data?.message ?? data?.error ?? 'Réponse invalide',
      });
      return;
    }

    logAnalytics('Enregistrement visite — confirmé', {
      path,
      id: data.data?.id,
      status: response.status,
    });
  } catch (error) {
    logAnalytics('Enregistrement visite — échec réseau', {
      path,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(url, blob);
      logAnalytics('Enregistrement visite — fallback sendBeacon', { path, sent });
    }
  }
}
