/**
 * Copies only PUBLISHED projects' captures into public/work.
 *
 * Why this exists: everything in public/ is served. Leaving every capture
 * there meant unfinished client work was publicly fetchable — dentalspace
 * screenshots carry real patient names, and the Porsche Albania kiosk is not
 * released — even though their pages were hidden. Hiding a page is not hiding
 * a file.
 *
 * captures/ is the archive and is never served. public/work is generated from
 * it, so publishing a project stays a one-line edit to src/content/published.ts
 * followed by `npm run sync:work`.
 *
 *   node scripts/sync-work-assets.mjs [--check]
 *
 * --check exits non-zero if public/work holds anything unpublished, so CI or a
 * prebuild can refuse to ship a leak.
 */
import { readdirSync, mkdirSync, copyFileSync, rmSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(ROOT, 'captures')
const DEST = resolve(ROOT, 'public/work')
const CHECK = process.argv.includes('--check')

// read the slug list without importing TypeScript
const listSrc = readdirSync(resolve(ROOT, 'src/content')).includes('published.ts')
  ? await import('node:fs').then((fs) =>
      fs.readFileSync(resolve(ROOT, 'src/content/published.ts'), 'utf8'),
    )
  : ''
const m = /PUBLISHED_SLUGS\s*=\s*\[([^\]]*)\]/s.exec(listSrc)
if (!m) {
  console.error('sync:work — could not read PUBLISHED_SLUGS from src/content/published.ts')
  process.exit(1)
}
const published = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1])

/**
 * Every variant of a capture maps back to one slug: the poster, the numbered
 * supporting stills, the card cut, the 1080p hero cut, the motion-graphic film
 * the walkthrough's poster frame, and the per-language cuts of the film.
 *
 * A suffix missing from this list does not merely fail to copy — it also reads
 * as an unpublished file, so `--check` would call it a leak. Add new variants
 * here when you invent them.
 */
const slugOf = (file) =>
  file
    .replace(/\.(webp|webm|png|jpg|mp4)$/i, '')
    .replace(/-(film|card)-(en|sq)$/, '')
    .replace(/-film$/, '')
    .replace(/-walk$/, '')
    .replace(/-hd$/, '')
    .replace(/-\d+$/, '')

/* captures/ is the local archive and is deliberately not in the repository:
   it holds unreleased client work. CI therefore has no captures/ at all, and
   builds from the public/work that is committed. Exiting non-zero here failed
   every deploy; the honest behaviour is to leave the committed assets alone
   and say so. */
if (!existsSync(SRC)) {
  console.log('sync:work — no captures/ here, using the committed public/work as-is')
  process.exit(0)
}
mkdirSync(DEST, { recursive: true })

const inDest = existsSync(DEST) ? readdirSync(DEST).filter((f) => statSync(resolve(DEST, f)).isFile()) : []
const leaked = inDest.filter((f) => !published.includes(slugOf(f)))

if (CHECK) {
  if (leaked.length) {
    console.error(`sync:work --check FAILED: ${leaked.length} unpublished asset(s) in public/work`)
    leaked.slice(0, 10).forEach((f) => console.error('   ' + f))
    process.exit(1)
  }
  console.log(`sync:work --check ok — public/work holds only published assets (${inDest.length} files)`)
  process.exit(0)
}

/* public/work is a MIRROR of captures, not an accumulation of it. Removing a
   file from captures has to remove it here too: superseded renders otherwise
   sit in the deployed bundle forever, still served, just never referenced. */
const inSrc = new Set(readdirSync(SRC))
const stale = inDest.filter((f) => !inSrc.has(f))
for (const f of new Set([...leaked, ...stale])) rmSync(resolve(DEST, f), { force: true })

let copied = 0
for (const f of readdirSync(SRC)) {
  if (!published.includes(slugOf(f))) continue
  copyFileSync(resolve(SRC, f), resolve(DEST, f))
  copied++
}

console.log(
  `sync:work — ${copied} file(s) for ${published.length} published project(s); removed ${leaked.length} unpublished, ${stale.length} superseded`,
)
