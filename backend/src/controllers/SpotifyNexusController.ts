import { Context } from 'hono';
import type { ApiResponse } from '../../types/index.js';
import { runSpotifySync } from '../services/SpotifySyncService.js';
import {
  getAllTopSnapshots,
  getNexusSpotifyStatus,
  getSpotifyPeriods,
  getTopSnapshot,
  getTopsPanel,
  getWrappedForPeriod,
  type WrappedPeriodQuery,
} from '../services/SpotifyStatsService.js';
import type { SpotifySnapshotType, SpotifyTimeRange } from '../services/SpotifySnapshotService.js';

export async function getStatus(c: Context): Promise<Response> {
  try {
    const data = await getNexusSpotifyStatus();
    return c.json({ success: true, data } as ApiResponse);
  } catch (error) {
    console.error('Nexus Spotify status error:', error);
    return c.json(
      {
        success: false,
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

function parseWrappedQuery(c: Context): WrappedPeriodQuery | { error: string } {
  const allTime = c.req.path.endsWith('/all-time') || c.req.query('period') === 'all-time';

  if (allTime) {
    return { period: 'all-time' };
  }

  const period = c.req.query('period');
  const yearParam = c.req.query('year');
  const monthParam = c.req.query('month');

  if (period === 'month' && yearParam) {
    const year = parseInt(yearParam, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return { error: 'Année invalide' };
    }

    if (monthParam === 'current') {
      return { period: 'month', year, month: 'current' };
    }

    if (monthParam) {
      const month = parseInt(monthParam, 10);
      if (Number.isNaN(month) || month < 1 || month > 12) {
        return { error: 'Mois invalide' };
      }
      return { period: 'month', year, month };
    }

    return { period: 'year', year };
  }

  if (period === 'year' && yearParam) {
    const year = parseInt(yearParam, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return { error: 'Année invalide' };
    }
    return { period: 'year', year };
  }

  if (yearParam) {
    const year = parseInt(yearParam, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return { error: 'Année invalide' };
    }
    return { period: 'year', year };
  }

  return { period: 'year', year: new Date().getFullYear() };
}

export async function getWrapped(c: Context): Promise<Response> {
  try {
    const parsed = parseWrappedQuery(c);
    if ('error' in parsed) {
      return c.json(
        { success: false, error: 'Invalid parameters', message: parsed.error } as ApiResponse,
        400,
      );
    }

    const data = await getWrappedForPeriod(parsed);
    return c.json({ success: true, data } as ApiResponse);
  } catch (error) {
    console.error('Nexus Spotify wrapped error:', error);
    return c.json(
      {
        success: false,
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function getPeriods(c: Context): Promise<Response> {
  try {
    const data = await getSpotifyPeriods();
    return c.json({ success: true, data } as ApiResponse);
  } catch (error) {
    console.error('Nexus Spotify periods error:', error);
    return c.json(
      {
        success: false,
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function getTops(c: Context): Promise<Response> {
  try {
    const data = await getTopsPanel();
    return c.json({ success: true, data } as ApiResponse);
  } catch (error) {
    console.error('Nexus Spotify tops error:', error);
    return c.json(
      {
        success: false,
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function getTop(c: Context): Promise<Response> {
  try {
    const type = c.req.query('type') as SpotifySnapshotType | undefined;
    const range = c.req.query('range') as SpotifyTimeRange | undefined;

    if (type && range) {
      const data = await getTopSnapshot(type, range);
      return c.json({ success: true, data } as ApiResponse);
    }

    const data = await getAllTopSnapshots();
    return c.json({ success: true, data } as ApiResponse);
  } catch (error) {
    console.error('Nexus Spotify top error:', error);
    return c.json(
      {
        success: false,
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function postSync(c: Context): Promise<Response> {
  try {
    const backfill = c.req.query('backfill') === 'true';
    await runSpotifySync({ backfill });
    const data = await getNexusSpotifyStatus();
    return c.json({ success: true, data, message: 'Synchronisation terminée' } as ApiResponse);
  } catch (error) {
    console.error('Nexus Spotify sync error:', error);
    return c.json(
      {
        success: false,
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}
