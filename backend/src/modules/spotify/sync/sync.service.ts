import SpotifyWebApi from 'spotify-web-api-node';
import { logAnalytics } from '../../../shared/utils/analyticsLogger.js';
import Logger from '../../../shared/utils/logger.js';
import { enrichIncompleteArtists } from '../enrichment/artist-enrichment.service.js';
import { upsertArtists, type SpotifyArtistInput } from '../data/artist.repository.js';
import { insertPlays, type SpotifyPlayInput } from '../data/play.repository.js';
import {
  insertSnapshot,
  shouldRefreshSnapshot,
  type SpotifySnapshotItem,
  type SpotifySnapshotType,
  type SpotifyTimeRange,
} from '../data/snapshot.repository.js';
import { setSyncError, setSyncRunning, setSyncSuccess } from './sync-meta.repository.js';
import { getSyncToken } from './sync-token.repository.js';
import { getSpotifyWebApi, getValidSyncAccessToken } from './sync-token.service.js';

let syncInProgress = false;

function getTopLimit(): number {
  const parsed = parseInt(process.env.SPOTIFY_TOP_LIMIT ?? '50', 10);
  if (Number.isNaN(parsed)) return 50;
  return Math.min(Math.max(parsed, 1), 50);
}

function isTrack(item: { artists?: unknown; album?: unknown }): boolean {
  return 'artists' in item && 'album' in item;
}

function mapRecentlyPlayedItem(item: {
  played_at: string;
  track: {
    id: string;
    name: string;
    duration_ms: number;
    artists: { id: string; name: string }[];
    album: { name: string; images: { url: string }[] };
    external_urls: { spotify: string };
  };
}): SpotifyPlayInput | null {
  const track = item.track;
  if (!isTrack(track) || !track.artists.length) return null;

  const artistIds = track.artists.map((artist) => artist.id);

  return {
    trackId: track.id,
    name: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    album: track.album.name,
    durationMs: track.duration_ms,
    playedAt: new Date(item.played_at),
    image: track.album.images[0]?.url,
    externalUrl: track.external_urls.spotify,
    artistIds,
    primaryArtistId: track.artists[0]!.id,
  };
}

async function fetchAndStoreRecentlyPlayed(
  api: SpotifyWebApi,
  options: { backfill?: boolean } = {},
): Promise<number> {
  let totalInserted = 0;
  let before: number | undefined;
  const maxPages = options.backfill ? 10 : 1;

  for (let page = 0; page < maxPages; page++) {
    const params: { limit: number; before?: number } = { limit: 50 };
    if (before !== undefined) params.before = before;

    const response = await api.getMyRecentlyPlayedTracks(params);
    const items = response.body.items ?? [];
    if (items.length === 0) break;

    const plays = items
      .map(mapRecentlyPlayedItem)
      .filter((p): p is SpotifyPlayInput => p !== null);

    const artistsFromPlays: SpotifyArtistInput[] = [];
    for (const item of items) {
      if (!isTrack(item.track)) continue;
      for (const artist of item.track.artists) {
        artistsFromPlays.push({ id: artist.id, name: artist.name });
      }
    }
    await upsertArtists(artistsFromPlays);

    totalInserted += await insertPlays(plays);

    const lastPlayedAt = items[items.length - 1]?.played_at;
    if (!lastPlayedAt) break;

    before = new Date(lastPlayedAt).getTime();
    if (items.length < 50) break;
  }

  return totalInserted;
}

async function fetchAndStoreTopItems(
  api: SpotifyWebApi,
  type: SpotifySnapshotType,
  timeRange: SpotifyTimeRange,
): Promise<void> {
  const shouldRefresh = await shouldRefreshSnapshot(type, timeRange);
  if (!shouldRefresh) return;

  const limit = getTopLimit();
  let items: SpotifySnapshotItem[] = [];
  const artistsToCache: SpotifyArtistInput[] = [];

  if (type === 'top_tracks') {
    const response = await api.getMyTopTracks({ limit, time_range: timeRange });
    items = (response.body.items ?? []).map((track) => {
      const artistIds = track.artists.map((artist) => artist.id);
      for (const artist of track.artists) {
        artistsToCache.push({
          id: artist.id,
          name: artist.name,
          externalUrl: artist.external_urls?.spotify,
        });
      }
      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map((a) => a.name).join(', '),
        artistIds,
        album: track.album.name,
        durationMs: track.duration_ms,
        image: track.album.images[0]?.url,
        popularity: track.popularity,
        externalUrl: track.external_urls.spotify,
      };
    });
  } else {
    const response = await api.getMyTopArtists({ limit, time_range: timeRange });
    items = (response.body.items ?? []).map((artist) => {
      artistsToCache.push({
        id: artist.id,
        name: artist.name,
        image: artist.images[0]?.url,
        externalUrl: artist.external_urls.spotify,
      });
      return {
        id: artist.id,
        name: artist.name,
        image: artist.images[0]?.url,
        genres: artist.genres,
        popularity: artist.popularity,
        externalUrl: artist.external_urls.spotify,
      };
    });
  }

  await upsertArtists(artistsToCache);
  await insertSnapshot({ type, timeRange, items });
}

export async function runSpotifySync(options: { backfill?: boolean } = {}): Promise<void> {
  if (syncInProgress) {
    Logger.debug('Spotify sync - already running, skipped');
    return;
  }

  const token = await getSyncToken();
  if (!token?.refreshToken) {
    Logger.info('Spotify sync - no sync token, skipped');
    return;
  }

  syncInProgress = true;
  await setSyncRunning();
  const start = Date.now();

  try {
    const accessToken = await getValidSyncAccessToken();
    if (!accessToken) {
      throw new Error('Impossible de rafraîchir le token Spotify sync');
    }

    const api = getSpotifyWebApi();
    api.setAccessToken(accessToken);

    const playsInserted = await fetchAndStoreRecentlyPlayed(api, { backfill: options.backfill });
    logAnalytics('Spotify sync - recently played', { playsInserted });

    const timeRanges: SpotifyTimeRange[] = ['short_term', 'medium_term', 'long_term'];
    for (const timeRange of timeRanges) {
      await fetchAndStoreTopItems(api, 'top_tracks', timeRange);
      await fetchAndStoreTopItems(api, 'top_artists', timeRange);
    }

    const enrichResult = await enrichIncompleteArtists(api);
    Logger.success(
      `Spotify sync completed in ${Date.now() - start} ms (${playsInserted} plays inserted)`,
    );
    logAnalytics('Spotify sync - terminé', {
      durationMs: Date.now() - start,
      playsInserted,
      ...enrichResult,
    });

    await setSyncSuccess();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Spotify sync error', message);
    await setSyncError(message);
    logAnalytics('Spotify sync - erreur', { message, durationMs: Date.now() - start });
  } finally {
    syncInProgress = false;
  }
}

export function triggerSpotifySync(options: { backfill?: boolean } = {}): void {
  void runSpotifySync(options);
}
