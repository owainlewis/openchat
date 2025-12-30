import { useEffect, useState } from 'react'
import { useConversationStore, useConfigStore, useChatStore } from '../../stores'
import type { Conversation, ConversationDetail, Message } from '../../types'
import { ChatIcon, TrashIcon, NewChatIcon } from '../icons'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { config } = useConfigStore()
  const { conversations, currentConversationId, fetchConversations, setCurrentConversation, deleteConversation, isLoading } = useConversationStore()
  const { clearMessages, addMessage } = useChatStore()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const baseUrl = config.api.baseUrl

  useEffect(() => {
    if (isOpen && config.features?.sidebar) {
      fetchConversations(baseUrl)
    }
  }, [isOpen, baseUrl, fetchConversations, config.features?.sidebar])

  const handleNewChat = () => {
    setCurrentConversation(null)
    clearMessages()
    onClose()
  }

  const handleSelectConversation = async (conversation: Conversation) => {
    if (conversation.id === currentConversationId) {
      onClose()
      return
    }

    try {
      const response = await fetch(`${baseUrl}/conversations/${conversation.id}`)
      if (!response.ok) throw new Error('Failed to load conversation')

      const detail: ConversationDetail = await response.json()

      // Clear current messages and load conversation messages
      clearMessages()
      setCurrentConversation(conversation.id)

      // Add each message to the chat
      detail.messages.forEach((msg, index) => {
        const message: Message = {
          id: `${conversation.id}_msg_${index}`,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(),
        }
        addMessage(message)
      })

      onClose()
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeletingId(id)
    await deleteConversation(baseUrl, id)
    setDeletingId(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 z-50
        bg-white dark:bg-[#171717] border-r border-gray-200 dark:border-[#303030]
        flex flex-col
        lg:relative lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-[#303030]">
          <h2 className="font-medium text-gray-900 dark:text-gray-100">Conversations</h2>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-[#2f2f2f] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#424242]"
          >
            <NewChatIcon />
            New
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No conversations yet
            </div>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    onClick={() => handleSelectConversation(conversation)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-lg group
                      flex items-start gap-2
                      ${currentConversationId === conversation.id
                        ? 'bg-gray-200 dark:bg-[#2f2f2f]'
                        : 'hover:bg-gray-100 dark:hover:bg-[#2f2f2f]'}
                    `}
                  >
                    <span className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0">
                      <ChatIcon />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                        {conversation.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDate(conversation.updated_at)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conversation.id)}
                      disabled={deletingId === conversation.id}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 flex-shrink-0"
                      aria-label="Delete conversation"
                    >
                      {deletingId === conversation.id ? (
                        <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon />
                      )}
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
