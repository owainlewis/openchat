import { useEffect, useRef } from 'react'
import type { Message as MessageType } from '../../types'
import { renderMarkdown, setupCopyButtons } from '../../utils'
import { ToolCall } from './ToolCall'
import { MessageActions } from './MessageActions'

interface MessageProps {
  message: MessageType
  collapseToolCalls?: boolean
  onRegenerate?: () => void
  isLast?: boolean
}

export function Message({ message, collapseToolCalls = true, onRegenerate, isLast = false }: MessageProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const isUser = message.role === 'user'

  useEffect(() => {
    if (contentRef.current && !isUser) {
      setupCopyButtons(contentRef.current)
    }
  }, [message.content, isUser])

  if (isUser) {
    // User message - compact right-aligned bubble (ChatGPT style)
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[85%] md:max-w-[70%]">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-gray-100">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    )
  }

  // Assistant message - full width, clean layout
  return (
    <div className="px-4 py-4">
      <div className="max-w-3xl mx-auto">
        {/* Tool calls */}
        {message.toolCalls?.map((toolCall) => (
          <ToolCall
            key={toolCall.id}
            toolCall={toolCall}
            collapsed={collapseToolCalls}
          />
        ))}

        {/* Message content */}
        <div
          ref={contentRef}
          className="prose prose-gray dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(message.content),
          }}
        />

        {/* Streaming cursor */}
        {message.isStreaming && (
          <span className="inline-block w-2 h-5 bg-gray-400 dark:bg-gray-500 animate-pulse ml-0.5 align-middle" />
        )}

        {/* Action bar - only show when not streaming */}
        {!message.isStreaming && message.content && (
          <MessageActions
            content={message.content}
            onRegenerate={isLast ? onRegenerate : undefined}
          />
        )}
      </div>
    </div>
  )
}
