import { fallbackHtml, llmsTxt, caseStudyHtml, workIndexHtml, alternates, routeManifest, sitemapXml } from './scripts/seo-content.js'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Preload the two faces the first screen actually needs.
 *
 * Both are referenced from @font-face inside the stylesheet, so the browser
 * cannot discover them until the CSS has downloaded and parsed — a full extra
 * round trip before the headline can render in Clash rather than the fallback.
 * Filenames are content-hashed, so the tags are emitted from the real bundle.
 */
/**
 * Ships real, crawlable text inside `#root`, and writes /llms.txt.
 *
 * See scripts/seo-content.ts for why: the served HTML had zero words of body
 * text, so every AI crawler that does not execute JavaScript — GPTBot,
 * OAI-SearchBot, ClaudeBot, PerplexityBot — saw an empty page. React replaces
 * the container on mount, so this costs a visitor nothing.
 */
function seoFallback(): Plugin {
  return {
    name: 'vela-seo-fallback',
    apply: 'build',
    transformIndexHtml(html) {
      const body = fallbackHtml('en')
      return html.replace(
        '<div id="root"></div>',
        `<div id="root"><div id="seo-fallback">
${body}
</div></div>`,
      )
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llmsTxt() })
      // overwrites the static public/sitemap.xml with one that matches the
      // routes actually emitted, in both languages
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() })
    },
    /**
     * A real HTML file per route.
     *
     * Without this every route serves the homepage's HTML, so /work/vela-shop
     * carried `canonical: https://vela.al/` — which tells Google the case study
     * IS the homepage and folds it away as a duplicate. It also meant a non-JS
     * crawler asking for a case study got homepage copy. Each file below gets
     * its own title, description, canonical, og:url and body text; the SPA
     * still takes over the moment JavaScript runs.
     */
    writeBundle(options) {
      const outDir = options.dir ?? 'dist'
      const shell = readFileSync(resolve(outDir, 'index.html'), 'utf8')
      const home = fallbackHtml('en')

      for (const { appPath, lang } of routeManifest()) {
        const route = lang === 'sq' ? (appPath === '/' ? '/sq' : `/sq${appPath}`) : appPath
        const url = `https://vela.al${route === '/' ? '/' : route}`

        let title: string, desc: string, body: string
        if (appPath === '/') {
          const t = lang === 'sq' ? 'Vela Agency · Ngrini velat e biznesit tuaj' : 'Vela Agency · Raise the sails of your business'
          title = t
          desc =
            lang === 'sq'
              ? 'Dyqane online, një treg dhe reklama. Një agjenci ju çon online dhe ju mban në lëvizje.'
              : 'Online stores, a marketplace and advertising. One agency takes you online and keeps you moving.'
          body = fallbackHtml(lang)
        } else if (appPath === '/work') {
          const w = workIndexHtml(lang)
          title = w.title
          desc = w.desc
          body = w.body
        } else {
          const c = caseStudyHtml(appPath.replace('/work/', ''), lang)
          title = c.title
          desc = c.desc
          body = c.body
        }

        const page = shell
          .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
          .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${lang === 'sq' ? 'sq_AL' : 'en_US'}$2`)
          .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
          // hreflang goes next to the canonical it belongs with
          .replace(/(<link rel="canonical"[^>]*>)/, `$1
    ${alternates(appPath)}`)
          .replace(home, body)

        if (route === '/') {
          writeFileSync(resolve(outDir, 'index.html'), page)
        } else {
          const dir = resolve(outDir, route.replace(/^\//, ''))
          mkdirSync(dir, { recursive: true })
          writeFileSync(resolve(dir, 'index.html'), page)
        }
      }
    },
  }
}

function preloadCriticalFonts(): Plugin {
  const CRITICAL = ['ClashDisplay-Semibold', 'Satoshi-500']
  // Pages builds run with --base=/Vela-Web/, so a hardcoded /assets/… would
  // 404 there and the preload would be worse than useless.
  let base = '/'
  return {
    name: 'vela-preload-critical-fonts',
    enforce: 'post',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml(html, ctx) {
      const files = Object.keys(ctx.bundle ?? {}).filter(
        (f) => f.endsWith('.woff2') && CRITICAL.some((name) => f.includes(name)),
      )
      return {
        html,
        tags: files.map((file) => ({
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'font',
            type: 'font/woff2',
            href: `${base.endsWith('/') ? base : base + '/'}${file}`,
            crossorigin: '',
          },
          injectTo: 'head-prepend' as const,
        })),
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCriticalFonts(), seoFallback()],
})
