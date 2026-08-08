import { useTranslation } from 'react-i18next'
import { RiArrowRightUpLine } from '@remixicon/react'
import { openContact } from '../lib/contact-modal'
import { BlurText } from './BlurText'

/**
 * The last five doubts, answered before the ask.
 *
 * Placed between the process and the CTA because that is where enquiries are
 * lost — not to disagreement, but to an unanswered "yes, but…". Answers are
 * open rather than collapsed: there are only five, each is one or two lines,
 * and a question a visitor has to click to read is one they will not read.
 *
 * Marked up as a description list, which is what a Q&A actually is, and
 * mirrored in FAQPage structured data in index.html — keep the two in sync.
 */
export function Questions() {
  const { t } = useTranslation()
  const items = t('questions.items', { returnObjects: true }) as Array<{ q: string; a: string }>

  return (
    <section id="questions" className="pt-24 md:pt-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* sticky so the ask stays with the reader for the whole list */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-fade">
                {t('questions.eyebrow')}
              </p>
              <BlurText className="mt-4 max-w-[14ch] text-3xl sm:text-5xl md:text-6xl">
                {t('questions.h2pre')}<span className="text-accent-ink">{t('questions.h2accent')}</span>.
              </BlurText>
              <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-soft md:text-lg" data-reveal>
                {t('questions.sub')}
              </p>
            </div>
          </div>

          <dl className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:col-span-7 lg:mt-0 lg:gap-y-10">
            {items.map((item) => (
              <div key={item.q} data-reveal>
                <dt className="font-display text-lg font-semibold leading-snug text-strong md:text-xl">
                  {item.q}
                </dt>
                <dd className="mt-2.5 text-[15px] leading-relaxed text-soft">{item.a}</dd>
              </div>
            ))}

            {/* An odd number of answers leaves one cell empty; the invitation to
                ask a sixth belongs exactly there — at the end of the reading,
                not stranded above it. It stays a dt/dd pair because a <dl> may
                only contain those. */}
            <div data-reveal className="sm:self-start">
              <dt className="font-display text-lg font-semibold leading-snug text-strong md:text-xl">
                {t('questions.moreTitle')}
              </dt>
              <dd className="mt-4">
                <button
                  onClick={() => openContact('questions')}
                  className="group inline-flex items-center gap-2.5 rounded-full border border-edge bg-surface-2/60 py-3.5 pl-6 pr-3.5 text-[15px] font-bold text-strong transition-[color,border-color,background-color] duration-300 hover:border-cyan hover:text-accent-ink dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
                >
                  {t('questions.cta')}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan/15 text-accent-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <RiArrowRightUpLine size={15} aria-hidden />
                  </span>
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
