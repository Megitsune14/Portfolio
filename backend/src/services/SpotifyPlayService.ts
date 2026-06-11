import { Collection } from 'mongodb';
import { getDb } from '../db/mongodb.js';

export interface SpotifyPlayDocument {
  trackId: string;
  name: string;
  artist: string;
  album: string;
  durationMs: number;
  playedAt: Date;
  image?: string;
  externalUrl?: string;
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

export async function aggregateTopArtists(options: {
  from?: Date;
  to?: Date;
  limit?: number;
}): Promise<{ name: string; count: number }[]> {
  const collection = await getCollection();
  const match: Record<string, unknown> = {};
  if (options.from || options.to) {
    match.playedAt = {};
    if (options.from) (match.playedAt as Record<string, Date>).$gte = options.from;
    if (options.to) (match.playedAt as Record<string, Date>).$lt = options.to;
  }

  const pipeline = [
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    { $group: { _id: '$artist', count: { $sum: 1 } } },
    { $sort: { count: -1 as const } },
    { $limit: options.limit ?? 10 },
  ];

  const results = await collection.aggregate<{ _id: string; count: number }>(pipeline).toArray();
  return results.map((r) => ({ name: r._id, count: r.count }));
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
    { $limit: options.limit ?? 10 },
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
}): Promise<{ dayOfWeek: number; count: number } | null> {
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
      },
    },
    { $sort: { count: -1 as const } },
    { $limit: 1 },
  ];

  const [result] = await collection
    .aggregate<{ _id: number; count: number }>(pipeline)
    .toArray();

  if (!result) return null;
  return { dayOfWeek: result._id, count: result.count };
}
