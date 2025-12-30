import type { OpenChatConfig } from './types'

const DEFAULT_CONFIG: OpenChatConfig = {
  api: {
    baseUrl: 'http://localhost:8000',
    mode: 'native',
    endpoints: {
      chat: '/chat',
      conversations: '/conversations',
    },
    headers: {},
  },
  features: {
    streaming: true,
    sidebar: false,
    toolCalls: true,
  },
  ui: {
    title: 'Open Chat',
    theme: 'system',
    welcomeMessage: 'How can I help you today?',
    inputPlaceholder: 'Message...',
  },
  behavior: {
    autofocus: true,
    sendOnEnter: true,
    collapseToolCalls: true,
  },
}

function deepMerge(
  target: OpenChatConfig,
  source: Partial<OpenChatConfig>
): OpenChatConfig {
  const result = { ...target }

  if (source.api) {
    result.api = { ...target.api, ...source.api }
    if (source.api.endpoints) {
      result.api.endpoints = { ...target.api.endpoints, ...source.api.endpoints }
    }
    if (source.api.headers) {
      result.api.headers = { ...target.api.headers, ...source.api.headers }
    }
  }

  if (source.features) {
    result.features = { ...target.features, ...source.features }
  }

  if (source.ui) {
    result.ui = { ...target.ui, ...source.ui }
  }

  if (source.behavior) {
    result.behavior = { ...target.behavior, ...source.behavior }
  }

  if (source.models) {
    result.models = source.models
  }

  return result
}

declare global {
  interface Window {
    OPENCHAT_CONFIG?: Partial<OpenChatConfig>
  }
}

export async function loadConfig(): Promise<OpenChatConfig> {
  let config = { ...DEFAULT_CONFIG }

  // Load from config.json
  try {
    const response = await fetch('/config.json')
    if (response.ok) {
      const fileConfig = await response.json()
      config = deepMerge(config, fileConfig)
    }
  } catch {
    // Config file not found or invalid, use defaults
  }

  // Override with runtime config from window
  if (window.OPENCHAT_CONFIG) {
    config = deepMerge(config, window.OPENCHAT_CONFIG)
  }

  return config
}

export { DEFAULT_CONFIG }
