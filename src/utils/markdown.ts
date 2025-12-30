import { marked } from 'marked'
import hljs from 'highlight.js'

// Configure marked with syntax highlighting
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Custom renderer for code blocks
const renderer = new marked.Renderer()

renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(text, { language }).value
  return `<div class="code-block-wrapper">
    <div class="code-block-header">
      <span class="code-block-language">${language}</span>
      <button class="copy-button" data-code="${encodeURIComponent(text)}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      </button>
    </div>
    <pre><code class="hljs language-${language}">${highlighted}</code></pre>
  </div>`
}

renderer.codespan = ({ text }: { text: string }) => {
  return `<code class="inline-code">${text}</code>`
}

marked.use({ renderer })

export function renderMarkdown(content: string): string {
  return marked.parse(content) as string
}

export function setupCopyButtons(container: HTMLElement) {
  const buttons = container.querySelectorAll('.copy-button')
  buttons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault()
      const code = decodeURIComponent(
        (button as HTMLElement).dataset.code || ''
      )
      try {
        await navigator.clipboard.writeText(code)
        const span = button.querySelector('span')
        if (span) {
          const originalText = span.textContent
          span.textContent = 'Copied!'
          setTimeout(() => {
            span.textContent = originalText
          }, 2000)
        }
      } catch {
        // Clipboard access denied
      }
    })
  })
}
