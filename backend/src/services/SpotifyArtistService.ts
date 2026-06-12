import { Collection, Filter } from 'mongodb';
import { getDb } from '../db/mongodb.js';

export interface SpotifyArtistDocument {
  _id: string;
  name: string;
  image?: string;
  genres?: string[];
  popularity?: number;
  externalUrl?: string;
  enrichedAt?: Date;
  updatedAt: Date;
}

export interface SpotifyArtistInput {
  id: string;
  name: string;
  image?: string;
  genres?: string[];
  popularity?: number;
  externalUrl?: string;
}

let artistsCollection: Collection<SpotifyArtistDocument> | null = null;

const INCOMPLETE_FIELD_CONDITIONS: Filter<SpotifyArtistDocument>[] = [
  { image: { $exists: false } },
  { image: null },
  { image: '' },
  { externalUrl: { $exists: false } },
  { externalUrl: null },
  { externalUrl: '' },
  { popularity: { $exists: false } },
  { genres: { $exists: false } },
  { genres: { $size: 0 } },
];

function buildArtistSetFields(
  artist: SpotifyArtistInput,
  now: Date,
  options: { merge: boolean },
): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    name: artist.name,
    updatedAt: now,
  };

  const maybeSet = (key: 'image' | 'genres' | 'popularity' | 'externalUrl', value: unknown) => {
    if (value === undefined) return;
    if (options.merge) {
      if (typeof value === 'string' && value.length === 0) return;
      if (Array.isArray(value) && value.length === 0) return;
    }
    fields[key] = value;
  };

  maybeSet('image', artist.image);
  maybeSet('genres', artist.genres);
  maybeSet('popularity', artist.popularity);
  maybeSet('externalUrl', artist.externalUrl);

  return fields;
}

async function getCollection(): Promise<Collection<SpotifyArtistDocument>> {
  if (!artistsCollection) {
    const db = getDb();
    artistsCollection = db.collection<SpotifyArtistDocument>('spotify_artists');
    await artistsCollection.createIndex({ name: 1 });
    await artistsCollection.createIndex({ enrichedAt: 1 });
  }
  return artistsCollection;
}

export function getArtistEnrichmentTtlDays(): number {
  const parsed = parseInt(process.env.SPOTIFY_ARTIST_ENRICH_TTL_DAYS ?? '30', 10);
  if (Number.isNaN(parsed) || parsed < 0) return 30;
  return parsed;
}

export async function upsertArtists(artists: SpotifyArtistInput[]): Promise<void> {
  if (artists.length === 0) return;

  const collection = await getCollection();
  const now = new Date();

  await Promise.all(
    artists.map((artist) =>
      collection.updateOne(
        { _id: artist.id },
        {
          $set: buildArtistSetFields(artist, now, { merge: true }),
        },
        { upsert: true },
      ),
    ),
  );
}

export async function findArtistsNeedingEnrichment(limit: number): Promise<SpotifyArtistDocument[]> {
  const collection = await getCollection();
  const ttlDays = getArtistEnrichmentTtlDays();
  const cutoff = new Date(Date.now() - ttlDays * 24 * 60 * 60 * 1000);

  const enrichmentDue: Filter<SpotifyArtistDocument>[] = [{ enrichedAt: { $exists: false } }];
  if (ttlDays > 0) {
    enrichmentDue.push({ enrichedAt: { $lt: cutoff } });
  }

  return collection
    .find({
      $and: [{ $or: enrichmentDue }, { $or: INCOMPLETE_FIELD_CONDITIONS }],
    })
    .limit(limit)
    .toArray();
}

export async function applyArtistEnrichment(updates: SpotifyArtistInput[]): Promise<void> {
  if (updates.length === 0) return;

  const collection = await getCollection();
  const now = new Date();

  await Promise.all(
    updates.map((artist) =>
      collection.updateOne(
        { _id: artist.id },
        {
          $set: {
            ...buildArtistSetFields(artist, now, { merge: false }),
            enrichedAt: now,
          },
        },
        { upsert: true },
      ),
    ),
  );
}

export async function markArtistsEnriched(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const collection = await getCollection();
  const now = new Date();

  await collection.updateMany(
    { _id: { $in: ids } },
    { $set: { enrichedAt: now, updatedAt: now } },
  );
}

export async function getArtistsByIds(ids: string[]): Promise<Map<string, SpotifyArtistDocument>> {
  if (ids.length === 0) return new Map();

  const collection = await getCollection();
  const docs = await collection.find({ _id: { $in: ids } }).toArray();
  return new Map(docs.map((doc) => [doc._id, doc]));
}

export async function getArtistsByNames(names: string[]): Promise<Map<string, SpotifyArtistDocument>> {
  if (names.length === 0) return new Map();

  const collection = await getCollection();
  const docs = await collection.find({ name: { $in: names } }).toArray();
  const map = new Map<string, SpotifyArtistDocument>();
  for (const doc of docs) {
    if (!map.has(doc.name)) {
      map.set(doc.name, doc);
    }
  }
  return map;
}
