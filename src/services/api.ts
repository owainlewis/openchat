import type { OpenChatConfig, ChatResponse, Message, ToolCall } from '../types'
import { streamChat, type SSECallbacks } from './sse'
import { streamOpenAI } from './openai'

export class ApiService {
  private config: OpenChatConfig

  constructor(config: OpenChatConfig) {
    this.config = config
  }

  private getUrl(endpoint: string): string {
    const base = this.config.api.baseUrl.replace(/\/$/, '')
    return `${base}${endpoint}`
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (this.config.api.headers) {
      for (const [key, value] of Object.entries(this.config.api.headers)) {
        // Support environment variable interpolation
        headers[key] = value.replace(/\$\{(\w+)\}/g, (_, name: string) => {
          if (typeof window !== 'undefined' && name in window) {
            const val = (window as unknown as Record<string, unknown>)[name]
            return val != null ? String(val) : ''
          }
          return ''
        })
      }
    }
    return headers
  }

  private isOpenAIMode(): boolean {
    return this.config.api.mode === 'openai'
  }

  async sendMessage(
    message: string,
    callbacks: {
      onMessageStart: (msgId: string, conversationId?: string) => void
      onText: (content: string) => void
      onToolStart: (id: string, name: string, input: Record<string, unknown>) => void
      onToolEnd: (id: string, output?: Record<string, unknown>, error?: string) => void
      onError: (code: string, message: string) => void
      onComplete: () => void
    },
    signal?: AbortSignal,
    messageHistory?: Array<{ role: string; content: string }>,
    model?: string,
    conversationId?: string
  ): Promise<void> {
    const endpoint = this.config.api.endpoints?.chat || '/chat'
    const url = this.getUrl(endpoint)

    if (this.isOpenAIMode()) {
      // OpenAI-compatible mode
      const messages = messageHistory || [{ role: 'user', content: message }]

      const body: Record<string, unknown> = {
        messages,
        model: model || 'openai/gpt-4o-mini',
      }

      // Generate message ID
      const msgId = `msg_asst_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

      await streamOpenAI(
        url,
        body,
        this.getHeaders(),
        {
          onStart: () => {
            callbacks.onMessageStart(msgId)
          },
          onText: callbacks.onText,
          onError: (errorMessage) => {
            callbacks.onError('api_error', errorMessage)
          },
          onComplete: callbacks.onComplete,
        },
        signal
      )
    } else {
      // Native mode
      const body: Record<string, unknown> = {
        message,
        model,
      }

      if (conversationId) {
        body.conversation_id = conversationId
      }

      if (this.config.features?.streaming !== false) {
        const sseCallbacks: SSECallbacks = {
          onMessageStart: (convId, msgId) => callbacks.onMessageStart(msgId, convId),
          onText: callbacks.onText,
          onToolStart: callbacks.onToolStart,
          onToolEnd: callbacks.onToolEnd,
          onError: callbacks.onError,
          onComplete: callbacks.onComplete,
        }

        await streamChat(url, body, this.getHeaders(), sseCallbacks, signal)
      } else {
        // Non-streaming fallback
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...this.getHeaders(),
            },
            body: JSON.stringify(body),
            signal,
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            callbacks.onError(
              'request_failed',
              errorData?.error?.message || `Request failed: ${response.status}`
            )
            return
          }

          const data: ChatResponse = await response.json()
          callbacks.onMessageStart(data.message_id)
          callbacks.onText(data.content)

          if (data.tool_calls) {
            for (const tc of data.tool_calls) {
              callbacks.onToolStart(tc.id, tc.name, tc.input)
              callbacks.onToolEnd(tc.id, tc.output)
            }
          }

          callbacks.onComplete()
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            callbacks.onError('network_error', error.message)
          }
        }
      }
    }
  }
}

export function createMessage(
  id: string,
  role: 'user' | 'assistant',
  content: string
): Message {
  return {
    id,
    role,
    content,
    createdAt: new Date(),
  }
}

export function createToolCall(
  id: string,
  name: string,
  input: Record<string, unknown>
): ToolCall {
  return {
    id,
    name,
    input,
    status: 'running',
  }
}
