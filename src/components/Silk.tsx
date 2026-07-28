import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

type Ribbon = { base: number; amp: number; k: number; speed: number; phase: number; fill: string }

const RIBBONS: Ribbon[] = [
  { base: 0.22, amp: 0.1, k: 0.0038, speed: 0.24, phase: 0.4, fill: 'rgba(255, 255, 255, 0.10)' },
  { base: 0.4, amp: 0.14, k: 0.0028, speed: 0.18, phase: 2.2, fill: 'rgba(7, 30, 38, 0.10)' },
  { base: 0.58, amp: 0.12, k: 0.0044, speed: 0.3, phase: 4.0, fill: 'rgba(255, 255, 255, 0.08)' },
  { base: 0.74, amp: 0.15, k: 0.0032, speed: 0.21, phase: 1.1, fill: 'rgba(7, 30, 38, 0.12)' },
  { base: 0.88, amp: 0.1, k: 0.005, speed: 0.27, phase: 5.3, fill: 'rgba(255, 255, 255, 0.07)' },
]

/**
 * React Bits-style Silk, brand-tuned: slow layered ribbons flowing through
 * the cyan field like fabric under water. Canvas 2D, transform-free.
 */
export function Silk({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let w = 0
    let h = 0

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const r of RIBBONS) {
        ctx.beginPath()
        ctx.moveTo(-8, h)
        for (let x = -8; x <= w + 8; x += 10) {
          const y =
            h * r.base +
            Math.sin(x * r.k + t * r.speed * 2.4 + r.phase) * h * r.amp * 0.55 +
            Math.sin(x * r.k * 0.4 + t * r.speed * 1.5 + r.phase * 1.7) * h * r.amp * 0.45
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w + 8, h)
        ctx.closePath()
        ctx.fillStyle = r.fill
        ctx.fill()
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduce) draw(2)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    if (reduce) return () => ro.disconnect()

    let active = true
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting
    })
    io.observe(canvas)

    const tick = () => {
      if (active) draw(gsap.ticker.time)
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      io.disconnect()
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />
}
