import { getArtistsByIds, getArtistsByNames } from './artist.repository.js';
import { DEFAULT_TOP_LIMIT, getPlaysCollection } from './play.repository.js';

export interface AggregatedTopArtist {
  name: string;
  count: number;
  artistId?: string;
  image?: string;
}

export async function aggregateTopArtists(options: {
  from?: Date;
  to?: Date;
  limit?: number;
}): Promise<AggregatedTopArtist[]> {
  const collection = await getPlaysCollection();
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
          $cond: [{ $ifNull: ['$primaryArtistId', false] }, '$primaryArtistId', '$artist'],
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
    };
  });
}

export async function aggregateTopTracks(options: {
  from?: Date;
  to?: Date;
  limit?: number;
}): Promise<{ trackId: string; name: string; artist: string; image?: string; count: number }[]> {
  const collection = await getPlaysCollection();
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
  const collection = await getPlaysCollection();
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
  const collection = await getPlaysCollection();
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
  const collection = await getPlaysCollection();
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
