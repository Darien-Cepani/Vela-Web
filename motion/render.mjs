/**
 * Renders one CaseFilm per project per language into ../captures.
 *
 *   node render.mjs            every project, both languages
 *   node render.mjs vatan      one project, both languages
 *   node render.mjs vatan en   one project, one language
 *
 * The copy lives here rather than being pulled from the site's i18n on
 * purpose: a film has room for four short lines and the case-study prose is
 * written to be read at leisure, so making one serve the other would make both
 * worse. What must stay true is the claim. Nothing here says anything the case
 * study does not.
 *
 * Albanian is written, not translated. A film caption is four words long, and
 * four words run through a translator is exactly where a bilingual site starts
 * sounding like a machine wrote half of it.
 *
 * Output is H.264 MP4. Chrome reports that it can play our VP9 WebM files and
 * then fails on the actual stream with PIPELINE_ERROR_DECODE, so every card and
 * every case-study hero sat frozen on its poster.
 */
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CAPTURES = resolve(HERE, '../captures')
const PUBLIC = resolve(HERE, 'public')

/** the two act headings, per language, as "services|palette" */
const LABELS = {
  en: { heading: 'What we did|The palette', outro: 'Built by Vela' },
  sq: { heading: 'Çfarë bëmë|Paleta', outro: 'Ndërtuar nga Vela' },
}

