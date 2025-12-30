import type { SSEEvent } from '../types'

export interface SSECallbacks {
  onMessageStart?: (conversationId: string, messageId: string) => void
  onText?: (content: string) => void
  onToolStart?: (id: string, name: string, input: Record<string, unknown>) => void
  onToolEnd?: (id: string, output?: Record<string, unknown>, error?: string) => void
  onError?: (code: string, message: string) => void
  onMessageEnd?: (usage?: { inputTokens: number; outputTokens: number }) => void
  onComplete?: () => void
}

export async function streamChat(
  url: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  callbacks: SSECallbacks,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...headers,
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage =
      errorData?.error?.message || `Request failed: ${response.status}`
    callbacks.onError?.('request_failed', errorMessage)
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    callbacks.onError?.('no_reader', 'Failed to get response reader')
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            callbacks.onComplete?.()
            return
          }

          try {
            const event: SSEEvent = JSON.parse(data)
            handleEvent(event, callbacks)
          } catch {
            // Invalid JSON, skip
          }
        }
      }
    }

    // Process any remaining data in buffer
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6).trim()
      if (data && data !== '[DONE]') {
        try {
          const event: SSEEvent = JSON.parse(data)
          handleEvent(event, callbacks)
        } catch {
          // Invalid JSON, skip
        }
      }
    }

    callbacks.onComplete?.()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      callbacks.onComplete?.()
    } else {
      callbacks.onError?.(
        'stream_error',
        error instanceof Error ? error.message : 'Stream error'
      )
    }
  } finally {
    reader.releaseLock()
  }
}

function handleEvent(event: SSEEvent, callbacks: SSECallbacks) {
  switch (event.type) {
    case 'message_start':
      callbacks.onMessageStart?.(event.conversation_id, event.message_id)
      break
    case 'text':
      callbacks.onText?.(event.content)
      break
    case 'tool_start':
      callbacks.onToolStart?.(event.id, event.name, event.input)
      break
    case 'tool_end':
      callbacks.onToolEnd?.(event.id, event.output, event.error)
      break
    case 'error':
      callbacks.onError?.(event.code, event.message)
      break
    case 'message_end':
      callbacks.onMessageEnd?.(
        event.usage
          ? {
              inputTokens: event.usage.input_tokens,
              outputTokens: event.usage.output_tokens,
            }
          : undefined
      )
      break
  }
}
