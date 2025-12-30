import { useRef, useCallback, useEffect, useState } from 'react'
import { useChatStore, useConfigStore, useConversationStore } from '../../stores'
import { ApiService, createMessage, createToolCall } from '../../services'
import { MessageList } from './MessageList'
import { InputArea } from './InputArea'
import { ErrorIcon, CloseIcon } from '../icons'
import type { ModelConfig } from '../../types'

export function ChatContainer() {
  const { config } = useConfigStore()
  const {
    messages,
    isStreaming,
    selectedModel,
    error,
    addMessage,
    updateMessage,
    appendToMessage,
    addToolCall,
    updateToolCall,
    setIsStreaming,
    setError,
    clearError,
    setSelectedModel,
  } = useChatStore()
  const { currentConversationId, setCurrentConversation, addConversation, updateConversation } = useConversationStore()
  const [models, setModels] = useState<ModelConfig[]>([])

  const abortControllerRef = useRef<AbortController | null>(null)
  const apiServiceRef = useRef<ApiService | null>(null)

  // Fetch models from backend
  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch(`${config.api.baseUrl}/models`)
        if (response.ok) {
          const data = await response.json()
          setModels(data)
        }
      } catch {
        // Failed to fetch models, will use empty list
      }
    }
    fetchModels()
  }, [config.api.baseUrl])

  // Recreate API service when config changes
  useEffect(() => {
    apiServiceRef.current = new ApiService(config)
  }, [config])

  // Get or create API service
  const getApiService = useCallback(() => {
    if (!apiServiceRef.current) {
      apiServiceRef.current = new ApiService(config)
    }
    return apiServiceRef.current
  }, [config])

  const handleSend = async (message: string) => {
    // Build message history from current messages
    const messageHistory = [
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    // Add user message
    const userMessageId = `msg_user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    addMessage(createMessage(userMessageId, 'user', message))

    // Prepare for streaming
    setIsStreaming(true)
    abortControllerRef.current = new AbortController()

    let assistantMessageId: string | null = null

    // Use selected model or first model from list or default
    const modelToUse = selectedModel || models[0]?.id || 'anthropic/claude-sonnet-4'

    try {
      const apiService = getApiService()
      await apiService.sendMessage(
        message,
        {
          onMessageStart: (msgId, convId) => {
            assistantMessageId = msgId
            addMessage(createMessage(msgId, 'assistant', ''))
            updateMessage(msgId, { isStreaming: true })

            // Track conversation
            if (convId && !currentConversationId) {
              setCurrentConversation(convId)
              addConversation({
                id: convId,
                title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
                updated_at: new Date().toISOString(),
              })
            } else if (convId && currentConversationId) {
              updateConversation(convId, { updated_at: new Date().toISOString() })
            }
          },
          onText: (content) => {
            if (assistantMessageId) {
              appendToMessage(assistantMessageId, content)
            }
          },
          onToolStart: (id, name, input) => {
            if (assistantMessageId) {
              addToolCall(assistantMessageId, createToolCall(id, name, input))
            }
          },
          onToolEnd: (id, output, error) => {
            if (assistantMessageId) {
              updateToolCall(assistantMessageId, id, {
                output,
                error,
                status: error ? 'error' : 'completed',
              })
            }
          },
          onError: (code, errorMessage) => {
            setError(`${code}: ${errorMessage}`)
          },
          onComplete: () => {
            if (assistantMessageId) {
              updateMessage(assistantMessageId, { isStreaming: false })
            }
          },
        },
        abortControllerRef.current.signal,
        messageHistory,
        modelToUse,
        currentConversationId || undefined
      )
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setError(error.message)
      }
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    abortControllerRef.current?.abort()
  }

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        collapseToolCalls={config.behavior?.collapseToolCalls}
        welcomeMessage={config.ui?.welcomeMessage}
        welcomeSubtitle={config.ui?.welcomeSubtitle}
        examplePrompts={config.ui?.examplePrompts}
        onSendPrompt={(prompt) => handleSend(prompt)}
      />

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mb-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <ErrorIcon size={20} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-800 dark:text-red-200 break-words">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="flex-shrink-0 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            aria-label="Dismiss error"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      )}

      <InputArea
        onSend={handleSend}
        onStop={handleStop}
        isStreaming={isStreaming}
        placeholder={config.ui?.inputPlaceholder}
        autofocus={config.behavior?.autofocus}
        sendOnEnter={config.behavior?.sendOnEnter}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
    </div>
  )
}