const FILMS = {
  'vela-shop': {
    name: 'Vela Shop',
    logo: 'mark-shop.svg',
    // the product is a light application, so the film is light
    theme: {
      bg: '#F7F5F2',
      ink: '#14191C',
      accent: '#C81E3C',
      light: true,
      swatches: ['#A31234', '#C81E3C', '#FACC15'],
    },
    en: {
      kicker: 'E-commerce platform',
      services: ['Product design', 'E-commerce', 'Platform'],
      beats: [
        ['The pitch', 'Instagram brings them. Then you are on your own.', 'vela-shop-clip-landing.mp4'],
        ['One screen to start', 'An account, and the shop is open', 2],
        ['Opens on the money', 'Revenue, orders and best sellers, in that order', 3],
        ['Built from your posts', 'Products read out of Instagram, not retyped', 4],
        ['What the customer sees', 'Your brand, your language, their cart', 5],
      ],
    },
    sq: {
      kicker: 'Platformë e-commerce',
      services: ['Dizajn produkti', 'E-commerce', 'Platformë'],
      beats: [
        ['Prezantimi', 'Instagrami i sjell. Pastaj mbetesh vetëm.', 'vela-shop-clip-landing.mp4'],
        ['Një ekran për të nisur', 'Një llogari, dhe dyqani është hapur', 2],
        ['Hapet me paranë', 'Xhiroja, porositë dhe më të shiturat, me atë radhë', 3],
        ['Ndërtuar nga postimet', 'Produktet lexohen nga Instagrami, nuk rishkruhen', 4],
        ['Çfarë sheh klienti', 'Marka juaj, gjuha juaj, shporta e tij', 5],
      ],
    },
  },

  'vela-al': {
    name: 'vela.al',
    logo: 'mark-cyan.svg',
    theme: {
      bg: '#071E26',
      ink: '#FFFFFF',
      accent: '#00AAD4',
      swatches: ['#00AAD4', '#0B303C', '#9FBAC3'],
    },
    en: {
      kicker: 'Agency site',
      services: ['Brand', 'Website', 'Motion'],
      beats: [
        ['The offer, first', 'What we sell, before the atmosphere', 'vela-al-clip-landing.mp4'],
        ['The name is the argument', 'Course sets direction. Hull carries the weight.', 2],
        ['Six claims, six drawings', 'Every argument illustrated, not asserted', 4],
        ['The work carries it', 'Each project opens into its own case study', 3],
      ],
    },
    sq: {
      kicker: 'Faqja e agjencisë',
      services: ['Markë', 'Faqe interneti', 'Lëvizje'],
      beats: [
        ['Oferta, e para', 'Çfarë shesim, para atmosferës', 'vela-al-clip-landing.mp4'],
        ['Emri është argumenti', 'Kursi jep drejtimin. Trupi mban peshën.', 2],
        ['Gjashtë pretendime, gjashtë vizatime', 'Çdo argument i ilustruar, jo i pohuar', 4],
        ['Puna e mban vetë', 'Çdo projekt hapet në rastin e vet studimor', 3],
      ],
    },
  },

  vatan: {
    logoWordmark: true,
    name: 'VATAN',
    logo: 'vatan.svg',
    // the site's own ground and gold, read off the live stylesheet
    theme: {
      bg: '#0F0D0D',
      ink: '#FFFFFF',
      accent: '#C8A84E',
      swatches: ['#C8A84E', '#8E1B1B', '#E8D5A0'],
    },
    en: {
      kicker: 'Beer brand site',
      services: ['Brand site', 'Bilingual', 'CMS'],
      // every beat is a claim a viewer can check against the still beside it
      beats: [
        ['The gate is the brand', 'Every alcohol site must ask. This one asks well.', 'vatan-clip-gate.mp4'],
        ['The can carries the page', 'Dark ground, gold type, product full bleed', 1],
        ['One line, three endings', 'Vatan means culture, heritage, spirit', 2],
        ['The numbers, plainly', 'Strength, volume and bitterness, without the hunt', 5],
      ],
    },
    sq: {
      kicker: 'Faqe brandi birre',
      services: ['Faqe brandi', 'Dygjuhëshe', 'CMS'],
      beats: [
        ['Verifikimi si pjesë e markës', 'Çdo faqe alkooli duhet të pyesë. Kjo pyet bukur.', 'vatan-clip-gate.mp4'],
        ['Kanaçja e mban faqen', 'Sfond i errët, ar në tekst, produkt full bleed', 1],
        ['Një rresht, tri mbyllje', 'Vatan do të thotë kulturë, trashëgimi, shpirt', 2],
        ['Numrat, hapur', 'Forca, vëllimi dhe hidhësia, pa i kërkuar', 5],
      ],
    },
  },

  ddm: {
    logoWordmark: true,
    name: 'DDM',
    logo: 'ddm.svg',
    // cream and lime: the blue that used to be here belonged to no part of this brand
    theme: {
      bg: '#F3F2E7',
      ink: '#171C10',
      accent: '#7C9E12',
      light: true,
      swatches: ['#A8CF3A', '#7C9E12', '#171C10'],
    },
    en: {
      kicker: 'Digital media agency',
      services: ['Website', 'Brand', 'Marketing'],
      beats: [
        ['Offer before adjectives', 'The services are named in the first screen', 'ddm-clip-landing.mp4'],
        ['Name the pain first', 'Slow sites, chasing suppliers, ads that return nothing', 3],
        ['The whole range, one grid', 'Sixteen services. Find yours without reading.', 4],
        ['Terms, stated plainly', 'Fixed dates, one price, one person to call', 5],
      ],
    },
    sq: {
      kicker: 'Agjenci media dixhitale',
      services: ['Faqe interneti', 'Markë', 'Marketing'],
      beats: [
        ['Oferta para mbiemrave', 'Shërbimet emërtohen që në ekranin e parë', 'ddm-clip-landing.mp4'],
        ['Emërto dhimbjen e para', 'Faqe të ngadalta, vrapim pas furnitorëve, reklama pa kthim', 3],
        ['E gjithë gama, një rrjet', 'Gjashtëmbëdhjetë shërbime. Gjeje tëndin pa lexuar.', 4],
        ['Kushtet, hapur', 'Afate fikse, një çmim, një person', 5],
      ],
    },
  },

  poal: {
    logoWordmark: true,
    name: 'Porsche Albania',
    logo: 'poal.png',
    theme: {
      bg: '#0B0B0C',
      ink: '#FFFFFF',
      accent: '#E4681F',
      swatches: ['#E4681F', '#7A3D12', '#F2F2F2'],
    },
    en: {
      kicker: 'In-showroom feedback',
      services: ['Web app', 'Gamification', 'Automotive'],
      beats: [
        ['Feedback buys the games', 'Two questions, and the arcade opens', 'poal-clip-survey.mp4'],
        ['Four games, one economy', 'Shared points, one leaderboard worth climbing', 1],
        ['The group’s own brands', 'VW, Audi, Škoda and Seat, down to the card backs', 2],
        ['Built for standing use', 'Big targets. No instructions. No account.', 5],
        ['A reason to come back', 'Points that carry across the showroom', 6],
      ],
    },
    sq: {
      kicker: 'Feedback në sallon',
      services: ['Aplikacion web', 'Lojëra', 'Automotiv'],
      beats: [
        ['Feedback-u i blen lojërat', 'Dy pyetje, dhe arkada hapet', 'poal-clip-survey.mp4'],
        ['Katër lojëra, një ekonomi', 'Pikë të përbashkëta, një tabelë që ia vlen', 1],
        ['Markat e vetë grupit', 'VW, Audi, Škoda dhe Seat, deri te letrat', 2],
        ['Ndërtuar për në këmbë', 'Objektiva të mëdhenj. Pa udhëzime. Pa llogari.', 5],
        ['Arsye për t’u kthyer', 'Pikë që vazhdojnë nëpër sallon', 6],
      ],
    },
  },
}

