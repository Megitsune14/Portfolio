import Logger from '../../../shared/utils/logger.js';
import { logAnalytics } from '../../../shared/utils/analyticsLogger.js';
import {
  formatLocation,
  lookupGeoFromIp,
  parseUserAgent,
  type VisitorClient,
  type VisitorGeo,
} from './visitorMetadata.js';
import {
  countUniqueVisitorIps,
  countVisitors,
  findVisitorsPaginated,
  insertVisitor,
  type VisitorDocument,
} from './visitors.repository.js';

export type { VisitorDocument };

export interface SerializedVisitor {
  id: string;
  ip: string;
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

export async function enrichVisitorForDisplay(visitor: VisitorDocument): Promise<SerializedVisitor> {
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

  const client = parseUserAgent(data.userAgent);
  const geo = await lookupGeoFromIp(data.ip, data.countryCode ?? null);

  const document: VisitorDocument = {
    ...data,
    ...geo,
    ...client,
    createdAt: new Date(),
  };

  const visit = await insertVisitor(document);

  logAnalytics('Enregistrement visite - terminé', {
    id: visit._id?.toString(),
    ip: data.ip,
    path: data.path,
    durationMs: Date.now() - start,
  });

  return visit;
}

export async function getVisitors(options: { page: number; limit: number }) {
  return findVisitorsPaginated(options);
}

export async function getVisitorStats(): Promise<VisitorStats> {
  const [totalVisits, uniqueIps] = await Promise.all([countVisitors(), countUniqueVisitorIps()]);
  return { totalVisits, uniqueIps };
}
