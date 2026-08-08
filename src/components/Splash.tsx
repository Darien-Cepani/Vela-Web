import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import lockupWhite from '../assets/brand/lockup-white.svg'

/** Duration the hero waits before its first entrance (kept in sync with the splash exit). */
export const SPLASH_TOTAL = 2.1

let splashPlayed = false

/** Hero entrance delay: long on first load (behind the splash), short on remounts (language switch). */
export function splashDelay() {
  return splashPlayed ? 0.15 : SPLASH_TOTAL - 0.45
}

function seenThisSession() {
  try {
    return sessionStorage.getItem('vela-splash') === '1'
  } catch {
    return false
  }
}

/**
 * Splash: the mark comes up over the horizon, once.
 *
 * The old version showed the sail mark *and* the lockup — and since the lockup
 * already contains the sail, the brand appeared twice in one frame. There is
 * one identity here now, revealed rather than assembled: a horizon rules
 * itself across the dark, the lockup rises through it behind a mask like a
 * sail clearing the skyline, a swell passes underneath, and the whole screen
 * lifts away as a curtain.
 *
 * Always deep sea, in both themes.
 */
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

      tl
        // 1. the horizon rules itself out from the centre
        .fromTo('.splash-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.85, ease: 'power3.inOut' }, 0)
        // 2. the lockup clears it, revealed by the mask rather than faded in
        .fromTo('.splash-lockup', { yPercent: 118 }, { yPercent: 0, duration: 1.05 }, 0.34)
        // 3. a swell passes under the waterline
        .fromTo('.splash-swell', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.5)
        .to('.splash-swell', { opacity: 0, duration: 0.5, ease: 'power2.in' }, 1.05)
        // 4. one ring leaves the waterline, the way the hero's water behaves
        .fromTo(
          '.splash-ring',
          { scale: 0.2, opacity: 0.55 },
          { scale: 1, opacity: 0, duration: 1.2, ease: 'power2.out' },
          0.62,
        )
        // 5. the horizon thins away and the stage lifts
        .to('.splash-rule', { scaleX: 1.35, opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 1.2)
        .to('.splash-stage', { y: -30, opacity: 0, duration: 0.5, ease: 'power2.in' }, 1.32)
        .to(root.current, { yPercent: -100, duration: 0.72, ease: 'expo.inOut' }, 1.4)
    },
    { scope: root },
  )

  if (done) return null

  return (
    <div ref={root} className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-sea" aria-hidden>
      {/* faint deep-sea atmosphere so the field is not flat black-green */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_460px_at_50%_54%,rgb(0_170_212/0.13),transparent_68%)]"
      />

      <div className="splash-stage relative flex flex-col items-center">
        {/* a ring leaving the waterline */}
        <span
          aria-hidden
          className="splash-ring pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/40"
        />

        {/* the mask: the lockup exists only above the horizon */}
        <div className="overflow-hidden px-1 pb-1">
          <img src={lockupWhite} alt="" className="splash-lockup h-10 w-auto md:h-14" />
        </div>

        {/* the horizon itself */}
        <div className="relative mt-6 w-[240px] md:w-[340px]">
          <span aria-hidden className="splash-rule block h-px w-full origin-center bg-cyan" />
          {/* the swell running along it */}
          <span
            aria-hidden
            className="splash-swell absolute inset-x-0 -top-px block h-[3px] origin-center rounded-full bg-[linear-gradient(90deg,transparent,rgb(0_170_212/0.9),transparent)] blur-[1.5px]"
          />
        </div>
      </div>
    </div>
  )
}
