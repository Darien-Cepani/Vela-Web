/**
 * The displacement map for the page-wide click ripple.
 *
 * `feDisplacementMap` reads two channels and treats them as a per-pixel offset:
 * with `xChannelSelector="R"` and `yChannelSelector="B"`, a value of 0.5 means
 * "no shift" and everything either side pushes the underlying pixel one way or
 * the other. To bend a page *outward from a point* the offset has to follow the
 * angle around that point, which is a two-dimensional function — a radial
 * gradient cannot express it, so the map is drawn once into a canvas.
 *
 * The ring sits at half the image radius. The filter then animates the
 * feImage's own geometry to expand that ring across the viewport, which is far
 * cheaper than regenerating the map per frame.
 */

const SIZE = 512

let cached: string | null = null

export function rippleDisplacementMap(): string {
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const img = ctx.createImageData(SIZE, SIZE)
  const data = img.data
  const half = SIZE / 2

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = (x - half) / half
      const dy = (y - half) / half
      const r = Math.hypot(dx, dy)
      const i = (y * SIZE + x) * 4

      // a narrow crest at r = 0.5 with a trough behind it, so the wavefront
      // pushes pixels out and the water immediately behind it pulls them back
      const d = r - 0.5
      const crest = Math.exp(-(d * d) / 0.0042) * Math.sign(-d) * -1
      const profile = r > 0.001 && r < 1 ? crest : 0

      // encode the outward direction at this angle
      const ux = r > 0.001 ? dx / r : 0
      const uy = r > 0.001 ? dy / r : 0

      data[i] = Math.round((0.5 + ux * profile * 0.5) * 255) // R → x offset
      data[i + 1] = 128 // unused
      data[i + 2] = Math.round((0.5 + uy * profile * 0.5) * 255) // B → y offset
      data[i + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  cached = canvas.toDataURL('image/png')
  return cached
}
