import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

// angular offsets around the aim line, so the fan converges on the target
const RAYS = [
  { offset: -0.14, width: 0.045, speed: 0.45, phase: 0.2, alpha: 0.09 },
  { offset: -0.07, width: 0.024, speed: 0.75, phase: 1.9, alpha: 0.12 },
  { offset: -0.015, width: 0.055, speed: 0.32, phase: 3.3, alpha: 0.14 },
  { offset: 0.04, width: 0.028, speed: 0.6, phase: 4.6, alpha: 0.11 },
  { offset: 0.1, width: 0.05, speed: 0.42, phase: 2.5, alpha: 0.09 },
  { offset: 0.17, width: 0.022, speed: 0.85, phase: 5.4, alpha: 0.07 },
]

/**
 * React Bits-style LightRays: a fan of volumetric beams from the top-right,
 * aimed straight at the 3D mark (72% across, mid-hero) like a stage light.
 * The canvas itself is CSS-blurred for soft bloom.
 */
export function LightRays({ className = '' }: { className?: string }) {
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

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduce) draw(0)
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      // source above the top-right corner, aimed at the 3D mark's resting spot
      const ox = w * 1.04
      const oy = -h * 0.3
      const tx = w * 0.72
      const ty = h * 0.5
      const aim = Math.atan2(ty - oy, tx - ox)
      const reach = Math.hypot(tx - ox, ty - oy) * 2.1
      for (const ray of RAYS) {
        const breathe = 0.6 + 0.4 * Math.sin(t * ray.speed + ray.phase)
        const a = ray.alpha * breathe
        if (a < 0.005) continue
        const angle = aim + ray.offset
        const a1 = angle - ray.width
        const a2 = angle + ray.width
        const grad = ctx.createLinearGradient(ox, oy, ox + Math.cos(angle) * reach, oy + Math.sin(angle) * reach)
        grad.addColorStop(0, `rgba(199, 236, 248, ${a})`)
        grad.addColorStop(0.45, `rgba(0, 170, 212, ${a * 0.55})`)
        grad.addColorStop(1, 'rgba(0, 170, 212, 0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.lineTo(ox + Math.cos(a1) * reach, oy + Math.sin(a1) * reach)
        ctx.lineTo(ox + Math.cos(a2) * reach, oy + Math.sin(a2) * reach)
        ctx.closePath()
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
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

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none [filter:blur(14px)] ${className}`} />
}
