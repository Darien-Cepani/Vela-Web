import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { BlurText } from './BlurText'
import markCyan from '../assets/brand/mark-cyan.svg'

/** What Vela means: sticky title left, scrub-revealed manifesto, three pillar rows right. */
export function Meaning() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  const pillars = t('meaning.pillars', { returnObjects: true }) as Array<{
    word: string
    means: string
    body: string
  }>

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.manifesto-word',
        { opacity: 0.13 },
        {
          opacity: 1,
          stagger: 0.04,
          ease: 'none',
          scrollTrigger: {
            trigger: '.manifesto',
            start: 'top 74%',
            end: 'top 26%',
            scrub: true,
          },
        },
      )
    },
    { scope: root },
  )

  return (
    <section id="meaning" ref={root} className="pt-24 md:pt-40">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-14 px-5 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <img src={markCyan} alt="" aria-hidden className="h-12 w-auto" />
            <BlurText className="mt-7 text-3xl sm:text-5xl md:text-6xl">
              {t('meaning.titlePre')}<span className="text-accent-ink">{t('meaning.titleAccent')}</span>{t('meaning.titleEnd')}
            </BlurText>
            <p className="manifesto mt-7 max-w-[38ch] text-lg leading-relaxed text-strong md:text-2xl">
              {(t('meaning.manifesto') as string).split(' ').map((word, i) => (
                <span key={i} className="manifesto-word">{word} </span>
              ))}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          {pillars.map((p) => (
            <div
              key={p.word}
              data-reveal
              className="group relative border-t border-hair py-9 transition-colors duration-500 last:border-b hover:bg-ink/[0.03] dark:hover:bg-white/[0.02] md:py-12"
            >
              {/* course marker: a cyan bar that raises on hover */}
              <span
                aria-hidden
                className="absolute inset-y-8 left-0 w-[3px] origin-center scale-y-100 rounded-full bg-cyan transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:inset-y-10 lg:scale-y-0 lg:group-hover:scale-y-100"
              />
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 pl-5 pr-1 md:px-4">
                <h3 className="font-display text-2xl font-semibold transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-2 md:text-5xl">
                  {p.word}
                </h3>
                <span className="text-[15px] font-bold uppercase tracking-[0.18em] text-accent-ink">{p.means}</span>
              </div>
              <p className="mt-4 max-w-[52ch] pl-5 pr-1 text-base leading-relaxed text-soft md:px-4 md:text-lg">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
