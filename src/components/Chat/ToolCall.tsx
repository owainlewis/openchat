import { useState } from 'react'
import type { ToolCall as ToolCallType } from '../../types'

interface ToolCallProps {
  toolCall: ToolCallType
  collapsed?: boolean
}

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const StatusIndicator = ({ status }: { status: ToolCallType['status'] }) => {
  if (status === 'running' || status === 'pending') {
    return (
      <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    )
  }
  if (status === 'error') {
    return <span className="text-red-500">✗</span>
  }
  return <span className="text-green-500">✓</span>
}

export function ToolCall({ toolCall, collapsed = true }: ToolCallProps) {
  const [expanded, setExpanded] = useState(!collapsed)

  const inputPreview = JSON.stringify(toolCall.input).slice(0, 50)

  return (
    <div className="my-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
      >
        <ChevronIcon expanded={expanded} />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {toolCall.name}
        </span>
        <span className="text-gray-500 dark:text-gray-400 truncate flex-1">
          {inputPreview}
          {JSON.stringify(toolCall.input).length > 50 && '...'}
        </span>
        <StatusIndicator status={toolCall.status} />
      </button>

      {expanded && (
        <div className="px-3 py-2 text-sm border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="mb-2">
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Input:
            </span>
            <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs overflow-x-auto">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>
          {toolCall.output && (
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Output:
              </span>
              <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                {JSON.stringify(toolCall.output, null, 2)}
              </pre>
            </div>
          )}
          {toolCall.error && (
            <div>
              <span className="font-medium text-red-600 dark:text-red-400">
                Error:
              </span>
              <pre className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs overflow-x-auto text-red-700 dark:text-red-300">
                {toolCall.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
