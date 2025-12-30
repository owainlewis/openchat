import { useEffect, useRef } from 'react'
import type { Message as MessageType, ExamplePrompt } from '../../types'
import { Message } from './Message'
import { CodeIcon, DocumentIcon, LightbulbIcon, PencilIcon, SearchIcon, ChatIcon } from '../icons'

interface MessageListProps {
  messages: MessageType[]
  collapseToolCalls?: boolean
  welcomeMessage?: string
  welcomeSubtitle?: string
  examplePrompts?: ExamplePrompt[]
  onRegenerate?: () => void
  onSendPrompt?: (prompt: string) => void
}

const iconMap = {
  code: CodeIcon,
  document: DocumentIcon,
  lightbulb: LightbulbIcon,
  pencil: PencilIcon,
  search: SearchIcon,
  chat: ChatIcon,
}

export function MessageList({
  messages,
  collapseToolCalls = true,
  welcomeMessage = 'How can I help you today?',
  welcomeSubtitle,
  examplePrompts,
  onRegenerate,
  onSendPrompt,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)

  useEffect(() => {
    const messageCount = messages.length
    if (messageCount > prevMessageCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = messageCount
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {welcomeMessage}
        </h1>
        {welcomeSubtitle && (
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-lg mb-8">
            {welcomeSubtitle}
          </p>
        )}

        {examplePrompts && examplePrompts.length > 0 && (
          <div className="w-full max-w-2xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
              Try one of these examples
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examplePrompts.map((example, index) => {
                const IconComponent = example.icon ? iconMap[example.icon] : ChatIcon
                return (
                  <button
                    key={index}
                    onClick={() => onSendPrompt?.(example.prompt)}
                    className="flex items-start gap-3 p-4 text-left rounded-xl border border-gray-200 dark:border-[#424242] bg-white dark:bg-[#2f2f2f] hover:bg-gray-50 dark:hover:bg-[#3a3a3a] transition-colors"
                  >
                    <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 mt-0.5">
                      <IconComponent />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {example.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {example.prompt}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Find the last assistant message for regenerate
  let lastAssistantIndex = -1
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      lastAssistantIndex = i
      break
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-4">
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            collapseToolCalls={collapseToolCalls}
            onRegenerate={onRegenerate}
            isLast={index === lastAssistantIndex}
          />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
