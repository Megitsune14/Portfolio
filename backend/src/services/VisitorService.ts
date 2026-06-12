import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../db/mongodb.js';
import { logAnalytics } from '../utils/analyticsLogger.js';
import {
  formatLocation,
  lookupGeoFromIp,
  parseUserAgent,
  type VisitorClient,
  type VisitorGeo,
} from '../utils/visitorMetadata.js';

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

export interface SerializedVisitor {
  id: string;
  ip: string;
  path: string;
  createdAt: string;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  location: string;
  device: string;
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

function formatDevice(client: VisitorClient): string {
  const parts = [
    client.deviceType === 'mobile'
      ? 'Mobile'
      : client.deviceType === 'tablet'
        ? 'Tablette'
        : 'Desktop',
    client.os,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : '-';
}

export function serializeVisitor(visitor: VisitorDocument): SerializedVisitor {
  const geo: VisitorGeo = {
    country: visitor.country ?? null,
    countryCode: visitor.countryCode ?? null,
    city: visitor.city ?? null,
    region: visitor.region ?? null,
  };
  const client: VisitorClient = {
    browser: visitor.browser ?? null,
    os: visitor.os ?? null,
    deviceType: visitor.deviceType ?? null,
  };

  return {
    id: visitor._id?.toString() ?? '',
    ip: visitor.ip,
    path: visitor.path,
    createdAt: visitor.createdAt.toISOString(),
    country: geo.country,
    countryCode: geo.countryCode,
    city: geo.city,
    region: geo.region,
    browser: client.browser,
    os: client.os,
    deviceType: client.deviceType,
    location: formatLocation(geo),
    device: formatDevice(client),
  };
}

export async function enrichVisitorForDisplay(
  visitor: VisitorDocument,
): Promise<SerializedVisitor> {
  let doc = visitor;

  if (!visitor.country && !visitor.countryCode && visitor.ip) {
    const geo = await lookupGeoFromIp(visitor.ip);
    doc = { ...visitor, ...geo };
  }

  if (!visitor.browser && visitor.userAgent) {
    const client = parseUserAgent(visitor.userAgent);
    doc = { ...doc, ...client };
  }

  return serializeVisitor(doc);
}

export async function recordVisit(data: {
  ip: string;
  userAgent: string;
  referrer: string | null;
  path: string;
  countryCode?: string | null;
}): Promise<VisitorDocument> {
  const start = Date.now();
  logAnalytics('Enregistrement visite - début', { ip: data.ip, path: data.path });

  const collection = await getCollection();
  const client = parseUserAgent(data.userAgent);
  const geo = await lookupGeoFromIp(data.ip, data.countryCode ?? null);

  const document: VisitorDocument = {
    ...data,
    ...geo,
    ...client,
    createdAt: new Date(),
  };

  const result = await collection.insertOne(document);
  const visit = { ...document, _id: result.insertedId };

  logAnalytics('Enregistrement visite - terminé', {
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
