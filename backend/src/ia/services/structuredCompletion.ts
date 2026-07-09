import type { ZodType } from 'zod'
import { createCodexClient, type CodexClientOptions } from '../codex/client.js'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const extractJsonCandidate = (text: string): string => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1)
  }

  return text.trim()
}

export type StructuredCompletionOptions<T> = CodexClientOptions & {
  prompt: string
  schema: ZodType<T>
  instructions?: string
  model?: string
}

export async function structuredCompletion<T>(
  options: StructuredCompletionOptions<T>,
): Promise<T> {
  const { prompt, schema, instructions, model, ...clientOptions } = options
  const client = await createCodexClient({ ...clientOptions, model })

  const raw = await client.generateText({
    prompt,
    instructions,
    model,
  })

  const candidate = extractJsonCandidate(raw)

  let parsed: unknown
  try {
    parsed = JSON.parse(candidate)
  } catch {
    throw new Error(`Failed to parse JSON from Codex response: ${raw}`)
  }

  if (!isRecord(parsed)) {
    throw new Error('Codex response JSON must be an object.')
  }

  return schema.parse(parsed)
}
