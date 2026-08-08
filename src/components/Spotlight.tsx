import { type ReactNode, type CSSProperties } from 'react'
import { useGlare } from './GlareHover'

/**
 * React Bits-style SpotlightCard + BorderGlow + GlareHover on one surface:
 * a pointer-tracked radial glow inside the card, a ring of light on the border
 * that follows the cursor, and a directional glare that rakes across once as
 * the pointer arrives. Position is written straight to CSS vars, never through
 * React state.
 */
export function Spotlight({
  children,
  className = '',
  style,
  color = 'rgb(0 170 212 / 0.14)',
  glare = 0.3,
  ...rest
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  color?: string
  /** strength of the arrival glare; 0 disables it */
  glare?: number
} & Record<string, unknown>) {
  const { ref, onPointerEnter, style: glareStyle } = useGlare(glare)

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`)
  }

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      onPointerMove={onPointerMove}
      onPointerEnter={glare > 0 ? onPointerEnter : undefined}
      className={`group relative overflow-hidden ${glare > 0 ? 'glare-host' : ''} ${className}`}
      style={{ ...style, ...(glare > 0 ? glareStyle : null) }}
      {...rest}
    >
      {/* interior spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100"
        style={{
          background: `radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${color}, transparent 65%)`,
        }}
      />
      {/* border glow ring chasing the pointer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100"
        style={{
          padding: '1.5px',
          background: `radial-gradient(300px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgb(0 190 235 / 0.6), transparent 70%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
        }}
      />
      {children}
    </article>
  )
}
