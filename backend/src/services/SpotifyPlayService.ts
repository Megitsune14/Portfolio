import { Collection } from 'mongodb';
import { getDb } from '../db/mongodb.js';
import { getArtistsByIds, getArtistsByNames } from './SpotifyArtistService.js';

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

async function getCollection(): Promise<Collection<SpotifyPlayDocument>> {
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

  const collection = await getCollection();
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
  const collection = await getCollection();
  return collection.countDocuments({});
}

export async function getPlayDateRange(): Promise<{ first: Date | null; last: Date | null }> {
  const collection = await getCollection();
  const [firstDoc, lastDoc] = await Promise.all([
    collection.find({}).sort({ playedAt: 1 }).limit(1).toArray(),
    collection.find({}).sort({ playedAt: -1 }).limit(1).toArray(),
  ]);
  return {
    first: firstDoc[0]?.playedAt ?? null,
    last: lastDoc[0]?.playedAt ?? null,
  };
}

export interface AggregatedTopArtist {
  name: string;
  count: number;
  artistId?: string;
  image?: string;
  genres?: string[];
}

export async function getAvailablePeriods(): Promise<{
  years: number[];
  monthsByYear: Record<string, number[]>;
}> {
  const collection = await getCollection();
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

export async function aggregateTopArtists(options: {
  from?: Date;
  to?: Date;
  limit?: number;
}): Promise<AggregatedTopArtist[]> {
  const collection = await getCollection();
  const match: Record<string, unknown> = {};
  if (options.from || options.to) {
    match.playedAt = {};
    if (options.from) (match.playedAt as Record<string, Date>).$gte = options.from;
    if (options.to) (match.playedAt as Record<string, Date>).$lt = options.to;
  }

  const pipeline = [
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    {
      $project: {
        primaryArtistId: 1,
        artist: 1,
        artistIds: 1,
      },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $ifNull: ['$primaryArtistId', false] },
            '$primaryArtistId',
            '$artist',
          ],
        },
        name: { $first: '$artist' },
        artistId: { $first: '$primaryArtistId' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 as const } },
    { $limit: options.limit ?? DEFAULT_TOP_LIMIT },
  ];

  const results = await collection
    .aggregate<{
      _id: string;
      name: string;
      artistId?: string;
      count: number;
    }>(pipeline)
    .toArray();

  const artistIds = results.map((r) => r.artistId).filter((id): id is string => Boolean(id));
  const artistNames = results.filter((r) => !r.artistId).map((r) => r.name);

  const [byId, byName] = await Promise.all([
    getArtistsByIds(artistIds),
    getArtistsByNames(artistNames),
  ]);

  return results.map((r) => {
    const cached = r.artistId ? byId.get(r.artistId) : byName.get(r.name);
    return {
      name: cached?.name ?? r.name,
      count: r.count,
      artistId: r.artistId ?? cached?._id,
      image: cached?.image,
      genres: cached?.genres,
    };
  });
}

export async function aggregateTopTracks(options: {
  from?: Date;
  to?: Date;
  limit?: number;
}): Promise<{ trackId: string; name: string; artist: string; image?: string; count: number }[]> {
  const collection = await getCollection();
  const match: Record<string, unknown> = {};
  if (options.from || options.to) {
    match.playedAt = {};
    if (options.from) (match.playedAt as Record<string, Date>).$gte = options.from;
    if (options.to) (match.playedAt as Record<string, Date>).$lt = options.to;
  }

  const pipeline = [
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    {
      $group: {
        _id: '$trackId',
        name: { $first: '$name' },
        artist: { $first: '$artist' },
        image: { $first: '$image' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 as const } },
    { $limit: options.limit ?? DEFAULT_TOP_LIMIT },
  ];

  const results = await collection
    .aggregate<{ _id: string; name: string; artist: string; image?: string; count: number }>(pipeline)
    .toArray();

  return results.map((r) => ({
    trackId: r._id,
    name: r.name,
    artist: r.artist,
    image: r.image,
    count: r.count,
  }));
}

export async function aggregateSummary(options: { from?: Date; to?: Date }): Promise<{
  totalPlays: number;
  uniqueTracks: number;
  uniqueArtists: number;
  estimatedListeningMs: number;
}> {
  const collection = await getCollection();
  const match: Record<string, unknown> = {};
  if (options.from || options.to) {
    match.playedAt = {};
    if (options.from) (match.playedAt as Record<string, Date>).$gte = options.from;
    if (options.to) (match.playedAt as Record<string, Date>).$lt = options.to;
  }

  const pipeline = [
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    {
      $group: {
        _id: null as null,
        totalPlays: { $sum: 1 },
        uniqueTracks: { $addToSet: '$trackId' },
        uniqueArtists: { $addToSet: '$artist' },
        estimatedListeningMs: { $sum: '$durationMs' },
      },
    },
  ];

  const [result] = await collection
    .aggregate<{
      totalPlays: number;
      uniqueTracks: string[];
      uniqueArtists: string[];
      estimatedListeningMs: number;
    }>(pipeline)
    .toArray();

  if (!result) {
    return { totalPlays: 0, uniqueTracks: 0, uniqueArtists: 0, estimatedListeningMs: 0 };
  }

  return {
    totalPlays: result.totalPlays,
    uniqueTracks: result.uniqueTracks.length,
    uniqueArtists: result.uniqueArtists.length,
    estimatedListeningMs: result.estimatedListeningMs,
  };
}

export async function aggregateMostActiveMonth(options: {
  from?: Date;
  to?: Date;
}): Promise<{ month: number; year: number; count: number } | null> {
  const collection = await getCollection();
  const match: Record<string, unknown> = {};
  if (options.from || options.to) {
    match.playedAt = {};
    if (options.from) (match.playedAt as Record<string, Date>).$gte = options.from;
    if (options.to) (match.playedAt as Record<string, Date>).$lt = options.to;
  }

  const pipeline = [
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    {
      $group: {
        _id: { year: { $year: '$playedAt' }, month: { $month: '$playedAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 as const } },
    { $limit: 1 },
  ];

  const [result] = await collection
    .aggregate<{ _id: { year: number; month: number }; count: number }>(pipeline)
    .toArray();

  if (!result) return null;
  return { year: result._id.year, month: result._id.month, count: result.count };
}

export async function aggregateMostActiveDayOfWeek(options: {
  from?: Date;
  to?: Date;
}): Promise<{ dayOfWeek: number; count: number; estimatedListeningMs: number } | null> {
  const collection = await getCollection();
  const match: Record<string, unknown> = {};
  if (options.from || options.to) {
    match.playedAt = {};
    if (options.from) (match.playedAt as Record<string, Date>).$gte = options.from;
    if (options.to) (match.playedAt as Record<string, Date>).$lt = options.to;
  }

  const pipeline = [
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    {
      $group: {
        _id: { $dayOfWeek: '$playedAt' },
        count: { $sum: 1 },
        estimatedListeningMs: { $sum: '$durationMs' },
      },
    },
    { $sort: { count: -1 as const } },
    { $limit: 1 },
  ];

  const [result] = await collection
    .aggregate<{ _id: number; count: number; estimatedListeningMs: number }>(pipeline)
    .toArray();

  if (!result) return null;
  return {
    dayOfWeek: result._id,
    count: result.count,
    estimatedListeningMs: result.estimatedListeningMs,
  };
}
