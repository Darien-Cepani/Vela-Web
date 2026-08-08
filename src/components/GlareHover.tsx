import { useCallback, useRef, type CSSProperties } from 'react'

/**
 * React Bits-style GlareHover, brand-tuned and reduced to the part this site
 * needs: a hard-edged band of light that rakes across a surface once per
 * hover, entering from the side the pointer came from.
 *
 * Unlike a spotlight it has *direction*, which is what makes a flat card read
 * as a physical panel catching the sun off the water — the same raking light
 * the hero's 3D mark is lit by.
 *
 * Returned as a hook rather than a wrapper component so it can ride an
 * existing positioned card instead of adding a nested box around every one.
 * The sweep is a CSS animation restarted by a class toggle, so hover state
 * never round-trips through React.
 */
export function useGlare(intensity = 0.32) {
  const ref = useRef<HTMLElement>(null)

  const onPointerEnter = useCallback((e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    // enter from whichever edge the pointer crossed, so the light has a source
    el.style.setProperty('--glare-from', e.clientX - r.left < r.width / 2 ? '-1' : '1')
    el.classList.remove('glare-run')
    // force a reflow so re-entering mid-sweep restarts the sweep
    void el.offsetWidth
    el.classList.add('glare-run')
  }, [])

  return {
    ref,
    onPointerEnter,
    style: { ['--glare-alpha' as string]: intensity } as CSSProperties,
  }
}
