/**
 * Language lives in the URL, not in localStorage.
 *
 * It used to live only in localStorage, which meant the whole site had exactly
 * one address. The Albanian copy — for an Albanian studio selling to Albanian
 * businesses — had no URL of its own, so Google had nothing to index and no
 * assistant could ever quote it. One page cannot rank in two languages.
 *
 * So: `/` and `/work/vela-shop` are English, `/sq/` and `/sq/work/vela-shop`
 * are Albanian, each with its own canonical and a hreflang pair pointing at
 * the other. localStorage still remembers a returning visitor's preference,
 * but only to redirect them once on the bare root — the URL always wins, or
 * the same address would serve two languages and neither would rank.
 */
export const LOCALES = ['en', 'sq'] as const
export type Locale = (typeof LOCALES)[number]

/** English is unprefixed: it is the default, and x-default points at it. */
export const DEFAULT_LOCALE: Locale = 'en'

/** The URL segment for a locale — '' for the default, '/sq' otherwise. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`
}

/** `/sq/work/x` → `{ locale: 'sq', path: '/work/x' }`. Base already stripped. */
export function splitLocale(path: string): { locale: Locale; path: string } {
  const m = /^\/(sq)(?=\/|$)/.exec(path)
  if (!m) return { locale: DEFAULT_LOCALE, path: path || '/' }
  const rest = path.slice(m[0].length)
  return { locale: m[1] as Locale, path: rest || '/' }
}

/** `('/work/x', 'sq')` → `/sq/work/x`. */
export function withLocale(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  const prefixed = `${localePrefix(locale)}${clean}`
  // '/sq/' and '/' both normalise to no trailing slash except at the root
  return prefixed.length > 1 ? prefixed.replace(/\/$/, '') : '/'
}

/**
 * The language for this page load. The URL is authoritative; the stored
 * preference is a fallback only for the bare root, where no locale is implied.
 */
export function initialLocale(pathname: string, base = ''): Locale {
  const stripped = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  const { locale, path } = splitLocale(stripped || '/')
  if (locale !== DEFAULT_LOCALE) return locale
  if (path === '/') {
    try {
      const saved = localStorage.getItem('vela-lang')
      if (saved && (LOCALES as readonly string[]).includes(saved)) return saved as Locale
    } catch {
      /* private mode; fall through to the default */
    }
  }
  return DEFAULT_LOCALE
}
