import { Collection } from 'mongodb';
import { getDb } from '../../../shared/db/mongodb.js';

export interface SpotifyPlayDocument {
  trackId: string;
  name: string;
  artist: string;
  album: string;
  durationMs: number;
  playedAt: Date;
  image?: string;
  externalUrl?: string;
  artistIds?: string[];
  primaryArtistId?: string;
}

export interface SpotifyPlayInput {
  trackId: string;
  name: string;
  artist: string;
  album: string;
  durationMs: number;
  playedAt: Date;
  image?: string;
  externalUrl?: string;
  artistIds?: string[];
  primaryArtistId?: string;
}

export const DEFAULT_TOP_LIMIT = 50;

export function yearBounds(year: number): { from: Date; to: Date } {
  return {
    from: new Date(`${year}-01-01T00:00:00.000Z`),
    to: new Date(`${year + 1}-01-01T00:00:00.000Z`),
  };
}

export function monthBounds(year: number, month: number): { from: Date; to: Date } {
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 1));
  return { from, to };
}

export function currentMonthBounds(): { from: Date; to: Date } {
  const now = new Date();
  return monthBounds(now.getUTCFullYear(), now.getUTCMonth() + 1);
}

export function todayBounds(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return { from, to };
}

let playsCollection: Collection<SpotifyPlayDocument> | null = null;

export async function getPlaysCollection(): Promise<Collection<SpotifyPlayDocument>> {
  if (!playsCollection) {
    const db = getDb();
    playsCollection = db.collection<SpotifyPlayDocument>('spotify_plays');
    await playsCollection.createIndex({ playedAt: 1, trackId: 1 }, { unique: true });
    await playsCollection.createIndex({ playedAt: -1 });
  }
  return playsCollection;
}

export function serializePlay(doc: SpotifyPlayDocument) {
  return {
    trackId: doc.trackId,
    name: doc.name,
    artist: doc.artist,
    album: doc.album,
    durationMs: doc.durationMs,
    playedAt: doc.playedAt.toISOString(),
    image: doc.image,
    externalUrl: doc.externalUrl,
  };
}

export async function insertPlays(plays: SpotifyPlayInput[]): Promise<number> {
  if (plays.length === 0) return 0;

  const collection = await getPlaysCollection();
  let inserted = 0;

  for (const play of plays) {
    try {
      await collection.insertOne(play);
      inserted++;
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
        continue;
      }
      throw error;
    }
  }

  return inserted;
}

export async function countPlays(): Promise<number> {
  const collection = await getPlaysCollection();
  return collection.countDocuments({});
}

export async function getPlayDateRange(): Promise<{ first: Date | null; last: Date | null }> {
  const collection = await getPlaysCollection();
  const [firstDoc, lastDoc] = await Promise.all([
    collection.find({}).sort({ playedAt: 1 }).limit(1).toArray(),
    collection.find({}).sort({ playedAt: -1 }).limit(1).toArray(),
  ]);
  return {
    first: firstDoc[0]?.playedAt ?? null,
    last: lastDoc[0]?.playedAt ?? null,
  };
}

export async function getAvailablePeriods(): Promise<{
  years: number[];
  monthsByYear: Record<string, number[]>;
}> {
  const collection = await getPlaysCollection();
  const results = await collection
    .aggregate<{ _id: { year: number; month: number } }>([
      {
        $group: {
          _id: { year: { $year: '$playedAt' }, month: { $month: '$playedAt' } },
        },
      },
      { $sort: { '_id.year': -1 as const, '_id.month': -1 as const } },
    ])
    .toArray();

  const monthsByYear: Record<string, number[]> = {};
  const yearsSet = new Set<number>();

  for (const result of results) {
    const { year, month } = result._id;
    yearsSet.add(year);
    const key = String(year);
    if (!monthsByYear[key]) monthsByYear[key] = [];
    monthsByYear[key].push(month);
  }

  for (const year of Object.keys(monthsByYear)) {
    monthsByYear[year]!.sort((a, b) => b - a);
  }

  return {
    years: [...yearsSet].sort((a, b) => b - a),
    monthsByYear,
  };
}
