import { Collection } from 'mongodb';
import { getDb } from '../../../shared/db/mongodb.js';

export interface SpotifySyncTokenDocument {
  _id: 'singleton';
  spotifyUserId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  displayName?: string;
  connectedAt: Date;
  updatedAt: Date;
}

let tokenCollection: Collection<SpotifySyncTokenDocument> | null = null;

async function getCollection(): Promise<Collection<SpotifySyncTokenDocument>> {
  if (!tokenCollection) {
    const db = getDb();
    tokenCollection = db.collection<SpotifySyncTokenDocument>('spotify_sync_tokens');
  }
  return tokenCollection;
}

export function serializeSyncToken(doc: SpotifySyncTokenDocument) {
  return {
    spotifyUserId: doc.spotifyUserId,
    displayName: doc.displayName,
    connectedAt: doc.connectedAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    expiresAt: doc.expiresAt,
  };
}

export async function getSyncToken(): Promise<SpotifySyncTokenDocument | null> {
  const collection = await getCollection();
  return collection.findOne({ _id: 'singleton' });
}

export async function saveSyncToken(data: {
  spotifyUserId: string;
  accessToken: string;
  refreshToken: string;
  displayName?: string;
}): Promise<SpotifySyncTokenDocument> {
  const collection = await getCollection();
  const now = new Date();
  const expiresAt = Date.now() + 3600 * 1000;

  const document: SpotifySyncTokenDocument = {
    _id: 'singleton',
    spotifyUserId: data.spotifyUserId,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt,
    displayName: data.displayName,
    connectedAt: now,
    updatedAt: now,
  };

  await collection.updateOne(
    { _id: 'singleton' },
    {
      $set: {
        spotifyUserId: document.spotifyUserId,
        accessToken: document.accessToken,
        refreshToken: document.refreshToken,
        expiresAt: document.expiresAt,
        displayName: document.displayName,
        updatedAt: now,
      },
      $setOnInsert: { connectedAt: now },
    },
    { upsert: true },
  );

  const saved = await collection.findOne({ _id: 'singleton' });
  if (!saved) {
    throw new Error('Failed to save sync token');
  }
  return saved;
}

export async function updateSyncAccessToken(accessToken: string, expiresAt: number): Promise<void> {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: 'singleton' },
    { $set: { accessToken, expiresAt, updatedAt: new Date() } },
  );
}

export async function deleteSyncToken(): Promise<void> {
  const collection = await getCollection();
  await collection.deleteOne({ _id: 'singleton' });
}

export async function hasSyncToken(): Promise<boolean> {
  const token = await getSyncToken();
  return token !== null && !!token.refreshToken;
}
