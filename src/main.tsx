import { initPerfTier } from './lib/perf-tier'
import { StrictMode, useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@astryxdesign/core/reset.css'
import '@astryxdesign/core/astryx.css'
import './index.css'
import './i18n'
import { Theme } from '@astryxdesign/core'
// pre-built theme artifacts (npx astryx theme build src/theme/vela.ts)
import { velaTheme } from './theme/vela.js'
import './theme/vela.css'
import { ThemeModeProvider } from './theme-context'
import { RouterProvider } from './lib/router'
import App from './App.tsx'

// stamp the stored theme before first paint to avoid a flash
document.documentElement.dataset.theme = localStorage.getItem('vela-theme') ?? 'dark'

function Root() {
  const [mode, setMode] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('vela-theme') as 'light' | 'dark') ?? 'dark',
  )
  const onChange = useCallback((m: 'light' | 'dark') => setMode(m), [])
  return (
    <Theme theme={velaTheme} mode={mode}>
      <ThemeModeProvider onChange={onChange}>
        <RouterProvider>
          <App />
        </RouterProvider>
      </ThemeModeProvider>
    </Theme>
  )
}

initPerfTier()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
