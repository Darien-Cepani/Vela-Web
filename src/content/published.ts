/**
 * The slugs the site is allowed to publish, and the single source of truth for
 * it.
 *
 * This lives apart from `projects.ts` on purpose: that module imports SVG
 * assets, which the Vite config cannot load when it generates the static
 * routes and the sitemap at build time. Both sides import this instead, so a
 * project cannot be visible in one place and hidden in the other — which is
 * exactly how an unfinished project ends up with an indexable page nobody
 * meant to ship.
 *
 * Adding a slug here publishes it: it appears in the portfolio, the archive,
 * the sitemap and gets its own static page in both languages. Removing it
 * takes all of that away in one edit.
 */
export const PUBLISHED_SLUGS = ['vela-shop', 'vela-al', 'poal', 'vatan', 'ddm'] as const

export type PublishedSlug = (typeof PUBLISHED_SLUGS)[number]

export function isPublished(slug: string): boolean {
  return (PUBLISHED_SLUGS as readonly string[]).includes(slug)
}
