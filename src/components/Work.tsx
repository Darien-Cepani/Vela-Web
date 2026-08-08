import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { RiArrowRightUpLine } from '@remixicon/react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { Link } from '../lib/router'
import { FEATURE_LIMIT, FEATURED, OVERFLOW, PUBLISHED } from '../content/projects'
import { ProjectCard } from './ProjectCard'
import { BlurText } from './BlurText'

/**
 * The work, rationed.
 *
 * A two-column grid where the first project spans the full width, and so does
 * a trailing odd one — so the block is always complete no matter how many
 * projects are published. Anything past the feature limit streams by in a
 * marquee with one button to the full archive, because a landing page that
 * lists every project is an archive, and nobody reads an archive on the way to
 * hiring someone.
 *
 * The grid runs wider than the site's 1240px column — the work is the
 * argument, and a centred column turns it into thumbnails. The section heading
 * stays on the column so the page keeps its spine.
 */
export function Work() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      ScrollTrigger.batch('.work-card-wrap', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, stagger: 0.09, ease: 'expo.out', overwrite: true }),
      })
      gsap.set('.work-card-wrap', { y: 42, opacity: 0 })
      ScrollTrigger.refresh()
    },
    { scope: root },
  )

  return (
    <section id="work" ref={root} className="pt-24 md:pt-40">
      {/* the heading keeps the page's column; the grid below does not */}
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-fade">{t('work.eyebrow')}</p>
            <BlurText className="mt-4 max-w-[16ch] text-3xl sm:text-5xl md:text-6xl">
              {t('work.h2pre')}<span className="text-accent-ink">{t('work.h2accent')}</span>.
            </BlurText>
          </div>
          <p className="max-w-[38ch] text-base leading-relaxed text-soft md:text-lg" data-reveal>
            {t('work.sub')}
          </p>
        </div>
      </div>

      {/* ── the work itself ──
          Two columns, with the first project spanning both and any odd card at
          the end doing the same. The earlier layout was tiered — four across,
          then up to four inset, then a marquee — which is right for a large
          archive and wrong for a curated handful: with five projects it drew
          four across and left the fifth stranded on its own row at a narrower
          width, which reads as a mistake rather than a hierarchy.

          Spanning the leftovers means the grid is always full, whatever the
          count, and every card is large enough that the work inside it is
          actually legible. */}
      <div className="mx-auto mt-12 w-full max-w-[1400px] px-5 sm:px-6 md:mt-16 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {FEATURED.map((p, i) => {
            const span = i === 0 || (i === FEATURED.length - 1 && FEATURED.length % 2 === 0)
            return (
              /* no .work-card-wrap here — ProjectCard renders its own, and
                 nesting them made the scroll reveal target both */
              <div key={p.slug} className={span ? 'md:col-span-2' : undefined}>
                <ProjectCard project={p} size="lead" />
              </div>
            )
          })}
        </div>
      </div>

      {/* ── everything else, streaming ── */}
      {OVERFLOW.length > 0 && <Stream />}

      {/* The route into the archive, under the five this section shows. It
          hides only if there is not even a full set here yet, since a "see all
          two" under two projects is worse than no link at all. */}
      {PUBLISHED.length >= FEATURE_LIMIT && (
      <div className="mt-12 flex justify-center px-5 md:mt-16">
        <Link
          to="/work"
          className="group inline-flex items-center gap-3 rounded-full border border-edge bg-surface-2/60 py-4 pl-7 pr-4 text-base font-bold text-strong transition-[color,border-color,background-color] duration-300 hover:border-cyan hover:text-accent-ink dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
        >
          {t('work.seeAll', { count: PUBLISHED.length })}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan/15 text-accent-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
            <RiArrowRightUpLine size={16} aria-hidden />
          </span>
        </Link>
      </div>
      )}
    </section>
  )
}

/* One card plus its gap. Used to work out how many copies a seamless loop
   needs — the animation translates by exactly -50%, so each half must be at
   least as wide as the widest viewport or a gap opens at the wrap. */
/* The narrowest a stream card can get. It has to be the MINIMUM rather than
   the typical width: perHalf below divides by it to decide how many cards fill
   a half-track, and under-counting leaves a visible gap at the seam. */
const STREAM_CARD_W = 200
const STREAM_MIN_HALF = 2200

/**
 * The overflow: mini cards running past on an endless loop.
 *
 * The track is one set repeated until it is wider than any viewport, then that
 * whole thing duplicated, and the animation slides it exactly -50%. At the
 * moment it wraps, the second copy is sitting precisely where the first began,
 * so the loop has no seam and never visibly restarts. Repeating only twice was
 * not enough with a short project list: two copies of three cards is under a
 * thousand pixels, and the track ran out mid-screen.
 *
 * It pauses on hover, because a card that runs away from the cursor you are
 * aiming at it with is a hostile little thing.
 */
function Stream() {
  const { t } = useTranslation()
  const perHalf = Math.max(OVERFLOW.length, Math.ceil(STREAM_MIN_HALF / STREAM_CARD_W))
  const half = Array.from({ length: perHalf }, (_, i) => OVERFLOW[i % OVERFLOW.length])
  const track = [...half, ...half]

  return (
    <div
      className="mt-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
      aria-label={t('work.streamLabel')}
    >
      {/* No flex gap and no padding on the track: those live inside each item
          instead. A gap-separated row of 2n items is 2n cards + (2n-1) gaps, so
          translating it by exactly -50% lands half a gap out and the seam
          shows. With the gap as each card's right padding the track is exactly
          2n equal units and -50% is exactly one full set. */}
      <div className="work-stream flex w-max">
        {track.map((p, i) => (
          <div
            key={`${p.slug}-${i}`}
            /* The mini tier has to stay smaller than the compact row at EVERY width,
               or the hierarchy inverts. A fixed 320px did not: the compact cards
               are a grid fraction, so at 1440 they were 249px against this
               tier's 300px and the marquee read as the biggest row on the page.
               Sizing it in vw keeps it proportional — about two thirds of a
               compact card from 1024 all the way up. */
            className="w-[188px] shrink-0 pr-5 md:w-[clamp(160px,13vw,272px)]"
            /* Only the first pass is real content; the repeats are decoration.
               `inert` as well as aria-hidden: hiding them from the accessibility
               tree alone left their links in the tab order, so a keyboard user
               walked through eighteen invisible duplicates of cards they had
               already passed. inert removes them from focus too. */
            aria-hidden={i >= OVERFLOW.length}
            inert={i >= OVERFLOW.length}
          >
            <ProjectCard project={p} size="mini" />
          </div>
        ))}
      </div>
    </div>
  )
}
