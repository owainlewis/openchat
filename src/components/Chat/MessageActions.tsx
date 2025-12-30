import { useState } from 'react'
import { CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon, RegenerateIcon } from '../icons'

interface MessageActionsProps {
  content: string
  onRegenerate?: () => void
}

export function MessageActions({ content, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState<boolean | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access denied
    }
  }

  const buttonClass = "p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2f2f2f]"
  const activeClass = "text-gray-900 dark:text-white"

  return (
    <div className="flex items-center gap-1 mt-3">
      <button
        onClick={handleCopy}
        className={buttonClass}
        aria-label={copied ? 'Copied!' : 'Copy message'}
        title={copied ? 'Copied!' : 'Copy'}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>

      <button
        onClick={() => setLiked(liked === true ? null : true)}
        className={`${buttonClass} ${liked === true ? activeClass : ''}`}
        aria-label="Good response"
        title="Good response"
      >
        <ThumbsUpIcon />
      </button>

      <button
        onClick={() => setLiked(liked === false ? null : false)}
        className={`${buttonClass} ${liked === false ? activeClass : ''}`}
        aria-label="Bad response"
        title="Bad response"
      >
        <ThumbsDownIcon />
      </button>

      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className={buttonClass}
          aria-label="Regenerate response"
          title="Regenerate"
        >
          <RegenerateIcon />
        </button>
      )}
    </div>
  )
}
