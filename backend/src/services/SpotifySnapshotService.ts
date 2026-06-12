import { Collection } from 'mongodb';
import { getDb } from '../db/mongodb.js';

export type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term';
export type SpotifySnapshotType = 'top_tracks' | 'top_artists';

export interface SpotifySnapshotItem {
  id: string;
  name: string;
  artist?: string;
  image?: string;
  popularity?: number;
  externalUrl?: string;
  genres?: string[];
  artistIds?: string[];
  album?: string;
  durationMs?: number;
  count?: number;
}

export interface SpotifySnapshotDocument {
  type: SpotifySnapshotType;
  timeRange: SpotifyTimeRange;
  fetchedAt: Date;
  items: SpotifySnapshotItem[];
}

let snapshotsCollection: Collection<SpotifySnapshotDocument> | null = null;

async function getCollection(): Promise<Collection<SpotifySnapshotDocument>> {
  if (!snapshotsCollection) {
    const db = getDb();
    snapshotsCollection = db.collection<SpotifySnapshotDocument>('spotify_snapshots');
    await snapshotsCollection.createIndex({ type: 1, timeRange: 1, fetchedAt: -1 });
  }
  return snapshotsCollection;
}

export function serializeSnapshot(doc: SpotifySnapshotDocument) {
  return {
    type: doc.type,
    timeRange: doc.timeRange,
    fetchedAt: doc.fetchedAt.toISOString(),
    items: doc.items,
  };
}

export async function insertSnapshot(snapshot: Omit<SpotifySnapshotDocument, 'fetchedAt'> & { fetchedAt?: Date }): Promise<void> {
  const collection = await getCollection();
  await collection.insertOne({
    ...snapshot,
    fetchedAt: snapshot.fetchedAt ?? new Date(),
  });
}

export async function getLatestSnapshot(
  type: SpotifySnapshotType,
  timeRange: SpotifyTimeRange,
): Promise<SpotifySnapshotDocument | null> {
  const collection = await getCollection();
  return collection.findOne({ type, timeRange }, { sort: { fetchedAt: -1 } });
}

export async function getLatestSnapshots(): Promise<SpotifySnapshotDocument[]> {
  const collection = await getCollection();
  const types: SpotifySnapshotType[] = ['top_tracks', 'top_artists'];
  const ranges: SpotifyTimeRange[] = ['short_term', 'medium_term', 'long_term'];

  const results = await Promise.all(
    types.flatMap((type) =>
      ranges.map((timeRange) => getLatestSnapshot(type, timeRange)),
    ),
  );

  return results.filter((s): s is SpotifySnapshotDocument => s !== null);
}

export async function shouldRefreshSnapshot(
  type: SpotifySnapshotType,
  timeRange: SpotifyTimeRange,
  maxAgeMs: number = 24 * 60 * 60 * 1000,
): Promise<boolean> {
  const latest = await getLatestSnapshot(type, timeRange);
  if (!latest) return true;
  return Date.now() - latest.fetchedAt.getTime() > maxAgeMs;
}
