import { Collection } from 'mongodb';
import type { RiotResponse } from '../../types/index.js';
import { getDb } from '../db/mongodb.js';

const STATS_DOC_ID = 'current' as const;

export interface RiotStatsDocument {
  _id: typeof STATS_DOC_ID;
  data: RiotResponse;
}

let statsCollection: Collection<RiotStatsDocument> | null = null;

async function getCollection(): Promise<Collection<RiotStatsDocument>> {
  if (!statsCollection) {
    const db = getDb();
    statsCollection = db.collection<RiotStatsDocument>('riot_stats');
  }
  return statsCollection;
}

export async function getRiotStats(): Promise<RiotResponse | null> {
  const collection = await getCollection();
  const doc = await collection.findOne({ _id: STATS_DOC_ID });
  return doc?.data ?? null;
}

/** Écrase les stats courantes - pas d'historique */
export async function saveRiotStats(data: RiotResponse): Promise<void> {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: STATS_DOC_ID },
    { $set: { data } },
    { upsert: true },
  );
}
