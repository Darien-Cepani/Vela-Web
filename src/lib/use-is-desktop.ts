import { useEffect, useState } from 'react'

/** Tracks a min-width media query; used to mount heavy visuals (canvas, WebGL) on desktop only. */
export function useIsDesktop(query = '(min-width: 1024px)') {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return isDesktop
}
