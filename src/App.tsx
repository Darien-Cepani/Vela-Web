import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, prefersReducedMotion } from './lib/gsap'
import { useSmoothScroll } from './lib/smooth-scroll'
import { useIsDesktop } from './lib/use-is-desktop'
import { Splash } from './components/Splash'
import { VoyageLine } from './components/VoyageLine'
import { ClickSpark } from './components/ClickSpark'
import { ClickRipple } from './components/ClickRipple'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Meaning } from './components/Meaning'
import { Products } from './components/Products'
import { Services } from './components/Services'
import { Process } from './components/Process'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { glassDisplacementMap } from './lib/glass-map'

gsap.registerPlugin(useGSAP)

export default function App() {
  useSmoothScroll()
  const { i18n } = useTranslation()
  const root = useRef<HTMLDivElement>(null)
  // the voyage line is desktop/tablet depth; on phones it just runs under text
  const showVoyage = useIsDesktop('(min-width: 768px)')

  // global scroll-reveal for [data-reveal] elements; re-registers after a language remount
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: parseFloat(el.dataset.revealDelay ?? '0'),
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 86%', once: true },
          },
        )
      })
      ScrollTrigger.refresh()
    },
    { scope: root, dependencies: [i18n.language], revertOnUpdate: true },
  )

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
        {showVoyage && <VoyageLine />}
        <ClickSpark />
        <ClickRipple />
        <Nav />
        {/* key remount on language switch rebuilds split text + scroll triggers cleanly */}
        <main key={i18n.language} className="relative">
          <Hero />
          <Marquee />
          <Meaning />
          <Products />
          <Services />
          <Process />
          <Contact />
        </main>
      </div>
      <Footer />
    </div>
  )
}
