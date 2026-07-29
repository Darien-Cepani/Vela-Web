import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { RiArrowRightUpLine } from '@remixicon/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { scrollToId } from '../lib/smooth-scroll'
import { useIsDesktop } from '../lib/use-is-desktop'
import { Magnetic } from './Magnetic'
import { Waves } from './Waves'
import { LightRays } from './LightRays'
import { splashDelay } from './Splash'
import { HeroMark3D } from './HeroMark3D'
import { WaterRipples, type WaterRipplesHandle } from './WaterRipples'

export function Hero() {
  const { t } = useTranslation()
  const isDesktop = useIsDesktop()
  const root = useRef<HTMLElement>(null)
  const ripples = useRef<WaterRipplesHandle>(null)

  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return

      // entry choreography, held until the splash curtain lifts on first load
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: splashDelay() })
      tl.fromTo('.hero-badge', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.05)
        .fromTo('.line-inner', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.14 }, 0.15)
        .fromTo('.hero-fade', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.6)
        .fromTo('.hero-ring', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, stagger: 0.12 }, 0.5)
      if (isDesktop) {
        tl.fromTo('.hero-visual', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4 }, 0.4)
      }

      // exit parallax: content lags the scroll and dims as the hero leaves
      gsap.to('.hero-grid', {
        y: 80,
        opacity: 0.35,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })

      const cleanups: Array<() => void> = []

      // clicking the mark drops a wave into the local water and sends one
      // refraction ring across the whole page (ClickRipple listens)
      const wraps = gsap.utils.toArray<HTMLElement>('.hero-mark-wrap')
      const burst = (e: Event) => {
        ripples.current?.drop(1)
        const pe = e as PointerEvent
        window.dispatchEvent(new CustomEvent('vela-ripple', { detail: { x: pe.clientX, y: pe.clientY } }))
      }
      wraps.forEach((el) => {
        el.addEventListener('pointerdown', burst)
        cleanups.push(() => el.removeEventListener('pointerdown', burst))
      })

      // interaction: the whole visual leans toward the pointer, gently
      const visual = root.current!.querySelector('.hero-visual')
      if (visual) {
        const xTo = gsap.quickTo(visual, 'x', { duration: 1.1, ease: 'power3.out' })
        const yTo = gsap.quickTo(visual, 'y', { duration: 1.1, ease: 'power3.out' })
        const onMove = contextSafe!((e: PointerEvent) => {
          const r = root.current!.getBoundingClientRect()
          xTo(((e.clientX - r.left) / r.width - 0.5) * 14)
          yTo(((e.clientY - r.top) / r.height - 0.5) * 10)
        }) as (e: PointerEvent) => void
        root.current!.addEventListener('pointermove', onMove, { passive: true })
        cleanups.push(() => root.current?.removeEventListener('pointermove', onMove))
      }
      return () => cleanups.forEach((fn) => fn())
    },
    { scope: root, dependencies: [isDesktop], revertOnUpdate: true },
  )

  return (
    <section id="top" ref={root} className="relative flex min-h-[100dvh] items-center overflow-hidden">
      {/* theme-aware deep-sea / coastal atmosphere */}
      <div aria-hidden className="hero-atmo absolute inset-0" />
      {/* pointer-driven canvases are desktop-only: mobile keeps the static atmosphere and stays fast */}
      {isDesktop && (
        <>
          {/* volumetric beams from the top-right, aligned with the 3D key light */}
          <LightRays className="absolute inset-0 h-full w-full opacity-100 [mask-image:linear-gradient(to_bottom,black_30%,transparent_88%)] dark:opacity-100" />
          {/* interactive sea lines */}
          <Waves className="absolute inset-x-0 bottom-0 h-[52%] w-full [mask-image:linear-gradient(to_top,black_40%,transparent)]" />
        </>
      )}

      <div className="hero-grid relative mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-14 px-5 pt-28 pb-16 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:pt-24 lg:pb-14">
        <div className="lg:col-span-6">
          <span className="hero-badge orbit-border inline-flex items-center whitespace-nowrap rounded-full border border-hair bg-white/40 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] backdrop-blur-xl sm:px-4 sm:text-[12.5px] sm:tracking-[0.16em] dark:bg-white/[0.06]">
            {t('hero.badge')}
          </span>
          <h1 className="mt-7 text-[clamp(2.5rem,10.5vw,3.6rem)] leading-[1.05] md:text-[clamp(3.8rem,6.6vw,6rem)] md:leading-[1.01]">
            <span className="line"><span className="line-inner">{t('hero.l1')}</span></span>
            <span className="line">
              <span className="line-inner">
                {t('hero.l2pre')}<span className="text-accent-ink">{t('hero.l2accent')}</span>.
              </span>
            </span>
          </h1>
          <p className="hero-fade mt-7 max-w-[42ch] text-base leading-relaxed text-soft md:text-xl">
            {t('hero.sub')}
          </p>
          <div className="hero-fade mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <button
                onClick={() => scrollToId('contact')}
                className="btn-sheen group flex items-center gap-3 rounded-full bg-cyan py-3.5 pl-8 pr-3.5 text-base font-bold text-sea shadow-cta transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              >
                {t('nav.cta')}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sea/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                  <RiArrowRightUpLine size={16} />
                </span>
              </button>
            </Magnetic>
            <button
              onClick={() => scrollToId('products')}
              className="rounded-full border border-hair px-8 py-5 text-base font-bold leading-6 text-strong transition-colors duration-300 hover:border-cyan hover:text-accent-ink"
            >
              {t('hero.cta2')}
            </button>
          </div>

          {/* mobile / tablet: the 3D mark anchors the hero below the actions */}
          {!isDesktop && (
            <div className="relative mt-12 flex justify-center lg:hidden" aria-hidden>
              <div className="hero-mark-wrap relative z-[35] flex items-center justify-center">
                <div className="hero-ring absolute h-[260px] w-[260px] rounded-full border border-hair" />
                <WaterRipples ref={ripples} className="absolute h-[340px] w-[340px]" />
                <HeroMark3D className="relative h-[240px] w-[240px] drop-shadow-[0_0_40px_rgb(0_170_212/0.3)]" />
              </div>
            </div>
          )}
        </div>

        {isDesktop && (
          <div className="relative hidden justify-center lg:col-span-6 lg:flex" aria-hidden>
            <div className="hero-visual hero-mark-wrap relative z-[35] flex items-center justify-center will-change-transform">
              <div className="hero-ring absolute top-1/2 left-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-hair" />
              <div className="hero-ring absolute top-1/2 left-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-hair/70" />
              <WaterRipples
                ref={ripples}
                className="absolute top-1/2 left-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2"
              />
              <HeroMark3D className="hero-mark relative h-[460px] w-[460px] drop-shadow-[0_0_60px_rgb(0_170_212/0.3)]" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
