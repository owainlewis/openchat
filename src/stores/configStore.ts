import { create } from 'zustand'
import type { OpenChatConfig } from '../types'
import { DEFAULT_CONFIG, loadConfig } from '../config'

interface ConfigState {
  config: OpenChatConfig
  isLoading: boolean
  error: string | null
  loadConfig: () => Promise<void>
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: DEFAULT_CONFIG,
  isLoading: true,
  error: null,

  loadConfig: async () => {
    try {
      set({ isLoading: true, error: null })
      const config = await loadConfig()
      set({ config, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load config',
        isLoading: false,
      })
    }
  },
}))
