// OpenAI-compatible streaming handler

export interface OpenAIStreamCallbacks {
  onStart?: (id: string) => void
  onText?: (content: string) => void
  onError?: (message: string) => void
  onComplete?: () => void
}

interface OpenAIChoice {
  index: number
  delta: {
    role?: string
    content?: string
  }
  finish_reason: string | null
}

interface OpenAIChunk {
  id: string
  object: string
  created: number
  model: string
  choices: OpenAIChoice[]
}

export async function streamOpenAI(
  url: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  callbacks: OpenAIStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      ...body,
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage =
      errorData?.error?.message || `Request failed: ${response.status}`
    callbacks.onError?.(errorMessage)
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    callbacks.onError?.('Failed to get response reader')
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let messageId: string | null = null

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') {
          if (trimmed === 'data: [DONE]') {
            callbacks.onComplete?.()
            return
          }
          continue
        }

        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6)
          try {
            const chunk: OpenAIChunk = JSON.parse(data)

            // Emit start event on first chunk
            if (!messageId && chunk.id) {
              messageId = chunk.id
              callbacks.onStart?.(chunk.id)
            }

            // Extract content from delta
            const content = chunk.choices?.[0]?.delta?.content
            if (content) {
              callbacks.onText?.(content)
            }

            // Check for completion
            if (chunk.choices?.[0]?.finish_reason) {
              callbacks.onComplete?.()
              return
            }
          } catch {
            // Invalid JSON, skip
          }
        }
      }
    }

    callbacks.onComplete?.()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      callbacks.onComplete?.()
    } else {
      callbacks.onError?.(error instanceof Error ? error.message : 'Stream error')
    }
  } finally {
    reader.releaseLock()
  }
}