import {
  aggregateMostActiveDayOfWeek,
  aggregateMostActiveMonth,
  aggregateSummary,
  aggregateTopArtists,
  aggregateTopTracks,
} from '../data/play.queries.js';
import {
  countPlays,
  currentMonthBounds,
  getAvailablePeriods,
  getPlayDateRange,
  getRecentPlays,
  monthBounds,
  todayBounds,
  yearBounds,
  DEFAULT_TOP_LIMIT,
} from '../data/play.repository.js';
import {
  getLatestSnapshot,
  getLatestSnapshots,
  serializeSnapshot,
  type SpotifySnapshotItem,
  type SpotifySnapshotType,
  type SpotifyTimeRange,
} from '../data/snapshot.repository.js';
import { getSyncMeta, serializeSyncMeta } from '../sync/sync-meta.repository.js';
import { getSyncToken, hasSyncToken, serializeSyncToken } from '../sync/sync-token.repository.js';
import type { WrappedPeriodQuery } from '../schemas/wrapped.schemas.js';

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

function resolveWrappedBounds(query: WrappedPeriodQuery): {
  from?: Date;
  to?: Date;
  periodLabel: string;
} {
  if (query.period === 'all-time') {
    return { periodLabel: 'Depuis le début' };
  }

  if (query.period === 'year' && query.year) {
    const { from, to } = yearBounds(query.year);
    return { from, to, periodLabel: String(query.year) };
  }

  if (query.period === 'month' && query.year) {
    const month =
      query.month === 'current'
        ? new Date().getUTCMonth() + 1
        : typeof query.month === 'number'
          ? query.month
          : null;

    if (!month) {
      const { from, to } = yearBounds(query.year);
      return { from, to, periodLabel: String(query.year) };
    }

    const { from, to } = monthBounds(query.year, month);
    return {
      from,
      to,
      periodLabel: `${MONTH_NAMES[month - 1]} ${query.year}`,
    };
  }

  const currentYear = new Date().getFullYear();
  const { from, to } = yearBounds(currentYear);
  return { from, to, periodLabel: String(currentYear) };
}

