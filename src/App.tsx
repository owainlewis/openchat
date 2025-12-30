import { useEffect, useState } from 'react'
import { useChatStore, useConfigStore, useUiStore } from './stores'
import { ChatContainer } from './components/Chat'
import { Sidebar } from './components/Sidebar'
import { NewChatIcon, SunIcon, MoonIcon, MenuIcon } from './components/icons'

function App() {
  const { config, isLoading, loadConfig } = useConfigStore()
  const { clearMessages, messages } = useChatStore()
  const { resolvedTheme, setTheme } = useUiStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebarEnabled = config.features?.sidebar ?? false

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // Keyboard shortcut for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        clearMessages()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearMessages])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#212121]">
        <div className="animate-spin w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-[#212121]">
      {/* Sidebar */}
      {sidebarEnabled && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-[#303030]">
          <div className="flex items-center gap-2">
            {sidebarEnabled && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2f2f2f]"
                aria-label="Toggle sidebar"
              >
                <MenuIcon />
              </button>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2f2f2f]"
                aria-label="New chat"
              >
                <NewChatIcon />
                <span>New Chat</span>
              </button>
            )}
          </div>

          <h1 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {config.ui?.title || 'Open Chat'}
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2f2f2f]"
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 min-h-0">
          <ChatContainer />
        </div>
      </div>
    </div>
  )
}

export default App
