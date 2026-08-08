import markShop from '../assets/brand/mark-shop.svg'
import markCyan from '../assets/brand/mark-cyan.svg'
import logoVatan from '../assets/logos/vatan.svg'
import logoDdm from '../assets/logos/ddm.svg'
import logoPoal from '../assets/logos/poal.png'
import { isPublished } from './published'

/**
 * The portfolio.
 *
 * Structure lives here; every word lives in `src/i18n.ts` under
 * `work.projects.<slug>`, the same split the Products section uses, so both
 * languages stay in one place.
 *
 * ────────────────────────────────────────────────────────────────────────
 * ADDING A CLIENT PROJECT
 *
 *  1. Add an entry below with a new `slug` (it becomes the URL: /work/<slug>).
 *  2. Add the matching copy block to BOTH `en` and `sq` in src/i18n.ts:
 *
 *       'my-slug': {
 *         name: 'Client name',
 *         kicker: 'What it is, in four words',
 *         summary: 'Two sentences a stranger can understand.',
 *         brief: 'What they came to us with.',
 *         did: [{ t: 'Heading', b: 'What we actually did.' }, …],
 *         outcome: ['What shipped.', 'What changed.', …],
 *       },
 *
 *  3. Drop the visual in `public/work/` and set
 *       cover: { src: '/work/my-slug.jpg' }                      // screenshot, mockup
 *       cover: { src: '/work/my-logo.svg', fit: 'contain', pad: '#101820' }  // logo, board
 *       coverVideo: '/work/my-slug.mp4'                          // motion work
 *     Without one the band renders a branded panel instead, which is honest —
 *     better an intentional brand panel than a mocked-up fake screenshot.
 *
 *  `name` is what shows on the closed band, so for client work it is the
 *  client's name, not the project's internal title.
 *
 * Only put real work here. An invented client, an invented quote or an
 * invented number on a public agency site is the kind of thing that costs an
 * agency the account it was meant to win.
 * ────────────────────────────────────────────────────────────────────────
 */
export type Project = {
  /** URL segment and i18n key */
  slug: string
  /** shown as the small meta line on the card */
  year: string
  /** drives the cover wash and the accent on the case-study page */
  accent: string
  wash: string
  /** optional brand mark shown on the generated cover */
  mark?: string
  /**
   * The client's real logo, shown as a chip on the card.
   *
   * Rendered in flat white rather than in brand colour: these sit on top of a
   * screenshot, where a coloured logo lands on whatever pixels happen to be
   * underneath it. A white lockup on a dark scrim is what a brand's own
   * guidelines would ask for in this position, and it keeps five different
   * marks looking like one set.
   */
  logo?: string
  /**
   * True when `logo` spells the client's name out.
   *
   * A wordmark stands in for the name on the card; a symbol cannot, so it sits
   * beside the name instead. VATAN's lockup next to the word "VATAN" reads as a
   * mistake, and the Vela Shop sail on its own tells nobody what they are
   * looking at — the two cases need opposite treatment.
   */
  logoWordmark?: boolean
  /**
   * The scrim colour under the caption, as an `r g b` triple.
   *
   * The card darkens toward the foot so white type has something to sit on.
   * Doing that in one neutral near-black for every project made a warm brand
   * like VATAN and a cream one like DDM fade into the same cold blue-grey, so
   * each fades into a near-black mixed from its own palette instead.
   */
  ink?: string
  /**
   * The band's visual. Anything that shows the work: a site screenshot (desktop
   * or phone), a logo lockup, a design board, a mockup, a frame from a content
   * pack. Put files in `public/work/`.
   *
   *   fit: 'cover'   fills the band — screenshots, mockups, photography
   *   fit: 'contain' sits inside it on `pad` — logos, design boards, anything
   *                  that must not be cropped
   */
  cover?: { src: string; fit?: 'cover' | 'contain'; pad?: string; alt?: string }
  /**
   * Motion work: a muted loop that plays while the band is hovered or focused
   * and is otherwise never fetched. `cover` stays as the still behind it.
   *
   * This is the Remotion film — a titled, captioned piece cut from the real
   * screenshots — rather than a raw screen recording. A recording shows what
   * the thing looks like; the film says what it does, which is what a
   * portfolio card has three seconds to communicate.
   */
  coverVideo?: string
  /**
   * True when the film exists in both languages as `<stem>-en.mp4` and
   * `<stem>-sq.mp4`. The film carries spoken-language captions, so an Albanian
   * visitor being shown the English cut is the same defect as an untranslated
   * paragraph, only harder to notice.
   */
  filmPerLanguage?: boolean
  /** the unnarrated screen recording, kept for the case-study body */
  screenVideo?: string
  /** short labels: what the work involved */
  tags: string[]
  /** live URL, if the work is public */
  url?: string
  /**
   * What state the work is actually in.
   *
   *   live     public on the open web; the card offers a link to visit it
   *   private  finished and in daily use, but not on the open web
   *   wip      still being built
   *
   * `private` exists because the alternative was labelling finished client
   * work as unfinished. Porsche Albania runs on screens inside the showroom
   * and DDM is built but not yet deployed to its domain: calling either one
   * "in progress" on a public portfolio would be untrue.
   */
  status?: 'live' | 'private' | 'wip'
  /** true while it is still in build — the card says so instead of implying it shipped */
  inProgress?: boolean
  /**
   * Whether this is finished enough to show is NOT set here — it comes from
   * PUBLISHED_SLUGS in ./published, which the build also reads. Keeping it in
   * one place is what stops a hidden project keeping an indexable page.
   */
  /** the four you most want seen: these lead the section at full size */
  pinned?: boolean
  /**
   * An empty slot standing in for work not yet published. Renders a visible
   * badge and placeholder copy — never let one of these masquerade as a real
   * project. Delete them as real work replaces them.
   */
  placeholder?: boolean
}