async function buildWrappedSummary(query: WrappedPeriodQuery) {
  const bounds = resolveWrappedBounds(query);
  const limit = DEFAULT_TOP_LIMIT;

  const today = todayBounds();
  const isCurrentMonth =
    query.period === 'month' && 'month' in query && query.month === 'current';

  const [summary, topArtists, topTracks, activeMonth, activeDay, todaySummary, recentPlays] =
    await Promise.all([
      aggregateSummary({ from: bounds.from, to: bounds.to }),
      aggregateTopArtists({ from: bounds.from, to: bounds.to, limit }),
      aggregateTopTracks({ from: bounds.from, to: bounds.to, limit }),
      aggregateMostActiveMonth({ from: bounds.from, to: bounds.to }),
      aggregateMostActiveDayOfWeek({ from: bounds.from, to: bounds.to }),
      aggregateSummary({ from: today.from, to: today.to }),
      isCurrentMonth
        ? getRecentPlays({ from: bounds.from, to: bounds.to, limit: 10 })
        : Promise.resolve([]),
    ]);

  return {
    period: query.period,
    year: 'year' in query ? query.year : null,
    month: query.period === 'month' && 'month' in query ? query.month : null,
    periodLabel: bounds.periodLabel,
    totalPlays: summary.totalPlays,
    uniqueTracks: summary.uniqueTracks,
    uniqueArtists: summary.uniqueArtists,
    estimatedListeningTime: formatListeningTime(summary.estimatedListeningMs),
    estimatedListeningMs: summary.estimatedListeningMs,
    topArtists,
    topTracks,
    recentPlays: isCurrentMonth ? recentPlays : undefined,
    mostActiveMonth: activeMonth
      ? { label: `${MONTH_NAMES[activeMonth.month - 1]} ${activeMonth.year}`, count: activeMonth.count }
      : null,
    mostActiveDay: activeDay
      ? {
          label: DAY_NAMES[activeDay.dayOfWeek - 1] ?? `Jour ${activeDay.dayOfWeek}`,
          count: activeDay.count,
          estimatedListeningTime: formatListeningTime(activeDay.estimatedListeningMs),
          estimatedListeningMs: activeDay.estimatedListeningMs,
        }
      : null,
    todayPlays: {
      count: todaySummary.totalPlays,
      estimatedListeningTime: formatListeningTime(todaySummary.estimatedListeningMs),
      estimatedListeningMs: todaySummary.estimatedListeningMs,
    },
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

export async function getWrappedForPeriod(query: WrappedPeriodQuery) {
  if (query.period === 'all-time') {
    const dateRange = await getPlayDateRange();
    return {
      ...(await buildWrappedSummary(query)),
      firstPlayAt: dateRange.first?.toISOString() ?? null,
      lastPlayAt: dateRange.last?.toISOString() ?? null,
    };
  }

  return buildWrappedSummary(query);
}

export async function getWrappedForYear(year: number) {
  return getWrappedForPeriod({ period: 'year', year });
}

export async function getWrappedAllTime() {
  return getWrappedForPeriod({ period: 'all-time' });
}

export async function getSpotifyPeriods() {
  return getAvailablePeriods();
}

function mapLocalItemsToSnapshotItems(
  artists: Awaited<ReturnType<typeof aggregateTopArtists>>,
): SpotifySnapshotItem[] {
  return artists.map((artist) => ({
    id: artist.artistId ?? artist.name,
    name: artist.name,
    image: artist.image,
    count: artist.count,
    externalUrl: undefined as string | undefined,
  }));
}

function mapLocalTracksToSnapshotItems(
  tracks: Awaited<ReturnType<typeof aggregateTopTracks>>,
): SpotifySnapshotItem[] {
  return tracks.map((track) => ({
    id: track.trackId,
    name: track.name,
    artist: track.artist,
    image: track.image,
    count: track.count,
    externalUrl: undefined as string | undefined,
  }));
}

export async function getTopsPanel() {
  const { from, to } = currentMonthBounds();
  const limit = DEFAULT_TOP_LIMIT;

  const [snapshots, monthArtists, monthTracks] = await Promise.all([
    getLatestSnapshots(),
    aggregateTopArtists({ from, to, limit }),
    aggregateTopTracks({ from, to, limit }),
  ]);

  type TopBubble = {
    id: string;
    type: SpotifySnapshotType;
    timeRange: SpotifyTimeRange | 'current_month';
    source: 'spotify' | 'local';
    fetchedAt: string | null;
    items: SpotifySnapshotItem[];
  };

  const bubbles: TopBubble[] = [];

  bubbles.push(
    {
      id: 'tracks-current_month',
      type: 'top_tracks',
      timeRange: 'current_month',
      source: 'local',
      fetchedAt: new Date().toISOString(),
      items: mapLocalTracksToSnapshotItems(monthTracks),
    },
    {
      id: 'artists-current_month',
      type: 'top_artists',
      timeRange: 'current_month',
      source: 'local',
      fetchedAt: new Date().toISOString(),
      items: mapLocalItemsToSnapshotItems(monthArtists),
    },
  );

  const spotifyRanges: SpotifyTimeRange[] = ['short_term', 'medium_term', 'long_term'];
  for (const timeRange of spotifyRanges) {
    const artistSnapshot = snapshots.find(
      (s) => s.type === 'top_artists' && s.timeRange === timeRange,
    );
    const trackSnapshot = snapshots.find(
      (s) => s.type === 'top_tracks' && s.timeRange === timeRange,
    );

    bubbles.push(
      {
        id: `tracks-${timeRange}`,
        type: 'top_tracks',
        timeRange,
        source: 'spotify',
        fetchedAt: trackSnapshot?.fetchedAt.toISOString() ?? null,
        items: trackSnapshot?.items ?? [],
      },
      {
        id: `artists-${timeRange}`,
        type: 'top_artists',
        timeRange,
        source: 'spotify',
        fetchedAt: artistSnapshot?.fetchedAt.toISOString() ?? null,
        items: artistSnapshot?.items ?? [],
      },
    );
  }

  return { bubbles };
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
