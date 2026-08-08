import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './i18n-resources'
import { initialLocale } from './lib/locale'
i18n.use(initReactI18next).init({
  resources,
  // The URL is authoritative — /sq/* is Albanian, everything else English.
  // A stored preference only applies on the bare root, where the address
  // implies nothing; otherwise one URL would serve two languages.
  lng: initialLocale(window.location.pathname, import.meta.env.BASE_URL.replace(/\/$/, '')),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

/** Keep the document's own language metadata honest — screen readers pick
 *  their pronunciation rules from <html lang>, and it never changed before. */
function syncDocumentLanguage(lng: string) {
  localStorage.setItem('vela-lang', lng)
  document.documentElement.lang = lng
  document.title = i18n.t('meta.title')
  const set = (sel: string, attr: string, value: string) =>
    document.querySelector(sel)?.setAttribute(attr, value)
  set('meta[name="description"]', 'content', i18n.t('meta.desc'))
  set('meta[property="og:title"]', 'content', i18n.t('meta.title'))
  set('meta[property="og:description"]', 'content', i18n.t('meta.desc'))
  set('meta[property="og:locale"]', 'content', lng === 'sq' ? 'sq_AL' : 'en_US')
}

// run for the language we booted with, not only for later switches
syncDocumentLanguage(i18n.language)
i18n.on('languageChanged', syncDocumentLanguage)

export default i18n
