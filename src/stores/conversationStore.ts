import { create } from 'zustand'
import type { Conversation, ConversationDetail } from '../types'

interface ConversationState {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (id: string | null) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  removeConversation: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchConversations: (baseUrl: string) => Promise<void>
  loadConversation: (baseUrl: string, id: string) => Promise<ConversationDetail | null>
  deleteConversation: (baseUrl: string, id: string) => Promise<boolean>
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),

  setCurrentConversation: (id) => set({ currentConversationId: id }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversationId:
        state.currentConversationId === id ? null : state.currentConversationId,
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchConversations: async (baseUrl) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${baseUrl}/conversations`)
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const conversations = await response.json()
      set({ conversations, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch conversations',
        isLoading: false,
      })
    }
  },

  loadConversation: async (baseUrl, id) => {
    try {
      const response = await fetch(`${baseUrl}/conversations/${id}`)
      if (!response.ok) {
        throw new Error('Failed to load conversation')
      }
      const conversation = await response.json()
      set({ currentConversationId: id })
      return conversation
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load conversation',
      })
      return null
    }
  },

  deleteConversation: async (baseUrl, id) => {
    try {
      const response = await fetch(`${baseUrl}/conversations/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }
      get().removeConversation(id)
      return true
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete conversation',
      })
      return false
    }
  },
}))
