import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
// responsive sections legitimately drop breakpoint-specific targets; keep prod console quiet
gsap.config({ nullTargetWarn: false })

export const EASE_OUT = 'expo.out'

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export { gsap, ScrollTrigger }