const onlySlug = process.argv[2]
const onlyLang = process.argv[3]
mkdirSync(PUBLIC, { recursive: true })

/* Stage every asset a film will reference BEFORE bundling.
   Remotion's bundle() snapshots public/ as it stands, so anything copied in
   afterwards is served as a 404. Stills happened to survive because earlier
   runs had already left them there; the clips, being new, did not. */
let staged = 0
for (const [slug, film] of Object.entries(FILMS)) {
  if (onlySlug && onlySlug !== slug) continue
  if (film.logo) staged += 0
  for (const lang of ['en', 'sq']) {
    for (const [, , pick] of film[lang].beats) {
      const isClip = typeof pick === 'string' && pick.endsWith('.mp4')
      const name = isClip ? pick : `${slug}-${pick ?? ''}.webp`
      const src = resolve(CAPTURES, name)
      if (existsSync(src)) {
        copyFileSync(src, resolve(PUBLIC, name))
        staged++
      }
    }
  }
}
console.log(`staged ${staged} asset(s)`)

console.log('bundling…')
const serveUrl = await bundle({ entryPoint: resolve(HERE, 'src/index.ts') })

// act lengths, kept in step with the constants exported from CaseFilm
const OPEN = 72
const SERVICES = 60
const PALETTE = 66
const SIGNOFF = 66
const PER_BEAT = 90

for (const [slug, film] of Object.entries(FILMS)) {
  if (onlySlug && onlySlug !== slug) continue

  for (const lang of ['en', 'sq']) {
    if (onlyLang && onlyLang !== lang) continue
    const copy = film[lang]

    // the stills the film shows have to be reachable from Remotion's public dir.
    // a beat may name its own still as a third element; without one it falls
    // back to position, which is only right when the captures happen to be in
    // the same order as the story, and they usually are not.
    const beats = []
    for (let i = 0; i < copy.beats.length; i++) {
      const [label, caption, pick] = copy.beats[i]
      // a source ending .mp4 is a recording of the real page; anything else is
      // the numbered still it used to be
      const isClip = typeof pick === 'string' && pick.endsWith('.mp4')
      const name = isClip ? pick : `${slug}-${pick ?? i + 1}.webp`
      const src = resolve(CAPTURES, name)
      if (!existsSync(src)) {
        console.log(`${slug}/${lang}\tbeat "${label}" skipped, no ${name}`)
        continue
      }
      copyFileSync(src, resolve(PUBLIC, name))
      beats.push(isClip ? { video: name, label, caption } : { img: name, label, caption })
    }
    if (!beats.length) {
      console.log(`${slug}/${lang}\tSKIP\tno stills`)
      continue
    }
    if (film.logo) copyFileSync(resolve(PUBLIC, film.logo), resolve(PUBLIC, film.logo))

    const inputProps = {
      name: film.name,
      kicker: copy.kicker,
      logo: film.logo,
      logoWordmark: film.logoWordmark,
      theme: film.theme,
      services: copy.services,
      paletteLabel: LABELS[lang].heading,
      outro: LABELS[lang].outro,
      beats,
    }
    const composition = await selectComposition({ serveUrl, id: 'CaseFilm', inputProps })
    composition.durationInFrames =
      OPEN + SERVICES + beats.length * PER_BEAT + PALETTE + SIGNOFF

    const out = resolve(CAPTURES, `${slug}-film-${lang}.mp4`)
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      crf: 24,
      outputLocation: out,
      inputProps,
      /* Two, not four. Each worker now decodes video as well as painting the
         composition, and four of them starved the font loader badly enough
         that delayRender timed out before the faces were ready. */
      concurrency: 2,
      /* and the default 28s budget is for a page that only has to paint */
      timeoutInMilliseconds: 180000,
    })
    const kb = Math.round(statSync(out).size / 1024)
    const secs = (composition.durationInFrames / 30).toFixed(1)
    console.log(`${slug}/${lang}\tOK\t${kb}KB\t${secs}s\t${beats.length} beats`)
  }
}
