/**
 * Builds the crawlable text that ships inside index.html, plus /llms.txt.
 *
 * Why this exists
 * ---------------
 * The site is a client-rendered SPA, so the HTML a server returns contains an
 * empty `<div id="root">`. Googlebot renders JavaScript and therefore sees the
 * real page, but the crawlers behind the AI assistants largely do not:
 * GPTBot/OAI-SearchBot, ClaudeBot and PerplexityBot fetch HTML and read it.
 * Measured before this existed, the served page had **zero** words of visible
 * text. An assistant asked "who builds online stores in Tirana" had nothing of
 * ours to read, let alone cite.
 *
 * The fix is the oldest one in the SPA book: put real content inside `#root`.
 * React's `createRoot().render()` replaces the container's children on mount,
 * so a visitor never sees it for a frame longer than hydration, while a
 * non-JS crawler gets the whole page as semantic HTML. It is the same content
 * the app renders, drawn from the same `resources` object the UI reads, so it
 * cannot quietly drift out of sync with what users are shown — which is the
 * line between a legitimate fallback and cloaking.
 */
import { resources } from '../src/i18n-resources.js'
import { isPublished } from '../src/content/published.js'

type Lang = 'en' | 'sq'
/* eslint-disable @typescript-eslint/no-explicit-any */
const T = (lang: Lang) => resources[lang].translation as any

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Names of the three products, which live in the component rather than i18n. */
const PRODUCT_NAMES = ['Vela Shop', 'Vela Market', 'Vela Ads']

/** The homepage, as the semantic document it would be without JavaScript. */
export function fallbackHtml(lang: Lang = 'en'): string {
  const t = T(lang)
  const p: string[] = []
  const h2 = (s: any) => `${s.h2pre ?? ''}${s.h2accent ?? ''}`.trim()

  // The lead is the one part a visitor can briefly see, so it stays visible
  // and styled to stand in for the hero. It is also what Lighthouse picks as
  // the LCP element: painting it straight from HTML rather than waiting for
  // React lands LCP ~1.7s sooner on throttled mobile, measured. Everything
  // after it is clipped — it exists for crawlers, not for the half second
  // before hydration.
  p.push('<div class="sf-lead">')
  p.push(`<h1>${esc(t.hero.l1)} ${esc(t.hero.l2pre)}${esc(t.hero.l2accent)}.</h1>`)
  p.push(`<p>${esc(t.hero.sub)}</p>`)
  p.push('</div>')
  p.push('<div class="sf-rest">')
  p.push('<ul>')
  for (const it of t.hero.proof) p.push(`<li><strong>${esc(it.k)}</strong> — ${esc(it.v)}</li>`)
  p.push('</ul>')

  p.push(`<h2>${esc(t.meaning.titlePre)}${esc(t.meaning.titleAccent)}${esc(t.meaning.titleEnd ?? '')}</h2>`)
  p.push(`<p>${esc(t.meaning.manifesto)}</p>`)
  p.push(`<h3>${esc(t.meaning.whoTitle)}</h3><p>${esc(t.meaning.whoBody)}</p>`)
  p.push('<ul>')
  for (const pl of t.meaning.pillars) {
    p.push(`<li><strong>${esc(pl.word)} — ${esc(pl.means)}</strong> ${esc(pl.body)}</li>`)
  }
  p.push('</ul>')

  p.push(`<h2>${esc(h2(t.services))}</h2><ul>`)
  for (const k of ['ecom', 'web', 'design', 'content', 'apps', 'blog']) {
    const it = t.services[k]
    if (it) p.push(`<li><strong>${esc(it.t)}</strong> — ${esc(it.b)}</li>`)
  }
  p.push('</ul>')

  p.push(`<h2>${esc(h2(t.shift))}</h2><p>${esc(t.shift.sub)}</p><ul>`)
  for (const r of t.shift.rows) {
    p.push(`<li><strong>${esc(r.label)}: ${esc(r.claim)}</strong> ${esc(r.note)}</li>`)
  }
  p.push('</ul>')

  p.push(`<h2>${esc(h2(t.process))}</h2><p>${esc(t.process.sub)}</p><ol>`)
  for (const st of t.process.steps) {
    p.push(`<li><strong>${esc(st.verb)}</strong> — ${esc(st.body)} (${esc(st.yield)})</li>`)
  }
  p.push('</ol>')

  p.push(`<h2>${esc(h2(t.products))}</h2><p>${esc(t.products.sub)}</p>`)
  t.products.items.forEach((it: any, i: number) => {
    p.push(`<h3>${esc(PRODUCT_NAMES[i] ?? '')}</h3><p>${esc(it.claim)} ${esc(it.body)}</p>`)
    if (it.chips?.length) p.push(`<p>${it.chips.map((c: string) => esc(c)).join(' · ')}</p>`)
  })

  // the questions, as a definition list — the shape an answer engine can lift
  p.push(`<h2>${esc(h2(t.questions))}</h2><dl>`)
  for (const q of t.questions.items) p.push(`<dt>${esc(q.q)}</dt><dd>${esc(q.a)}</dd>`)
  p.push('</dl>')

  p.push(`<h2>${esc(t.contact.h2)}</h2><p>${esc(t.contact.sub)}</p>`)
  if (t.contact.assurances?.length) {
    p.push('<ul>')
    for (const a of t.contact.assurances) p.push(`<li>${esc(a)}</li>`)
    p.push('</ul>')
  }
  p.push('</div>')
  return p.join('\n')
}

