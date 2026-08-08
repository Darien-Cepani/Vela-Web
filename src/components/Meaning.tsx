import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import {
  RiAnchorLine,
  RiCompass3Line,
  RiFlashlightLine,
  RiPriceTag3Line,
  RiTranslate2,
  RiAccessibilityLine,
  RiWindyLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useTheme } from '../theme-context'
import { BlurText } from './BlurText'
import markCyan from '../assets/brand/mark-cyan.svg'

/**
 * The icons this section may use, named from the copy rather than imported
 * into it, so the words stay plain data. Each one restates its line rather
 * than decorating it — a compass for direction, the universal access symbol
 * for accessibility — so the column can be understood at a glance before any
 * of it is read.
 *
 * That access icon was a wheelchair. The claim it marks is about keyboard
 * reach, colour contrast and reduced motion, none of which a wheelchair has
 * anything to do with; it narrowed accessibility to one physical disability
 * and stood in for a group rather than for the work.
 */
const ICONS: Record<string, RemixiconComponentType> = {
  wind: RiWindyLine,
  compass: RiCompass3Line,
  anchor: RiAnchorLine,
  speed: RiFlashlightLine,
  access: RiAccessibilityLine,
  translate: RiTranslate2,
  price: RiPriceTag3Line,
}

/**
 * What Vela means: sticky title left, scrub-revealed manifesto, three pillar
 * rows and the standard on the right.
 *
 * Deliberately short. This is the first section under the hero, where a reader
 * is still deciding whether to keep going, and it used to run to about three
 * hundred words of prose. Every claim it made is still here — as a line each,
 * which is both less to read and easier to check.
 */

