import Logger from '../../../shared/utils/logger.js';
import { Context } from 'hono';
import type { ApiResponse } from '../../../../types/index.js';
import { runSpotifySync } from '../sync/sync.service.js';
import { invalidateMoodCache } from '../mood/mood.cache.repository.js';
import {
  getAllTopSnapshots,
  getNexusSpotifyStatus,
  getSpotifyPeriods,
  getTopSnapshot,
  getTopsPanel,
  getWrappedForPeriod,
} from '../stats/stats.service.js';
import type { SpotifySnapshotType, SpotifyTimeRange } from '../data/snapshot.repository.js';
import { parseWrappedQuery } from '../schemas/wrapped.schemas.js';

export async function getStatus(c: Context): Promise<Response> {
  try {
    const data = await getNexusSpotifyStatus();
    return c.json({ success: true, data } as ApiResponse);
  } catch (error) {
    Logger.error('Nexus Spotify status error:', error);
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
    Logger.error('Nexus Spotify wrapped error:', error);
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
    Logger.error('Nexus Spotify periods error:', error);
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
    Logger.error('Nexus Spotify tops error:', error);
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
    Logger.error('Nexus Spotify top error:', error);
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
    await invalidateMoodCache();
    const data = await getNexusSpotifyStatus();
    return c.json({ success: true, data, message: 'Synchronisation terminée' } as ApiResponse);
  } catch (error) {
    Logger.error('Nexus Spotify sync error:', error);
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