export const PROJECTS: Project[] = [
  {
    slug: 'vela-shop',
    status: 'wip',
    logo: markShop,
    /* the product's own wine-red gradient, which deliberately echoes
       Instagram's without being it */
    ink: '26 8 16',
    year: '2026',
    accent: '#C81E3C',
    wash: 'radial-gradient(720px 520px at 68% 18%, rgb(200 30 60 / 0.58), transparent 68%), radial-gradient(620px 460px at 98% 88%, rgb(250 204 21 / 0.42), transparent 72%), linear-gradient(150deg,#1c0d14,#071E26 78%)',
    mark: markShop,
    cover: { src: '/work/vela-shop.webp', alt: 'The Vela Shop landing page: turn an Instagram feed into a shop.' },
    coverVideo: '/work/vela-shop-film',
    filmPerLanguage: true,
    screenVideo: '/work/vela-shop.webm',
    tags: ['E-commerce', 'Product design', 'Platform'],
    pinned: true,
  },
  {
    slug: 'vela-al',
    status: 'live',
    logo: markCyan,
    ink: '3 12 16',
    year: '2026',
    accent: '#00AAD4',
    wash: 'radial-gradient(720px 520px at 68% 18%, rgb(0 190 235 / 0.55), transparent 68%), radial-gradient(620px 460px at 98% 88%, rgb(0 125 156 / 0.5), transparent 72%), linear-gradient(150deg,#0B303C,#071E26 78%)',
    mark: markCyan,
    cover: { src: '/work/vela-al.webp', alt: 'The Vela Agency site: bilingual, adaptive, built to argue its own case.' },
    coverVideo: '/work/vela-al-film',
    filmPerLanguage: true,
    screenVideo: '/work/vela-al.webm',
    tags: ['Brand', 'Website', 'Motion'],
    url: 'https://vela.al/',
    pinned: true,
  },

  {
    slug: 'dentalspace',
    year: '2025',
    accent: '#0E9F8F',
    wash: 'radial-gradient(720px 520px at 68% 18%, rgb(14 159 143 / 0.5), transparent 68%), radial-gradient(620px 460px at 98% 88%, rgb(6 95 90 / 0.45), transparent 72%), linear-gradient(150deg,#08262b,#071E26 78%)',
    cover: { src: '/work/dentalspace.webp', alt: 'The dentalspace dashboard: appointments, chair utilisation and collections.' },
    coverVideo: '/work/dentalspace.webm',
    tags: ['Web app', 'Product design', 'Healthcare'],
    pinned: true,
  },
  {
    slug: 'usta-al',
    year: '2025',
    accent: '#2B4EE6',
    wash: 'radial-gradient(720px 520px at 68% 18%, rgb(43 78 230 / 0.5), transparent 68%), radial-gradient(620px 460px at 98% 88%, rgb(20 40 140 / 0.45), transparent 72%), linear-gradient(150deg,#0a1830,#071E26 78%)',
    cover: { src: '/work/usta-al.webp', alt: 'Usta.al: the marketplace that matches tradespeople with jobs.' },
    coverVideo: '/work/usta-al.webm',
    tags: ['Marketplace', 'Web app', 'Mobile'],
    inProgress: true,
    pinned: true,
  },
  {
    slug: 'vatan',
    status: 'live',
    logoWordmark: true,
    logo: logoVatan,
    ink: '15 9 9',
    year: '2026',
    accent: '#C8A24A',
    wash: 'radial-gradient(720px 520px at 68% 18%, rgb(200 162 74 / 0.42), transparent 68%), radial-gradient(620px 460px at 98% 88%, rgb(120 92 30 / 0.4), transparent 72%), linear-gradient(150deg,#171208,#071E26 82%)',
    cover: { src: '/work/vatan.webp', alt: 'VATAN: an Albanian beer brand site behind an age gate.' },
    coverVideo: '/work/vatan-film',
    filmPerLanguage: true,
    screenVideo: '/work/vatan.webm',
    tags: ['Brand site', 'CMS', 'Bilingual'],
    url: 'https://vatan.al/',
    pinned: true,
  },
  {
    slug: 'florist-system',
    year: '2026',
    accent: '#C9789B',
    wash: 'radial-gradient(720px 520px at 68% 18%, rgb(201 120 155 / 0.48), transparent 68%), radial-gradient(620px 460px at 98% 88%, rgb(120 60 140 / 0.42), transparent 72%), linear-gradient(150deg,#1d1220,#071E26 80%)',
    cover: { src: '/work/florist-system.webp', alt: 'One of five themed florist storefronts built from a shared system.' },
    coverVideo: '/work/florist-system.webm',
    tags: ['E-commerce', 'Design system', 'Albanian'],
  },
  {
    slug: 'ddm',
    status: 'wip',
    logoWordmark: true,
    logo: logoDdm,
    ink: '14 18 9',
    year: '2026',
    /* Cream and lime. The blue that used to be here belonged to no part of
       this brand — it was a placeholder that outlived its purpose. */
    accent: '#A8CF3A',
    wash: 'radial-gradient(720px 520px at 68% 18%, rgb(168 207 58 / 0.34), transparent 68%), radial-gradient(620px 460px at 98% 88%, rgb(120 150 40 / 0.30), transparent 72%), linear-gradient(150deg,#131a0d,#071E26 82%)',
    cover: { src: '/work/ddm.webp', alt: 'DDM — Do Digital Media: agency site.' },
    coverVideo: '/work/ddm-film',
    filmPerLanguage: true,
    screenVideo: '/work/ddm.webm',
    tags: ['Website', 'Brand', 'Marketing'],
    pinned: true,
  },
  {
    slug: 'poal',
    status: 'private',
    logoWordmark: true,
    logo: logoPoal,
    ink: '13 9 6',
    year: '2025',
    accent: '#E4681F',
    wash: 'radial-gradient(720px 520px at 68% 18%, rgb(228 104 31 / 0.42), transparent 68%), linear-gradient(150deg,#171008,#071E26 82%)',
    cover: { src: '/work/poal.webp', alt: 'Porsche Albania: an in-showroom feedback kiosk with a game layer.' },
    coverVideo: '/work/poal-film',
    filmPerLanguage: true,
    screenVideo: '/work/poal.webm',
    tags: ['Web app', 'Gamification', 'Automotive'],
    /* In daily use, but it runs on screens inside the showroom rather than on
       the open web — so there is deliberately no link to visit. */
    pinned: true,
  },
  {
    slug: 'csviewer',
    year: '2024',
    accent: '#4F86C6',
    wash: 'radial-gradient(720px 520px at 68% 18%, rgb(79 134 198 / 0.42), transparent 68%), linear-gradient(150deg,#0b1a2a,#071E26 82%)',
    cover: { src: '/work/csviewer.webp', alt: 'CSViewer: a data tool built for AlpineEdge.' },
    coverVideo: '/work/csviewer.webm',
    tags: ['Web app', 'Data', 'Internal tool'],
  },
  {
    slug: 'balla-pension',
    year: '2025',
    accent: '#B08A54',
    wash: 'radial-gradient(720px 520px at 68% 18%, rgb(176 138 84 / 0.42), transparent 68%), linear-gradient(150deg,#1a1610,#071E26 82%)',
    cover: { src: '/work/balla-pension.webp', alt: 'Balla Pension: a guesthouse site.' },
    coverVideo: '/work/balla-pension.webm',
    tags: ['Website', 'Hospitality'],
  },
]

