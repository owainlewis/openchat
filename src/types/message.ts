export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  status: 'pending' | 'running' | 'completed' | 'error'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCall[]
  createdAt: Date
  isStreaming?: boolean
}
