import { useRef, type ReactNode, type CSSProperties } from 'react'

/**
 * React Bits-style SpotlightCard + BorderGlow: a pointer-tracked radial glow
 * inside the card, and a ring of light on the border that follows the cursor.
 * Position is written straight to CSS vars, never through React state.
 */
export function Spotlight({
  children,
  className = '',
  style,
  color = 'rgb(0 170 212 / 0.14)',
  ...rest
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  color?: string
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null)

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
      className={`group relative overflow-hidden ${className}`}
      style={style}
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
