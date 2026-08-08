import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { gsap, prefersReducedMotion } from './lib/gsap'
import { useSmoothScroll } from './lib/smooth-scroll'
import { useIsDesktop } from './lib/use-is-desktop'
import { Splash } from './components/Splash'
import { VoyageLine } from './components/VoyageLine'
import { ClickSpark } from './components/ClickSpark'
import { ClickRipple } from './components/ClickRipple'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Footer } from './components/Footer'
import { glassDisplacementMap } from './lib/glass-map'
import { onContactOpen } from './lib/contact-modal'
import { isWorkIndex, matchWork, useRouter } from './lib/router'

// below-the-fold sections stream in right after first paint: the initial
// hydration task stays small, which is what mobile TBT is made of
const Meaning = lazy(() => import('./components/Meaning').then((m) => ({ default: m.Meaning })))
const Shift = lazy(() => import('./components/Shift').then((m) => ({ default: m.Shift })))
const Products = lazy(() => import('./components/Products').then((m) => ({ default: m.Products })))
const Services = lazy(() => import('./components/Services').then((m) => ({ default: m.Services })))
const Process = lazy(() => import('./components/Process').then((m) => ({ default: m.Process })))
const Questions = lazy(() => import('./components/Questions').then((m) => ({ default: m.Questions })))
const Work = lazy(() => import('./components/Work').then((m) => ({ default: m.Work })))
const Contact = lazy(() => import('./components/Contact').then((m) => ({ default: m.Contact })))
// only ever fetched when someone opens a case study
const CaseStudy = lazy(() => import('./components/CaseStudy').then((m) => ({ default: m.CaseStudy })))
const WorkIndex = lazy(() => import('./components/WorkIndex').then((m) => ({ default: m.WorkIndex })))
// the dialog costs nothing until someone asks for it
const ContactModal = lazy(() =>
  import('./components/ContactModal').then((m) => ({ default: m.ContactModal })),
)

gsap.registerPlugin(useGSAP)

