/**
 * One page-wide way to open the contact dialog.
 *
 * Every call to action on the page — nav, hero, product slices, the contact
 * panel, the mobile menu — routes through this instead of scrolling somewhere,
 * so "start your project" always means the same thing.
 */
const OPEN_EVENT = 'vela-contact-open'

/** The dialog is a lazy chunk, so the click that *mounts* it fires before it
 *  can subscribe. The request is parked here and replayed on subscription. */
let pending: string | null = null

/** `source` is passed to the dialog so the form can note where the visitor came from. */
export function openContact(source = 'cta') {
  pending = source
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { source } }))
}

/**
 * @param replayPending  subscribe *and* immediately handle a request that
 *                       arrived before this listener existed. Only the dialog
 *                       itself should ask for this.
 */
export function onContactOpen(handler: (source: string) => void, replayPending = false) {
  const listener = (e: Event) => handler((e as CustomEvent).detail?.source ?? 'cta')
  window.addEventListener(OPEN_EVENT, listener)
  if (replayPending && pending !== null) {
    const source = pending
    pending = null
    // after paint, so the dialog element exists before showModal() is called
    requestAnimationFrame(() => handler(source))
  }
  return () => window.removeEventListener(OPEN_EVENT, listener)
}
