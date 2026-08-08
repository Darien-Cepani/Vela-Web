import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

let lenis: Lenis | null = null

/**
 * Where the reader was, per URL, so a reload puts them back.
 *
 * The browser restores scroll on reload by itself, but Lenis takes ownership
 * of the scroll position when it initialises and starts from zero, which threw
 * the reader back to the top of the page every refresh. Recording the offset
 * ourselves and re-applying it once Lenis is running is the only way to have
 * both smooth scrolling and a reload that does not lose your place.
 */
const KEY = 'vela-scroll'

function remember(y: number) {
  try {
    sessionStorage.setItem(KEY + ':' + location.pathname, String(Math.round(y)))
  } catch {
    /* private mode, or storage full: losing the position is not worth throwing over */
  }
}

function recall(): number {
  try {
    return Number(sessionStorage.getItem(KEY + ':' + location.pathname) ?? 0) || 0
  } catch {
    return 0
  }
}

/** Lenis smooth scrolling wired into GSAP's ticker + ScrollTrigger. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      // no Lenis to fight with, so the browser's own restoration is enough
      return
    }

    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 })
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis?.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Only restore when the browser says this was a reload or a history
    // traversal. A fresh visit belongs at the top of the page.
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    const restoring = !location.hash && (nav?.type === 'reload' || nav?.type === 'back_forward')
    const target = restoring ? recall() : 0

    if (target > 0) {
      // after layout, or the page is not yet tall enough to hold the offset
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          lenis?.scrollTo(target, { immediate: true })
          ScrollTrigger.refresh()
        }),
      )
    }

    let ticking = 0
    const onScroll = () => {
      if (ticking) return
      ticking = window.setTimeout(() => {
        ticking = 0
        remember(window.scrollY)
      }, 200)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // a reload can happen without a final scroll event, so record on the way out too
    const onLeave = () => remember(window.scrollY)
    window.addEventListener('pagehide', onLeave)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', onLeave)
      if (ticking) clearTimeout(ticking)
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
