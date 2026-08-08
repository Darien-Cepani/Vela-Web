import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

type Pt = { x: number; y: number }

/** Tack points of the course: alternating reaches down the page, in real pixels. */
function tackPoints(w: number, h: number): Pt[] {
  const n = Math.max(4, Math.min(8, Math.round(h / 950)))
  const seg = h / (n + 1)
  const pts: Pt[] = [{ x: w * 0.72, y: 0 }]
  for (let i = 1; i <= n; i++) {
    const left = i % 2 === 1
    pts.push({ x: left ? w * (0.16 + (i % 3) * 0.03) : w * (0.84 - (i % 3) * 0.03), y: seg * i })
  }
  pts.push({ x: w * 0.55, y: h })
  return pts
}

/** Catmull-Rom through the tacks → one smooth flowing bezier course. */
function pathD(pts: Pt[]): string {
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

/**
 * The voyage chart: a quiet dotted course that starts below the marquee and
 * tacks down the page. The faint dotted plan drifts forward; the sailed dots
 * brighten progressively behind a scroll-driven mask (dotted strokes cannot
 * use the dashoffset draw trick directly). Kept deliberately low-contrast so
 * text above it stays readable. Waypoints ping once as the course passes.
 */
export function VoyageLine() {
  const wrap = useRef<HTMLDivElement>(null)
  const maskRef = useRef<SVGPathElement>(null)
  const mainRef = useRef<SVGPathElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0, top: 0 })
  const [wps, setWps] = useState<Pt[]>([])
  const wpFracs = useRef<number[]>([])
  const progress = useRef({ p: 0 })

  // geometry follows the page: below the marquee, down to the sheet's end
  useEffect(() => {
    const el = wrap.current
    if (!el?.parentElement) return
    const parent = el.parentElement
    const build = () => {
      const parentRect = parent.getBoundingClientRect()
      const marquee = document.getElementById('marquee')
      const top = marquee
        ? marquee.getBoundingClientRect().bottom - parentRect.top
        : window.innerHeight
      setBox({ w: parent.clientWidth, h: Math.max(0, parent.clientHeight - top), top })
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  useGSAP(
    () => {
      const main = mainRef.current
      const mask = maskRef.current
      const head = headRef.current
      if (!main || !mask || !head || !box.w || !box.h) return

      const total = main.getTotalLength()
      mask.style.strokeDasharray = String(total)
      mask.style.strokeDashoffset = String(total)

      // waypoints sit where the course crosses each tack's depth (y is monotonic)
      const tacks = tackPoints(box.w, box.h).slice(1, -1)
      const found = tacks.map((tp) => {
        let lo = 0
        let hi = total
        for (let k = 0; k < 14; k++) {
          const mid = (lo + hi) / 2
          if (main.getPointAtLength(mid).y < tp.y) lo = mid
          else hi = mid
        }
        return { pt: main.getPointAtLength(lo), f: lo / total }
      })
      wpFracs.current = found.map((f) => f.f)
      setWps(found.map((f) => ({ x: f.pt.x, y: f.pt.y })))

      if (prefersReducedMotion()) return

      // The comet marks where you are *while you are moving*. Parked, it is a
      // glowing dot sitting on top of whatever paragraph you stopped at, which
      // is exactly where it is hardest to read around. So it fades out shortly
      // after the scrolling stops and comes back the moment it resumes.
      let idle = 0
      const parkHead = () => {
        window.clearTimeout(idle)
        idle = window.setTimeout(() => {
          head.style.opacity = '0'
        }, 700)
      }

      const render = () => {
        const p = progress.current.p
        mask.style.strokeDashoffset = String(total * (1 - p))
        const pt = main.getPointAtLength(total * p)
        head.style.transform = `translate(${pt.x}px, ${pt.y}px)`
        const sailing = p > 0.004 && p < 0.996
        head.style.opacity = sailing ? '1' : '0'
        if (sailing) parkHead()
        else window.clearTimeout(idle)
        wrap.current
          ?.querySelectorAll<HTMLElement>('.vl-wp')
          .forEach((wp, i) => wp.classList.toggle('vl-wp-on', p >= (wpFracs.current[i] ?? 2)))
      }
      gsap.to(progress.current, {
        p: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 1.2, invalidateOnRefresh: true },
        onUpdate: render,
      })
      render()
      return () => window.clearTimeout(idle)
    },
    { scope: wrap, dependencies: [box.w, box.h], revertOnUpdate: true },
  )

  const d = box.w && box.h ? pathD(tackPoints(box.w, box.h)) : ''

  return (
    <div
      ref={wrap}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      style={{ top: box.top }}
    >
      {d && (
        <svg className="h-full w-full" viewBox={`0 0 ${box.w} ${box.h}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="vl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#45C8E8" />
              <stop offset="0.5" stopColor="#00AAD4" />
              <stop offset="1" stopColor="#007D9C" />
            </linearGradient>
            {/* scroll-driven reveal window for the sailed dots */}
            <mask id="vl-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={box.w} height={box.h}>
              <path ref={maskRef} d={d} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
            </mask>
          </defs>
          {/* the planned course: faint dots, drifting slowly forward */}
          <path
            className="vl-plan opacity-[0.09] dark:opacity-[0.12]"
            d={d}
            fill="none"
            stroke="url(#vl-grad)"
            strokeWidth="2.5"
            strokeDasharray="0.5 11"
            strokeLinecap="round"
          />
          {/* the sailed course: the same dots, brightened as far as you've come */}
          <path
            ref={mainRef}
            className="opacity-35"
            d={d}
            fill="none"
            stroke="url(#vl-grad)"
            strokeWidth="2.5"
            strokeDasharray="0.5 11"
            strokeLinecap="round"
            mask="url(#vl-mask)"
          />
        </svg>
      )}

      {/* waypoints on each tack: hollow until passed, then lit with a one-shot ping */}
      {wps.map((wp, i) => (
        <span
          key={i}
          className="vl-wp absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/50 bg-surface transition-[background-color,border-color,box-shadow] duration-500"
          style={{ left: wp.x, top: wp.y }}
        />
      ))}

      {/* the comet riding the tip of the sailed course */}
      <div ref={headRef} className="vl-head absolute top-0 left-0 opacity-0 transition-opacity duration-500 will-change-transform">
        <div className="relative flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <span className="absolute h-8 w-8 rounded-full border border-cyan/40 [animation:waypoint-ping_2.8s_ease-out_infinite]" />
          <span className="block h-2.5 w-2.5 rounded-full bg-[#7FDFF7] shadow-[0_0_10px_3px_rgb(0_170_212/0.35)]" />
        </div>
      </div>
    </div>
  )
}
