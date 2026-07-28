import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import markCyan from '../assets/brand/mark-cyan.svg'
import lockupWhite from '../assets/brand/lockup-white.svg'

/** Duration the hero waits before its first entrance (kept in sync with the splash exit). */
export const SPLASH_TOTAL = 1.9

let splashPlayed = false

/** Hero entrance delay: long on first load (behind the splash), short on remounts (language switch). */
export function splashDelay() {
  return splashPlayed ? 0.15 : SPLASH_TOTAL - 0.45
}

/**
 * Splash: the sail rises from the waterline, the wordmark surfaces,
 * then the whole screen lifts away like a curtain. Always deep sea, in both themes.
 */
function seenThisSession() {
  try {
    return sessionStorage.getItem('vela-splash') === '1'
  } catch {
    return false
  }
}

export function Splash() {
  const [done, setDone] = useState(() => {
    if (prefersReducedMotion() || seenThisSession()) {
      splashPlayed = true
      return true
    }
    return false
  })
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (done || !root.current) return
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          splashPlayed = true
          try {
            sessionStorage.setItem('vela-splash', '1')
          } catch {
            /* private mode: splash just replays */
          }
          setDone(true)
        },
      })
      tl.fromTo('.splash-mark', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7 }, 0.1)
        .fromTo('.splash-line', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.25)
        .fromTo('.splash-lockup', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.55)
        .to('.splash-stage', { y: -26, opacity: 0, duration: 0.45, ease: 'power2.in' }, 1.15)
        .to(root.current, { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, 1.2)
    },
    { scope: root },
  )

  if (done) return null

  return (
    <div ref={root} className="fixed inset-0 z-[60] flex items-center justify-center bg-sea" aria-hidden>
      <div className="splash-stage flex flex-col items-center gap-7">
        <img src={markCyan} alt="" className="splash-mark w-20 md:w-24" />
        <div className="h-px w-40 overflow-hidden md:w-52">
          <div className="splash-line h-px w-full origin-left bg-cyan" />
        </div>
        <img src={lockupWhite} alt="" className="splash-lockup h-7 w-auto md:h-8" />
      </div>
    </div>
  )
}
