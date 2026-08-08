import { useEffect, useState } from 'react'
import { getPerfTier, onPerfTierChange, type PerfTier } from './perf-tier'

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

/**
 * Width AND capability. `useIsDesktop` alone was handing WebGL to any wide
 * window, including machines with no GPU acceleration where the hero measured
 * 11fps. Heavy visuals should ask this instead.
 */
export function useCanAfford(query = '(min-width: 1024px)') {
  const wide = useIsDesktop(query)
  const [tier, setTier] = useState<PerfTier>(() => getPerfTier())
  // the unsubscribe returns a boolean (Set.delete); wrap it so the effect
  // cleanup type stays void
  useEffect(() => {
    const off = onPerfTierChange(setTier)
    return () => {
      off()
    }
  }, [])
  return wide && tier === 'full'
}

/**
 * The live tier. The probe demotes ~1.5s after load, which is after most
 * components have already mounted — anything that started expensive work on
 * the strength of an optimistic first guess has to be able to stop.
 */
export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>(() => getPerfTier())
  useEffect(() => {
    const off = onPerfTierChange(setTier)
    return () => {
      off()
    }
  }, [])
  return tier
}
