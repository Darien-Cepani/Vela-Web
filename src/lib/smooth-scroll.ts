import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

let lenis: Lenis | null = null

/** Lenis smooth scrolling wired into GSAP's ticker + ScrollTrigger. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 })
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis?.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenis = null
    }
  }, [])
}

/** Scroll to an element id, through Lenis when active. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.2 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
