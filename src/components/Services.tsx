import { useTranslation } from 'react-i18next'
import {
  RiPenNibLine,
  RiMovie2Line,
  RiGlobalLine,
  RiCodeSSlashLine,
  RiStore2Line,
  RiArticleLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { Spotlight } from './Spotlight'
import { BlurText } from './BlurText'
import markWhite from '../assets/brand/mark-white.svg'

/**
 * Six services, one grid, three weights.
 *
 * The old bento mixed permanently-dark cells with theme-following ones, so in
 * light mode half the grid looked like it had forgotten to switch. Every cell
 * now follows the theme; hierarchy comes from *weight* instead — one lead cell
 * in full brand cyan, one deep-sea feature, four quiet cells — so the grid
 * still has a focal point without three unrelated card treatments in a row.
 */

type Cell = {
  key: string
  icon: RemixiconComponentType
  /** lead = brand cyan, deep = deep-sea, quiet = follows the page surface */
  weight: 'lead' | 'deep' | 'quiet'
  span: string
}

/* The loudest cell sits at the grid's entry point and it is the flagship
   service, so the hierarchy the eye reads matches the hierarchy of the
   business. One lead, one deep anchor mid-grid, four quiet. */
const CELLS: Cell[] = [
  { key: 'ecom', icon: RiStore2Line, weight: 'lead', span: 'md:col-span-7' },
  { key: 'web', icon: RiGlobalLine, weight: 'quiet', span: 'md:col-span-5' },
  { key: 'design', icon: RiPenNibLine, weight: 'deep', span: 'md:col-span-6 lg:col-span-4' },
  { key: 'content', icon: RiMovie2Line, weight: 'quiet', span: 'md:col-span-6 lg:col-span-4' },
  { key: 'apps', icon: RiCodeSSlashLine, weight: 'quiet', span: 'md:col-span-12 lg:col-span-4' },
  { key: 'blog', icon: RiArticleLine, weight: 'quiet', span: 'md:col-span-12' },
]

/* The lead gradient bottoms out well below full-brightness cyan on purpose:
   white body copy on #00AAD4 measures 3.6:1 and fails AA, while the same copy
   on #00708F clears 5.6:1. The cell still reads as the brand colour. */
const SHELL: Record<Cell['weight'], string> = {
  lead: 'border-cyan-deep/50 bg-[linear-gradient(158deg,#0092B8_0%,#00708F_48%,#0B303C_100%)] text-white shadow-[0_20px_60px_rgb(0_125_156/0.28)]',
  deep: 'border-line-dark bg-[radial-gradient(880px_400px_at_88%_-12%,rgb(0_170_212/0.30),transparent_58%),linear-gradient(170deg,#0B303C_0%,#071E26_74%)] text-white shadow-[0_20px_60px_rgb(7_30_38/0.24)]',
  quiet: 'glass-refract border-hair bg-surface-2/70 shadow-card',
}

const TILE: Record<Cell['weight'], string> = {
  lead: 'bg-white/20 shadow-[inset_0_1px_0_rgb(255_255_255/0.3)] text-white',
  deep: 'bg-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] text-cyan',
  quiet: 'bg-cyan/10 dark:bg-white/[0.06] text-accent-ink',
}

const BODY: Record<Cell['weight'], string> = {
  lead: 'text-white',
  deep: 'text-mist',
  quiet: 'text-soft',
}

/* The base layer sets `color` directly on h1–h3, and a direct rule always
   beats a colour inherited from the card. Headings on the two dark cells must
   therefore state their own colour or they go dark-on-dark in light theme. */
const TITLE: Record<Cell['weight'], string> = {
  lead: 'text-white',
  deep: 'text-white',
  quiet: 'text-strong',
}

export function Services() {
  const { t } = useTranslation()

  return (
    <section id="services" className="pt-24 md:pt-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <BlurText className="max-w-[20ch] text-3xl sm:text-5xl md:text-6xl">
          {t('services.h2pre')}<span className="text-accent-ink">{t('services.h2accent')}</span>.
        </BlurText>

        <div className="mt-12 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-12">
          {CELLS.map((cell) => {
            const Icon = cell.icon
            const isBlog = cell.key === 'blog'
            return (
              <Spotlight
                key={cell.key}
                data-reveal
                color={cell.weight === 'lead' ? 'rgb(255 255 255 / 0.18)' : 'rgb(0 170 212 / 0.14)'}
                glare={cell.weight === 'quiet' ? 0.14 : 0.3}
                className={`flex flex-col rounded-[22px] border p-7 md:p-9 ${SHELL[cell.weight]} ${cell.span} ${
                  isBlog ? 'md:flex-row md:items-end md:justify-between md:gap-10' : ''
                }`}
              >
                {cell.weight === 'lead' && (
                  <>
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-[0.22] [background:radial-gradient(circle,rgb(7_30_38/0.55)_1.6px,transparent_1.7px)] [background-size:14px_14px]"
                    />
                    <img
                      src={markWhite}
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -bottom-12 w-48 opacity-[0.10] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
                    />
                  </>
                )}
                {cell.weight === 'deep' && (
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.14] [background:repeating-linear-gradient(0deg,transparent_0_54px,#12404e_54px_55px)]"
                  />
                )}

                <div className="relative flex max-w-[52ch] flex-col">
                  {/* icon and title sit together: the old mt-16 opened a hole in
                      the top half of every card that read as unfinished */}
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${TILE[cell.weight]}`}
                  >
                    <Icon
                      size={26}
                      aria-hidden
                      className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1"
                    />
                  </span>
                  <h3 className={`mt-6 text-2xl leading-tight md:text-[1.75rem] ${TITLE[cell.weight]}`}>
                    {t(`services.${cell.key}.t`)}
                  </h3>
                  <p className={`mt-3 leading-relaxed ${BODY[cell.weight]}`}>{t(`services.${cell.key}.b`)}</p>
                </div>

                {isBlog && (
                  <p className="relative mt-8 shrink-0 font-display text-xl leading-tight text-fade md:mt-0 md:max-w-[13ch] md:text-right md:text-2xl">
                    {t('services.taglinePre')}
                    <span className="text-accent-ink">{t('services.taglineAccent')}</span>
                    {t('services.taglinePost')}
                  </p>
                )}
              </Spotlight>
            )
          })}
        </div>
      </div>
    </section>
  )
}
