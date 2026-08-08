import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { usePerfTier } from '../lib/use-is-desktop'
import { ShiftDiagram, type DiagramKind } from './ShiftDiagram'
import { BlurText } from './BlurText'

/**
 * "Why any of this matters" — the stakes, shown rather than described.
 *
 * This section used to be six paragraphs, and six paragraphs is a wall nobody
 * on a phone reads. Each point is now a small animated diagram that makes the
 * argument on its own, with a service label and one short claim under it. The
 * reading load went from roughly 180 words to under 40.
 *
 * The diagrams are inline SVG, not video: they have to follow the light and
 * dark themes, they must not bake in a language, and six video files would
 * outweigh the entire bundle.
 *
 * Every claim here is checkable against the reader's own week — there are no
 * numbers anywhere, because we would be inventing them.
 */

const KINDS: DiagramKind[] = ['hours', 'found', 'craft', 'reuse', 'automate', 'cited']

export function Shift() {
  const tier = usePerfTier()
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  const rows = t('shift.rows', { returnObjects: true }) as Array<{
    label: string
    claim: string
    note: string
  }>

  useGSAP(
    () => {
      // Six looping diagrams are ~74 simultaneously animating SVG elements, and
      // SVG animation is main-thread work that no compositor takes over.
      // Measured on a 6x-throttled CPU: 53fps with them running, 60 with them
      // held still. Every diagram's resting state is already a complete,
      // readable frame — it was built that way for reduced motion — so a weak
      // device gets the finished infographic instead of a stuttering one.
      // `.dia-run` is a class, not a GSAP-set property, so reverting the
      // context does not remove it. If the probe demotes this device after the
      // diagrams already started, strip it by hand or they keep looping.
      const stopAll = () =>
        root.current
          ?.querySelectorAll('.dia-run')
          .forEach((el) => el.classList.remove('dia-run'))
      if (prefersReducedMotion() || tier === 'low') {
        stopAll()
        return
      }
      gsap.utils.toArray<HTMLElement>('.shift-cell', root.current!).forEach((cell) => {
        gsap.fromTo(
          cell,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'expo.out',
            scrollTrigger: { trigger: cell, start: 'top 86%', once: true },
          },
        )

        // The diagrams loop forever, so they are gated on the card being
        // ON SCREEN, not merely having been reached once — otherwise six
        // looping SVGs keep the compositor busy for the whole visit.
        ScrollTrigger.create({
          trigger: cell,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: ({ isActive }) => cell.classList.toggle('dia-run', isActive),
        })
      })
      ScrollTrigger.refresh()
    },
    { scope: root, dependencies: [tier], revertOnUpdate: true },
  )

  return (
    <section id="shift" ref={root} className="pt-24 md:pt-40">
      {/* the heading stays on the page's column */}
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-fade">{t('shift.eyebrow')}</p>
        <BlurText className="mt-4 max-w-[16ch] text-3xl sm:text-5xl md:text-6xl">
          {t('shift.h2pre')}<span className="text-accent-ink">{t('shift.h2accent')}</span>.
        </BlurText>
        <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-soft md:text-lg" data-reveal>
          {t('shift.sub')}
        </p>
      </div>

      {/* on the page's column, like every other section */}
      <div className="mx-auto mt-12 w-full max-w-[1240px] px-5 sm:px-6 md:mt-16 lg:px-8">
        <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
          {rows.map((r, i) => (
            <li
              key={r.claim}
              className="shift-cell glass-refract group relative overflow-hidden rounded-[22px] border border-hair bg-surface-2/50 p-5 transition-colors duration-500 hover:border-cyan/40 md:p-6 dark:bg-white/[0.03]"
            >
              {/* the diagram carries the argument */}
              <div className="relative aspect-[16/9] w-full text-strong">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-[14px] bg-[radial-gradient(70%_70%_at_50%_32%,rgb(0_170_212/0.10),transparent_72%)]"
                />
                <div className="relative h-full w-full p-2">
                  <ShiftDiagram kind={KINDS[i]} />
                </div>
              </div>

              <p className="mt-5 text-[11.5px] font-bold uppercase tracking-[0.18em] text-fade">{r.label}</p>
              <h3 className="mt-1.5 font-display text-xl leading-snug font-semibold text-strong md:text-[1.4rem]">
                {r.claim}
              </h3>
              <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-soft">{r.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
