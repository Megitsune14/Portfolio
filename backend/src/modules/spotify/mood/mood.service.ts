import { structuredCompletion } from '../../../ia/index.js'
import { aggregateSummary, aggregateTopTracks } from '../data/play.queries.js'
import {
  currentMonthBounds,
  todayBounds,
} from '../data/play.repository.js'
import { getCachedMood, setCachedMood } from './mood.cache.repository.js'
import {
  moodResponseSchema,
  type MoodResult,
  type MoodScope,
  type SpotifyMoodPayload,
} from './mood.schema.js'

const MAX_TRACKS_FOR_PROMPT = 80

const MONTH_LABELS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

function formatUtcDayKey(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatUtcMonthKey(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function todayPeriodLabel(): string {
  return "aujourd'hui"
}

function currentMonthPeriodLabel(): string {
  const now = new Date()
  const month = MONTH_LABELS[now.getUTCMonth()] ?? 'ce mois'
  return `${month} ${now.getUTCFullYear()}`
}

function buildPrompt(options: {
  periodLabel: string
  tracks: { artist: string; name: string; count: number }[]
  totalPlays: number
  uniqueTracks: number
}): string {
  const lines = options.tracks.map(
    (track) => `- ${track.artist} — ${track.name} (x${track.count})`,
  )

  return [
    `Analyse ces écoutes Spotify pour la période "${options.periodLabel}".`,
    `Total: ${options.totalPlays} écoutes, ${options.uniqueTracks} morceaux uniques.`,
    'Morceaux (artiste — titre, répétitions) :',
    ...lines,
    '',
    'Réponds UNIQUEMENT en JSON valide : { "mood": "..." }',
    'Le champ mood doit être une courte expression de 3 à 10 mots décrivant l\'ambiance générale.',
    'Réponds en français.',
  ].join('\n')
}

function toMoodResult(
  doc: {
    mood: string
    periodLabel: string
    trackCount: number
    generatedAt: Date
  },
  fromCache: boolean,
): MoodResult {
  return {
    mood: doc.mood,
    periodLabel: doc.periodLabel,
    trackCount: doc.trackCount,
    generatedAt: doc.generatedAt.toISOString(),
    fromCache,
  }
}

async function resolveMoodForScope(options: {
  scope: MoodScope
  from: Date
  to: Date
  periodKey: string
  periodLabel: string
}): Promise<MoodResult> {
  const cached = await getCachedMood(options.scope, options.periodKey)
  if (cached) {
    return toMoodResult(cached, true)
  }

  const [summary, tracks] = await Promise.all([
    aggregateSummary({ from: options.from, to: options.to }),
    aggregateTopTracks({ from: options.from, to: options.to, limit: MAX_TRACKS_FOR_PROMPT }),
  ])

  if (summary.totalPlays === 0) {
    const now = new Date()
    const result: MoodResult = {
      mood: 'aucune écoute',
      periodLabel: options.periodLabel,
      trackCount: 0,
      generatedAt: now.toISOString(),
      fromCache: false,
    }
    await setCachedMood({
      scope: options.scope,
      periodKey: options.periodKey,
      mood: result.mood,
      trackCount: 0,
      periodLabel: options.periodLabel,
    })
    return result
  }

  const prompt = buildPrompt({
    periodLabel: options.periodLabel,
    tracks,
    totalPlays: summary.totalPlays,
    uniqueTracks: summary.uniqueTracks,
  })

  const { mood } = await structuredCompletion({
    prompt,
    schema: moodResponseSchema,
  })

  const saved = await setCachedMood({
    scope: options.scope,
    periodKey: options.periodKey,
    mood,
    trackCount: summary.totalPlays,
    periodLabel: options.periodLabel,
  })

  return toMoodResult(saved, false)
}

export async function getSpotifyMood(): Promise<SpotifyMoodPayload> {
  const now = new Date()
  const dayBounds = todayBounds()
  const monthBounds = currentMonthBounds()

  const [day, month] = await Promise.all([
    resolveMoodForScope({
      scope: 'day',
      from: dayBounds.from,
      to: dayBounds.to,
      periodKey: formatUtcDayKey(now),
      periodLabel: todayPeriodLabel(),
    }),
    resolveMoodForScope({
      scope: 'month',
      from: monthBounds.from,
      to: monthBounds.to,
      periodKey: formatUtcMonthKey(now),
      periodLabel: currentMonthPeriodLabel(),
    }),
  ])

  return { day, month }
}
