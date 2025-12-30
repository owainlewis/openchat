// SSE Event Types
export interface MessageStartEvent {
  type: 'message_start'
  conversation_id: string
  message_id: string
}

export interface TextEvent {
  type: 'text'
  content: string
}

export interface ToolStartEvent {
  type: 'tool_start'
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ToolEndEvent {
  type: 'tool_end'
  id: string
  output?: Record<string, unknown>
  error?: string
}

export interface ErrorEvent {
  type: 'error'
  code: string
  message: string
}

export interface MessageEndEvent {
  type: 'message_end'
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

export type SSEEvent =
  | MessageStartEvent
  | TextEvent
  | ToolStartEvent
  | ToolEndEvent
  | ErrorEvent
  | MessageEndEvent

// API Request/Response Types
export interface ChatRequest {
  message: string
  conversation_id?: string
  files?: { id: string; name: string; type: string }[]
}

export interface ChatResponse {
  conversation_id: string
  message_id: string
  content: string
  tool_calls?: {
    id: string
    name: string
    input: Record<string, unknown>
    output?: Record<string, unknown>
  }[]
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
    retry_after?: number
  }
}

// Conversation Types
export interface Conversation {
  id: string
  title: string
  updated_at: string
  created_at?: string
}

export interface ConversationDetail extends Conversation {
  messages: {
    role: 'user' | 'assistant'
    content: string
  }[]
}
