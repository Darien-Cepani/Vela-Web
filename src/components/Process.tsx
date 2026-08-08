import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { BlurText } from './BlurText'

/**
 * "Our process" as a voyage timeline: a dashed course runs down the section,
 * a cyan progress line draws over it as you scroll, and each phase is a
 * waypoint that lights up when the course reaches it.
 *
 * The phases are numbered because the order *is* the content — a client
 * reading this needs to know that Discover comes before Build — and each
 * carries what it actually produces, so the section answers "what happens,
 * in what order, and what do I get" instead of only naming four verbs.
 */
export function Process() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  const steps = t('process.steps', { returnObjects: true }) as Array<{
    verb: string
    body: string
    yield: string
  }>

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // the sailed course draws down the rail as the phases scroll by
      gsap.fromTo(
        '.proc-progress',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.proc-rail-wrap', start: 'top 72%', end: 'bottom 58%', scrub: 0.6 },
        },
      )
      // waypoints light up as the course passes them
      gsap.utils.toArray<HTMLElement>('.proc-dot', root.current!).forEach((dot) => {
        ScrollTrigger.create({
          trigger: dot,
          start: 'top 64%',
          onEnter: () => dot.classList.add('glass-orb-on'),
          onLeaveBack: () => dot.classList.remove('glass-orb-on'),
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="process" ref={root} className="pt-24 md:pt-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <BlurText className="max-w-[16ch] text-3xl sm:text-5xl md:text-6xl">
          {t('process.h2pre')}<span className="text-accent-ink">{t('process.h2accent')}</span>.
        </BlurText>
        <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-soft md:text-lg" data-reveal>
          {t('process.sub')}
        </p>

        {/* A single rail on the left at every width. The old centre rail on lg
            alternated sides, which left half of every row empty and put a
            second dashed line in direct competition with the voyage chart. */}
        <ol className="proc-rail-wrap relative mt-14 md:mt-16">
          <div aria-hidden className="absolute inset-y-3 left-[19px] w-px md:left-[27px]">
            <div className="h-full border-l border-dashed border-hair" />
            <div className="proc-progress absolute inset-0 origin-top scale-y-0 bg-cyan shadow-[0_0_10px_rgb(0_170_212/0.45)]" />
          </div>

          {steps.map((s, i) => (
            <li
              key={s.verb}
              data-reveal
              /* Three columns from lg: marker, phase, explanation. As two
                 columns the body stopped at its 54ch measure and left roughly
                 a third of the row empty on a wide screen — splitting the
                 phase from its explanation uses that width and turns the list
                 into something you can read across as well as down. */
              className="group relative grid grid-cols-[40px_1fr] items-start gap-x-5 border-t border-hair py-8 first:border-t-0 md:grid-cols-[56px_1fr] md:gap-x-8 md:py-10 lg:grid-cols-[56px_minmax(0,4fr)_minmax(0,5fr)] lg:gap-x-12 lg:items-baseline"
            >
              {/* the waypoint carries the phase number: the marker and the
                  ordinal are the same object, so the rail reads as a sequence */}
              <span
                aria-hidden
                className="proc-dot glass-orb relative z-10 flex h-11 w-11 items-center justify-center rounded-full font-display text-[13px] font-semibold text-soft md:h-14 md:w-14 md:text-[15px]"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* the phase */}
              <div className="min-w-0 pt-1 lg:pt-0">
                <h3 className="font-display text-2xl font-semibold transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 md:text-4xl">
                  {s.verb}<span className="text-accent-ink">.</span>
                </h3>
                {/* what the client walks away with, tied to the phase it belongs to */}
                <span className="mt-3 inline-block rounded-full border border-cyan/25 bg-cyan/[0.08] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.14em] whitespace-nowrap text-accent-ink">
                  {s.yield}
                </span>
              </div>

              {/* the explanation, on its own column from lg */}
              <p className="col-start-2 mt-3 max-w-[54ch] text-base leading-relaxed text-soft md:text-lg lg:col-start-3 lg:mt-0 lg:max-w-none">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
