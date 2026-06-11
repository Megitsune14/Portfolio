import { Context } from 'hono';
import type { ApiResponse } from '../../types/index.js';
import { runSpotifySync } from '../services/SpotifySyncService.js';
import {
  getAllTopSnapshots,
  getNexusSpotifyStatus,
  getTopSnapshot,
  getWrappedAllTime,
  getWrappedForYear,
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

export async function getWrapped(c: Context): Promise<Response> {
  try {
    const yearParam = c.req.query('year');
    const allTime = c.req.path.endsWith('/all-time') || c.req.query('period') === 'all-time';

    if (allTime) {
      const data = await getWrappedAllTime();
      return c.json({ success: true, data } as ApiResponse);
    }

    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return c.json(
        { success: false, error: 'Invalid year', message: 'Année invalide' } as ApiResponse,
        400,
      );
    }

    const data = await getWrappedForYear(year);
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
