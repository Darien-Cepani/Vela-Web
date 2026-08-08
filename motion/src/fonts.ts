import { continueRender, delayRender, staticFile } from 'remotion'

/**
 * Registers the brand faces and holds rendering until they are actually
 * loaded. Without the wait, the first frames render in a fallback face and the
 * type jumps mid-film — the kind of defect that only shows up after encoding,
 * when it is expensive to notice.
 */
const face = (family: string, file: string, weight: number) => `
@font-face {
  font-family: "${family}";
  src: url("${staticFile(file)}") format("woff2");
  font-weight: ${weight};
  font-display: block;
}`

export function loadBrandFonts() {
  const handle = delayRender('brand fonts')
  const style = document.createElement('style')
  style.textContent = [
    face('Clash Display', 'ClashDisplay-Semibold.woff2', 600),
    face('Clash Display', 'ClashDisplay-Medium.woff2', 500),
    face('Satoshi', 'Satoshi-700.woff2', 700),
    face('Satoshi', 'Satoshi-500.woff2', 500),
  ].join('\n')
  document.head.appendChild(style)

  /* The gate always opens.
     Holding the render until the faces report ready is right, but it must not
     be able to stall the render outright: once beats became real video, the
     compositor competed for the same main thread and document.fonts.ready
     stopped resolving inside Remotion's 28s budget, so the whole film failed
     rather than rendering one frame in a fallback face. The race means the
     worst case is a slightly wrong first frame instead of no film at all. */
  let opened = false
  const open = () => {
    if (opened) return
    opened = true
    continueRender(handle)
  }
  const guard = setTimeout(open, 10000)

  Promise.all([
    document.fonts.load('600 128px "Clash Display"'),
    document.fonts.load('700 22px "Satoshi"'),
  ])
    .then(() => document.fonts.ready)
    .then(() => {
      clearTimeout(guard)
      open()
    })
    .catch(() => {
      clearTimeout(guard)
      open()
    })
}
