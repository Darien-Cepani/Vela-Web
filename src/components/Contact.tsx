import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { RiArrowRightUpLine, RiCheckLine, RiMailLine } from '@remixicon/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { useCanAfford } from '../lib/use-is-desktop'
import { CONTACT_EMAIL } from '../lib/site'
import { openContact } from '../lib/contact-modal'
import { Magnetic } from './Magnetic'
import { BlurText } from './BlurText'
import { Silk } from './Silk'
import markWhite from '../assets/brand/mark-white.svg'

/**
 * The closing argument. The form itself lives in the dialog (ContactModal) —
 * this panel's job is to make the click worth making: the ask, the three
 * things that remove risk from it, and one unmissable button.
 */
export function Contact() {
  const { t } = useTranslation()
  const canAfford = useCanAfford()
  const root = useRef<HTMLElement>(null)

  // idle: the watermark sail drifts slowly, like the harbor at dusk
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.to('.contact-watermark', { y: -18, rotation: -3, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    },
    { scope: root },
  )

  return (
    <section id="contact" ref={root} className="px-4 pt-24 sm:px-6 md:pt-40 lg:px-8">
      {/* double-bezel shell around the cyan field */}
      <div
        data-reveal
        className="mx-auto max-w-[1240px] rounded-[32px] border border-ink/10 bg-ink/[0.04] p-1.5 dark:border-white/10 dark:bg-white/[0.03]"
      >
        {/* id is the nav's cue to go solid: the pill is unreadable over this
            field, and the section box (160px of top padding) is not the field */}
        <div
          id="contact-panel"
          className="relative overflow-hidden rounded-[calc(32px-0.375rem)] bg-cyan px-6 py-16 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] sm:px-10 md:py-24 lg:px-16"
        >
          {/* silk flowing through the cyan field, desktop-only for mobile performance */}
          {canAfford && <Silk className="absolute inset-0 h-full w-full" />}
          <img
            src={markWhite}
            alt=""
            aria-hidden
            className="contact-watermark pointer-events-none absolute -right-16 -bottom-20 w-[260px] opacity-15 md:w-[380px]"
          />

          <div className="relative mx-auto max-w-[52ch]">
            <BlurText className="text-3xl leading-[1.05] text-sea sm:text-5xl md:text-6xl">
              {t('contact.h2')}
            </BlurText>
            {/* sea/75 measured 4.09:1 on cyan and failed AA; full sea is 8.3:1 */}
            <p className="mx-auto mt-5 max-w-[40ch] text-base font-bold text-sea md:text-lg">{t('contact.sub')}</p>

            <div className="mt-9 flex justify-center" data-reveal>
              <Magnetic strength={0.25}>
                <button
                  onClick={() => openContact('contact-panel')}
                  className="btn-sheen group flex items-center gap-3 rounded-full bg-sea py-4 pl-9 pr-4 text-lg font-bold text-white shadow-[0_18px_45px_rgb(4_24_31/0.35)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                >
                  {t('nav.cta')}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                    <RiArrowRightUpLine size={18} aria-hidden />
                  </span>
                </button>
              </Magnetic>
            </div>

            <ul className="mx-auto mt-10 flex max-w-[46ch] flex-col items-start gap-2.5 text-left sm:mt-11">
              {(t('contact.assurances', { returnObjects: true }) as string[]).map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[14.5px] font-bold text-sea">
                  <RiCheckLine size={18} aria-hidden className="mt-px shrink-0 text-sea-2" />
                  {line}
                </li>
              ))}
            </ul>

            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('contact.subject'))}`}
              className="mt-8 inline-flex items-center gap-2 border-b border-sea/35 py-2.5 text-[15px] font-bold text-sea transition-colors duration-300 hover:border-sea"
            >
              <RiMailLine size={17} aria-hidden />
              {t('contact.orEmail')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
