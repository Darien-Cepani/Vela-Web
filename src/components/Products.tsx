import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { RiArrowDownSLine, RiArrowRightUpLine } from '@remixicon/react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useIsDesktop } from '../lib/use-is-desktop'
import { openContact } from '../lib/contact-modal'
import { BlurText } from './BlurText'
import markShop from '../assets/brand/mark-shop.svg'
import markMall from '../assets/brand/mark-mall.svg'
import markAds from '../assets/brand/mark-ads.svg'

type Product = {
  mark: string
  descriptor: string
  dot: string
  future: boolean
  /** the product's own colour, laid *over* the glass so it survives the blur */
  wash: string
  /** a matching edge so the open slice reads as that product, not as a grey panel */
  edge: string
}

const STATIC: Product[] = [
  {
    mark: markShop,
    descriptor: 'Shop',
    dot: '#FF2E2E',
    future: false,
    wash: 'radial-gradient(680px 460px at 76% 12%, rgb(255 46 46 / 0.42), transparent 66%), radial-gradient(520px 380px at 96% 76%, rgb(245 158 11 / 0.30), transparent 70%)',
    edge: 'rgb(255 92 60 / 0.55)',
  },
  {
    mark: markMall,
    descriptor: 'Market',
    dot: '#1BA312',
    future: true,
    wash: 'radial-gradient(680px 460px at 76% 12%, rgb(45 200 30 / 0.36), transparent 66%), radial-gradient(520px 380px at 96% 76%, rgb(27 163 18 / 0.26), transparent 70%)',
    edge: 'rgb(56 200 40 / 0.5)',
  },
  {
    mark: markAds,
    descriptor: 'Ads',
    dot: '#B70808',
    future: true,
    wash: 'radial-gradient(680px 460px at 76% 12%, rgb(226 40 40 / 0.46), transparent 66%), radial-gradient(520px 380px at 96% 76%, rgb(150 14 14 / 0.42), transparent 70%)',
    edge: 'rgb(220 48 48 / 0.5)',
  },
]

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

/**
 * Products as a horizontal accordion: three deep-sea slices, one open at a time.
 * Hover, click or focus a slice and it unfurls; the others fold to their name
 * and mark. Below md the same three become a tap accordion. Cards stay
 * deep-sea in both themes, and only one of the two layouts is ever in the DOM
 * so screen readers and crawlers see each product exactly once.
 */
