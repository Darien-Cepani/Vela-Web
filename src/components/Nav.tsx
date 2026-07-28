import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { RiArrowRightUpLine, RiMoonLine, RiSunLine } from '@remixicon/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { scrollToId } from '../lib/smooth-scroll'
import { useTheme } from '../theme-context'
import { splashDelay } from './Splash'
import lockupWhite from '../assets/brand/lockup-white.svg'
import lockupInk from '../assets/brand/lockup-ink.svg'

const LINK_IDS = ['products', 'services', 'process'] as const
const SPY_IDS = ['top', 'products', 'services', 'process', 'contact'] as const

function LangToggle({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation()
  const lang = i18n.language
  return (
    <div className={`flex items-center rounded-full border border-hair p-1 ${className}`}>
      {(['en', 'sq'] as const).map((l) => (
        <button
          key={l}
          onClick={() => i18n.changeLanguage(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide transition-colors duration-300 ${
            lang === l ? 'bg-cyan text-sea' : 'text-fade hover:text-strong'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

/** Floating refraction-glass nav with scroll-spy links and a React Bits-style staggered mobile menu. */
export function Nav() {
  const { t, i18n } = useTranslation()
  const { mode, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const headerRef = useRef<HTMLElement>(null)

  // entrance: the pill drops in as the splash curtain lifts (runs once, nav survives remounts)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        headerRef.current,
        { y: -18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: splashDelay() + 0.1 },
      )
    },
    { scope: headerRef },
  )

  // scroll-spy: the section crossing the upper-middle of the viewport owns the highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-38% 0px -57% 0px' },
    )
    const timer = setTimeout(() => {
      SPY_IDS.forEach((id) => {
        const section = document.getElementById(id)
        if (section) observer.observe(section)
      })
    }, 120)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [i18n.language])

  // the page must not scroll behind the open menu
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    // release the scroll lock synchronously so the smooth-scroll isn't clamped
    document.documentElement.style.overflow = ''
    scrollToId(id)
  }

  return (
    <>
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 md:pt-5">
        <nav className="glass-refract glass-refract-deep relative flex w-full max-w-[960px] items-center justify-between overflow-hidden rounded-full border border-ink/10 bg-white/70 py-2 pl-6 pr-2 shadow-[0_18px_50px_rgb(12_20_24/0.12)] dark:border-white/10 dark:bg-sea/60 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_18px_50px_rgb(2_10_14/0.5)]">
          <span aria-hidden className="liquid-sheen opacity-70 dark:opacity-100" />
          <button onClick={() => go('top')} aria-label={t('nav.backToTop')} className="shrink-0">
            <img src={mode === 'dark' ? lockupWhite : lockupInk} alt="Vela" className="h-[22px] w-auto lg:h-6" />
          </button>

          <div className="hidden items-center gap-8 lg:flex">
            {LINK_IDS.map((id) => (
              <button
                key={id}
                onClick={() => go(id)}
                aria-current={active === id ? 'true' : undefined}
                className={`link-slide text-[14.5px] font-bold tracking-[0.01em] transition-colors duration-300 ${
                  active === id ? 'link-active' : 'text-soft hover:text-strong'
                }`}
              >
                {t(`nav.${id}`)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LangToggle className="hidden sm:flex" />
            <button
              onClick={toggle}
              aria-label={mode === 'dark' ? 'Light theme' : 'Dark theme'}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hair text-soft transition-colors duration-300 hover:text-strong"
            >
              {mode === 'dark' ? <RiSunLine size={17} /> : <RiMoonLine size={17} />}
            </button>
            <button
              onClick={() => go('contact')}
              className="btn-sheen group hidden items-center gap-2.5 rounded-full bg-cyan py-2.5 pl-5 pr-2.5 text-[14px] font-bold text-sea transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] active:scale-[0.98] lg:flex"
            >
              {t('nav.cta')}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sea/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <RiArrowRightUpLine size={14} />
              </span>
            </button>

            {/* hamburger morph */}
            <button
              className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full border border-hair lg:hidden"
              aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span
                className={`absolute h-[2px] w-5 rounded bg-strong transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  open ? 'rotate-45' : '-translate-y-[4px]'
                }`}
              />
              <span
                className={`absolute h-[2px] w-5 rounded bg-strong transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  open ? '-rotate-45' : 'translate-y-[4px]'
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* staggered mobile menu: cyan sweep, glass panel, cascading links (CSS-driven) */}
      <div
        className={`fixed inset-0 z-30 lg:hidden ${
          open
            ? 'pointer-events-auto visible'
            : 'pointer-events-none invisible [transition:visibility_0s_linear_0.7s]'
        }`}
      >
        <div
          className={`absolute inset-y-0 right-0 w-full bg-cyan transition-transform duration-500 ease-[cubic-bezier(0.83,0,0.17,1)] ${
            open ? 'translate-x-0 delay-0' : 'translate-x-full delay-100'
          }`}
        />
        <div
          className={`glass-refract absolute inset-y-0 right-0 flex w-full flex-col justify-center bg-surface/95 px-8 transition-transform duration-500 ease-[cubic-bezier(0.83,0,0.17,1)] ${
            open ? 'translate-x-0 delay-100' : 'translate-x-full delay-0'
          }`}
        >
          <div className="flex flex-col gap-4">
            {[...LINK_IDS.map((id) => ({ id, label: t(`nav.${id}`) })), { id: 'contact', label: t('footer.colContact') }].map(
              (item, i) => (
                <div key={item.id} className="overflow-hidden">
                  <button
                    onClick={() => go(item.id)}
                    className={`block text-left font-display text-4xl font-semibold transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      open ? 'translate-y-0 opacity-100' : 'translate-y-[115%] opacity-0'
                    } ${item.id === 'contact' || active === item.id ? 'text-accent-ink' : 'text-strong'}`}
                    style={{ transitionDelay: open ? `${280 + i * 70}ms` : '0ms' }}
                  >
                    {item.label}
                  </button>
                </div>
              ),
            )}
          </div>
          <div
            className={`mt-10 flex items-center gap-4 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: open ? '560ms' : '0ms' }}
          >
            <button
              onClick={() => go('contact')}
              className="rounded-full bg-cyan px-7 py-3.5 text-base font-bold text-sea active:scale-[0.98]"
            >
              {t('nav.cta')}
            </button>
            <LangToggle className="sm:hidden" />
          </div>
        </div>
      </div>
    </>
  )
}
