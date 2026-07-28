import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

/**
 * React Bits-style interactive "Waves" canvas, tuned to the Vela sea:
 * drifting sine lines in brand cyan that bow toward the pointer.
 * One canvas, GSAP ticker, zero React state.
 */
export function Waves({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // pointer state, eased each frame (canvas itself is pointer-events-none)
    const target = { x: -9999, y: -9999 }
    const eased = { x: -9999, y: -9999 }
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      target.x = e.clientX - rect.left
      target.y = e.clientY - rect.top
    }
    const onLeave = () => {
      target.x = -9999
      target.y = -9999
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onLeave, { passive: true })

    const LINES = 11
    let t = 0
    const draw = () => {
      t += 0.004
      eased.x += (target.x - eased.x) * 0.06
      eased.y += (target.y - eased.y) * 0.06
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < LINES; i++) {
        const yBase = (h / (LINES + 1)) * (i + 1)
        const amp = 8 + i * 4.5
        const speed = 0.6 + i * 0.12
        ctx.beginPath()
        for (let x = 0; x <= w; x += 8) {
          let y =
            yBase +
            Math.sin(x * 0.0042 + t * speed * 4) * amp +
            Math.sin(x * 0.0011 + t * speed * 2.2) * amp * 0.6
          // bow toward the pointer with a gaussian falloff
          const dx = x - eased.x
          const influence = Math.exp(-(dx * dx) / (2 * 130 * 130))
          y += (eased.y - yBase) * 0.22 * influence
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(0, 170, 212, ${0.06 + i * 0.02})`
        ctx.lineWidth = 1.6
        ctx.stroke()
      }
    }

    gsap.ticker.add(draw)
    return () => {
      gsap.ticker.remove(draw)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />
}
