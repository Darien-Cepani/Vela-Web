import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { scrollToId } from './smooth-scroll'
import { prefersReducedMotion } from './gsap'
import { splitLocale, withLocale, type Locale } from './locale'

/**
 * A router in forty lines.
 *
 * The site has exactly two route shapes — the landing page and
 * `/work/:slug` — and its measured bottleneck is already script evaluation on
 * mobile. Pulling in a routing library to match two patterns would add more
 * kilobytes to the exact thing that is slow, so this does the small part of
 * the job that is actually needed: History API, back/forward, modified-click
 * passthrough, and scroll reset.
 *
 * Paths here are always base-relative ('/', '/work/vela-shop'). The deploy
 * base (`/Vela-Web/` on Pages, `/` on vela.al) is added and stripped at the
 * edges so nothing else in the app has to know about it.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/**
 * Strip the deploy base AND the locale prefix, so the rest of the app only
 * ever deals with `/`, `/work`, `/work/:slug`. The locale is carried
 * separately and re-attached by `href` — nothing downstream has to remember
 * which language it is in to build a link.
 */
function toAppPath(pathname: string): string {
  const p = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname
  return splitLocale(p || '/').path
}

function toLocale(pathname: string): Locale {
  const p = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname
  return splitLocale(p || '/').locale
}

/**
 * Absolute href for an app path — what goes in the anchor, so links are real
 * links. Locale-aware: an internal link written as `/work/x` stays inside the
 * language the visitor is already reading.
 */
export function href(path: string, locale: Locale = currentLocale): string {
  return `${BASE}${withLocale(path, locale)}` || '/'
}

/* Read by `href`, which is called from render paths that have no hook access.
   Kept in sync by the provider below. */
let currentLocale: Locale = 'en'

type RouterValue = { path: string; locale: Locale; navigate: (to: string, forceLocale?: Locale) => void }

const RouterContext = createContext<RouterValue>({ path: '/', locale: 'en', navigate: () => {} })

export function useRouter() {
  return useContext(RouterContext)
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => toAppPath(window.location.pathname))
  const [locale, setLocale] = useState<Locale>(() => toLocale(window.location.pathname))
  currentLocale = locale

  useEffect(() => {
    const onPop = () => {
      setPath(toAppPath(window.location.pathname))
      setLocale(toLocale(window.location.pathname))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to: string, forceLocale?: Locale) => {
    // '/#work' means "go home, then to that section"
    const [rawPath, hash] = to.split('#')
    // `to` may carry a locale prefix (the language toggle passes '/sq/work/x').
    // Split it off: `path` state is always locale-free, and the locale travels
    // beside it. Storing '/sq/...' in `path` would make every route matcher
    // miss, which is exactly what happened before this.
    const { locale: fromPath, path: target } = splitLocale(rawPath || '/')
    /* A BARE path inherits the language the reader is already in.
       English is the unprefixed locale, so `/work/vatan` and "the English
       version of /work/vatan" are the same string: splitting the prefix off a
       bare path always answered "English", which quietly switched an Albanian
       reader back to English the moment they opened a case study. Only an
       explicit `/sq` prefix, or an explicit argument from the language toggle,
       is allowed to change it. */
    const nextLocale = forceLocale ?? (rawPath.startsWith('/sq') ? fromPath : currentLocale)
    const changed =
      target !== toAppPath(window.location.pathname) || nextLocale !== toLocale(window.location.pathname)

    if (changed) {
      window.history.pushState({}, '', `${BASE}${withLocale(target, nextLocale)}`)
      // A cross-document-style transition without the document swap. The API
      // snapshots the old frame, lets React commit, then cross-fades the two —
      // so a route change reads as one page moving rather than a hard cut.
      // Unsupported engines and reduced-motion callers just get the commit.
      const swap = () => {
        setPath(target)
        setLocale(nextLocale)
      }
      const vt = (document as Document & { startViewTransition?: (cb: () => void) => unknown })
        .startViewTransition
      if (vt && !prefersReducedMotion()) {
        // flushSync so React has painted the new route before the snapshot ends
        vt.call(document, () => flushSync(swap))
      } else {
        swap()
      }
    } else if (hash) {
      window.history.replaceState({}, '', `${BASE}${withLocale(target, nextLocale)}#${hash}`)
    }

    if (hash) {
      // two frames: let the destination mount and lay out before we aim at it
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (changed) window.scrollTo(0, 0)
          scrollToId(hash)
        }),
      )
    } else if (changed) {
      window.scrollTo(0, 0)
    }
  }, [])

  const value = useMemo(() => ({ path, locale, navigate }), [path, locale, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

/**
 * A real anchor that happens to route on the client: it has an href, so it is
 * middle-clickable, openable in a new tab, and crawlable.
 */
export function Link({
  to,
  children,
  className,
  ref,
  ...rest
}: { to: string; children: ReactNode; className?: string; ref?: React.Ref<HTMLAnchorElement> } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>) {
  const { navigate } = useRouter()
  return (
    <a
      ref={ref}
      href={href(to)}
      className={className}
      onClick={(e) => {
        // let the browser handle new-tab, new-window and non-primary clicks
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

/** `/work/vela-shop` → `vela-shop`; anything else → null. */
export function matchWork(path: string): string | null {
  const m = /^\/work\/([a-z0-9-]+)\/?$/i.exec(path)
  return m ? m[1].toLowerCase() : null
}

/** `/work` exactly — the searchable archive. */
export function isWorkIndex(path: string): boolean {
  return /^\/work\/?$/i.test(path)
}