/** Look up one project by slug — used by the case-study route. */
/**
 * Look up one project by slug — used by the case-study route. Unpublished work
 * is not found, so a hidden project 404s rather than rendering a page with no
 * copy behind it.
 */
export function findProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug && isPublished(p.slug))
}

/**
 * What the site is allowed to show. Everything downstream — the portfolio
 * rows, the marquee, the archive, the tag filter, the sitemap and the static
 * routes — reads this rather than PROJECTS, so hiding a project is one flag
 * and never a half-removal that leaves an orphan page behind.
 */
export const PUBLISHED = PROJECTS.filter((p) => isPublished(p.slug))

/**
 * What the landing page's work section shows.
 *
 * Below this many published projects the section simply shows all of them and
 * the "see all" link hides itself, because a link to an archive identical to
 * the thing you are already looking at is a dead end. Above it, the section
 * becomes an excerpt and the archive earns its place.
 */
export const FEATURE_LIMIT = 5
export const FEATURED = PUBLISHED.slice(0, FEATURE_LIMIT)

export const PINNED = PUBLISHED.filter((p) => p.pinned).slice(0, 4)
export const SECONDARY = PUBLISHED.filter((p) => !PINNED.includes(p)).slice(0, 4)
export const OVERFLOW = PUBLISHED.filter((p) => !PINNED.includes(p) && !SECONDARY.includes(p))

/** every distinct tag, for the filter row on the portfolio page */
export const ALL_TAGS = [...new Set(PUBLISHED.flatMap((p) => p.tags))].sort()
