import { collectCompletedResponseFromSse } from './sse.js'
import { loadAuthTokens, type AuthLoaderOptions, type EffectiveAuth } from './auth.js'

export const DEFAULT_CODEX_BASE_URL = 'https://chatgpt.com/backend-api/codex'
export const DEFAULT_CODEX_MODEL = process.env.CODEX_MODEL ?? 'gpt-5.4'

export type CodexClientOptions = AuthLoaderOptions & {
  baseURL?: string
  model?: string
}

export type CodexMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type GenerateTextOptions = {
  prompt?: string
  messages?: CodexMessage[]
  model?: string
  instructions?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const extractTextFromContent = (content: unknown): string => {
  if (typeof content === 'string') {
    return content
  }

  if (!Array.isArray(content)) {
    return ''
  }

  const parts: string[] = []
  for (const item of content) {
    if (!isRecord(item)) continue
    if (item.type === 'output_text' && typeof item.text === 'string') {
      parts.push(item.text)
    } else if (item.type === 'text' && typeof item.text === 'string') {
      parts.push(item.text)
    }
  }

  return parts.join('')
}

export const extractTextFromCodexResponse = (response: Record<string, unknown>): string => {
  const outputText = response.output_text
  if (typeof outputText === 'string' && outputText.length > 0) {
    return outputText
  }

  const output = response.output
  if (Array.isArray(output)) {
    const parts: string[] = []
    for (const item of output) {
      if (!isRecord(item)) continue
      if (item.type === 'message') {
        parts.push(extractTextFromContent(item.content))
      } else if (typeof item.text === 'string') {
        parts.push(item.text)
      }
    }
    if (parts.length > 0) {
      return parts.join('\n').trim()
    }
  }

  const choices = response.choices
  if (Array.isArray(choices) && choices.length > 0) {
    const first = choices[0]
    if (isRecord(first)) {
      const message = first.message
      if (isRecord(message)) {
        const text = extractTextFromContent(message.content)
        if (text) return text
      }
    }
  }

  return ''
}

const buildInput = (options: GenerateTextOptions): CodexMessage[] => {
  if (options.messages && options.messages.length > 0) {
    return options.messages
  }

  if (typeof options.prompt === 'string' && options.prompt.length > 0) {
    return [{ role: 'user', content: options.prompt }]
  }

  throw new Error('Either prompt or messages must be provided.')
}

export type CodexClient = {
  auth: EffectiveAuth
  model: string
  generateText: (options: GenerateTextOptions) => Promise<string>
}

export const createCodexClient = async (
  options: CodexClientOptions = {},
): Promise<CodexClient> => {
  const auth = await loadAuthTokens(options)
  const baseURL = (options.baseURL ?? DEFAULT_CODEX_BASE_URL).replace(/\/$/, '')
  const model = options.model ?? DEFAULT_CODEX_MODEL

  const generateText = async (generateOptions: GenerateTextOptions): Promise<string> => {
    const input = buildInput(generateOptions)
    const instructions = generateOptions.instructions ?? ''

    const body = {
      model: generateOptions.model ?? model,
      input,
      instructions,
      store: false,
      stream: true,
    }

    const response = await fetch(`${baseURL}/responses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'chatgpt-account-id': auth.accountId,
        'OpenAI-Beta': 'responses=experimental',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(
        `Codex request failed (${response.status}): ${errorText || response.statusText}`,
      )
    }

    if (!response.body) {
      throw new Error('Codex response body is empty.')
    }

    const completed = await collectCompletedResponseFromSse(response.body)
    const text = extractTextFromCodexResponse(completed)
    if (!text) {
      throw new Error('Codex returned an empty response.')
    }

    return text.trim()
  }

  return {
    auth,
    model,
    generateText,
  }
}
