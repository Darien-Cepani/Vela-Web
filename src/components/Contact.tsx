import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { RiArrowRightUpLine } from '@remixicon/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { useIsDesktop } from '../lib/use-is-desktop'
import { Magnetic } from './Magnetic'
import { BlurText } from './BlurText'
import { Silk } from './Silk'
import markWhite from '../assets/brand/mark-white.svg'

export function Contact() {
  const { t } = useTranslation()
  const isDesktop = useIsDesktop()
  const root = useRef<HTMLElement>(null)

  // idle: the watermark sail drifts slowly, like the harbor at dusk
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.to('.contact-watermark', {
        y: -18,
        rotation: -3,
        duration: 5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    },
    { scope: root },
  )

  return (
    <section id="contact" ref={root} className="px-4 pt-24 sm:px-6 md:pt-40 lg:px-8">
      {/* double-bezel shell around the cyan field */}
      <div data-reveal className="mx-auto max-w-[1240px] rounded-[32px] border border-ink/10 bg-ink/[0.04] p-1.5 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="relative overflow-hidden rounded-[calc(32px-0.375rem)] bg-cyan px-6 py-16 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] sm:px-8 md:py-28">
          {/* silk flowing through the cyan field, desktop-only for mobile performance */}
          {isDesktop && <Silk className="absolute inset-0 h-full w-full" />}
          <img
            src={markWhite}
            alt=""
            aria-hidden
            className="contact-watermark pointer-events-none absolute -right-16 -bottom-20 w-[260px] opacity-15 md:w-[380px]"
          />
          <div className="relative">
            <BlurText className="text-4xl text-sea sm:text-5xl md:text-7xl">{t('contact.h2')}</BlurText>
            <p className="mx-auto mt-5 max-w-[40ch] text-lg font-bold text-sea/75 md:text-xl">{t('contact.sub')}</p>
            <div className="mt-9 flex justify-center md:mt-10" data-reveal>
              <Magnetic strength={0.25}>
                <a
                  href={`mailto:darien.cepani42@gmail.com?subject=${encodeURIComponent(t('contact.subject'))}`}
                  className="btn-sheen group flex items-center gap-3 rounded-full bg-sea py-4 pl-9 pr-4 text-lg font-bold text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                >
                  {t('nav.cta')}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                    <RiArrowRightUpLine size={18} />
                  </span>
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
