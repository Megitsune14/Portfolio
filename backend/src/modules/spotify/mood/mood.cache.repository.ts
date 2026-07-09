import { Collection } from 'mongodb'
import { getDb } from '../../../shared/db/mongodb.js'
import type { MoodScope } from './mood.schema.js'

export interface MoodCacheDocument {
  scope: MoodScope
  periodKey: string
  mood: string
  trackCount: number
  periodLabel: string
  generatedAt: Date
}

const COLLECTION = 'ia_mood_cache'

const TTL_MS: Record<MoodScope, number> = {
  day: 2 * 60 * 60 * 1000,
  month: 24 * 60 * 60 * 1000,
}

let collection: Collection<MoodCacheDocument> | null = null

async function getCollection(): Promise<Collection<MoodCacheDocument>> {
  if (!collection) {
    collection = getDb().collection<MoodCacheDocument>(COLLECTION)
    await collection.createIndex({ scope: 1, periodKey: 1 }, { unique: true })
    await collection.createIndex({ generatedAt: 1 })
  }
  return collection
}

export async function getCachedMood(
  scope: MoodScope,
  periodKey: string,
): Promise<MoodCacheDocument | null> {
  const col = await getCollection()
  const doc = await col.findOne({ scope, periodKey })
  if (!doc) return null

  const ttl = TTL_MS[scope]
  const age = Date.now() - doc.generatedAt.getTime()
  if (age > ttl) {
    await col.deleteOne({ scope, periodKey })
    return null
  }

  return doc
}

export async function setCachedMood(input: {
  scope: MoodScope
  periodKey: string
  mood: string
  trackCount: number
  periodLabel: string
}): Promise<MoodCacheDocument> {
  const col = await getCollection()
  const generatedAt = new Date()
  const doc: MoodCacheDocument = {
    scope: input.scope,
    periodKey: input.periodKey,
    mood: input.mood,
    trackCount: input.trackCount,
    periodLabel: input.periodLabel,
    generatedAt,
  }

  await col.updateOne(
    { scope: input.scope, periodKey: input.periodKey },
    { $set: doc },
    { upsert: true },
  )

  return doc
}

export async function invalidateMoodCache(): Promise<void> {
  const col = await getCollection()
  await col.deleteMany({})
}
