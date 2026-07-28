import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

type Spark = { x: number; y: number; angle: number; start: number }

const DURATION = 0.45
const COUNT = 8
const RADIUS = 26
const LENGTH = 9

/**
 * React Bits-style ClickSpark, in brand cyan: every click fires a small
 * burst of radiating lines. One fixed canvas, GSAP ticker, no React state.
 */
export function ClickSpark() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let sparks: Spark[] = []
    const onClick = (e: MouseEvent) => {
      const start = gsap.ticker.time
      for (let i = 0; i < COUNT; i++) {
        sparks.push({ x: e.clientX, y: e.clientY, angle: (Math.PI * 2 * i) / COUNT + Math.PI / COUNT, start })
      }
    }
    window.addEventListener('click', onClick)

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      if (!sparks.length) return
      const now = gsap.ticker.time
      sparks = sparks.filter((s) => now - s.start < DURATION)
      for (const s of sparks) {
        const p = (now - s.start) / DURATION
        const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
        const dist = eased * RADIUS
        const len = LENGTH * (1 - eased)
        ctx.strokeStyle = `rgba(0, 170, 212, ${1 - p})`
        ctx.lineWidth = 1.6
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(s.x + Math.cos(s.angle) * dist, s.y + Math.sin(s.angle) * dist)
        ctx.lineTo(s.x + Math.cos(s.angle) * (dist + len), s.y + Math.sin(s.angle) * (dist + len))
        ctx.stroke()
      }
    }

    gsap.ticker.add(draw)
    return () => {
      gsap.ticker.remove(draw)
      window.removeEventListener('click', onClick)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[55] h-full w-full" />
}
