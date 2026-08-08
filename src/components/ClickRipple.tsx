import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { rippleDisplacementMap } from '../lib/ripple-map'

/**
 * The shockwave from the hero mark.
 *
 * Two layers, because no single technique does both jobs everywhere:
 *
 *  1. A *physical* wave — a visible cyan wavefront plus a radial nudge given
 *     to every piece of UI it passes. Pure transforms, so it runs identically
 *     on every engine and is the whole effect where the second layer cannot go.
 *
 *  2. A *refraction* — the page itself bends through the wavefront, via an SVG
 *     displacement filter riding a full-viewport `backdrop-filter`. This is the
 *     part that makes it read as water rather than as a moving ring.
 *
 * The refraction is Chromium-only on purpose. Gecko supports the property but
 * rasterises SVG filters on the CPU; measured on this site's fixed nav it cost
 * about a third of the scroll frame rate for a permanent effect, and a
 * full-viewport filter would be far worse. Firefox keeps layer one, which is a
 * complete effect on its own.
 *
 * The overlay sits below the nav's stacking context, so the navigation stays
 * perfectly straight while everything under it bends — a distorted nav reads
 * as a rendering fault, not as an effect.
 */

const SPEED = 1.45 // wavefront px per ms
const REACH = 1800 // px the wave travels before it dies
const PUSH = 10 // max px an element is nudged
const MAX_DISPLACE = 78 // peak refraction strength

const TARGETS =
  'main h1, main h2, main h3, main p, main button, main a, main article, main li, main .hero-badge'

export function ClickRipple() {
  const [mapUrl, setMapUrl] = useState('')
  const imageRef = useRef<SVGFEImageElement>(null)
  const dispRefs = useRef<(SVGFEDisplacementMapElement | null)[]>([])
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onRipple = (e: Event) => {
      if (prefersReducedMotion()) return
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail

      // ── layer 1: the visible wavefront ──
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

      // ── layer 1b: the page furniture gets shoved ──
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
          .to(el, { x: (dx / d) * push, y: (dy / d) * push, duration: 0.16, ease: 'power2.out', overwrite: 'auto' })
          .to(el, { x: 0, y: 0, duration: 0.95, ease: 'elastic.out(1, 0.38)' })
      })

      // ── layer 2: the page bends ──
      const overlay = overlayRef.current
      const feImage = imageRef.current
      const disps = dispRefs.current.filter(Boolean) as SVGFEDisplacementMapElement[]
      if (!overlay || !feImage || disps.length === 0) return
      // generated on the first ripple only, then cached for the session
      if (!mapUrl) setMapUrl(rippleDisplacementMap())

      const travel = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      ) * 2.1

      const state = { radius: 40, strength: 1 }
      overlay.style.opacity = '1'
      gsap.killTweensOf(state)
      gsap
        .timeline({
          onUpdate: () => {
            // the feImage is a square centred on the click; growing it is what
            // moves the ring outward, and it is one attribute write per frame
            const s = state.radius
            feImage.setAttribute('x', String(x - s))
            feImage.setAttribute('y', String(y - s))
            feImage.setAttribute('width', String(s * 2))
            feImage.setAttribute('height', String(s * 2))
            // the three channels stay slightly apart so the bend splits light
            const base = MAX_DISPLACE * state.strength
            disps[0].setAttribute('scale', String(base))
            disps[1].setAttribute('scale', String(base * 1.09))
            disps[2].setAttribute('scale', String(base * 1.18))
          },
          onComplete: () => {
            overlay.style.opacity = '0'
          },
        })
        .to(state, { radius: travel, duration: 1.15, ease: 'power2.out' }, 0)
        .to(state, { strength: 0, duration: 1.15, ease: 'power2.in' }, 0)
    }

    window.addEventListener('vela-ripple', onRipple)
    return () => window.removeEventListener('vela-ripple', onRipple)
  }, [mapUrl])

  return (
    <>
      {/* The refracting pane. z-30 keeps it under the nav (z-40) and under the
          hero mark (z-35), so the thing you clicked and the thing you navigate
          with both stay undistorted while the page behind them moves. */}
      <div ref={overlayRef} aria-hidden className="ripple-refract" />

      <svg aria-hidden className="absolute h-0 w-0">
        <defs>
          <filter
            id="vela-click-ripple"
            x="0"
            y="0"
            width="100%"
            height="100%"
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            {/* a transparent pixel until the first ripple: a href-less feImage
                renders a broken-image glyph in Chromium */}
            <feImage
              ref={imageRef}
              result="MAP"
              preserveAspectRatio="none"
              href={mapUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
              x="-9999"
              y="-9999"
              width="1"
              height="1"
            />
            {/* one displacement per channel — a real lens splits colour at the
                edge of the bend, and without it the wave reads as a smear */}
            <feDisplacementMap
              ref={(el) => {
                dispRefs.current[0] = el
              }}
              in="SourceGraphic"
              in2="MAP"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="B"
              result="R_D"
            />
            <feColorMatrix
              in="R_D"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="R_C"
            />
            <feDisplacementMap
              ref={(el) => {
                dispRefs.current[1] = el
              }}
              in="SourceGraphic"
              in2="MAP"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="B"
              result="G_D"
            />
            <feColorMatrix
              in="G_D"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="G_C"
            />
            <feDisplacementMap
              ref={(el) => {
                dispRefs.current[2] = el
              }}
              in="SourceGraphic"
              in2="MAP"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="B"
              result="B_D"
            />
            <feColorMatrix
              in="B_D"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="B_C"
            />
            <feBlend in="R_C" in2="G_C" mode="screen" result="RG" />
            <feBlend in="RG" in2="B_C" mode="screen" />
          </filter>
        </defs>
      </svg>
    </>
  )
}
