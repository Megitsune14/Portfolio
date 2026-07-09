import { z } from 'zod'

const wordCount = (value: string): number =>
  value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

export const moodResponseSchema = z.object({
  mood: z
    .string()
    .min(1)
    .max(80)
    .refine((value) => {
      const count = wordCount(value)
      return count >= 3 && count <= 10
    }, 'mood must contain 3 to 10 words'),
})

export type MoodResponse = z.infer<typeof moodResponseSchema>

export type MoodScope = 'day' | 'month'

export type MoodResult = {
  mood: string
  periodLabel: string
  trackCount: number
  generatedAt: string
  fromCache: boolean
}

export type SpotifyMoodPayload = {
  day: MoodResult
  month: MoodResult
}
