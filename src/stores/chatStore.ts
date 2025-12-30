import { create } from 'zustand'
import type { Message, ToolCall } from '../types'

interface ChatState {
  messages: Message[]
  isStreaming: boolean
  error: string | null
  selectedModel: string | null

  // Actions
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  appendToMessage: (messageId: string, content: string) => void
  addToolCall: (messageId: string, toolCall: ToolCall) => void
  updateToolCall: (messageId: string, toolCallId: string, updates: Partial<ToolCall>) => void
  clearMessages: () => void
  clearError: () => void
  setIsStreaming: (isStreaming: boolean) => void
  setError: (error: string | null) => void
  setSelectedModel: (model: string | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  error: null,
  selectedModel: null,

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  updateMessage: (messageId, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    }))
  },

  appendToMessage: (messageId, content) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: msg.content + content }
          : msg
      ),
    }))
  },

  addToolCall: (messageId, toolCall) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id !== messageId) return msg
        return {
          ...msg,
          toolCalls: [...(msg.toolCalls || []), toolCall],
        }
      }),
    }))
  },

  updateToolCall: (messageId, toolCallId, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id !== messageId) return msg
        return {
          ...msg,
          toolCalls: msg.toolCalls?.map((tc) =>
            tc.id === toolCallId ? { ...tc, ...updates } : tc
          ),
        }
      }),
    }))
  },

  clearMessages: () => set({ messages: [], error: null }),
  clearError: () => set({ error: null }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setError: (error) => set({ error }),
  setSelectedModel: (model) => set({ selectedModel: model }),
}))
