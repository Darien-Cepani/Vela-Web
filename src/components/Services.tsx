import { useTranslation } from 'react-i18next'
import {
  RiPenNibLine,
  RiMovie2Line,
  RiGlobalLine,
  RiCodeSSlashLine,
  RiStore2Line,
  RiArticleLine,
} from '@remixicon/react'
import { Spotlight } from './Spotlight'
import { BlurText } from './BlurText'
import markWhite from '../assets/brand/mark-white.svg'

const ICON_CLS =
  'transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1'

/**
 * Bento: 6 services, 6 cells (row 1: 7+5, row 2: 4+4+4, row 3: 12) - dense, zero voids.
 * Three cells carry brand image-direction art (deep water, duotone halftone, coastal light).
 */
export function Services() {
  const { t } = useTranslation()

  return (
    <section id="services" className="pt-24 md:pt-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <BlurText className="max-w-[20ch] text-3xl sm:text-5xl md:text-6xl">
          {t('services.h2pre')}<span className="text-accent-ink">{t('services.h2accent')}</span>.
        </BlurText>

        <div className="mt-12 grid grid-flow-dense grid-cols-1 gap-5 md:mt-14 md:grid-cols-12">
          {/* E-commerce: deep-water art cell (deep sea in both themes) */}
          <Spotlight
            data-reveal
            className="rounded-[22px] border border-line-dark p-7 md:col-span-7 md:p-10"
            style={{
              background:
                'radial-gradient(900px 420px at 85% -10%, rgb(0 170 212 / 0.34), transparent 60%), linear-gradient(170deg, #0B303C 0%, #071E26 72%)',
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12] [background:repeating-linear-gradient(0deg,transparent_0_54px,#12404e_54px_55px)]"
            />
            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]"><RiStore2Line size={26} className={`text-cyan ${ICON_CLS}`} /></span>
              <h3 className="mt-8 text-2xl text-white md:mt-16 md:text-3xl">{t('services.ecom.t')}</h3>
              <p className="mt-3 max-w-[46ch] text-mist">{t('services.ecom.b')}</p>
            </div>
            <img
              src={markWhite}
              alt=""
              aria-hidden
              className="absolute -right-8 -bottom-10 w-44 opacity-[0.08] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
            />
          </Spotlight>

          <Spotlight data-reveal data-reveal-delay="0.08" className="glass-refract rounded-[22px] border border-hair bg-surface-2/70 p-7 shadow-card md:col-span-5 md:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-cyan/10 dark:bg-white/[0.06]"><RiGlobalLine size={26} className={`text-accent-ink ${ICON_CLS}`} /></span>
            <h3 className="mt-8 text-2xl md:mt-16 md:text-3xl">{t('services.web.t')}</h3>
            <p className="mt-3 text-soft">{t('services.web.b')}</p>
          </Spotlight>

          {/* Graphic design: duotone halftone art cell */}
          <Spotlight
            data-reveal
            color="rgb(255 255 255 / 0.16)"
            className="rounded-[22px] border border-line-dark p-7 md:col-span-6 lg:col-span-4"
            style={{ background: 'linear-gradient(160deg, #00AAD4 0%, #0B303C 78%)' }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-25 [background:radial-gradient(circle,rgb(7_30_38/0.5)_1.6px,transparent_1.7px)] [background-size:14px_14px]"
            />
            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/15 shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]"><RiPenNibLine size={26} className={`text-white ${ICON_CLS}`} /></span>
              <h3 className="mt-8 text-2xl text-white md:mt-12">{t('services.design.t')}</h3>
              <p className="mt-3 text-white/85">{t('services.design.b')}</p>
            </div>
          </Spotlight>

          <Spotlight data-reveal data-reveal-delay="0.07" className="glass-refract rounded-[22px] border border-hair bg-surface-2/70 p-7 shadow-card md:col-span-6 lg:col-span-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-cyan/10 dark:bg-white/[0.06]"><RiMovie2Line size={26} className={`text-accent-ink ${ICON_CLS}`} /></span>
            <h3 className="mt-8 text-2xl md:mt-12">{t('services.content.t')}</h3>
            <p className="mt-3 text-soft">{t('services.content.b')}</p>
          </Spotlight>

          {/* Web apps: coastal-light art cell (always light, ink text) */}
          <Spotlight
            data-reveal
            data-reveal-delay="0.14"
            color="rgb(0 170 212 / 0.18)"
            className="rounded-[22px] border border-hair p-7 md:col-span-12 lg:col-span-4"
            style={{ background: 'linear-gradient(180deg, #DFF0F6 0%, #F4F7F8 60%, #CFE4EC 100%)' }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-cyan/10"><RiCodeSSlashLine size={26} className={`text-cyan-text ${ICON_CLS}`} /></span>
            <h3 className="mt-8 text-2xl text-ink md:mt-12">{t('services.apps.t')}</h3>
            <p className="mt-3 text-muted">{t('services.apps.b')}</p>
          </Spotlight>

          <Spotlight
            data-reveal
            className="glass-refract rounded-[22px] border border-hair bg-surface-2/70 p-7 shadow-card md:col-span-12 md:flex md:items-end md:justify-between md:p-10"
          >
            <div className="max-w-[52ch]">
              <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-cyan/10 dark:bg-white/[0.06]"><RiArticleLine size={26} className={`text-accent-ink ${ICON_CLS}`} /></span>
              <h3 className="mt-8 text-2xl md:mt-12 md:text-3xl">{t('services.blog.t')}</h3>
              <p className="mt-3 text-soft">{t('services.blog.b')}</p>
            </div>
            <p className="mt-8 font-display text-xl text-fade md:mt-0 md:text-2xl">
              {t('services.taglinePre')}
              <span className="text-accent-ink">{t('services.taglineAccent')}</span>
              {t('services.taglinePost')}
            </p>
          </Spotlight>
        </div>
      </div>
    </section>
  )
}
