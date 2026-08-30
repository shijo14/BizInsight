import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem('bizinsight-theme') || 'dark'
  )
  const timeoutRef = useRef(null)

  // Apply data-theme attribute whenever theme state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = useCallback((t) => {
    // Use functional updater so we always read current theme, never a stale closure
    setThemeState((current) => {
      if (t === current) return current

      // Clear any pending timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      // Trigger smooth CSS transition on the whole page
      const html = document.documentElement
      html.classList.add('theme-transitioning')

      timeoutRef.current = setTimeout(() => {
        html.classList.remove('theme-transitioning')
      }, 400)

      // Persist to localStorage
      localStorage.setItem('bizinsight-theme', t)

      return t
    })
  }, []) // no deps needed — uses functional updater

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
