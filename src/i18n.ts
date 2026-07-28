import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      meta: {
        title: 'Vela Agency · Raise the sails of your business',
        desc: 'Online stores, a marketplace and advertising. One agency takes you online and keeps you moving.',
      },
      nav: {
        products: 'Products',
        services: 'Services',
        process: 'Process',
        cta: 'Start your project',
        backToTop: 'Vela, back to top',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
      },
      hero: {
        badge: 'Development & marketing studio',
        l1: 'Raise your sails.',
        l2pre: 'Sail the ',
        l2accent: 'online sea',
        sub: 'Online stores, a marketplace and advertising. One agency takes you online and keeps you moving.',
        cta2: 'See the products',
      },
      marquee: {
        label: 'Our services',
        items: ['Online stores', 'Marketplace', 'Advertising', 'Graphic design', 'Content', 'Web apps', 'E-commerce', 'CMS & blogs'],
      },
      meaning: {
        titlePre: 'Vela means ',
        titleAccent: 'sail',
        titleEnd: '.',
        manifesto:
          'In Albanian, vela is the sail. A sail does one thing: it turns wind into forward motion. We do the same with the internet, for your business.',
        pillars: [
          { word: 'Wind', means: 'Momentum', body: 'Launches in days, not quarters. Speed is part of the service, not an upgrade.' },
          { word: 'Course', means: 'Direction', body: 'Strategy before pixels. Every page, product and campaign has a heading and a destination.' },
          { word: 'Hull', means: 'Trust', body: 'Solid engineering underneath, carrying your whole business safely across.' },
        ],
      },
      products: {
        eyebrow: 'Products',
        h2pre: 'Three sails, one ',
        h2accent: 'course',
        sub: 'Same geometry, three colors. Each product covers one leg of the route to selling online.',
        items: [
          {
            claim: 'Your shop online. Live in 5 days.',
            body: 'A storefront in your brand, orders and payments in one panel, ready for Instagram and Google.',
            chips: ['Custom storefront', 'Order management', 'SQ + EN'],
          },
          {
            claim: 'The shopping center, online.',
            body: 'Your window in the Vela marketplace: new customers every day, zero marketing cost to start.',
            chips: ['Marketplace storefront', 'Shared customers', 'Central orders'],
          },
          {
            claim: 'Ads that sell.',
            body: "Impulse campaigns across Albania's biggest portals, with creatives from our studio.",
            chips: ['Major portals', 'Creatives included', 'Clear reporting'],
          },
        ],
      },
      services: {
        h2pre: 'Everything your business needs ',
        h2accent: 'online',
        ecom: { t: 'E-commerce', b: 'Complete shops with payments, stock and orders. From storefront to delivery, in one place.' },
        web: { t: 'Websites & landing pages', b: 'Pages that load fast, rank on Google and turn visitors into customers.' },
        design: { t: 'Graphic design', b: 'Identities, materials and campaigns with a studio hand.' },
        content: { t: 'Content creation', b: "Photos, video and copy that speak your customer's language." },
        apps: { t: 'Web apps & CMS', b: 'Dashboards, booking systems and a CMS your team can use without training.' },
        blog: { t: 'Blogs & SEO', b: 'Content that compounds: articles, optimization and structure Google understands.' },
        taglinePre: 'One team, ',
        taglineAccent: 'zero',
        taglinePost: ' agency handoffs.',
      },
      process: {
        h2pre: 'Our ',
        h2accent: 'process',
        sub: 'Four phases, one team. Every project follows the same proven course.',
        steps: [
          { verb: 'Discover', body: 'One conversation about your business, customers and goals. We leave with a clear course, not assumptions.' },
          { verb: 'Design', body: 'Identity, pages and content built on brand tokens. You see everything before we build it.' },
          { verb: 'Build', body: 'Fast development on the Vela platform: storefront, web app or campaign, tested at every step.' },
          { verb: 'Sail', body: 'Launch is the start, not the end. We measure, optimize and keep your business moving.' },
        ],
      },
      contact: {
        h2: 'Ready to set sail?',
        sub: 'A 30-minute conversation is enough to chart the course.',
        subject: 'Start a project with Vela',
      },
      footer: {
        blurb: 'The agency that takes Albanian businesses online and keeps them moving.',
        colProducts: 'Products',
        colSite: 'Site',
        colContact: 'Contact',
        location: 'Tirana, Albania',
        tagline: 'At full sail.',
        rights: '© 2026 Vela Agency',
      },
    },
  },
  sq: {
    translation: {
      meta: {
        title: 'Vela Agency · Ngri velat e biznesit tënd',
        desc: 'Dyqane online, marketplace dhe reklama. Një agjenci të çon online dhe të mban në lëvizje.',
      },
      nav: {
        products: 'Produktet',
        services: 'Shërbimet',
        process: 'Procesi',
        cta: 'Nis projektin',
        backToTop: 'Vela, kthehu në krye',
        openMenu: 'Hap menunë',
        closeMenu: 'Mbyll menunë',
      },
      hero: {
        badge: 'Studio zhvillimi & marketingu',
        l1: 'Ngri velat.',
        l2pre: 'Lundro në ',
        l2accent: 'detin online',
        sub: 'Dyqane online, marketplace dhe reklama. Një agjenci të çon online dhe të mban në lëvizje.',
        cta2: 'Shiko produktet',
      },
      marquee: {
        label: 'Shërbimet tona',
        items: ['Dyqane online', 'Marketplace', 'Reklama', 'Dizajn grafik', 'Përmbajtje', 'Web apps', 'E-commerce', 'CMS & blogje'],
      },
      meaning: {
        titlePre: 'Vela do të ',
        titleAccent: 'thotë',
        titleEnd: ':',
        manifesto:
          'Vela bën një gjë të vetme: e kthen erën në lëvizje përpara. Ne bëjmë të njëjtën gjë me internetin, për biznesin tënd.',
        pillars: [
          { word: 'Era', means: 'Vrull', body: 'Lançime në ditë, jo në tremujorë. Shpejtësia është pjesë e shërbimit, jo ekstra.' },
          { word: 'Kursi', means: 'Drejtim', body: 'Strategji para pikselëve. Çdo faqe, produkt dhe fushatë ka drejtim dhe destinacion.' },
          { word: 'Trupi', means: 'Besim', body: 'Inxhinieri solide nga poshtë, që e mban gjithë biznesin tënd të sigurt.' },
        ],
      },
      products: {
        eyebrow: 'Produktet',
        h2pre: 'Tre vela, një ',
        h2accent: 'kurs',
        sub: 'E njëjta gjeometri, tre ngjyra. Secili produkt mbulon një pjesë të rrugës drejt shitjeve online.',
        items: [
          {
            claim: 'Dyqani yt online. Live për 5 ditë.',
            body: 'Storefront me markën tënde, porosi e pagesa në një panel, gati për Instagram dhe Google.',
            chips: ['Storefront i personalizuar', 'Menaxhim porosish', 'SQ + EN'],
          },
          {
            claim: 'Qendra tregtare, online.',
            body: 'Vitrina jote në marketplace-un Vela: klientë të rinj çdo ditë, pa kosto marketingu në start.',
            chips: ['Vitrinë në marketplace', 'Klientë të përbashkët', 'Porosi të centralizuara'],
          },
          {
            claim: 'Reklama që shesin.',
            body: 'Fushata impulse në portalet më të mëdha shqiptare, me kreativë nga studioja jonë.',
            chips: ['Portalet kryesore', 'Kreativë të përfshirë', 'Raport i qartë'],
          },
        ],
      },
      services: {
        h2pre: 'Gjithçka që biznesi yt kërkon ',
        h2accent: 'online',
        ecom: { t: 'E-commerce', b: 'Dyqane të plota me pagesa, stok dhe porosi. Nga vitrina te dërgesa, gjithçka në një vend.' },
        web: { t: 'Website & landing pages', b: 'Faqe që hapen shpejt, renditen në Google dhe kthejnë vizitorë në klientë.' },
        design: { t: 'Dizajn grafik', b: 'Identitete, materiale dhe fushata me dorë studioje.' },
        content: { t: 'Krijim përmbajtjeje', b: 'Foto, video dhe tekste që flasin gjuhën e klientit tënd.' },
        apps: { t: 'Web apps & CMS', b: 'Panele, sisteme rezervimi dhe CMS që ekipi yt i përdor pa trajnim.' },
        blog: { t: 'Blogje & SEO', b: 'Përmbajtje që rritet me kohën: artikuj, optimizim dhe strukturë që Google e kupton.' },
        taglinePre: 'Një ekip, ',
        taglineAccent: 'zero',
        taglinePost: ' dorëzime mes agjencish.',
      },
      process: {
        h2pre: 'Procesi ',
        h2accent: 'ynë',
        sub: 'Katër faza, një ekip. Çdo projekt ndjek të njëjtin kurs të provuar.',
        steps: [
          { verb: 'Zbulojmë', body: 'Një bisedë për biznesin, klientët dhe objektivat. Dalim me një kurs të qartë, jo me supozime.' },
          { verb: 'Dizajnojmë', body: 'Identitet, faqe dhe përmbajtje mbi token-at e markës. Ti sheh gjithçka para se të ndërtohet.' },
          { verb: 'Ndërtojmë', body: 'Zhvillim i shpejtë mbi platformën Vela: storefront, web app ose fushatë, me teste në çdo hap.' },
          { verb: 'Lundrojmë', body: 'Publikimi është starti, jo fundi. Masim, optimizojmë dhe e mbajmë biznesin në lëvizje.' },
        ],
      },
      contact: {
        h2: 'T’i ngremë velat?',
        sub: 'Një bisedë 30-minutëshe mjafton për të nisur kursin.',
        subject: 'Nis projektin me Vela',
      },
      footer: {
        blurb: 'Agjencia që çon bizneset shqiptare online dhe i mban në lëvizje.',
        colProducts: 'Produktet',
        colSite: 'Faqja',
        colContact: 'Kontakt',
        location: 'Tiranë, Shqipëri',
        tagline: 'Me vela të plota.',
        rights: '© 2026 Vela Agency',
      },
    },
  },
} as const

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('vela-lang') ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('vela-lang', lng)
  document.documentElement.lang = lng
  document.title = i18n.t('meta.title')
  document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t('meta.desc'))
})

export default i18n
