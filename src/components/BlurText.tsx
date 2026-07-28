import { useRef, type ReactNode, type ElementType } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

type Token = { type: 'space'; s: string } | { type: 'word'; nodes: ReactNode[] }

function flatten(node: ReactNode, out: Token[]) {
  if (node == null || node === false) return
  if (typeof node === 'string' || typeof node === 'number') {
    String(node)
      .split(/(\s+)/)
      .forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) out.push({ type: 'space', s: part })
        else out.push({ type: 'word', nodes: [part] })
      })
    return
  }
  if (Array.isArray(node)) {
    node.forEach((n) => flatten(n, out))
    return
  }
  out.push({ type: 'word', nodes: [node] })
}

/** Adjacent word tokens with no whitespace between them fuse into one unit ("sail" + "." stay together). */
function tokenize(children: ReactNode): Token[] {
  const flat: Token[] = []
  flatten(children, flat)
  const merged: Token[] = []
  for (const tok of flat) {
    const prev = merged[merged.length - 1]
    if (tok.type === 'word' && prev?.type === 'word') prev.nodes.push(...tok.nodes)
    else merged.push(tok)
  }
  return merged
}

/**
 * React Bits-style BlurText: each word surfaces from a blur as the
 * heading scrolls into view. Accent spans and trailing punctuation
 * travel as a single unit so lines never break mid-word.
 */
export function BlurText({
  children,
  className = '',
  as: Tag = 'h2',
}: {
  children: ReactNode
  className?: string
  as?: ElementType
}) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.bt-word',
        { opacity: 0, y: 16, filter: 'blur(9px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.75,
          stagger: 0.05,
          ease: 'expo.out',
          scrollTrigger: { trigger: ref.current, start: 'top 86%', once: true },
        },
      )
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className}>
      {tokenize(children).map((tok, i) =>
        tok.type === 'space' ? (
          tok.s
        ) : (
          <span key={i} className="bt-word inline-block will-change-transform">
            {tok.nodes}
          </span>
        ),
      )}
    </Tag>
  )
}
