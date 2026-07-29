import { useEffect } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

/**
 * Cross-browser click shockwave: true refraction of live DOM isn't possible
 * outside Chromium, so the ripple is physical instead. A wavefront expands
 * from the click and each UI element it reaches gets a slight radial push
 * with an elastic settle, plus a visible cyan ring riding the front.
 * Transforms only, GPU-composited, identical on Chrome/Firefox/Safari.
 * Fired via the `vela-ripple` CustomEvent (the 3D mark dispatches on click).
 */

const SPEED = 1.35 // wavefront px per ms
const REACH = 1500 // px radius the wave can travel
const PUSH = 8 // max px an element is nudged

const TARGETS =
  'main h1, main h2, main h3, main p, main button, main a, main article, main .hero-badge'

export function ClickRipple() {
  useEffect(() => {
    const onRipple = (e: Event) => {
      if (prefersReducedMotion()) return
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail

      // the visible wavefront: one cyan ring expanding from the click
      const ring = document.createElement('div')
      ring.className = 'ripple-ring'
      ring.style.left = `${x}px`
      ring.style.top = `${y}px`
      document.body.appendChild(ring)
      gsap.fromTo(
        ring,
        { scale: 0.02, opacity: 0.55 },
        {
          scale: 1,
          opacity: 0,
          duration: REACH / (SPEED * 1000),
          ease: 'power1.out',
          onComplete: () => ring.remove(),
        },
      )

      // the wave itself: nearby elements get pushed outward as the front passes
      document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.bottom < -80 || r.top > window.innerHeight + 80) return
        const dx = r.left + r.width / 2 - x
        const dy = r.top + r.height / 2 - y
        const d = Math.hypot(dx, dy) || 1
        if (d > REACH) return
        const push = PUSH * (1 - d / REACH)
        gsap
          .timeline({ delay: d / (SPEED * 1000) })
          .to(el, {
            x: (dx / d) * push,
            y: (dy / d) * push,
            duration: 0.16,
            ease: 'power2.out',
            overwrite: 'auto',
          })
          .to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.38)' })
      })
    }
    window.addEventListener('vela-ripple', onRipple)
    return () => window.removeEventListener('vela-ripple', onRipple)
  }, [])

  return null
}
