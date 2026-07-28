import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/gsap'

/**
 * Page-wide water-ripple refraction, modeled on the expanding damped ring of
 * shadertoy wdtyDH. WebGL cannot sample the live DOM, so the refraction is
 * driven through a backdrop-filter displacement chain instead (Chromium):
 * a ring-shaped displacement map grows outward from the click while its
 * strength decays, visibly bending everything painted beneath the overlay.
 * The navbar and the 3D mark sit above the overlay and stay undistorted.
 * Fired via the `vela-ripple` CustomEvent; one ring per click.
 */

/** Ring displacement map: R/G encode the radial push around a gaussian ring. */
function makeRingMap(): string {
  const S = 256
  const c = S / 2
  const R = S * 0.25
  const SIG = S * 0.045
  const cv = document.createElement('canvas')
  cv.width = cv.height = S
  const ctx = cv.getContext('2d')!
  const img = ctx.createImageData(S, S)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x - c
      const dy = y - c
      const dist = Math.hypot(dx, dy) || 1
      const g = Math.exp(-((dist - R) ** 2) / (2 * SIG * SIG))
      const i = (y * S + x) * 4
      img.data[i] = 128 + (dx / dist) * 127 * g
      img.data[i + 1] = 128 + (dy / dist) * 127 * g
      img.data[i + 2] = 128
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return cv.toDataURL()
}

export function ClickRipple() {
  const [active, setActive] = useState(false)
  const feImg = useRef<SVGFEImageElement>(null)
  const feDisp = useRef<SVGFEDisplacementMapElement>(null)
  const anim = useRef<{ x: number; y: number; t0: number } | null>(null)
  const raf = useRef(0)

  useEffect(() => {
    feImg.current?.setAttribute('href', makeRingMap())
    const onRipple = (e: Event) => {
      if (prefersReducedMotion()) return
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail
      anim.current = { x, y, t0: performance.now() }
      setActive(true)
    }
    window.addEventListener('vela-ripple', onRipple)
    return () => {
      window.removeEventListener('vela-ripple', onRipple)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const SPEED = 1250 // px/s wavefront
    const DECAY = 2.1 // strength half-life, wdtyDH-style damping
    const MAX_SCALE = 55
    const step = () => {
      const a = anim.current
      const img = feImg.current
      const disp = feDisp.current
      if (!a || !img || !disp) return
      const t = (performance.now() - a.t0) / 1000
      const ringR = 30 + t * SPEED
      const side = ringR * 4 // the map's ring sits at 0.25 of its side
      const scale = MAX_SCALE * Math.exp(-DECAY * t)
      img.setAttribute('x', String(a.x - side / 2))
      img.setAttribute('y', String(a.y - side / 2))
      img.setAttribute('width', String(side))
      img.setAttribute('height', String(side))
      disp.setAttribute('scale', String(scale))
      if (scale < 0.8 || ringR > Math.hypot(window.innerWidth, window.innerHeight)) {
        setActive(false)
        return
      }
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [active])

  return (
    <>
      <svg aria-hidden className="absolute h-0 w-0">
        <filter id="vela-click-ripple" primitiveUnits="userSpaceOnUse">
          {/* neutral gray everywhere the ring image doesn't cover = zero displacement */}
          <feFlood floodColor="rgb(128,128,128)" result="neutral" />
          <feImage ref={feImg} preserveAspectRatio="none" result="ring" />
          <feComposite in="ring" in2="neutral" operator="over" result="map" />
          <feDisplacementMap ref={feDisp} in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {active && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-30"
          style={{
            backdropFilter: 'url(#vela-click-ripple)',
            WebkitBackdropFilter: 'url(#vela-click-ripple)',
          }}
        />
      )}
    </>
  )
}
