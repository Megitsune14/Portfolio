import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../../../shared/db/mongodb.js';

export interface VisitorDocument {
  _id?: ObjectId;
  ip: string;
  userAgent: string;
  referrer: string | null;
  path: string;
  createdAt: Date;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  region?: string | null;
  browser?: string | null;
  os?: string | null;
  deviceType?: string | null;
}

let visitorsCollection: Collection<VisitorDocument> | null = null;

export async function getVisitorsCollection(): Promise<Collection<VisitorDocument>> {
  if (!visitorsCollection) {
    const db = getDb();
    visitorsCollection = db.collection<VisitorDocument>('visitors');
    await visitorsCollection.createIndex({ createdAt: -1 });
    await visitorsCollection.createIndex({ ip: 1 });
  }
  return visitorsCollection;
}

export async function insertVisitor(document: VisitorDocument): Promise<VisitorDocument> {
  const collection = await getVisitorsCollection();
  const result = await collection.insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function findVisitorsPaginated(options: {
  page: number;
  limit: number;
}): Promise<{ visitors: VisitorDocument[]; total: number }> {
  const collection = await getVisitorsCollection();
  const skip = (options.page - 1) * options.limit;

  const [visitors, total] = await Promise.all([
    collection.find({}).sort({ createdAt: -1 }).skip(skip).limit(options.limit).toArray(),
    collection.countDocuments({}),
  ]);

  return { visitors, total };
}

export async function countVisitors(): Promise<number> {
  const collection = await getVisitorsCollection();
  return collection.countDocuments({});
}

export async function countUniqueVisitorIps(): Promise<number> {
  const collection = await getVisitorsCollection();
  return collection.distinct('ip').then((ips) => ips.length);
}
