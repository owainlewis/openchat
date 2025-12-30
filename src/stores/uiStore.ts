import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface UiState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme
}

function applyTheme(resolvedTheme: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  // Disable transitions during theme change to prevent animation glitch
  document.documentElement.classList.add('no-transitions')
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  // Re-enable transitions after a frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transitions')
    })
  })
}

const THEME_KEY = 'openchat_theme'

function loadStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // Ignore storage errors
  }
  return 'system'
}

export const useUiStore = create<UiState>((set) => {
  const initialTheme = loadStoredTheme()
  const initialResolved = resolveTheme(initialTheme)

  // Apply theme immediately
  applyTheme(initialResolved)

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        set((state) => {
          if (state.theme !== 'system') return state
          const newResolved = getSystemTheme()
          applyTheme(newResolved)
          return { resolvedTheme: newResolved }
        })
      })
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,

    setTheme: (theme) => {
      const resolvedTheme = resolveTheme(theme)
      applyTheme(resolvedTheme)
      try {
        localStorage.setItem(THEME_KEY, theme)
      } catch {
        // Ignore storage errors
      }
      set({ theme, resolvedTheme })
    },
  }
})
