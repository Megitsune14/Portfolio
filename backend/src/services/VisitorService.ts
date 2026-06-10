import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../db/mongodb.js';
import { logAnalytics } from '../utils/analyticsLogger.js';

export interface VisitorDocument {
  _id?: ObjectId;
  ip: string;
  userAgent: string;
  referrer: string | null;
  path: string;
  createdAt: Date;
}

export interface VisitorStats {
  totalVisits: number;
  uniqueIps: number;
}

let visitorsCollection: Collection<VisitorDocument> | null = null;

async function getCollection(): Promise<Collection<VisitorDocument>> {
  if (!visitorsCollection) {
    const db = getDb();
    visitorsCollection = db.collection<VisitorDocument>('visitors');
    await visitorsCollection.createIndex({ createdAt: -1 });
    await visitorsCollection.createIndex({ ip: 1 });
  }
  return visitorsCollection;
}

export async function recordVisit(data: {
  ip: string;
  userAgent: string;
  referrer: string | null;
  path: string;
}): Promise<VisitorDocument> {
  const start = Date.now();
  logAnalytics('Enregistrement visite — début', { ip: data.ip, path: data.path });

  const collection = await getCollection();

  const document: VisitorDocument = {
    ...data,
    createdAt: new Date(),
  };

  const result = await collection.insertOne(document);
  const visit = { ...document, _id: result.insertedId };

  logAnalytics('Enregistrement visite — terminé', {
    id: visit._id?.toString(),
    ip: data.ip,
    path: data.path,
    durationMs: Date.now() - start,
  });

  return visit;
}

export async function getVisitors(options: {
  page: number;
  limit: number;
}): Promise<{ visitors: VisitorDocument[]; total: number }> {
  const collection = await getCollection();
  const skip = (options.page - 1) * options.limit;

  const [visitors, total] = await Promise.all([
    collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .toArray(),
    collection.countDocuments({}),
  ]);

  return { visitors, total };
}

export async function getVisitorStats(): Promise<VisitorStats> {
  const collection = await getCollection();

  const [totalVisits, uniqueIps] = await Promise.all([
    collection.countDocuments({}),
    collection.distinct('ip').then((ips) => ips.length),
  ]);

  return {
    totalVisits,
    uniqueIps,
  };
}