/**
 * /llms.txt — the llmstxt.org convention: one plain-markdown file describing
 * what the site is, for assistants that would rather read a summary than crawl
 * a design-heavy page. Cheap to serve and unambiguous about the entity, which
 * matters here because "Vela" is also a constellation and a common Latin word.
 */
export function llmsTxt(): string {
  const en = T('en')
  const sq = T('sq')
  const L: string[] = []

  L.push('# Vela Agency')
  L.push('')
  L.push('> Development and marketing studio in Tirana, Albania. Online stores, websites, brand, content and advertising for Albanian businesses. Works in Albanian and English.')
  L.push('')
  L.push('Vela Agency is a development and marketing studio based in Tirana, Albania. The name is the Albanian word for a sail. It takes local businesses online — the shop, the site, the brand, the campaigns — and builds its own products on the same stack it builds for clients.')
  L.push('')
  L.push('- Name: Vela Agency')
  L.push('- Type: development and marketing studio (web development, e-commerce, branding, advertising)')
  L.push('- Location: Tirana, Albania. Serves Albania nationwide.')
  L.push('- Languages: Albanian (sq) and English (en)')
  L.push('- Website (English): https://vela.al/')
  L.push('- Website (Albanian / Shqip): https://vela.al/sq')
  L.push('')

  L.push('## Services')
  L.push('')
  for (const k of ['ecom', 'web', 'design', 'content', 'apps', 'blog']) {
    const it = en.services[k]
    if (it) L.push(`- **${it.t}** — ${it.b}`)
  }
  L.push('')

  L.push('## What each service changes for a client')
  L.push('')
  for (const r of en.shift.rows) L.push(`- **${r.label} — ${r.claim}** ${r.note}`)
  L.push('')

  L.push('## Products built by Vela')
  L.push('')
  en.products.items.forEach((it: any, i: number) => {
    L.push(`- **${PRODUCT_NAMES[i]}** — ${it.claim} ${it.body}`)
  })
  L.push('')

  L.push('## How a project runs')
  L.push('')
  en.process.steps.forEach((s: any, i: number) => {
    L.push(`${i + 1}. **${s.verb}** — ${s.body} Result: ${s.yield}.`)
  })
  L.push('')

  L.push('## Questions and answers')
  L.push('')
  for (const q of en.questions.items) {
    L.push(`### ${q.q}`)
    L.push('')
    L.push(q.a)
    L.push('')
  }

  L.push('## Në shqip (Albanian)')
  L.push('')
  L.push(sq.meaning.whoBody)
  L.push('')
  for (const k of ['ecom', 'web', 'design', 'content', 'apps', 'blog']) {
    const it = sq.services[k]
    if (it) L.push(`- **${it.t}** — ${it.b}`)
  }
  L.push('')

  L.push('## Contact')
  L.push('')
  L.push('- Website: https://vela.al/ (English) · https://vela.al/sq (Shqip)')
  L.push('- Enquiries: contact form at https://vela.al/')
  L.push('')
  return L.join('\n')
}

/** Real projects only. The placeholder slots must never reach a crawler. */
export function realSlugs(): string[] {
  const all = T('en').work.projects as Record<string, unknown>
  // the same list the app renders from: unfinished work gets no page, no
  // sitemap entry and no hreflang pair
  return Object.keys(all).filter((k) => isPublished(k))
}

