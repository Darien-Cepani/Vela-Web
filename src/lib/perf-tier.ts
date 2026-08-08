/**
 * How much visual work this device can actually afford.
 *
 * Viewport width was the only gate before, and width says nothing about
 * capability: a 1440px window on a machine with no GPU acceleration was being
 * handed the WebGL water, the light rays, the wave canvas and eleven
 * backdrop-filters. Measured across the whole page:
 *
 *   GPU + 4x CPU throttle (mid-range phone)   59-61 fps   fine
 *   GPU + 6x CPU throttle (low-end phone)     43-59 fps   dips
 *   no GPU acceleration at all                11-37 fps   unusable in the hero
 *
 * You cannot draw the same frame at 60fps on hardware that cannot rasterise
 * it, so the site drops layers instead of frames. Capable devices see exactly
 * what they saw before; weak ones lose the most expensive effects and keep the
 * layout, the type, the colour and the motion.
 *
 * Two signals, because neither is sufficient alone:
 *
 *  1. A synchronous guess from hardware hints, so the very first frame is
 *     already correct rather than expensive-then-corrected.
 *  2. A real frame-rate probe over the first second, because hints lie in both
 *     directions — a low core count on a fast phone, a high one on a VM with
 *     no GPU. What actually renders is the only honest measure.
 *
 * The tier only ever moves downward. Flipping back up mid-scroll would mean
 * mounting a WebGL canvas into a page someone is already reading.
 */
export type PerfTier = 'full' | 'low'

const ROOT = () => document.documentElement

/** Cheap first guess. Deliberately conservative: a wrong 'low' costs a gradient. */
function guessFromHints(): PerfTier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  // Save-Data is an explicit request to spend less on this visit.
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (conn?.saveData) return 'low'
  if (cores <= 4 || memory <= 4) return 'low'
  return 'full'
}

/**
 * Watch real frames for a moment and demote if the device cannot hold a
 * reasonable rate. 50fps rather than 60: a couple of dropped frames during
 * mount is normal and not worth stripping the design over.
 */
function probe(onLow: () => void) {
  let frames = 0
  let start = 0
  const SAMPLE_MS = 900
  const FLOOR = 50

  const tick = (now: number) => {
    if (!start) start = now
    frames++
    const elapsed = now - start
    if (elapsed < SAMPLE_MS) {
      requestAnimationFrame(tick)
      return
    }
    if (frames / (elapsed / 1000) < FLOOR) onLow()
  }
  requestAnimationFrame(tick)
}

let current: PerfTier = 'full'
const listeners = new Set<(t: PerfTier) => void>()

function demote() {
  if (current === 'low') return
  current = 'low'
  ROOT().dataset.perf = 'low'
  listeners.forEach((l) => l('low'))
}

/**
 * Read an explicit override, so the low tier can be reviewed and QA'd on a
 * machine that would never trigger it. `?perf=low` for one visit;
 * localStorage 'vela-perf' to pin it.
 */
function override(): PerfTier | null {
  try {
    const q = new URLSearchParams(location.search).get('perf')
    if (q === 'low' || q === 'full') return q
    const saved = localStorage.getItem('vela-perf')
    if (saved === 'low' || saved === 'full') return saved
  } catch {
    /* no URL or storage access; fall through to detection */
  }
  return null
}

/** Call once, as early as possible. Safe to call twice. */
export function initPerfTier() {
  if (ROOT().dataset.perf) return
  const forced = override()
  if (forced) {
    current = forced
    ROOT().dataset.perf = forced
    return
  }
  current = guessFromHints()
  ROOT().dataset.perf = current
  if (current === 'full') {
    // give the page a beat to mount before judging it
    setTimeout(() => probe(demote), 600)
  }
}

export function getPerfTier(): PerfTier {
  return current
}

export function onPerfTierChange(fn: (t: PerfTier) => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