export function Meaning() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)
  // the reveal tweens between two theme tokens, so it has to be rebuilt when they flip
  const { mode } = useTheme()

  const pillars = t('meaning.pillars', { returnObjects: true }) as Array<{
    word: string
    means: string
    body: string
    icon?: string
  }>
  const standards = t('meaning.standards', { returnObjects: true }) as {
    t: string
    b: string
    icon?: string
  }[]

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // The reveal used to fade words up from opacity 0.13, which left half a
      // paragraph at roughly 2:1 against the page whenever it was parked
      // mid-scroll — and let the voyage chart behind it read straight through.
      // Tweening the colour instead keeps every word above 4.5:1 at rest and
      // still reads unmistakably as a reveal.
      const dim = getComputedStyle(document.documentElement).getPropertyValue('--txt3').trim()
      const full = getComputedStyle(document.documentElement).getPropertyValue('--txt').trim()
      gsap.fromTo(
        '.manifesto-word',
        { color: dim },
        {
          color: full,
          stagger: 0.04,
          ease: 'none',
          scrollTrigger: {
            trigger: '.manifesto',
            start: 'top 74%',
            end: 'top 26%',
            scrub: true,
          },
        },
      )

      // The three pillars used to sit there until you happened to hover one,
      // which on a phone is never. Whichever is crossing the reading band is
      // now the live one: its marker extends and its word takes the accent, so
      // the column reads as a course being sailed rather than a static list.
      // A reading line rather than a band. The rows are stacked flush against
      // each other, so "the line at 45% of the viewport is inside this row" is
      // true of exactly one row at a time and of some row at every scroll
      // position — a band wide enough to catch every row also lit two or three
      // at once, and a narrow one left dead gaps between them.
      gsap.utils.toArray<HTMLElement>('.pillar', root.current!).forEach((rowEl) => {
        ScrollTrigger.create({
          trigger: rowEl,
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: ({ isActive }) => rowEl.classList.toggle('pillar-live', isActive),
        })
      })
    },
    { scope: root, dependencies: [mode], revertOnUpdate: true },
  )

  return (
    <section id="meaning" ref={root} className="pt-24 md:pt-40">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-14 px-5 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <img src={markCyan} alt="" aria-hidden className="h-12 w-auto" />
            <BlurText className="mt-7 text-3xl sm:text-5xl md:text-6xl">
              {t('meaning.titlePre')}<span className="text-accent-ink">{t('meaning.titleAccent')}</span>{t('meaning.titleEnd')}
            </BlurText>
            <p className="manifesto mt-7 max-w-[24ch] text-2xl leading-snug text-strong md:text-[2rem]">
              {(t('meaning.manifesto') as string).split(' ').map((word, i) => (
                <span key={i} className="manifesto-word">{word} </span>
              ))}
            </p>

            {/* Who is saying all this. The sticky column ran out of content
                halfway down the pillars, and a visitor who has just read a
                metaphor about sails is entitled to ask who is behind it. */}
            <div className="mt-9 border-t border-hair pt-7" data-reveal>
              <p className="text-[12.5px] font-bold uppercase tracking-[0.2em] text-fade">
                {t('meaning.whoTitle')}
              </p>
              <p className="mt-3 max-w-[40ch] text-base leading-relaxed text-soft">{t('meaning.whoBody')}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {/* ── the standard ──
              Placed under the pillars rather than in a band of its own: this
              is the answer to "who are these people", and it belongs next to
              the answer to "what does the name mean".

              Every line is checkable by the reader, on this page, on their own
              device. That is deliberate — "unmatched attention to detail" is a
              sentence every agency writes and every reader discounts, and the
              same claim survives contact with a sceptic only when it is stated
              as a fact they can go and test. */}
          {pillars.map((p) => {
            const PillarIcon = p.icon ? ICONS[p.icon] : undefined
            return (
            <div
              key={p.word}
              data-reveal
              className="pillar group relative border-t border-hair py-7 transition-colors duration-500 last:border-b hover:bg-cyan/[0.045] dark:hover:bg-cyan/[0.06] md:py-9"
            >
              {/* Course marker. It used to be invisible on desktop until hover,
                  which left three text rows with nothing holding them to the
                  page; it now always marks the row and extends on approach. */}
              <span
                aria-hidden
                className="pillar-bar absolute inset-y-8 left-0 w-[3px] origin-center rounded-full bg-cyan transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:inset-y-10 lg:scale-y-[0.34] lg:opacity-45 lg:group-hover:scale-y-100 lg:group-hover:opacity-100"
              />
              {/* One row per pillar. The body used to be a sentence under the
                  word; at four words it belongs on the same line, which turns
                  three paragraphs into three statements. */}
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 pl-5 pr-1 md:px-4 lg:flex-nowrap lg:justify-between">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {PillarIcon && (
                    <span
                      aria-hidden
                      className="glass-orb inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-accent-ink md:h-14 md:w-14"
                    >
                      <PillarIcon size={26} />
                    </span>
                  )}
                  <h3 className="pillar-word font-display text-2xl font-semibold transition-[transform,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-2 group-hover:text-accent-ink md:text-5xl">
                    {p.word}
                  </h3>
                  <span className="self-baseline text-[15px] font-bold uppercase tracking-[0.18em] text-accent-ink">
                    {p.means}
                  </span>
                </div>
                <p className="text-base leading-relaxed text-soft md:text-lg lg:shrink-0 lg:text-right">
                  {p.body}
                </p>
              </div>
            </div>
            )
          })}

          <div data-reveal className="mt-14 border-t border-hair pt-10 md:mt-20 md:pt-12">
            <h3 className="font-display text-2xl font-semibold text-strong md:text-3xl">
              {t('meaning.standardsTitle')}
            </h3>
            <p className="mt-3 max-w-[46ch] leading-relaxed text-soft">{t('meaning.standardsBody')}</p>
            <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {standards.map((s2) => {
                const Icon = s2.icon ? ICONS[s2.icon] : undefined
                return (
                  <div key={s2.t}>
                    <dt className="flex items-start gap-3 font-display text-[17px] font-semibold leading-snug text-strong">
                      {/* the icon replaces the bullet: same job of marking the
                          row, but it also says which claim this is */}
                      <span
                        aria-hidden
                        className="mt-[-4px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan/12 text-accent-ink"
                      >
                        {Icon ? <Icon size={21} /> : <span className="h-1.5 w-1.5 rounded-full bg-cyan" />}
                      </span>
                      {s2.t}
                    </dt>
                    <dd className="mt-2 pl-[52px] text-[15px] leading-relaxed text-soft">{s2.b}</dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
