import {
  aggregateMostActiveDayOfWeek,
  aggregateMostActiveMonth,
  aggregateSummary,
  aggregateTopArtists,
  aggregateTopTracks,
  countPlays,
  getPlayDateRange,
} from './SpotifyPlayService.js';
import { getLatestSnapshot, getLatestSnapshots, serializeSnapshot } from './SpotifySnapshotService.js';
import { getSyncMeta, serializeSyncMeta } from './SpotifySyncMetaService.js';
import { getSyncToken, hasSyncToken, serializeSyncToken } from './SpotifySyncTokenService.js';
import type { SpotifySnapshotType, SpotifyTimeRange } from './SpotifySnapshotService.js';

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function formatListeningTime(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
}

function yearBounds(year: number): { from: Date; to: Date } {
  return {
    from: new Date(`${year}-01-01T00:00:00.000Z`),
    to: new Date(`${year + 1}-01-01T00:00:00.000Z`),
  };
}

async function buildWrappedSummary(options: { from?: Date; to?: Date; periodLabel: string }) {
  const [summary, topArtists, topTracks, activeMonth, activeDay] = await Promise.all([
    aggregateSummary({ from: options.from, to: options.to }),
    aggregateTopArtists({ from: options.from, to: options.to, limit: 10 }),
    aggregateTopTracks({ from: options.from, to: options.to, limit: 10 }),
    aggregateMostActiveMonth({ from: options.from, to: options.to }),
    aggregateMostActiveDayOfWeek({ from: options.from, to: options.to }),
  ]);

  return {
    periodLabel: options.periodLabel,
    totalPlays: summary.totalPlays,
    uniqueTracks: summary.uniqueTracks,
    uniqueArtists: summary.uniqueArtists,
    estimatedListeningTime: formatListeningTime(summary.estimatedListeningMs),
    estimatedListeningMs: summary.estimatedListeningMs,
    topArtists,
    topTracks,
    mostActiveMonth: activeMonth
      ? { label: `${MONTH_NAMES[activeMonth.month - 1]} ${activeMonth.year}`, count: activeMonth.count }
      : null,
    mostActiveDay: activeDay
      ? { label: DAY_NAMES[activeDay.dayOfWeek - 1] ?? `Jour ${activeDay.dayOfWeek}`, count: activeDay.count }
      : null,
  };
}

export async function getNexusSpotifyStatus() {
  const [connected, meta, totalPlays, token] = await Promise.all([
    hasSyncToken(),
    getSyncMeta(),
    countPlays(),
    getSyncToken(),
  ]);

  return {
    connected,
    displayName: token?.displayName,
    token: token ? serializeSyncToken(token) : null,
    sync: serializeSyncMeta(meta),
    totalPlays,
  };
}

export async function getWrappedForYear(year: number) {
  const { from, to } = yearBounds(year);
  return buildWrappedSummary({
    from,
    to,
    periodLabel: String(year),
  });
}

export async function getWrappedAllTime() {
  const dateRange = await getPlayDateRange();
  return {
    ...(await buildWrappedSummary({ periodLabel: 'Tout l\'historique' })),
    firstPlayAt: dateRange.first?.toISOString() ?? null,
    lastPlayAt: dateRange.last?.toISOString() ?? null,
  };
}

export async function getTopSnapshot(type: SpotifySnapshotType, timeRange: SpotifyTimeRange) {
  const snapshot = await getLatestSnapshot(type, timeRange);
  return snapshot ? serializeSnapshot(snapshot) : null;
}

export async function getAllTopSnapshots() {
  const snapshots = await getLatestSnapshots();
  return snapshots.map(serializeSnapshot);
}

export { formatListeningTime };
