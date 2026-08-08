import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import {
  RiArrowRightUpLine,
  RiFlashlightLine,
  RiMapPin2Line,
  RiTeamLine,
  RiTranslate2,
} from '@remixicon/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { scrollToId } from '../lib/smooth-scroll'
import { openContact } from '../lib/contact-modal'
import markCyan from '../assets/brand/mark-cyan.svg'
import { useCanAfford, useIsDesktop, usePerfTier } from '../lib/use-is-desktop'
import { Magnetic } from './Magnetic'
import { Waves } from './Waves'
import { LightRays } from './LightRays'
import { splashDelay } from './Splash'
import { HeroMark3D } from './HeroMark3D'
import { WaterRipples, type WaterRipplesHandle } from './WaterRipples'

export function Hero() {
  const { t } = useTranslation()
  const isDesktop = useIsDesktop()
  const canAfford = useCanAfford()
  const tier = usePerfTier()
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
    { scope: root, dependencies: [isDesktop, canAfford], revertOnUpdate: true },
  )

  return (
    <section id="top" ref={root} className="relative flex min-h-[100dvh] items-center overflow-hidden">
      {/* theme-aware deep-sea / coastal atmosphere */}
      <div aria-hidden className="hero-atmo absolute inset-0" />
      {/* Pointer-driven canvases need width AND a device that can pay for them.
          Width alone let a 1440px window with no GPU acceleration mount the
          light rays, the wave canvas and the WebGL water — the hero measured
          11fps there. The static atmosphere underneath is what those devices
          get, and it is the same composition without the live layers. */}
      {canAfford && (
        <>
          {/* volumetric beams from the top-right, aligned with the 3D key light */}
          <LightRays className="absolute inset-0 h-full w-full opacity-100 [mask-image:linear-gradient(to_bottom,black_30%,transparent_88%)] dark:opacity-100" />
          {/* interactive sea lines */}
          <Waves className="absolute inset-x-0 bottom-0 h-[52%] w-full [mask-image:linear-gradient(to_top,black_40%,transparent)]" />
        </>
      )}

      <div className="hero-grid relative mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-14 px-5 pt-28 pb-32 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-36 lg:pb-28">
        <div className="lg:col-span-7">
          <span className="hero-badge orbit-border inline-flex items-center whitespace-nowrap rounded-full border border-edge bg-white/40 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] backdrop-blur-xl sm:px-4 sm:text-[12.5px] sm:tracking-[0.16em] dark:bg-white/[0.06]">
            {t('hero.badge')}
          </span>
          {/* Two sentences, two lines — the display size is capped so neither
              sentence ever wraps into a third. Above 1240 the container stops
              growing, so the ceiling is a fixed rem value, not a vw. */}
          <h1 className="mt-7 text-[clamp(2.5rem,10.5vw,3.6rem)] leading-[1.05] md:text-[clamp(3rem,4.65vw,4.25rem)] md:leading-[1.02]">
            <span className="line"><span className="line-inner">{t('hero.l1')}</span></span>
            <span className="line">
              <span className="line-inner">
                {t('hero.l2pre')}<span className="text-accent-ink">{t('hero.l2accent')}</span>.
              </span>
            </span>
          </h1>
          <p className="hero-fade mt-7 max-w-[46ch] text-base leading-relaxed text-soft md:text-xl">
            {t('hero.sub')}
          </p>
          <div className="hero-fade mt-9 flex flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-4">
            <Magnetic>
              <button
                onClick={() => openContact('hero')}
                className="btn-sheen group flex w-full items-center justify-between gap-3 rounded-full bg-cyan py-3.5 pl-8 pr-3.5 text-base font-bold text-sea shadow-cta transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] min-[420px]:w-auto min-[420px]:justify-start"
              >
                {t('nav.cta')}
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sea/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                  <RiArrowRightUpLine size={16} />
                </span>
              </button>
            </Magnetic>
            {/* a bordered button on paper needs a surface of its own, or the
                hairline disappears into the page and it stops reading as a control */}
            <button
              onClick={() => scrollToId('products')}
              className="glass-refract glass-refract-deep rounded-full border border-edge bg-surface-2/60 px-8 py-5 text-base font-bold leading-6 text-strong transition-[color,border-color,background-color] duration-300 hover:border-cyan hover:bg-surface-2 hover:text-accent-ink dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
            >
              {t('hero.cta2')}
            </button>
          </div>

          {/* Below lg the mark sits under the actions. This block is
              `lg:hidden`, so it cannot cover a wide low-tier screen — that case
              is handled by the right column below, which keeps its layout and
              swaps only the expensive contents. */}
          {!isDesktop && (
            <div className="relative mt-12 flex justify-center lg:hidden" aria-hidden>
              <div className="hero-mark-wrap relative z-[35] flex items-center justify-center">
                <div className="hero-ring absolute h-[260px] w-[260px] rounded-full border border-hair" />
                {/* A low-tier device gets the flat mark. The WebGL water and the
                    three.js lathe are the two most expensive things on the page
                    and this is the one place they were still mounting
                    unconditionally — the comment above them used to claim they
                    were desktop-only, and they were not. */}
                {tier === 'full' ? (
                  <>
                    <WaterRipples ref={ripples} className="absolute h-[340px] w-[340px]" />
                    <HeroMark3D className="relative h-[240px] w-[240px] drop-shadow-[0_0_40px_rgb(0_170_212/0.3)]" />
                  </>
                ) : (
                  <img
                    src={markCyan}
                    alt=""
                    width={240}
                    height={240}
                    className="relative h-[240px] w-[240px]"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {isDesktop && (
          <div className="relative hidden justify-center lg:col-span-5 lg:flex" aria-hidden>
            <div className="hero-visual hero-mark-wrap relative z-[35] flex items-center justify-center will-change-transform">
              <div className="hero-ring absolute top-1/2 left-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-hair" />
              <div className="hero-ring absolute top-1/2 left-1/2 h-[312px] w-[312px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-hair/70" />
              {/* The rings and the composition stay whatever the device is; only
                  the two expensive layers swap. A low-tier machine used to get
                  an empty right column here, which read as a broken hero. */}
              {canAfford ? (
                <>
                  <WaterRipples
                    ref={ripples}
                    className="absolute top-1/2 left-1/2 h-[570px] w-[570px] -translate-x-1/2 -translate-y-1/2"
                  />
                  <HeroMark3D className="hero-mark relative h-[420px] w-[420px] drop-shadow-[0_0_60px_rgb(0_170_212/0.3)]" />
                </>
              ) : (
                <img
                  src={markCyan}
                  alt=""
                  width={420}
                  height={420}
                  className="hero-mark relative h-[420px] w-[420px] drop-shadow-[0_0_60px_rgb(0_170_212/0.3)]"
                />
              )}
            </div>
          </div>
        )}
      </div>

      <ProofRail />
    </section>
  )
}

/**
 * The instrument rail along the hero's lower edge: four things that are true
 * about working with Vela, stated flat. It closes the fold with information
 * instead of empty deep-sea, and it doubles as the scroll cue — the rail is
 * the visual floor of the first screen.
 */
function ProofRail() {
  const { t } = useTranslation()
  const items = t('hero.proof', { returnObjects: true }) as Array<{ k: string; v: string }>
  const icons = [RiFlashlightLine, RiTranslate2, RiTeamLine, RiMapPin2Line]

  return (
    <div className="hero-fade absolute inset-x-0 bottom-0 z-[20] border-t border-hair/70">
      <ul className="mx-auto grid max-w-[1240px] grid-cols-2 px-5 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map((item, i) => {
          const Icon = icons[i]
          return (
            <li
              key={item.k}
              className="group/proof flex items-center gap-3 border-hair/70 py-4 [&:nth-child(odd)]:border-r lg:border-r lg:py-5 lg:last:border-r-0 lg:[&:nth-child(odd)]:border-r [&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0 [&:nth-child(even)]:pl-4 sm:[&:nth-child(even)]:pl-6 lg:[&:nth-child(n)]:pl-6 lg:first:pl-0"
            >
              <Icon
                size={17}
                aria-hidden
                className="shrink-0 text-accent-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/proof:-translate-y-0.5"
              />
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-bold leading-tight text-strong sm:text-sm">
                  {item.k}
                </span>
                <span className="block truncate text-[11.5px] leading-tight text-fade sm:text-xs">{item.v}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
