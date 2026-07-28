import { defineTheme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral'

/**
 * Vela Agency theme for astryx components.
 * Tokens follow brand/guidelines/vela-agency-tokens.css:
 * accent = Vela Cyan, cool neutrals, Clash Display + Satoshi, pill actions.
 */
export const velaTheme = defineTheme({
  name: 'vela',
  extends: neutralTheme,
  color: { accent: '#00AAD4', neutralStyle: 'cool' },
  typography: {
    body: { family: 'Satoshi', fallbacks: '"Segoe UI", system-ui, sans-serif' },
    heading: { family: 'Clash Display', fallbacks: '"Segoe UI", system-ui, sans-serif' },
  },
  radius: { base: 10, multiplier: 1 },
  motion: { fast: 200, medium: 300, ratio: 0.75 },
  components: {
    button: {
      base: { borderRadius: '9999px', fontWeight: '700' },
    },
    badge: {
      base: { borderRadius: '9999px' },
    },
  },
})
