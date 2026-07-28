import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { RiArrowDownSLine } from '@remixicon/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { BlurText } from './BlurText'
import markShop from '../assets/brand/mark-shop.svg'
import markMall from '../assets/brand/mark-mall.svg'
import markAds from '../assets/brand/mark-ads.svg'

const STATIC = [
  {
    mark: markShop,
    descriptor: 'Shop',
    dot: '#FF2E2E',
    glow: 'radial-gradient(760px 520px at 78% 18%, rgb(255 46 46 / 0.26), rgb(245 158 11 / 0.10), transparent 70%)',
  },
  {
    mark: markMall,
    descriptor: 'Market',
    dot: '#1BA312',
    glow: 'radial-gradient(760px 520px at 78% 18%, rgb(27 163 18 / 0.26), rgb(56 250 21 / 0.08), transparent 70%)',
  },
  {
    mark: markAds,
    descriptor: 'Ads',
    dot: '#B70808',
    glow: 'radial-gradient(760px 520px at 78% 18%, rgb(183 8 8 / 0.30), rgb(255 46 46 / 0.10), transparent 70%)',
  },
]

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

/**
 * Products as a horizontal accordion: three deep-sea slices, one open at a time.
 * Hover or click a slice and it unfurls; the others fold to their name and mark.
 * Below md the three cards stack fully open. Cards stay deep-sea in both themes.
 */
export function Products() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  const items = t('products.items', { returnObjects: true }) as Array<{
    claim: string
    body: string
    chips: string[]
  }>

  // idle: every product mark bobs gently at anchor
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray<HTMLElement>('.acc-mark', root.current!).forEach((el, i) => {
        gsap.to(el, { y: -8, duration: 2.8 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })
    },
    { scope: root },
  )

  const name = (p: (typeof STATIC)[number], big = false) => (
    <span className={`font-display font-semibold text-white ${big ? 'text-3xl' : 'text-2xl'}`}>
      {p.descriptor}
      <span style={{ color: p.dot }}>.</span>
    </span>
  )

  return (
    <section id="products" ref={root} className="pt-24 md:pt-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-fade">{t('products.eyebrow')}</p>
        <BlurText className="mt-4 max-w-[16ch] text-3xl sm:text-5xl md:text-6xl">
          {t('products.h2pre')}<span className="text-accent-ink">{t('products.h2accent')}</span>.
        </BlurText>
        <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-soft md:text-lg" data-reveal>
          {t('products.sub')}
        </p>

        {/* ── desktop: the accordion ── */}
        <div className="mt-14 hidden h-[540px] gap-4 md:flex" data-reveal>
          {STATIC.map((p, i) => {
            const isActive = active === i
            return (
              <article
                key={p.descriptor}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActive(i)
                  }
                }}
                className="glass-refract relative min-w-[140px] cursor-pointer overflow-hidden rounded-[22px] border border-white/10 bg-sea-2/90 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_24px_70px_rgb(12_30_38/0.22)] outline-none focus-visible:ring-2 focus-visible:ring-cyan dark:bg-sea-2/75 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_24px_70px_rgb(4_16_21/0.5)]"
                style={{ flexGrow: isActive ? 3.6 : 1, flexBasis: 0, transition: `flex-grow 0.8s ${EASE}` }}
              >
                {/* product glow, brightens when open */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: p.glow, opacity: isActive ? 1 : 0.3, transition: `opacity 0.8s ${EASE}` }}
                />
                {/* liquid glass film over the glow */}
                <div aria-hidden className="glass-overlay rounded-[22px]" />
                <span aria-hidden className="liquid-sheen" style={{ opacity: isActive ? 1 : 0.4, transition: `opacity 0.8s ${EASE}` }} />

                {/* folded face: mark + name */}
                <div
                  aria-hidden={isActive}
                  className="absolute inset-0 flex flex-col items-center justify-between py-10"
                  style={{ opacity: isActive ? 0 : 1, transition: `opacity 0.45s ${EASE}` }}
                >
                  <img src={p.mark} alt="" className="acc-mark h-11 w-auto" />
                  {name(p)}
                </div>

                {/* open face: the full story */}
                <div
                  aria-hidden={!isActive}
                  className="absolute inset-0 flex flex-col justify-between p-10 lg:p-12"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(14px)',
                    transition: `opacity 0.55s ${EASE} 0.2s, transform 0.55s ${EASE} 0.2s`,
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <img src={p.mark} alt="" className="acc-mark h-10 w-auto" />
                    <span className="font-display text-2xl font-semibold text-white">
                      Vela {p.descriptor}
                      <span style={{ color: p.dot }}>.</span>
                    </span>
                  </div>

                  <div className="max-w-[46ch]">
                    <h3 className="text-3xl leading-tight text-white lg:text-[2.6rem]">{items[i].claim}</h3>
                    <p className="mt-4 text-base leading-relaxed text-mist lg:text-lg">{items[i].body}</p>
                  </div>

                  <ul className="flex flex-wrap gap-2.5">
                    {items[i].chips.map((c, ci) => (
                      <li
                        key={c}
                        className={`rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[13px] font-bold text-white/90 shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-cyan/60 lg:px-5 lg:py-2.5 lg:text-[14px] ${
                          isActive ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                        }`}
                        style={{ transitionDelay: isActive ? `${320 + ci * 80}ms` : '0ms' }}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>

        {/* ── mobile: same accordion, vertical — tap a product to unfurl it ── */}
        <div className="mt-10 flex flex-col gap-4 md:hidden">
          {STATIC.map((p, i) => {
            const isActive = active === i
            return (
              <article
                key={p.descriptor}
                data-reveal
                className="glass-refract relative overflow-hidden rounded-[22px] border border-white/10 bg-sea-2/90 dark:bg-sea-2/75"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{ background: p.glow, opacity: isActive ? 0.8 : 0.3 }}
                />
                <div aria-hidden className="glass-overlay rounded-[22px]" />
                <button
                  onClick={() => setActive(i)}
                  aria-expanded={isActive}
                  className="relative flex w-full items-center gap-3.5 p-5 text-left"
                >
                  <img src={p.mark} alt="" className="h-8 w-auto" />
                  <span className="font-display text-lg font-semibold text-white">
                    Vela {p.descriptor}
                    <span style={{ color: p.dot }}>.</span>
                  </span>
                  <RiArrowDownSLine
                    size={22}
                    className={`ml-auto shrink-0 text-mist transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      isActive ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className="relative grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ gridTemplateRows: isActive ? '1fr' : '0fr' }}
                  aria-hidden={!isActive}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-6">
                      <h3 className="text-xl leading-tight text-white">{items[i].claim}</h3>
                      <p className="mt-3 text-base leading-relaxed text-mist">{items[i].body}</p>
                      <ul className="mt-5 flex flex-wrap gap-2.5">
                        {items[i].chips.map((c) => (
                          <li
                            key={c}
                            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[13px] font-bold text-white/90 shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]"
                          >
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
