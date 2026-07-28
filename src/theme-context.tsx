import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

const ThemeContext = createContext<{ mode: ThemeMode; toggle: () => void }>({
  mode: 'dark',
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeModeProvider({
  children,
  onChange,
}: {
  children: ReactNode
  onChange?: (mode: ThemeMode) => void
}) {
  const [mode, setMode] = useState<ThemeMode>(
    () => (localStorage.getItem('vela-theme') as ThemeMode) ?? 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = mode
    localStorage.setItem('vela-theme', mode)
    onChange?.(mode)
  }, [mode, onChange])

  return (
    <ThemeContext.Provider value={{ mode, toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')) }}>
      {children}
    </ThemeContext.Provider>
  )
}
