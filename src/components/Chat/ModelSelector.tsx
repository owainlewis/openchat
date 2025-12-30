import { useState, useRef, useEffect } from 'react'
import type { ModelConfig } from '../../types'
import { ChevronIcon, CheckIcon } from '../icons'

interface ModelSelectorProps {
  models: ModelConfig[]
  selectedModel: string | null
  onSelect: (modelId: string) => void
  disabled?: boolean
}

export function ModelSelector({ models, selectedModel, onSelect, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get current model info
  const currentModel = models.find(m => m.id === selectedModel) || models[0]

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (models.length === 0) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="font-medium">{currentModel?.name || 'Select model'}</span>
        <ChevronIcon />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-[#2f2f2f] rounded-lg shadow-lg border border-gray-200 dark:border-[#424242] overflow-hidden z-50">
          <div className="py-1 max-h-64 overflow-y-auto">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model.id)
                  setIsOpen(false)
                }}
                className="w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#424242] transition-colors"
              >
                <div className="w-4 pt-0.5">
                  {model.id === (selectedModel || models[0]?.id) && (
                    <CheckIcon />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {model.name}
                  </div>
                  {model.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {model.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
