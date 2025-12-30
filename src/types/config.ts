export interface ApiConfig {
  baseUrl: string
  mode?: 'native' | 'openai'
  endpoints?: {
    chat?: string
    conversations?: string
  }
  headers?: Record<string, string>
}

export interface FeaturesConfig {
  streaming?: boolean
  sidebar?: boolean
  toolCalls?: boolean
}

export interface ExamplePrompt {
  icon?: 'code' | 'document' | 'lightbulb' | 'pencil' | 'search' | 'chat'
  title: string
  prompt: string
}

export interface UiConfig {
  title?: string
  theme?: 'light' | 'dark' | 'system'
  welcomeMessage?: string
  welcomeSubtitle?: string
  examplePrompts?: ExamplePrompt[]
  inputPlaceholder?: string
}

export interface BehaviorConfig {
  autofocus?: boolean
  sendOnEnter?: boolean
  collapseToolCalls?: boolean
}

export interface ModelConfig {
  id: string
  name: string
  description?: string
}

export interface OpenChatConfig {
  api: ApiConfig
  features?: FeaturesConfig
  ui?: UiConfig
  behavior?: BehaviorConfig
  models?: ModelConfig[]
}
