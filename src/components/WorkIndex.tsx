import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import { RiCloseLine, RiSearchLine } from '@remixicon/react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { PUBLISHED, ALL_TAGS } from '../content/projects'
import { ProjectCard } from './ProjectCard'

/**
 * The archive: every project, searchable and filterable.
 *
 * Filtering happens on a list held entirely in memory, so it is instant and
 * needs no loading state — the value of a filter is that the answer arrives
 * before you finish deciding you wanted it. Search reads the name, the kicker,
 * the summary and the tags, because people search for "the bakery one" as
 * readily as for a client's registered name.
 *
 * None of that appears until there is enough work to need it. A search field
 * and thirteen filter chips above five projects do not read as a well-equipped
 * archive; they read as a shop with one shelf and a directory in the doorway.
 * Below the threshold the page is simply the work, which is what a visitor came
 * for anyway.
 */
const TOOLS_FROM = 8
export function WorkIndex() {
  const { t, i18n } = useTranslation()
  const uid = useId()
  const root = useRef<HTMLElement>(null)
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState<string[]>([])
  // keeps typing smooth if the archive ever grows past a few dozen entries
  const q = useDeferredValue(query)

  useEffect(() => {
    const prev = document.title
    document.title = `${t('work.indexTitle')} · Vela`
    return () => {
      document.title = prev
    }
  }, [t, i18n.language])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return PUBLISHED.filter((p) => {
      if (tags.length && !tags.every((tag) => p.tags.includes(tag))) return false
      if (!needle) return true
      const key = `work.projects.${p.slug}`
      const haystack = [
        t(`${key}.name`),
        t(`${key}.kicker`),
        t(`${key}.summary`),
        p.year,
        ...p.tags,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [q, tags, t])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.wi-in',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'expo.out' },
      )
    },
    { scope: root, dependencies: [i18n.language] },
  )

  // results animate as a set whenever the filter changes, so the grid never
  // just blinks from one arrangement to another
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.wi-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.045, ease: 'expo.out' },
      )
    },
    { scope: root, dependencies: [q, tags.join(','), i18n.language], revertOnUpdate: true },
  )

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]))

  const clear = () => {
    setQuery('')
    setTags([])
  }
  const filtered = query.trim().length > 0 || tags.length > 0
  const showTools = PUBLISHED.length >= TOOLS_FROM

  return (
    <section ref={root} className="pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <p className="wi-in text-[13px] font-bold uppercase tracking-[0.22em] text-fade">{t('work.indexEyebrow')}</p>
        <h1 className="wi-in mt-4 max-w-[16ch] text-[clamp(2.4rem,7vw,4.5rem)] leading-[1.03]">
          {t('work.indexTitle')}
        </h1>
        {/* the strapline has to match what is actually on the page: promising a
            search box that is not rendered is worse than not mentioning it */}
        <p className="wi-in mt-5 max-w-[52ch] text-lg leading-relaxed text-soft">
          {t(showTools ? 'work.indexSubTools' : 'work.indexSub')}
        </p>

        {/* ── search and filters, once the archive is big enough to need them ── */}
        {showTools && (
        <>
        <div className="wi-in mt-10 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-[420px]">
            <label htmlFor={`${uid}-q`} className="sr-only-label">
              {t('work.searchLabel')}
            </label>
            <RiSearchLine
              size={18}
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fade"
            />
            <input
              id={`${uid}-q`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('work.searchPlaceholder')}
              className="w-full rounded-full border border-edge bg-surface-2/60 py-3.5 pl-11 pr-4 text-[15px] font-medium text-strong outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-fade focus-visible:border-cyan focus-visible:shadow-[0_0_0_3px_rgb(0_170_212/0.22)] dark:bg-white/[0.04]"
            />
          </div>
          <p aria-live="polite" className="text-[14px] font-bold text-fade">
            {t('work.resultCount', { count: results.length })}
          </p>
          {filtered && (
            <button
              onClick={clear}
              className="inline-flex items-center gap-1.5 self-start text-[14px] font-bold text-accent-ink transition-opacity duration-300 hover:opacity-75 md:ml-auto md:self-auto"
            >
              <RiCloseLine size={15} aria-hidden />
              {t('work.clear')}
            </button>
          )}
        </div>

        {/* ── filters ── */}
        <div className="wi-in mt-5 flex flex-wrap gap-2" role="group" aria-label={t('work.filterLabel')}>
          {ALL_TAGS.map((tag) => {
            const on = tags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 text-[13.5px] font-bold transition-[background-color,border-color,color] duration-300 ${
                  on
                    ? 'border-cyan bg-cyan text-sea'
                    : 'border-edge bg-surface-2/60 text-soft hover:border-cyan/60 hover:text-strong dark:bg-white/[0.04]'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
        </>
        )}
      </div>

      {/* the grid runs the full width, like the section on the landing page */}
      <div className="mx-auto mt-10 w-full max-w-[1400px] px-5 sm:px-6 md:mt-12 lg:px-8">
        {results.length > 0 ? (
          /* The first card spans, and so does a trailing odd one, so the grid
             is never left with a stranded card at a different width. */
          <div className="grid gap-5 md:grid-cols-2">
            {results.map((p, i) => {
              const span = i === 0 || (i === results.length - 1 && results.length % 2 === 0)
              return (
                <div key={p.slug} className={`wi-card${span ? ' md:col-span-2' : ''}`}>
                  <ProjectCard project={p} size="lead" headingLevel="h2" />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-[1240px] rounded-[22px] border border-dashed border-edge px-6 py-16 text-center">
            <p className="font-display text-2xl font-semibold text-strong">{t('work.emptyTitle')}</p>
            <p className="mx-auto mt-3 max-w-[40ch] leading-relaxed text-soft">{t('work.emptyBody')}</p>
            <button
              onClick={clear}
              className="mt-6 rounded-full bg-cyan px-6 py-3 text-[15px] font-bold text-sea transition-transform duration-300 hover:scale-[1.03]"
            >
              {t('work.clear')}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