export function Products() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  // false until the section is on screen: the accordion opens as you arrive
  const [unfurled, setUnfurled] = useState(false)
  const isWide = useIsDesktop('(min-width: 768px)')

  const items = t('products.items', { returnObjects: true }) as Array<{
    claim: string
    body: string
    chips: string[]
    cta: string
  }>

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        setUnfurled(true)
        return
      }
      // idle: every product mark bobs gently at anchor
      gsap.utils.toArray<HTMLElement>('.acc-mark', root.current!).forEach((el, i) => {
        gsap.to(el, { y: -8, duration: 2.8 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })
      // The section's own entrance: the three slices arrive closed, and the
      // first one unfurls once you are actually looking at it. Arriving
      // pre-opened threw away the one moment that explains the interaction.
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 68%',
        once: true,
        onEnter: () => setUnfurled(true),
      })
    },
    { scope: root, dependencies: [isWide], revertOnUpdate: true },
  )

  const status = (p: Product, small = false) =>
    p.future ? (
      <span
        className={`shrink-0 rounded-full border border-cyan/40 bg-cyan/15 font-bold uppercase tracking-[0.12em] text-cyan ${
          small ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-[10.5px]'
        }`}
      >
        {t('products.horizon')}
      </span>
    ) : (
      <span
        className={`flex shrink-0 items-center gap-1.5 rounded-full border border-mall-bright/40 bg-mall/20 font-bold uppercase tracking-[0.12em] text-mall-bright ${
          small ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-[10.5px]'
        }`}
      >
        <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-mall-bright" />
        {t('products.online')}
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

        {isWide ? (
          /* ── the accordion ── */
          <div className="mt-14 flex h-[540px] gap-4" data-reveal>
            {STATIC.map((p, i) => {
              const isActive = unfurled && active === i
              return (
                <article
                  key={p.descriptor}
                  aria-label={`Vela ${p.descriptor}`}
                  className="glass-refract group/slice relative min-w-[140px] cursor-pointer overflow-hidden rounded-[22px] border bg-sea-2/90 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cyan shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_24px_70px_rgb(12_30_38/0.22)] dark:bg-sea-2/75 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_24px_70px_rgb(4_16_21/0.5)]"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    flexGrow: isActive ? 3.6 : 1,
                    flexBasis: 0,
                    borderColor: isActive ? p.edge : 'rgb(255 255 255 / 0.10)',
                    transition: `flex-grow 0.8s ${EASE}, border-color 0.8s ${EASE}`,
                  }}
                >
                  {/* the product's own colour sits ABOVE the backdrop blur, or the
                      blur desaturates it into the same grey for all three */}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: p.wash, opacity: isActive ? 1 : 0.55, transition: `opacity 0.8s ${EASE}` }}
                  />
                  {/* liquid glass film over the wash */}
                  <div aria-hidden className="glass-overlay rounded-[22px]" />
                  <span
                    aria-hidden
                    className="liquid-sheen"
                    style={{ opacity: isActive ? 1 : 0.4, transition: `opacity 0.8s ${EASE}` }}
                  />

                  {/* Folded face. It is the control that opens the slice, so it
                      is a real button — mouse users hover, keyboard users tab
                      and press, and both land on the same state. */}
                  <button
                    type="button"
                    tabIndex={isActive ? -1 : 0}
                    aria-expanded={isActive}
                    aria-controls={`product-panel-${p.descriptor.toLowerCase()}`}
                    onClick={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    /* The button is suppressed once its panel opens, so an outline on it
                       would vanish the instant it was earned. The ring lives on the
                       slice instead, via focus-within — see the class list above. */
                    className="absolute inset-0 flex flex-col items-center gap-8 py-10 focus-visible:outline-none"
                    style={{
                      opacity: isActive ? 0 : 1,
                      visibility: isActive ? 'hidden' : 'visible',
                      transition: `opacity 0.4s ${EASE}, visibility 0s linear ${isActive ? '0.4s' : '0s'}`,
                    }}
                  >
                    <img src={p.mark} alt="" className="acc-mark h-11 w-auto shrink-0" />
                    {/* The name runs up the fold like a book spine. Set flat it
                        overflowed a 140px panel at md, and left the middle of a
                        540px slice empty; vertical it does neither. */}
                    <span className="acc-spine flex flex-1 items-center justify-center font-display text-2xl font-semibold text-white">
                      Vela {p.descriptor}
                      <span style={{ color: p.dot }}>.</span>
                    </span>
                    <span className="sr-only-label">{t('products.open')}</span>
                  </button>

                  {/* open face: the full story, top-weighted so the slice never
                      grows a hole in its middle */}
                  <div
                    id={`product-panel-${p.descriptor.toLowerCase()}`}
                    className="absolute inset-0 flex flex-col p-10 lg:p-12"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translateY(0)' : 'translateY(14px)',
                      transition: `opacity 0.5s ${EASE} 0.18s, transform 0.5s ${EASE} 0.18s`,
                      pointerEvents: isActive ? 'auto' : 'none',
                      visibility: isActive ? 'visible' : 'hidden',
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <img src={p.mark} alt="" className="acc-mark h-10 w-auto" />
                      <span className="font-display text-2xl font-semibold text-white">
                        Vela {p.descriptor}
                        <span style={{ color: p.dot }}>.</span>
                      </span>
                      {status(p)}
                    </div>

                    <div className="mt-9 max-w-[46ch]">
                      <h3 className="text-3xl leading-[1.08] text-white lg:text-[2.5rem]">{items[i].claim}</h3>
                      <p className="mt-4 text-base leading-relaxed text-mist lg:text-lg">{items[i].body}</p>
                    </div>

                    <ul className="mt-7 flex flex-wrap gap-2.5">
                      {items[i].chips.map((c, ci) => (
                        <li
                          key={c}
                          className={`rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:px-5 lg:py-2.5 lg:text-[14px] ${
                            isActive ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                          }`}
                          style={{ transitionDelay: isActive ? `${300 + ci * 70}ms` : '0ms' }}
                        >
                          {c}
                        </li>
                      ))}
                    </ul>

                    {/* every product now has somewhere to go */}
                    <div className="mt-auto pt-8">
                      <button
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => openContact(`product-${p.descriptor.toLowerCase()}`)}
                        className="btn-sheen group/cta inline-flex items-center gap-2.5 rounded-full bg-white py-3 pl-6 pr-3 text-[15px] font-bold text-sea transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] active:scale-[0.98]"
                      >
                        {items[i].cta}
                        <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-sea/12 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5">
                          <RiArrowRightUpLine size={15} />
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          /* ── same accordion, vertical: tap a product to unfurl it ── */
          <div className="mt-10 flex flex-col gap-4">
            {STATIC.map((p, i) => {
              const isActive = active === i
              const panelId = `product-panel-${p.descriptor.toLowerCase()}`
              return (
                <article
                  key={p.descriptor}
                  data-reveal
                  className="glass-refract relative overflow-hidden rounded-[22px] border bg-sea-2/90 transition-colors duration-500 dark:bg-sea-2/75"
                  style={{ borderColor: isActive ? p.edge : 'rgb(255 255 255 / 0.10)' }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{ background: p.wash, opacity: isActive ? 0.95 : 0.4 }}
                  />
                  <div aria-hidden className="glass-overlay rounded-[22px]" />
                  <button
                    onClick={() => setActive(i)}
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    className="relative flex w-full items-center gap-3 p-5 text-left"
                  >
                    <img src={p.mark} alt="" className="h-8 w-auto shrink-0" />
                    <span className="whitespace-nowrap font-display text-lg font-semibold text-white">
                      Vela {p.descriptor}
                      <span style={{ color: p.dot }}>.</span>
                    </span>
                    {status(p, true)}
                    <RiArrowDownSLine
                      size={22}
                      aria-hidden
                      className={`ml-auto shrink-0 text-mist transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        isActive ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    id={panelId}
                    className="relative grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    style={{ gridTemplateRows: isActive ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-6" hidden={!isActive}>
                        <h3 className="text-xl leading-tight text-white">{items[i].claim}</h3>
                        <p className="mt-3 text-base leading-relaxed text-mist">{items[i].body}</p>
                        <ul className="mt-5 flex flex-wrap gap-2.5">
                          {items[i].chips.map((c) => (
                            <li
                              key={c}
                              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]"
                            >
                              {c}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => openContact(`product-${p.descriptor.toLowerCase()}`)}
                          className="mt-6 inline-flex w-full items-center justify-between gap-2.5 rounded-full bg-white py-3 pl-6 pr-3 text-[15px] font-bold text-sea active:scale-[0.98]"
                        >
                          {items[i].cta}
                          <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-sea/12">
                            <RiArrowRightUpLine size={15} />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
