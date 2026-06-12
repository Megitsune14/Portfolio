import type SpotifyWebApi from 'spotify-web-api-node';
import { logAnalytics } from '../utils/analyticsLogger.js';
import { delayBetweenBatches, spotifyCall } from '../utils/spotifyRateLimit.js';
import {
  applyArtistEnrichment,
  findArtistsNeedingEnrichment,
  markArtistsEnriched,
  type SpotifyArtistInput,
} from './SpotifyArtistService.js';

function getBatchSize(): number {
  const parsed = parseInt(process.env.SPOTIFY_ARTIST_ENRICH_BATCH_SIZE ?? '50', 10);
  if (Number.isNaN(parsed)) return 50;
  return Math.min(Math.max(parsed, 1), 50);
}

function getDelayMs(): number {
  const parsed = parseInt(process.env.SPOTIFY_ARTIST_ENRICH_DELAY_MS ?? '150', 10);
  if (Number.isNaN(parsed) || parsed < 0) return 150;
  return parsed;
}

function getMaxPerSync(): number {
  const parsed = parseInt(process.env.SPOTIFY_ARTIST_ENRICH_MAX_PER_SYNC ?? '500', 10);
  if (Number.isNaN(parsed) || parsed < 1) return 500;
  return parsed;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function mapSpotifyArtist(artist: {
  id: string;
  name: string;
  images?: { url: string }[];
  genres?: string[];
  popularity?: number;
  external_urls?: { spotify?: string };
}): SpotifyArtistInput {
  return {
    id: artist.id,
    name: artist.name,
    image: artist.images?.[0]?.url,
    genres: artist.genres,
    popularity: artist.popularity,
    externalUrl: artist.external_urls?.spotify,
  };
}

export async function enrichIncompleteArtists(
  api: SpotifyWebApi,
): Promise<{ requested: number; updated: number; batches: number; durationMs: number }> {
  const start = Date.now();
  const maxPerSync = getMaxPerSync();
  const batchSize = getBatchSize();
  const delayMs = getDelayMs();

  const artists = await findArtistsNeedingEnrichment(maxPerSync);
  if (artists.length === 0) {
    return { requested: 0, updated: 0, batches: 0, durationMs: Date.now() - start };
  }

  const batches = chunk(artists, batchSize);
  let updated = 0;

  for (let index = 0; index < batches.length; index++) {
    const batch = batches[index]!;
    const ids = batch.map((artist) => artist._id);

    const response = await spotifyCall(() => api.getArtists(ids));
    const spotifyArtists = response.body.artists ?? [];

    const enrichments: SpotifyArtistInput[] = [];
    const missingIds: string[] = [];

    for (let i = 0; i < ids.length; i++) {
      const spotifyArtist = spotifyArtists[i];
      if (!spotifyArtist) {
        missingIds.push(ids[i]!);
        continue;
      }
      enrichments.push(mapSpotifyArtist(spotifyArtist));
    }

    if (enrichments.length > 0) {
      await applyArtistEnrichment(enrichments);
      updated += enrichments.length;
    }

    if (missingIds.length > 0) {
      await markArtistsEnriched(missingIds);
    }

    if (index < batches.length - 1) {
      await delayBetweenBatches(delayMs);
    }
  }

  const result = {
    requested: artists.length,
    updated,
    batches: batches.length,
    durationMs: Date.now() - start,
  };

  logAnalytics('Spotify sync - artist enrichment', result);
  return result;
}
