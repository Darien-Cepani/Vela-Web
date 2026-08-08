import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RiArrowRightUpLine, RiExternalLinkLine } from '@remixicon/react'
import { prefersReducedMotion } from '../lib/gsap'
import { Link } from '../lib/router'
import type { Project } from '../content/projects'
import { cardFilmFor } from '../lib/film'

/**
 * One project, as a pane of glass over its own work.
 *
 * The media fills the card; a liquid-glass plate floats on the foot of it
 * carrying the client's name. Closed, that is all there is — the work has to
 * do the talking, and eight summaries stacked up read as a list rather than a
 * portfolio. On approach the plate unfolds and the rest arrives in order.
 *
 * The plate carries the name and, on approach, one line of context. Nothing
 * else. It previously also held a summary and a row of tag pills, and on a
 * 16:9 card that stack covered most of the artwork the card exists to show —
 * the tags are already the filters on the archive page and the summary is the
 * first thing on the case study, so neither was earning its place here.
 *
 * `size` only changes how wide the card is drawn and its type scale:
 * - lead    the four pinned projects, full viewport row
 * - compact the next four, inset
 * - mini    the overflow marquee, name only
 */
export function ProjectCard({
  project: p,
  size = 'lead',
  headingLevel = 'h3',
}: {
  project: Project
  size?: 'lead' | 'compact' | 'mini'
  /** the archive page leads with an h1, so its cards are h2; sections use h3 */
  headingLevel?: 'h2' | 'h3'
}) {
  const Heading = headingLevel
  const { t, i18n } = useTranslation()
  const film = cardFilmFor(p, i18n.language)
  const status = p.status ?? (p.url ? 'live' : p.inProgress ? 'wip' : undefined)
  const statusLabel = p.placeholder
    ? (t('work.placeholder') as string)
    : status === 'wip'
      ? (t('work.inProgress') as string)
      : status === 'private'
        ? (t('work.privateWork') as string)
        : null
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const key = `work.projects.${p.slug}`

  /**
   * Buffer the film once the card is near the viewport, not when the pointer
   * lands on it, so the first hover has nothing left to fetch. The observer
   * only upgrades cards actually scrolled to, so a visitor who never reaches
   * the work section downloads none of it.
   */
  useEffect(() => {
    const v = videoRef.current
    if (!v || prefersReducedMotion()) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        v.preload = 'auto'
        v.load()
        io.disconnect()
      },
      { rootMargin: '400px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [film?.mp4])

  const play = () => {
    const v = videoRef.current
    if (!v || prefersReducedMotion()) return
    v.play().catch(() => {})
  }

  /**
   * Enter and leave are bound natively rather than through React.
   *
   * React routes pointerenter/pointerleave through its own delegated system,
   * which has to synthesise them from pointerover/pointerout and is sensitive
   * to what the pointer passed through on the way in. `mouseenter` and
   * `mouseleave` fire straight from the browser, once, on the element itself,
   * and are unaffected by the overlay link and the plate stacked on top of the
   * artwork. They are attached to the wrapper because the card inside it is
   * the element the tilt rotates, and a rotated element moves out from under
   * the very cursor that is tilting it.
   */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onEnter = () => play()
    const onLeave = () => {
      pause()
      untilt()
    }
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])
  const pause = () => videoRef.current?.pause()

  /* React Bits-style TiltedCard, kept deliberately small.
     The card leans a couple of degrees toward the pointer, which is what makes
     a pane of glass read as a physical object rather than a picture of one.
     Written straight to CSS custom properties — never React state — so a
     pointermove never triggers a render. It lives on the article while the
     scroll entrance animates the wrapper around it, because GSAP writes an
     inline transform and the two would otherwise fight over the property. */
  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion()) return
    const el = cardRef.current
    if (!el) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--tilt-x', `${(-py * 5).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${(px * 6).toFixed(2)}deg`)
    // the plate drifts a touch the other way, so the glass reads as separate
    // from the artwork under it rather than painted onto it
    el.style.setProperty('--tilt-shift', `${(px * -6).toFixed(2)}px`)
  }
  const untilt = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
    el.style.setProperty('--tilt-shift', '0px')
  }

  // Every card is 16:9, whatever tier it is in. Most of what goes in here is a
  // screenshot or a frame of motion, and both are 16:9 — anything else crops
  // them. The tiers differ by how wide the card is drawn, not by its shape.

  /* The pointer handlers live on the WRAPPER, not on the card.
     The card is the element the tilt rotates, and a rotated element moves out
     from under the cursor that is tilting it: the browser re-hit-tests, fires
     pointerleave, and pause() aborts the play() that pointerenter had just
     started with an AbortError. The result was a card that loaded its film,
     seeked past the title, and then sat frozen. The wrapper only carries the
     perspective, so its geometry never moves and enter/leave fire once. */
  return (
    <div
      ref={wrapRef}
      className="work-card-wrap"
      onPointerMove={tilt}
    >
    <article
      ref={cardRef}
      onFocus={play}
      onBlur={pause}
      data-size={size}
      /* The scrim and the hover ring are mixed from this project's own
         palette rather than one shared near-black, so a card reads as
         belonging to its brand before the name is even read. */
      style={
        {
          '--card-ink': p.ink ?? '3 12 16',
          '--card-accent': p.accent,
        } as React.CSSProperties
      }
      /* Always 16:9, at every size. A wider frame for the featured card
         letterboxed the capture inside it, and a taller crop would cut the
         page's own headline out of its screenshot. Spanning the grid is
         hierarchy enough. */
      className="work-card group relative aspect-video overflow-hidden rounded-[26px] border border-white/10 bg-sea"
    >
      {/* ── the work ── */}
      <div className="work-media absolute inset-0" style={{ background: p.wash }}>
        <div className="work-media-inner absolute inset-0">
          {p.cover ? (
            <img
              src={p.cover.src}
              alt={p.cover.alt ?? ''}
              loading="lazy"
              className={
                p.cover.fit === 'contain'
                  ? 'work-still absolute inset-0 h-full w-full object-contain p-8 md:p-12'
                  : 'work-still absolute inset-0 h-full w-full object-cover'
              }
              style={p.cover.fit === 'contain' && p.cover.pad ? { background: p.cover.pad } : undefined}
            />
          ) : (
            <>
              {/* no photograph yet: an intentional brand panel, never a fake screenshot */}
              <span
                aria-hidden
                className="absolute inset-0 opacity-25 [background:radial-gradient(circle,rgb(255_255_255/0.32)_1.1px,transparent_1.2px)] [background-size:18px_18px]"
              />
              {p.mark && (
                <img
                  src={p.mark}
                  alt=""
                  aria-hidden
                  className="absolute left-1/2 top-[38%] w-[26%] max-w-[150px] -translate-x-1/2 -translate-y-1/2 opacity-90"
                />
              )}
            </>
          )}
          {film && (
            <video
              key={film.mp4}
              ref={videoRef}
              poster={p.cover?.src}
              muted
              playsInline
              loop
              /* metadata until the card is approached, then upgraded to auto
                 by the observer above */
              preload="metadata"
              aria-hidden
              /* cover, not contain. Both the film and the card are 16:9, so
                 nothing is cropped either way, but `contain` leaves a
                 sub-pixel gap at the rounded border where the poster shows
                 through. On a light poster that gap reads as a white sliver
                 down each side of the video. */
              className="absolute inset-0 h-full w-full object-cover"
            >
              {/* H.264 first. Chrome reports that it can play our VP9 files and
                  then fails on the actual stream with PIPELINE_ERROR_DECODE, so
                  every card and hero sat frozen on its poster. H.264 has
                  universal hardware decode and does not have that problem; the
                  WebM stays as a smaller second choice for anything that
                  prefers it. */}
              <source src={film!.mp4} type="video/mp4" />
              {film!.webm && <source src={film!.webm} type="video/webm" />}
            </video>
          )}
        </div>
      </div>

      {/* ── the click target ──
          A real link spanning the card, rather than a pseudo-element on the
          name. The pseudo-element resolved against the caption plate (the
          nearest positioned ancestor) instead of the card, so only the strip
          along the bottom was ever clickable while the artwork above it was
          not. This carries the accessible name, so the heading beside it is
          plain text and the card has exactly one link to the case study. */}
      <Link
        to={`/work/${p.slug}`}
        className="work-link absolute inset-0 z-[3]"
      >
        <span className="sr-only-label">{t(`${key}.name`)}</span>
      </Link>

      {/* Status, top RIGHT. The films set their captions in the upper left of
          the frame, so a chip in that corner landed directly on top of the
          line it was competing with. Nothing else occupies this corner. */}
      {statusLabel && (
        <span className="pointer-events-none absolute right-3 top-3 z-[5] rounded-full bg-black/55 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/85 md:right-4 md:top-4">
          {statusLabel}
        </span>
      )}

      {/* ── the caption ──
          No panel. The text sits straight on the artwork and takes its contrast
          from the gradient scrim behind it (`.work-card::after`), which is what
          a scrim is for. A glass plate here was a second rectangle inside a
          rectangle, and it boxed the type away from the image it belongs to. */}
      <div className="work-plate pointer-events-none absolute inset-x-0 bottom-0 z-[4] px-4 pb-3.5 pt-12 md:px-5 md:pb-4">
        <div className="flex items-end justify-between gap-3">
          {/* ── the client's mark ──
              It lives on the plate rather than in a corner of the artwork.
              Up there it landed on whatever the screenshot happened to show —
              DDM's white lockup disappeared into its own cream page — and it
              sat directly beside the captured site's own header logo, so the
              card showed the same mark twice. Down here the scrim guarantees
              contrast, and it is the only mark in the frame.

              A wordmark replaces the name; the name stays for screen readers
              and for the link's accessible name. A symbol sits beside it. */}
          <Heading
            className={`work-name min-w-0 truncate font-display font-semibold text-white ${
              size === 'mini' ? 'text-base' : size === 'compact' ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              {p.logo && size !== 'mini' && (
                <img
                  src={p.logo}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  /* One height for every mark, wordmark or symbol. Sizing them
                     by type made five logos that were meant to read as a set
                     land at three different optical sizes. */
                  className="work-logo h-7 w-auto max-w-[190px] shrink-0 object-contain object-left md:h-8"
                />
              )}
              {p.logo && p.logoWordmark && size !== 'mini' ? (
                <span className="sr-only-label">{t(`${key}.name`)}</span>
              ) : (
                t(`${key}.name`)
              )}
            </span>
          </Heading>
          <div className="flex shrink-0 items-center gap-2">
            {/* The live link sits ABOVE the card-wide click target, so it is
                the one thing on the card that goes somewhere other than the
                case study. Everything else, including the whole surface, opens
                the case study. */}
            {p.url && size !== 'mini' && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto relative hidden items-center gap-1.5 rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-[11.5px] font-bold text-white backdrop-blur-sm transition-colors duration-300 hover:border-white/60 hover:bg-black/55 sm:inline-flex"
              >
                {t('work.visitLive')}
                <RiExternalLinkLine size={12} aria-hidden />
              </a>
            )}
            <span
              aria-hidden
              className="work-arrow flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 text-white"
            >
              <RiArrowRightUpLine size={14} />
            </span>
          </div>
        </div>

        {size !== 'mini' && (
          <div className="work-detail-grid">
            <div className="work-detail-inner">
              <p className="work-detail mt-1.5 flex items-center gap-x-2.5 text-[11.5px] font-bold uppercase tracking-[0.16em] text-white/70">
                <span>{p.year}</span>
                <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-white/40" />
                <span className="truncate">{t(`${key}.kicker`)}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
    </div>
  )
}
