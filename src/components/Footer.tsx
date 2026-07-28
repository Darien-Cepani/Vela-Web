import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import lockupWhite from '../assets/brand/lockup-white.svg'
import { scrollToId } from '../lib/smooth-scroll'

/**
 * Reveal footer: a fixed deep-sea panel that lives underneath the page sheet.
 * The sheet (see .page-sheet in App) scrolls up past a spacer of matching
 * height, uncovering the footer like a hull sliding off a chart. The inner
 * content drifts down into place as it is revealed. Deep sea in both themes.
 */
export function Footer() {
  const { t } = useTranslation()
  const spacerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(520)

  // the in-flow spacer always matches the fixed panel's real height
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
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

  const link = 'font-bold text-mist transition-colors duration-300 hover:text-white'

  return (
    <footer className="relative">
      <div ref={spacerRef} style={{ height }} aria-hidden />
      {/* ink field: deliberately darker and more neutral than the sea surface above it */}
      <div ref={panelRef} className="fixed inset-x-0 bottom-0 z-0 overflow-hidden bg-ink text-white">
        {/* faint cyan horizon along the very bottom edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_320px_at_50%_122%,rgb(0_170_212/0.2),transparent_70%)]"
        />
        <div className="foot-inner relative mx-auto max-w-[1240px] px-5 pt-12 pb-5 sm:px-6 md:pt-16 md:pb-6 lg:px-8">
          {/* one line of contact, one line of wayfinding */}
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <a
              href={`mailto:darien.cepani42@gmail.com?subject=${encodeURIComponent(t('contact.subject'))}`}
              className="font-display text-xl font-semibold break-all text-white transition-colors duration-300 hover:text-cyan sm:text-2xl md:text-3xl"
            >
              darien.cepani42@gmail.com
            </a>
            <ul className="flex flex-wrap gap-x-7 gap-y-2">
              <li><button onClick={() => scrollToId('products')} className={link}>{t('nav.products')}</button></li>
              <li><button onClick={() => scrollToId('services')} className={link}>{t('nav.services')}</button></li>
              <li><button onClick={() => scrollToId('process')} className={link}>{t('nav.process')}</button></li>
              <li><button onClick={() => scrollToId('contact')} className={link}>{t('footer.colContact')}</button></li>
            </ul>
          </div>

          {/* the brand at full sail: the page's closing image */}
          <img src={lockupWhite} alt="Vela" className="mx-auto mt-10 w-[min(420px,64vw)] md:mt-14" />

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
