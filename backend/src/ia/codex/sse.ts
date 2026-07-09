const SSE_SEPARATOR = /\r?\n\r?\n/

export type ServerSentEvent = {
  event?: string
  data?: string
}

const parseEventBlock = (block: string): ServerSentEvent => {
  const event: ServerSentEvent = {}
  const dataLines: string[] = []

  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith('event:')) {
      event.event = line.slice(6).trim()
      continue
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }

  if (dataLines.length > 0) {
    event.data = dataLines.join('\n')
  }

  return event
}

export async function* iterateServerSentEvents(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<ServerSentEvent> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const blocks = buffer.split(SSE_SEPARATOR)
      buffer = blocks.pop() ?? ''

      for (const block of blocks) {
        if (block.trim().length > 0) {
          yield parseEventBlock(block)
        }
      }
    }

    if (buffer.trim().length > 0) {
      yield parseEventBlock(buffer)
    }
  } finally {
    reader.releaseLock()
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const collectCompletedResponseFromSse = async (
  stream: ReadableStream<Uint8Array>,
): Promise<Record<string, unknown>> => {
  let latestResponse: Record<string, unknown> | undefined
  let latestError: unknown

  for await (const event of iterateServerSentEvents(stream)) {
    if (typeof event.data !== 'string' || event.data.length === 0) {
      continue
    }

    try {
      const parsed = JSON.parse(event.data)
      if (!isRecord(parsed)) {
        continue
      }

      if (event.event === 'error') {
        latestError = parsed
        continue
      }

      const response = parsed.response
      if (isRecord(response)) {
        latestResponse = response
      }

      if (parsed.type === 'response.completed' && isRecord(parsed.response)) {
        latestResponse = parsed.response
      }
    } catch {
      // ignore malformed SSE chunks
    }
  }

  if (latestResponse) {
    return latestResponse
  }

  throw new Error(
    `No completed response found in SSE stream.${latestError ? ` Last error: ${JSON.stringify(latestError)}` : ''}`,
  )
}

const extractTextFromResponse = (response: Record<string, unknown>): string => {
  const outputText = response.output_text
  if (typeof outputText === 'string' && outputText.length > 0) {
    return outputText
  }

  const output = response.output
  if (!Array.isArray(output)) {
    return ''
  }

  const parts: string[] = []
  for (const item of output) {
    if (!isRecord(item)) continue
    if (item.type === 'message' && Array.isArray(item.content)) {
      for (const part of item.content) {
        if (!isRecord(part)) continue
        if (part.type === 'output_text' && typeof part.text === 'string') {
          parts.push(part.text)
        }
      }
    } else if (typeof item.text === 'string') {
      parts.push(item.text)
    }
  }

  return parts.join('').trim()
}

export const collectTextFromSse = async (stream: ReadableStream<Uint8Array>): Promise<string> => {
  const deltas: string[] = []
  const doneTexts: string[] = []
  let latestResponse: Record<string, unknown> | undefined
  let latestError: unknown

  for await (const event of iterateServerSentEvents(stream)) {
    if (typeof event.data !== 'string' || event.data.length === 0) {
      continue
    }

    if (event.data === '[DONE]') {
      continue
    }

    try {
      const parsed = JSON.parse(event.data)
      if (!isRecord(parsed)) {
        continue
      }

      const eventType =
        typeof parsed.type === 'string' ? parsed.type : event.event

      if (eventType === 'error' || event.event === 'error') {
        latestError = parsed
        continue
      }

      if (eventType === 'response.output_text.delta') {
        const delta = parsed.delta
        if (typeof delta === 'string' && delta.length > 0) {
          deltas.push(delta)
        }
        continue
      }

      if (eventType === 'response.output_text.done') {
        const text = parsed.text
        if (typeof text === 'string' && text.length > 0) {
          doneTexts.push(text)
        }
        continue
      }

      if (eventType === 'response.completed' && isRecord(parsed.response)) {
        latestResponse = parsed.response
        continue
      }

      if (isRecord(parsed.response)) {
        latestResponse = parsed.response
      }
    } catch {
      // ignore malformed SSE chunks
    }
  }

  const streamed = deltas.join('')
  if (streamed.length > 0) {
    return streamed
  }

  if (doneTexts.length > 0) {
    return doneTexts[doneTexts.length - 1] ?? ''
  }

  if (latestResponse) {
    const extracted = extractTextFromResponse(latestResponse)
    if (extracted.length > 0) {
      return extracted
    }
  }

  throw new Error(
    `No text found in SSE stream.${latestError ? ` Last error: ${JSON.stringify(latestError)}` : ''}`,
  )
}