/** A single case study, as static HTML. */
export function caseStudyHtml(slug: string, lang: Lang = 'en'): { title: string; desc: string; body: string } {
  const t = T(lang)
  const c = t.work.projects[slug]
  const p: string[] = []
  p.push(`<h1>${esc(c.name)}</h1>`)
  p.push(`<p>${esc(c.kicker)} — ${esc(c.summary)}</p>`)
  p.push(`<h2>${esc(t.work.sectionBrief)}</h2><p>${esc(c.brief)}</p>`)
  p.push(`<h2>${esc(t.work.sectionDid)}</h2><ol>`)
  for (const d of c.did) p.push(`<li><strong>${esc(d.t)}</strong> — ${esc(d.b)}</li>`)
  p.push('</ol>')
  p.push(`<h2>${esc(t.work.sectionOutcome)}</h2><ul>`)
  for (const o of c.outcome) p.push(`<li>${esc(o)}</li>`)
  p.push('</ul>')
  p.push(`<p><a href="${lang === 'sq' ? '/sq' : ''}/work">${esc(t.work.backToWork)}</a></p>`)
  return {
    title: `${c.name} · ${t.work.caseStudy} · Vela Agency`,
    desc: String(c.summary).slice(0, 300),
    body: p.join('\n'),
  }
}

/** The /work archive. */
export function workIndexHtml(lang: Lang = 'en'): { title: string; desc: string; body: string } {
  const t = T(lang)
  const p: string[] = []
  p.push(`<h1>${esc(t.work.indexTitle)}</h1>`)
  p.push(`<p>${esc(t.work.indexSub)}</p><ul>`)
  for (const slug of realSlugs()) {
    const c = t.work.projects[slug]
    p.push(`<li><a href="${lang === 'sq' ? '/sq' : ''}/work/${esc(slug)}"><strong>${esc(c.name)}</strong></a> — ${esc(c.summary)}</li>`)
  }
  p.push('</ul>')
  return { title: `${t.work.indexTitle} · Vela Agency`, desc: String(t.work.indexSub).slice(0, 300), body: p.join('\n') }
}


/**
 * The hreflang set for one logical page.
 *
 * Every URL has to declare all of its language variants including itself, and
 * an x-default for anyone Google cannot place. Omitting the self-reference is
 * the usual way these get silently ignored.
 */
export function alternates(appPath: string): string {
  const clean = appPath === '/' ? '' : appPath
  const en = `https://vela.al${clean || '/'}`
  const sq = `https://vela.al/sq${clean}`
  return [
    `<link rel="alternate" hreflang="en" href="${en}" />`,
    `<link rel="alternate" hreflang="sq" href="${sq}" />`,
    `<link rel="alternate" hreflang="x-default" href="${en}" />`,
  ].join('\n' + '    ')
}

/** Every page the build emits, in both languages. */
export function routeManifest(): { appPath: string; lang: Lang }[] {
  const paths = ['/', '/work', ...realSlugs().map((s) => `/work/${s}`)]
  return paths.flatMap((appPath) => [
    { appPath, lang: 'en' as Lang },
    { appPath, lang: 'sq' as Lang },
  ])
}


/**
 * The sitemap, generated from the same manifest the pages are. A hand-kept
 * sitemap on a bilingual site drifts the moment a route is added, and a
 * sitemap that lists URLs which do not exist is worse than none.
 *
 * Each entry carries xhtml:link alternates as well as the hreflang tags in the
 * pages themselves; Google wants the pair to agree, and stating it in both
 * places is what makes the language cluster unambiguous.
 */
export function sitemapXml(): string {
  const paths = ['/', '/work', ...realSlugs().map((sl) => `/work/${sl}`)]
  const url = (appPath: string, lang: Lang) => {
    const clean = appPath === '/' ? '' : appPath
    return lang === 'sq' ? `https://vela.al/sq${clean}` : `https://vela.al${clean || '/'}`
  }
  const rows: string[] = []
  for (const appPath of paths) {
    for (const lang of ['en', 'sq'] as Lang[]) {
      const priority = appPath === '/' ? '1.0' : appPath === '/work' ? '0.8' : '0.7'
      rows.push(
        [
          '  <url>',
          `    <loc>${url(appPath, 'en') === url(appPath, lang) ? url(appPath, lang) : url(appPath, lang)}</loc>`,
          `    <xhtml:link rel="alternate" hreflang="en" href="${url(appPath, 'en')}" />`,
          `    <xhtml:link rel="alternate" hreflang="sq" href="${url(appPath, 'sq')}" />`,
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(appPath, 'en')}" />`,
          `    <changefreq>${appPath === '/' ? 'monthly' : 'yearly'}</changefreq>`,
          `    <priority>${priority}</priority>`,
          '  </url>',
        ].join('\n'),
      )
    }
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...rows,
    '</urlset>',
    '',
  ].join('\n')
}
