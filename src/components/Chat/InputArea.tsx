import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { ModelSelector } from './ModelSelector'
import type { ModelConfig } from '../../types'
import { SendIcon, StopIcon } from '../icons'

interface InputAreaProps {
  onSend: (message: string) => void
  onStop?: () => void
  isStreaming?: boolean
  placeholder?: string
  autofocus?: boolean
  sendOnEnter?: boolean
  models?: ModelConfig[]
  selectedModel?: string | null
  onSelectModel?: (modelId: string) => void
}

export function InputArea({
  onSend,
  onStop,
  isStreaming = false,
  placeholder = 'Ask anything',
  autofocus = true,
  sendOnEnter = true,
  models = [],
  selectedModel,
  onSelectModel,
}: InputAreaProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autofocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autofocus])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSend = () => {
    const trimmed = input.trim()
    if (trimmed && !isStreaming) {
      onSend(trimmed)
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (sendOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape' && isStreaming && onStop) {
      onStop()
    }
  }

  const canSend = input.trim() && !isStreaming

  return (
    <div className="bg-white dark:bg-gray-900 px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        {/* Input container - ChatGPT style pill */}
        <div className="relative flex items-end gap-2 bg-gray-100 dark:bg-[#2f2f2f] rounded-3xl border border-gray-200 dark:border-[#424242] focus-within:border-gray-400 dark:focus-within:border-gray-500">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 py-3 pl-4 max-h-[200px]"
            disabled={isStreaming}
          />

          {/* Send/Stop button */}
          <button
            onClick={isStreaming ? onStop : handleSend}
            disabled={!isStreaming && !canSend}
            className={`flex-shrink-0 m-2 p-2 rounded-full flex items-center justify-center ${
              isStreaming
                ? 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-600 dark:hover:bg-gray-300'
                : canSend
                  ? 'bg-white dark:bg-white text-gray-700 dark:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-100 shadow-sm border border-gray-200 dark:border-gray-300'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            aria-label={isStreaming ? 'Stop' : 'Send'}
          >
            {isStreaming ? <StopIcon /> : <SendIcon />}
          </button>
        </div>

        {/* Bottom bar with model selector and disclaimer */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            {models.length > 0 && onSelectModel && (
              <ModelSelector
                models={models}
                selectedModel={selectedModel ?? null}
                onSelect={onSelectModel}
                disabled={isStreaming}
              />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  )
}
