import { Collection } from 'mongodb';
import { getDb } from '../../../shared/db/mongodb.js';

export type SyncStatus = 'idle' | 'running' | 'success' | 'error';

export interface SpotifySyncMetaDocument {
  _id: 'singleton';
  lastSyncAt: Date | null;
  lastSyncStatus: SyncStatus;
  lastSyncError?: string;
  updatedAt: Date;
}

let metaCollection: Collection<SpotifySyncMetaDocument> | null = null;

async function getCollection(): Promise<Collection<SpotifySyncMetaDocument>> {
  if (!metaCollection) {
    const db = getDb();
    metaCollection = db.collection<SpotifySyncMetaDocument>('spotify_sync_meta');
  }
  return metaCollection;
}

export function serializeSyncMeta(doc: SpotifySyncMetaDocument) {
  return {
    lastSyncAt: doc.lastSyncAt?.toISOString() ?? null,
    lastSyncStatus: doc.lastSyncStatus,
    lastSyncError: doc.lastSyncError,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getSyncMeta(): Promise<SpotifySyncMetaDocument> {
  const collection = await getCollection();
  const existing = await collection.findOne({ _id: 'singleton' });
  if (existing) return existing;

  const defaultDoc: SpotifySyncMetaDocument = {
    _id: 'singleton',
    lastSyncAt: null,
    lastSyncStatus: 'idle',
    updatedAt: new Date(),
  };
  await collection.insertOne(defaultDoc);
  return defaultDoc;
}

export async function setSyncRunning(): Promise<void> {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: 'singleton' },
    {
      $set: { lastSyncStatus: 'running' as SyncStatus, updatedAt: new Date() },
      $unset: { lastSyncError: '' },
    },
    { upsert: true },
  );
}

export async function setSyncSuccess(): Promise<void> {
  const collection = await getCollection();
  const now = new Date();
  await collection.updateOne(
    { _id: 'singleton' },
    {
      $set: {
        lastSyncAt: now,
        lastSyncStatus: 'success' as SyncStatus,
        updatedAt: now,
      },
      $unset: { lastSyncError: '' },
    },
    { upsert: true },
  );
}

export async function setSyncError(error: string): Promise<void> {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: 'singleton' },
    {
      $set: {
        lastSyncStatus: 'error' as SyncStatus,
        lastSyncError: error,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
}