export default function App() {
  useSmoothScroll()
  const { t, i18n } = useTranslation()
  const skipLabel = t('nav.skip')
  const root = useRef<HTMLDivElement>(null)
  // the voyage line is desktop/tablet depth; on phones it just runs under text
  const showVoyage = useIsDesktop('(min-width: 768px)')
  const { path, locale } = useRouter()

  // Back/forward between languages changes the URL without going through the
  // toggle, so i18n has to follow the router rather than the other way round.
  useEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale)
  }, [locale, i18n])
  const workSlug = matchWork(path)
  const workIndex = isWorkIndex(path)
  // it's scroll-driven and starts below the fold, so mount it on the first
  // scroll intent: users get it before it can be seen, and its page-height
  // svg never resizes during load (which registered as a huge layout shift)
  const [settled, setSettled] = useState(false)
  // the contact dialog's chunk is fetched by the first CTA click; once mounted
  // it stays, so re-opening is instant
  const [wantsContact, setWantsContact] = useState(false)
  useEffect(() => onContactOpen(() => setWantsContact(true)), [])
  useEffect(() => {
    const fire = () => setSettled(true)
    const opts = { once: true, passive: true } as const
    window.addEventListener('scroll', fire, opts)
    window.addEventListener('wheel', fire, opts)
    window.addEventListener('touchstart', fire, opts)
    return () => {
      window.removeEventListener('scroll', fire)
      window.removeEventListener('wheel', fire)
      window.removeEventListener('touchstart', fire)
    }
  }, [])

  // Global scroll-reveal for [data-reveal]; re-registers after a language remount.
  //
  // An IntersectionObserver rather than GSAP. These are plain fade-and-rise
  // entrances, and ScrollTrigger measured each of its targets during the
  // initial refresh — main-thread work in the exact window that decides total
  // blocking time, for something a CSS transition runs on the compositor.
  //
  // The MutationObserver is not optional. Every section below the fold is a
  // lazy chunk, so at the moment this effect runs most [data-reveal] elements
  // do not exist yet; a one-shot querySelectorAll registers a handful and
  // leaves the rest permanently invisible. Watching for them to arrive is what
  // makes deferred sections and a scroll reveal coexist.
  useEffect(() => {
    if (prefersReducedMotion()) return

    const io = new IntersectionObserver(
      (entries) => {
        // Elements crossing together get a stagger, ordered by where they sit
        // on the page rather than by the order the observer reports them.
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          .forEach((entry, i) => {
            const el = entry.target as HTMLElement
            el.style.setProperty('--reveal-delay', `${i * 80}ms`)
            el.classList.add('is-in')
            io.unobserve(el)
          })
      },
      // matches the ScrollTrigger start this replaced, 'top 86%'
      { rootMargin: '0px 0px -14% 0px' },
    )

    const seen = new WeakSet<Element>()
    const register = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (seen.has(el) || el.classList.contains('is-in')) return
        seen.add(el)
        io.observe(el)
      })
    }
    const main = document.getElementById('main') ?? document.body
    register(document)

    // Batched to one sweep per frame. Reacting to each record individually
    // meant a querySelectorAll for every node React inserted while the eight
    // lazy sections mounted — hundreds of scans during the busiest moment of
    // the load, which cost more than the ScrollTrigger this replaced. One
    // rAF-coalesced sweep does the same job for a fixed price.
    let queued = 0
    const mo = new MutationObserver(() => {
      if (queued) return
      queued = requestAnimationFrame(() => {
        queued = 0
        register(document)
      })
    })
    mo.observe(main, { childList: true, subtree: true })

    return () => {
      if (queued) cancelAnimationFrame(queued)
      mo.disconnect()
      io.disconnect()
    }
  }, [i18n.language, path])

  return (
    <div ref={root} className="grain relative w-full max-w-full overflow-x-clip">
      {/* Liquid glass refraction (ported from liquid-glass-react, MIT): edge-lens displacement
          map + per-channel chromatic aberration, used by .glass-refract-deep backdrops */}
      <svg aria-hidden className="absolute h-0 w-0">
        <defs>
          <filter id="vela-glass-refraction" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
            <feImage x="0" y="0" width="100%" height="100%" result="MAP" href={glassDisplacementMap} preserveAspectRatio="xMidYMid slice" />
            {/* edge mask derived from the lens map: refraction lives at the rim, center stays clean */}
            <feColorMatrix in="MAP" type="matrix" values="0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0 0 0 1 0" result="EDGE_INTENSITY" />
            <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
              <feFuncA type="discrete" tableValues="0 0.1 1" />
            </feComponentTransfer>
            <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL" />
            {/* chromatic aberration: R/G/B displaced at slightly different scales */}
            <feDisplacementMap in="SourceGraphic" in2="MAP" scale="-70" xChannelSelector="R" yChannelSelector="B" result="RED_DISPLACED" />
            <feColorMatrix in="RED_DISPLACED" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="RED_CHANNEL" />
            <feDisplacementMap in="SourceGraphic" in2="MAP" scale="-77" xChannelSelector="R" yChannelSelector="B" result="GREEN_DISPLACED" />
            <feColorMatrix in="GREEN_DISPLACED" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="GREEN_CHANNEL" />
            <feDisplacementMap in="SourceGraphic" in2="MAP" scale="-84" xChannelSelector="R" yChannelSelector="B" result="BLUE_DISPLACED" />
            <feColorMatrix in="BLUE_DISPLACED" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="BLUE_CHANNEL" />
            <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
            <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />
            <feGaussianBlur in="RGB_COMBINED" stdDeviation="0.3" result="ABERRATED_BLURRED" />
            <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION" />
            <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
              <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feComposite in="CENTER_ORIGINAL" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN" />
            <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over" />
          </filter>
        </defs>
      </svg>
      <Splash />
      {/* the page sheet scrolls above the fixed footer and lifts away to reveal it */}
      <div className="page-sheet pb-24 md:pb-36">
        {showVoyage && settled && !workSlug && !workIndex && <VoyageLine />}
        {/* First tab stop: keyboard users skip the nav pill entirely. Targets
            <main> rather than the hero, because the hero only exists on the
            landing page and the nav is shared with every case study. */}
        <a href="#main" className="skip-link">
          {skipLabel}
        </a>
        <ClickSpark />
        <ClickRipple />
        <Nav />
        {/* key on route + language: both need split text and scroll triggers rebuilt */}
        <main id="main" tabIndex={-1} key={`${path}-${i18n.language}`} className="relative outline-none">
          {/* The case-study fallback reserves roughly a case study's worth of
              height. At 80dvh the footer sat inside the viewport while the
              chunk loaded and was then shoved down by the real content —
              0.084 CLS for an empty div. Reserving past the fold keeps the
              correction off-screen, which is what a fallback is for. */}
          {workSlug ? (
            <Suspense fallback={<div className="min-h-[240vh]" />}>
              <CaseStudy slug={workSlug} />
            </Suspense>
          ) : workIndex ? (
            <Suspense fallback={<div className="min-h-[240vh]" />}>
              <WorkIndex />
            </Suspense>
          ) : (
            <>
              <Hero />
              <Marquee />
              {/* One boundary per section, not one around all eight.
                  Sharing a boundary meant React waited for the slowest chunk
                  and then committed every section in a single pass — one
                  main-thread task long enough to dominate total blocking time,
                  followed by a ScrollTrigger refresh that measured the whole
                  page at once. Separate boundaries let each section commit as
                  its own chunk arrives, so the same work lands as several
                  short tasks instead of one long one. `null` fallbacks are
                  safe here because the hero and marquee hold the fold; CLS
                  stays at 0. */}
              <Suspense fallback={null}><Meaning /></Suspense>
              <Suspense fallback={null}><Services /></Suspense>
              <Suspense fallback={null}><Shift /></Suspense>
              <Suspense fallback={null}><Process /></Suspense>
              <Suspense fallback={null}><Products /></Suspense>
              <Suspense fallback={null}><Work /></Suspense>
              <Suspense fallback={null}><Questions /></Suspense>
              <Suspense fallback={null}><Contact /></Suspense>
            </>
          )}
        </main>
      </div>
      <Footer />
      {wantsContact && (
        <Suspense fallback={null}>
          <ContactModal />
        </Suspense>
      )}
    </div>
  )
}
