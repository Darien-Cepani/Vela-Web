import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import {
  RiArrowLeftLine,
  RiArrowRightUpLine,
  RiAwardLine,
  RiBarChartBoxLine,
  RiCheckLine,
  RiCodeSSlashLine,
  RiCompass3Line,
  RiCropLine,
  RiCursorLine,
  RiDatabase2Line,
  RiEditBoxLine,
  RiExternalLinkLine,
  RiEyeLine,
  RiFlashlightLine,
  RiFontSize,
  RiGamepadLine,
  RiGoblet2Line,
  RiImageLine,
  RiLayoutGridLine,
  RiLockUnlockLine,
  RiPaletteLine,
  RiPriceTag3Line,
  RiQuestionnaireLine,
  RiRoadMapLine,
  RiSearchEyeLine,
  RiSettings3Line,
  RiShieldCheckLine,
  RiShoppingBag3Line,
  RiSmartphoneLine,
  RiSparklingLine,
  RiStackLine,
  RiStoreLine,
  RiTeamLine,
  RiTimeLine,
  RiTranslate2,
  RiTrophyLine,
  RiUserVoiceLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { Link } from '../lib/router'
import { PUBLISHED, findProject } from '../content/projects'
import { openContact } from '../lib/contact-modal'
import { filmFor } from '../lib/film'
import { Magnetic } from './Magnetic'

type Did = { t: string; b: string; img?: number; alt?: string; icon?: string }

/**
 * The icons a case study is allowed to use.
 *
 * Named in the content rather than imported there, so the copy stays plain
 * data and the bundle only ever carries the icons that are actually referenced.
 * An unknown name falls back to the step number alone — a missing icon should
 * never be able to blank out a section header.
 */
const CASE_ICONS: Record<string, RemixiconComponentType> = {
  compass: RiCompass3Line,
  translate: RiTranslate2,
  speed: RiFlashlightLine,
  eye: RiEyeLine,
  palette: RiPaletteLine,
  shield: RiShieldCheckLine,
  game: RiGamepadLine,
  chart: RiBarChartBoxLine,
  grid: RiLayoutGridLine,
  price: RiPriceTag3Line,
  voice: RiUserVoiceLine,
  phone: RiSmartphoneLine,
  edit: RiEditBoxLine,
  trophy: RiTrophyLine,
  unlock: RiLockUnlockLine,
  survey: RiQuestionnaireLine,
  stack: RiStackLine,
  time: RiTimeLine,
  team: RiTeamLine,
  spark: RiSparklingLine,
  search: RiSearchEyeLine,
  code: RiCodeSSlashLine,
  image: RiImageLine,
  glass: RiGoblet2Line,
  map: RiRoadMapLine,
  store: RiStoreLine,
  bag: RiShoppingBag3Line,
  settings: RiSettings3Line,
  award: RiAwardLine,
  crop: RiCropLine,
  type: RiFontSize,
  cursor: RiCursorLine,
  database: RiDatabase2Line,
}

/**
 * A case study: what they came with, what we did about it, what exists now.
 *
 * Structured as an argument rather than a gallery — a prospect reading this is
 * checking whether their own problem is one Vela has handled, so the brief
 * comes first and the work is broken into named moves they can map onto their
 * own situation. It closes on the same dialog as every other CTA on the site.
 */
export function CaseStudy({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation()
  const root = useRef<HTMLElement>(null)
  const project = findProject(slug)

  const key = `work.projects.${slug}`
  const name = project ? (t(`${key}.name`) as string) : ''

  // the document has to describe the page it is actually on
  useEffect(() => {
    if (!project) return
    const prevTitle = document.title
    document.title = `${name} · ${t('work.caseStudy')} · Vela`
    const desc = document.querySelector('meta[name="description"]')
    const prevDesc = desc?.getAttribute('content') ?? ''
    desc?.setAttribute('content', t(`${key}.summary`) as string)
    return () => {
      document.title = prevTitle
      desc?.setAttribute('content', prevDesc)
    }
  }, [project, name, key, t, i18n.language])

  useGSAP(
    () => {
      if (prefersReducedMotion() || !project) return
      gsap.fromTo(
        '.cs-in',
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: 'expo.out', delay: 0.05 },
      )
      ScrollTrigger.batch('.cs-reveal', {
        start: 'top 86%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'expo.out', overwrite: true }),
      })
      gsap.set('.cs-reveal', { y: 26, opacity: 0 })
      ScrollTrigger.refresh()
    },
    { scope: root, dependencies: [slug, i18n.language], revertOnUpdate: true },
  )

  if (!project) return <NotFound />

  const film = filmFor(project, i18n.language)
  const did = t(`${key}.did`, { returnObjects: true }) as Did[]
  const outcome = t(`${key}.outcome`, { returnObjects: true }) as string[]
  // Two, not the whole archive. Every project listed at the foot of every
  // other project turns the tail of the page into a sitemap — and real work
  // outranks a placeholder slot for the one spot that matters.
  const others = PUBLISHED.filter((x) => x.slug !== slug)
    .sort((a, c) => Number(!!a.placeholder) - Number(!!c.placeholder))
    .slice(0, 2)

  return (
    <article ref={root} className="relative">
      {/* ── masthead ── */}
      <header className="relative overflow-hidden pt-32 pb-14 md:pt-40 md:pb-20">
        {/* A tint of the project's own colour rather than its cover wash: the
            wash is built for a dark plate and turns to grey mud over paper.
            An alpha'd accent reads as a glow on sea and a blush on paper. */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: `radial-gradient(1000px 560px at 78% -12%, ${project.accent}2E, transparent 62%)` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,var(--srf))]"
        />
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
          <Link
            to="/work"
            className="cs-in inline-flex items-center gap-2 text-[14px] font-bold text-soft transition-colors duration-300 hover:text-accent-ink"
          >
            <RiArrowLeftLine size={16} aria-hidden />
            {t('work.backToWork')}
          </Link>

          <div className="cs-in mt-8 flex flex-wrap items-center gap-3 text-[11.5px] font-bold uppercase tracking-[0.18em] text-fade">
            <span>{project.year}</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-fade/60" />
            <span>{t(`${key}.kicker`)}</span>
          </div>

          <h1 className="cs-in mt-4 max-w-[18ch] text-[clamp(2.4rem,7vw,4.5rem)] leading-[1.03]">{name}</h1>
          <p className="cs-in mt-6 max-w-[56ch] text-lg leading-relaxed text-soft md:text-xl">
            {t(`${key}.summary`)}
          </p>

          <div className="cs-in mt-8 flex flex-wrap items-center gap-2.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-hair bg-surface-2/60 px-4 py-2 text-[13px] font-bold text-soft dark:bg-white/[0.04]"
              >
                {tag}
              </span>
            ))}
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-4 py-2 text-[13px] font-bold text-accent-ink transition-colors duration-300 hover:border-cyan"
              >
                {t('work.visitLive')}
                <RiExternalLinkLine size={14} aria-hidden />
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        {/* ── the plate ──
            The recording, at full width, before a word of prose. It is the
            most direct evidence the page has: the thing actually running,
            rather than a description of it. Autoplays muted and loops, with
            the poster underneath so there is never an empty frame. */}
        <div className="cs-in relative mb-16 aspect-video w-full overflow-hidden rounded-[26px] border border-hair bg-sea md:mb-24">
          {film ? (
            <video
              /* the film, which is the piece that explains the project;
                 the raw recording appears further down as evidence */
              key={film.mp4}
              poster={project.cover?.src}
              autoPlay
              muted
              loop
              playsInline
              /* cover: the film is 16:9 and so is this plate, so nothing is
                 lost, and it closes the sub-pixel gap `contain` leaves at the
                 rounded border where the poster shows through as a pale sliver */
              className="h-full w-full object-cover"
              aria-label={project.cover?.alt ?? ''}
            >
              <source src={film.mp4} type="video/mp4" />
              {film.webm && <source src={film.webm} type="video/webm" />}
            </video>
          ) : project.cover ? (
            <img
              src={project.cover.src}
              alt={project.cover.alt ?? ''}
              className={
                project.cover.fit === 'contain'
                  ? 'h-full w-full object-contain p-10 md:p-16'
                  : 'h-full w-full object-cover'
              }
              style={project.cover.fit === 'contain' && project.cover.pad ? { background: project.cover.pad } : undefined}
            />
          ) : (
            <>
              <span aria-hidden className="absolute inset-0" style={{ background: project.wash }} />
              <span
                aria-hidden
                className="absolute inset-0 opacity-25 [background:radial-gradient(circle,rgb(255_255_255/0.35)_1.2px,transparent_1.3px)] [background-size:18px_18px]"
              />
              {project.mark && (
                <img src={project.mark} alt="" aria-hidden className="absolute left-1/2 top-1/2 w-[15%] -translate-x-1/2 -translate-y-1/2" />
              )}
            </>
          )}
        </div>

        {/* ── the brief ── */}
        <section className="cs-reveal border-t border-hair pt-10 md:grid md:grid-cols-12 md:gap-12 md:pt-14">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-fade md:col-span-4">
            {t('work.sectionBrief')}
          </h2>
          <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-strong md:col-span-8 md:mt-0 md:text-xl">
            {t(`${key}.brief`)}
          </p>
        </section>

        {/* ── what we did ──
            Each decision gets the screenshot that shows it. A claim about an
            interface is worth very little next to the interface, so the image
            is the argument and the prose explains why it looks like that.
            Alternating sides keeps a long page from reading as a list. */}
        <section className="mt-16 md:mt-24">
          <h2 className="cs-reveal text-[13px] font-bold uppercase tracking-[0.2em] text-fade">
            {t('work.sectionDid')}
          </h2>
          <div className="mt-8 md:mt-12">
            {did.map((d, i) => {
              const shot = d.img ? `/work/${project.slug}-${d.img}.webp` : null
              const Icon = d.icon ? CASE_ICONS[d.icon] : undefined
              const flip = i % 2 === 1
              return (
                <article
                  key={d.t}
                  className="cs-reveal border-t border-hair py-10 md:grid md:grid-cols-12 md:items-center md:gap-12 md:py-14"
                >
                  {/* A section with no screenshot would otherwise sit in five
                      columns with seven empty ones beside it, which reads as a
                      missing image rather than a deliberate text section. */}
                  <div
                    className={
                      shot ? `md:col-span-5 ${flip ? 'md:order-2' : ''}` : 'md:col-span-9'
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="glass-orb inline-flex h-11 w-11 items-center justify-center rounded-full text-soft"
                      >
                        {Icon ? (
                          <Icon size={19} />
                        ) : (
                          <span className="font-display text-[13px] font-semibold">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        )}
                      </span>
                      {Icon && (
                        <span
                          aria-hidden
                          className="font-display text-[12px] font-semibold tracking-[0.2em] text-fade"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-5 font-display text-[26px] leading-snug font-semibold text-strong md:text-[31px]">
                      {d.t}
                    </h3>
                    <p className="mt-4 max-w-[54ch] text-[17px] leading-[1.72] text-soft md:text-[18px]">{d.b}</p>
                  </div>
                  {shot && (
                    <div
                      className={`mt-7 overflow-hidden rounded-[18px] border border-hair bg-sea md:col-span-7 md:mt-0 ${
                        flip ? 'md:order-1' : ''
                      }`}
                    >
                      <img
                        src={shot}
                        alt={d.alt ?? ''}
                        loading="lazy"
                        width={1280}
                        height={720}
                        className="block h-auto w-full"
                      />
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        {/* ── the unnarrated walkthrough ──
            The film at the top argues; this is the evidence behind it. Same
            product, no captions, no cuts — a continuous pass through the real
            interface so a sceptical reader can check the claims against the
            thing itself. Loads only when it is scrolled to. */}
        {project.screenVideo && (
          <section className="mt-16 md:mt-24">
            <h2 className="cs-reveal text-[13px] font-bold uppercase tracking-[0.2em] text-fade">
              {t('work.sectionWalkthrough')}
            </h2>
            <div className="cs-reveal mt-8 overflow-hidden rounded-[22px] border border-hair bg-sea">
              {/* The poster is a frame of THIS video, not the project's cover
                  image. With the cover there, an unplayed walkthrough showed a
                  screen the recording never contains, so the section read as
                  broken rather than as waiting.

                  Controls stay, and it does not autoplay: a looping recording
                  the reader cannot stop is exactly what WCAG 2.2.2 is about,
                  and leaving it paused also keeps a second video off the
                  critical path. */}
              <video
                poster={project.screenVideo.replace(/\.webm$/, '-walk.webp')}
                muted
                loop
                playsInline
                controls
                preload="none"
                className="block h-auto w-full"
                aria-label={t('work.sectionWalkthrough')}
              >
                <source src={project.screenVideo.replace(/\.webm$/, '-hd.mp4')} type="video/mp4" />
                <source src={project.screenVideo.replace(/\.webm$/, '-hd.webm')} type="video/webm" />
              </video>
            </div>
          </section>
        )}

        {/* ── what exists now ── */}
        <section className="mt-16 md:mt-24">
          <h2 className="cs-reveal text-[13px] font-bold uppercase tracking-[0.2em] text-fade">
            {t('work.sectionOutcome')}
          </h2>
          <ul className="cs-reveal mt-8 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {outcome.map((o) => (
              <li key={o} className="flex items-start gap-3 text-[17px] leading-[1.65] text-strong md:text-[18px]">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-accent-ink">
                  <RiCheckLine size={13} aria-hidden />
                </span>
                {o}
              </li>
            ))}
          </ul>
        </section>

        {/* ── the ask ── */}
        <section className="cs-reveal mt-20 md:mt-28">
          <div className="relative overflow-hidden rounded-[28px] border border-cyan/25 bg-[linear-gradient(150deg,rgb(0_170_212/0.16),rgb(0_125_156/0.06))] px-6 py-12 text-center md:px-12 md:py-16">
            <span aria-hidden className="liquid-sheen opacity-60" />
            <h2 className="relative mx-auto max-w-[20ch] font-display text-3xl leading-tight font-semibold text-strong md:text-[2.6rem]">
              {t('work.ctaTitle')}
            </h2>
            <p className="relative mx-auto mt-4 max-w-[46ch] text-base leading-relaxed text-soft md:text-lg">
              {t('work.ctaBody')}
            </p>
            <div className="relative mt-8 flex justify-center">
              <Magnetic strength={0.25}>
                <button
                  onClick={() => openContact(`case-${slug}`)}
                  className="btn-sheen group flex items-center gap-3 rounded-full bg-cyan py-4 pl-8 pr-4 text-base font-bold text-sea shadow-cta transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                >
                  {t('nav.cta')}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sea/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <RiArrowRightUpLine size={18} aria-hidden />
                  </span>
                </button>
              </Magnetic>
            </div>
          </div>
        </section>

        {/* ── keep reading ── */}
        {others.length > 0 && (
          <section className="cs-reveal mt-20 border-t border-hair pt-10 pb-24 md:mt-28 md:pb-32">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-fade">{t('work.sectionNext')}</h2>
            <div className="mt-6 flex flex-col gap-3">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  to={`/work/${o.slug}`}
                  className="group flex items-center justify-between gap-6 rounded-[18px] border border-hair bg-surface-2/50 px-6 py-5 transition-[border-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-cyan/50 dark:bg-white/[0.03]"
                >
                  <span className="min-w-0">
                    <span className="block text-[11.5px] font-bold uppercase tracking-[0.16em] text-fade">
                      {t(`work.projects.${o.slug}.kicker`)}
                    </span>
                    <span className="mt-1 block truncate font-display text-xl font-semibold text-strong">
                      {t(`work.projects.${o.slug}.name`)}
                    </span>
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan/12 text-accent-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
                    <RiArrowRightUpLine size={16} aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[1240px] flex-col items-start justify-center px-5 sm:px-6 lg:px-8">
      <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-fade">404</p>
      <h1 className="mt-4 max-w-[16ch] text-4xl md:text-6xl">{t('work.notFound')}</h1>
      <Link
        to="/work"
        className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-cyan py-3.5 pl-6 pr-5 text-[15px] font-bold text-sea transition-transform duration-300 hover:scale-[1.03]"
      >
        <RiArrowLeftLine size={16} aria-hidden />
        {t('work.backToWork')}
      </Link>
    </div>
  )
}
