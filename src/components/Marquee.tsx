import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { gsap, prefersReducedMotion } from '../lib/gsap'

/** Minimal service marquee: one quiet strip, looping forever at a constant pace. */
export function Marquee() {
  const { t } = useTranslation()
  const track = useRef<HTMLDivElement>(null)

  const items = t('marquee.items', { returnObjects: true }) as string[]

  useGSAP(
    () => {
      if (!track.current || prefersReducedMotion()) return
      gsap.to(track.current, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 })
    },
    { scope: track },
  )

  const row = (hidden: boolean) =>
    items.map((item, i) => (
      <span key={item} className="flex items-center gap-12" aria-hidden={hidden || undefined}>
        <span
          className={`font-display text-2xl font-medium md:text-3xl ${
            i % 2 === 0 ? 'text-fade' : 'text-outline'
          }`}
        >
          {item}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-cyan/50" aria-hidden />
      </span>
    ))

  return (
    <section
      id="marquee"
      className="overflow-hidden border-y border-hair py-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      aria-label={t('marquee.label')}
    >
      <div ref={track} className="flex w-max items-center gap-12 whitespace-nowrap will-change-transform">
        {row(false)}
        {row(true)}
      </div>
    </section>
  )
}
