import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { BlurText } from './BlurText'

/**
 * "Our process" as a voyage timeline: a dashed course runs down the section,
 * a cyan progress line draws over it as you scroll, and each phase is a
 * waypoint that lights up when the course reaches it. Steps alternate sides
 * of the rail on desktop and stack along a left rail on mobile.
 */
export function Process() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  const steps = t('process.steps', { returnObjects: true }) as Array<{ verb: string; body: string }>

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
          scrollTrigger: {
            trigger: '.proc-rail-wrap',
            start: 'top 72%',
            end: 'bottom 58%',
            scrub: 0.6,
          },
        },
      )
      // waypoints light up as the course passes them
      gsap.utils.toArray<HTMLElement>('.proc-dot', root.current!).forEach((dot) => {
        ScrollTrigger.create({
          trigger: dot,
          start: 'top 64%',
          onEnter: () => dot.classList.add('vl-wp-on'),
          onLeaveBack: () => dot.classList.remove('vl-wp-on'),
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="process" ref={root} className="pt-24 md:pt-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <BlurText className="max-w-[16ch] text-4xl sm:text-5xl md:text-6xl">
          {t('process.h2pre')}<span className="text-accent-ink">{t('process.h2accent')}</span>.
        </BlurText>
        <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-soft" data-reveal>
          {t('process.sub')}
        </p>

        <div className="proc-rail-wrap relative mt-14 md:mt-20">
          {/* the course: dashed plan + scrubbed sailed line, left rail on mobile, center on lg */}
          <div aria-hidden className="absolute inset-y-2 left-[7px] w-px lg:left-1/2 lg:-translate-x-1/2">
            <div className="h-full border-l border-dashed border-hair" />
            <div className="proc-progress absolute inset-0 origin-top scale-y-0 bg-cyan shadow-[0_0_10px_rgb(0_170_212/0.45)]" />
          </div>

          <div className="flex flex-col gap-14 md:gap-24">
            {steps.map((s, i) => (
              <article
                key={s.verb}
                data-reveal
                className="relative grid grid-cols-[30px_1fr] items-start lg:grid-cols-2 lg:gap-x-20"
              >
                {/* waypoint on the course */}
                <span
                  aria-hidden
                  className="proc-dot relative top-3 h-4 w-4 rounded-full border-2 border-cyan bg-surface transition-[background-color,border-color,box-shadow] duration-500 lg:absolute lg:left-1/2 lg:-translate-x-1/2"
                />
                <div
                  className={
                    i % 2 === 0
                      ? 'lg:col-start-1 lg:row-start-1 lg:text-right'
                      : 'lg:col-start-2 lg:row-start-1'
                  }
                >
                  <h3 className="font-display text-4xl font-semibold md:text-5xl">
                    {s.verb}<span className="text-accent-ink">.</span>
                  </h3>
                  <p
                    className={`mt-3 max-w-[38ch] text-lg leading-relaxed text-soft ${
                      i % 2 === 0 ? 'lg:ml-auto' : ''
                    }`}
                  >
                    {s.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
