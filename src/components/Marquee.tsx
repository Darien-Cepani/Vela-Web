import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import markCyan from '../assets/brand/mark-cyan.svg'

/**
 * The service band under the hero: one quiet strip, looping forever at a
 * constant pace.
 *
 * It reads as its own stratum rather than a rule with words in it — a faint
 * cyan wash between two hairlines, the sail mark as the separator instead of a
 * generic dot, and words alternating between soft and accent for rhythm. The
 * edge mask makes the loop endless rather than something that visibly restarts.
 */
export function Marquee() {
  const { t } = useTranslation()
  const track = useRef<HTMLDivElement>(null)

  const items = t('marquee.items', { returnObjects: true }) as string[]

  useGSAP(
    () => {
      if (!track.current || prefersReducedMotion()) return
      gsap.to(track.current, { xPercent: -50, duration: 44, ease: 'none', repeat: -1 })
    },
    { scope: track },
  )

  const row = (hidden: boolean) =>
    items.map((item, i) => (
      <span key={item} className="flex items-center gap-10 md:gap-14" aria-hidden={hidden || undefined}>
        <span
          className={`font-display text-2xl leading-none font-medium md:text-[2.1rem] ${
            i % 2 === 0 ? 'text-soft' : 'text-accent-ink'
          }`}
        >
          {item}
        </span>
        {/* the mark itself as the separator: a dot could belong to any site */}
        <img
          src={markCyan}
          alt=""
          aria-hidden
          className="h-[14px] w-auto shrink-0 opacity-60 md:h-[17px]"
        />
      </span>
    ))

  return (
    <section
      id="marquee"
      aria-label={t('marquee.label')}
      className="relative overflow-hidden border-y border-hair bg-[linear-gradient(180deg,transparent,rgb(0_170_212/0.05)_50%,transparent)] py-6 md:py-8"
    >
      {/* a single hairline of brand light along the top edge of the band */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(0_170_212/0.5),transparent)]"
      />
      <div className="[mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)]">
        <div ref={track} className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform md:gap-14">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  )
}
