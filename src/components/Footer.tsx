import { useLayoutEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { RiArrowRightUpLine } from '@remixicon/react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import lockupWhite from '../assets/brand/lockup-white.svg'
import { scrollToId } from '../lib/smooth-scroll'
import { openContact } from '../lib/contact-modal'
import { useRouter } from '../lib/router'
import { CONTACT_EMAIL } from '../lib/site'

/**
 * Reveal footer: a fixed deep-sea panel that lives underneath the page sheet.
 * The sheet (see .page-sheet in App) scrolls up past a spacer of matching
 * height, uncovering the footer like a hull sliding off a chart. The inner
 * content drifts down into place as it is revealed. Deep sea in both themes.
 */
export function Footer() {
  const { t } = useTranslation()
  const { path, navigate } = useRouter()
  /* The footer is shared with the case studies and the archive, where none of
     these sections exist — scrollToId there silently did nothing and every
     link in the footer was dead. Off the landing page, go there first. */
  const go = (id: string) => (path === '/' ? scrollToId(id) : navigate(`/#${id}`))
  const spacerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(520)

  // The in-flow spacer always matches the fixed panel's real height.
  //
  // Measured in a layout effect, before the browser paints: letting the 520px
  // placeholder render and then correcting it is a real layout shift on any
  // page short enough for the footer to be in view at load — it cost the case
  // study 0.084 CLS before this ran synchronously.
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    setHeight(panel.offsetHeight)
    const ro = new ResizeObserver(() => {
      setHeight(panel.offsetHeight)
      ScrollTrigger.refresh()
    })
    ro.observe(panel)
    return () => ro.disconnect()
  }, [])

  // parallax: the footer content settles into place as the sheet uncovers it
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.foot-inner',
        { y: -48, opacity: 0.4 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: spacerRef.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      )
    },
    { scope: panelRef },
  )

  /**
   * React Bits-style FlowingMenu, reduced to what a minimal footer can carry:
   * a cyan slab floods up from the baseline on hover and the label inverts
   * onto it. The whole effect is one transform and one colour, so the footer
   * stays as quiet as it looks until you reach for it.
   */
  const link =
    'relative isolate inline-flex items-center overflow-hidden rounded-[8px] px-2.5 py-2.5 font-bold text-mist transition-colors duration-300 ' +
    'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-[6px] before:bg-cyan ' +
    "before:transition-transform before:duration-400 before:ease-[cubic-bezier(0.32,0.72,0,1)] before:content-[''] " +
    'hover:text-sea hover:before:scale-y-100 focus-visible:text-sea focus-visible:before:scale-y-100'

  return (
    <footer className="relative">
      <div ref={spacerRef} style={{ height }} aria-hidden />
      {/* ink field: deliberately darker and more neutral than the sea surface above it */}
      <div ref={panelRef} className="fixed inset-x-0 bottom-0 z-0 overflow-hidden bg-ink text-white">
        {/* the horizon, breathing slowly */}
        <div aria-hidden className="foot-glow pointer-events-none absolute inset-0" />

        {/* Two waterlines drifting at different speeds along the very bottom.
            This is the footer's only idle motion, and it is the one the brand
            has earned: the page ends at the sea. Each path is drawn twice end
            to end and translated by exactly half its width, so the loop has no
            seam. */}
        <div aria-hidden className="foot-sea pointer-events-none absolute inset-x-0 bottom-0 h-24 overflow-hidden">
          <svg className="foot-wave foot-wave-back" viewBox="0 0 1200 60" preserveAspectRatio="none" fill="none">
            <path
              d="M0 34 C 75 14, 150 54, 225 34 C 300 14, 375 54, 450 34 C 525 14, 600 54, 675 34 C 750 14, 825 54, 900 34 C 975 14, 1050 54, 1125 34 C 1162 24, 1181 39, 1200 34"
              stroke="rgb(0 170 212 / 0.22)"
              strokeWidth="1.5"
            />
          </svg>
          <svg className="foot-wave foot-wave-front" viewBox="0 0 1200 60" preserveAspectRatio="none" fill="none">
            <path
              d="M0 44 C 100 26, 200 62, 300 44 C 400 26, 500 62, 600 44 C 700 26, 800 62, 900 44 C 1000 26, 1100 62, 1200 44"
              stroke="rgb(0 170 212 / 0.35)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="foot-inner relative mx-auto max-w-[1240px] px-5 pt-14 pb-5 sm:px-6 md:pt-20 md:pb-6 lg:px-8">
          {/* the ask, then the wayfinding */}
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <p className="text-[12.5px] font-bold uppercase tracking-[0.2em] text-mist-2">{t('footer.kicker')}</p>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('contact.subject'))}`}
                className="foot-mail mt-3 inline-block font-display text-2xl font-semibold break-all text-white sm:text-3xl md:text-[2.6rem] md:leading-[1.1]"
              >
                {CONTACT_EMAIL}
              </a>
              <div className="mt-6">
                <button
                  onClick={() => openContact('footer')}
                  className="btn-sheen group inline-flex items-center gap-3 rounded-full bg-cyan py-3.5 pl-7 pr-3.5 text-[15px] font-bold text-sea transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] active:scale-[0.98]"
                >
                  {t('nav.cta')}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sea/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <RiArrowRightUpLine size={15} aria-hidden />
                  </span>
                </button>
              </div>
            </div>

            <nav className="lg:col-span-5 lg:justify-self-end" aria-label={t('footer.colSite')}>
              <p className="text-[12.5px] font-bold uppercase tracking-[0.2em] text-mist-2">{t('footer.colSite')}</p>
              <ul className="-mx-2.5 mt-3 flex flex-wrap gap-x-1 gap-y-0 lg:flex-col lg:gap-y-0">
                <li><button onClick={() => go('meaning')} className={link}>{t('nav.meaning')}</button></li>
                <li><button onClick={() => go('services')} className={link}>{t('nav.services')}</button></li>
                <li><button onClick={() => go('process')} className={link}>{t('nav.process')}</button></li>
                <li><button onClick={() => go('products')} className={link}>{t('nav.products')}</button></li>
                <li><button onClick={() => go('work')} className={link}>{t('nav.work')}</button></li>
              </ul>
            </nav>
          </div>

          {/* the brand at full sail: the page's closing image */}
          <img src={lockupWhite} alt="Vela" className="foot-lockup mx-auto mt-12 w-[min(420px,64vw)] md:mt-16" />

          <div className="mt-9 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-white/10 pt-4 text-[13px] font-bold text-mist-2 md:mt-11">
            <span>{t('footer.rights')}</span>
            <span>{t('footer.location')}</span>
            <span>{t('footer.tagline')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
