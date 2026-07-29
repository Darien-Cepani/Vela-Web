import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import markSvgRaw from '../assets/brand/mark-cyan.svg?raw'
import markCyan from '../assets/brand/mark-cyan.svg'

/**
 * The Vela mark as a real 3D object: SVG paths extruded with bevels,
 * clearcoat material, studio environment. Idle: slow weighted spin + bob.
 * Pointer: the mark leans toward the cursor on a heavy spring.
 * Click: it whips around twice with a physical wind-up and elastic settle.
 * Falls back to the flat SVG while loading and under reduced motion failure.
 */
export function HeroMark3D({ className = '' }: { className?: string }) {
  const holder = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = holder.current
    if (!mount) return
    const el: HTMLDivElement = mount
    let cancelled = false
    let cleanup: (() => void) | undefined

    // the 3D mark is decorative: keep the three.js parse + tessellation off
    // the load critical path (the flat SVG fallback and the splash cover it).
    // Phones wait for the first interaction (they always come fast on touch);
    // desktop builds at idle.
    let cancelDefer: () => void
    if (window.innerWidth < 1024) {
      const events: Array<keyof WindowEventMap> = ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown']
      let fired = false
      const fire = () => {
        if (fired) return
        fired = true
        off()
        init()
      }
      const off = () => {
        events.forEach((e) => window.removeEventListener(e, fire))
        clearTimeout(t)
      }
      events.forEach((e) => window.addEventListener(e, fire, { passive: true }))
      const t = window.setTimeout(fire, 8000)
      cancelDefer = off
    } else {
      const hasIdle = typeof window.requestIdleCallback === 'function'
      const id = hasIdle
        ? window.requestIdleCallback(() => init(), { timeout: 2600 })
        : window.setTimeout(() => init(), 700)
      cancelDefer = () => (hasIdle ? window.cancelIdleCallback(id as number) : clearTimeout(id as number))
    }

    async function init() {
      const THREE = await import('three')
      const { SVGLoader } = await import('three/examples/jsm/loaders/SVGLoader.js')
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')
      if (cancelled || !holder.current) return

      const reduce = prefersReducedMotion()
      const size = () => Math.min(el.clientWidth, el.clientHeight) || 420

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      // quiet ANGLE's X4122 precision warnings about three's own shader constants
      renderer.debug.checkShaderErrors = false
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(size(), size())
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.92
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFShadowMap
      el.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
      camera.position.set(0, 0, 7.2)

      // studio reflections for the clearcoat
      const pmrem = new THREE.PMREMGenerator(renderer)
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
      scene.environment = envRT.texture

      // ── light rig: hard key from top-right (casts crisp self-shadow), hemisphere, cool fill, cyan rim ──
      const key = new THREE.DirectionalLight(0xffffff, 1.7)
      key.position.set(7.5, 8, 3)
      key.castShadow = true
      key.shadow.mapSize.set(2048, 2048)
      key.shadow.normalBias = 0.02
      key.shadow.camera.left = -4
      key.shadow.camera.right = 4
      key.shadow.camera.top = 4
      key.shadow.camera.bottom = -4
      key.shadow.camera.near = 1
      key.shadow.camera.far = 30
      key.shadow.bias = -0.0004
      key.shadow.radius = 2
      scene.add(key)

      const hemi = new THREE.HemisphereLight(0x8fd8ee, 0x06202b, 0.4)
      scene.add(hemi)
      const fill = new THREE.DirectionalLight(0x0e6d8c, 0.7)
      fill.position.set(-3, -2, 3)
      scene.add(fill)
      const rim = new THREE.PointLight(0x00d2ff, 26, 40)
      rim.position.set(-5, -1, -4)
      scene.add(rim)

      // theme-reactive lighting: re-tuned live when data-theme flips
      // hard key, near-zero fills: unlit faces fall almost to black
      const applyTheme = (mode: string | undefined) => {
        if (mode === 'light') {
          renderer.toneMappingExposure = 0.98
          key.intensity = 2.7
          key.color.set(0xffffff)
          hemi.intensity = 0.1
          hemi.color.set(0xffffff)
          hemi.groundColor.set(0xa9c6d2)
          fill.intensity = 0.03
          fill.color.set(0x7fc8de)
          rim.intensity = 3
          material.envMapIntensity = 0.08
        } else {
          renderer.toneMappingExposure = 0.84
          key.intensity = 2.3
          key.color.set(0xffffff)
          hemi.intensity = 0.02
          hemi.color.set(0x7fc8de)
          hemi.groundColor.set(0x010d13)
          fill.intensity = 0.03
          fill.color.set(0x0e6d8c)
          rim.intensity = 12
          material.envMapIntensity = 0.03
        }
      }
      const themeWatcher = new MutationObserver(() => {
        applyTheme(document.documentElement.dataset.theme)
        if (prefersReducedMotion()) renderer.render(scene, camera)
      })
      themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

      // extrude the brand mark's SVG paths
      const svg = new SVGLoader().parse(markSvgRaw)
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x0099c6,
        metalness: 0.1,
        roughness: 0.36,
        clearcoat: 1,
        clearcoatRoughness: 0.14,
        envMapIntensity: 0.28,
      })
      const group = new THREE.Group()
      // tessellation scales with display size: the mobile mark is 240px, so
      // high segment counts only burn main-thread time without visible gain
      const fine = window.innerWidth >= 1024
      svg.paths.forEach((path, pathIndex) => {
        path.toShapes().forEach((shape) => {
          const geo = new THREE.ExtrudeGeometry(shape, {
            depth: 16,
            bevelEnabled: true,
            bevelThickness: 2.2,
            bevelSize: 1.6,
            bevelSegments: fine ? 3 : 2,
            curveSegments: fine ? 22 : 12,
          })
          const mesh = new THREE.Mesh(geo, material)
          mesh.castShadow = true
          mesh.receiveShadow = true
          // the sail (second path) sits slightly forward of the hull plane so the
          // hard key drapes a cast shadow onto the hull; kept small because camera
          // perspective turns any larger offset into visible sail/hull parallax
          if (pathIndex === 1) mesh.position.z = 4
          group.add(mesh)
        })
      })
      // SVG space is y-down; flip, center, and normalize scale
      group.scale.set(1, -1, 1)
      const box = new THREE.Box3().setFromObject(group)
      const center = box.getCenter(new THREE.Vector3())
      const dims = box.getSize(new THREE.Vector3())
      const s = 4.4 / Math.max(dims.x, dims.y)
      const pivot = new THREE.Group()
      group.position.sub(center)
      pivot.add(group)
      pivot.scale.setScalar(s)
      scene.add(pivot)

      // light rig matches whichever theme is active right now
      applyTheme(document.documentElement.dataset.theme)

      // ── motion state: heavy spring toward the pointer + idle drift + click spins ──
      const target = { x: 0, y: 0 }
      const rot = { x: 0, y: 0, vx: 0, vy: 0 }
      const spin = { extra: 0 }
      // settle weight: 1 = free idle wobble + pointer lean, 0 = locked square to the camera.
      // Zeroed during a click spin so the mark always lands facing the viewer dead-on,
      // then the drift is eased back in afterwards.
      const wobble = { w: 1 }
      let idle = 0

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        // very subtle lean, the idle drift stays the star
        target.y = ((e.clientX - cx) / window.innerWidth) * 0.5
        target.x = ((e.clientY - cy) / window.innerHeight) * 0.32
      }

      // directional motion blur: horizontal-only gaussian, matching the Y-axis spin
      const blur = { v: 0 }
      const blurPrimitive = el.querySelector('#vela-motion-blur feGaussianBlur')
      const applyBlur = () => {
        if (blur.v > 0.08) {
          blurPrimitive?.setAttribute('stdDeviation', `${blur.v.toFixed(2)} 0`)
          renderer.domElement.style.filter = 'url(#vela-motion-blur)'
        } else {
          renderer.domElement.style.filter = ''
        }
      }
      const onClick = () => {
        // wind-up, two fast turns, elastic settle: weight first, then release
        // spin.extra always advances by exact full turns, so the landing faces front
        gsap.to(spin, {
          extra: spin.extra + Math.PI * 4,
          duration: 1.9,
          ease: 'power4.out',
        })
        // lock out wobble + lean while spinning, ease the idle drift back in after landing
        gsap.killTweensOf(wobble)
        gsap
          .timeline()
          .to(wobble, { w: 0, duration: 0.5, ease: 'power2.out' }, 0)
          .to(wobble, { w: 1, duration: 3, ease: 'power1.inOut' }, 2.0)
        gsap
          .timeline()
          .to(pivot.scale, { x: s * 0.9, y: s * 0.9, z: s * 0.9, duration: 0.14, ease: 'power2.in' })
          .to(pivot.scale, { x: s, y: s, z: s, duration: 1.3, ease: 'elastic.out(1, 0.35)' })
        // motion blur that tracks the burst: sharp ramp in, decays with the spin
        gsap
          .timeline()
          .to(blur, { v: 14, duration: 0.16, ease: 'power2.in', onUpdate: applyBlur })
          .to(blur, { v: 0, duration: 1.5, ease: 'power3.out', onUpdate: applyBlur })
      }

      let raf = 0
      let running = false
      const frame = () => {
        idle += 0.0035
        // critically-damped-ish spring: acceleration toward target, heavy damping
        rot.vx = (rot.vx + (target.x - rot.x) * 0.045) * 0.9
        rot.vy = (rot.vy + (target.y - rot.y) * 0.045) * 0.9
        rot.x += rot.vx
        rot.y += rot.vy
        pivot.rotation.x = rot.x * wobble.w
        pivot.rotation.y = (Math.sin(idle) * 0.38 + rot.y) * wobble.w + spin.extra
        pivot.position.y = Math.sin(idle * 2.1) * 0.12
        renderer.render(scene, camera)
        raf = requestAnimationFrame(frame)
      }
      const start = () => {
        if (!running) {
          running = true
          raf = requestAnimationFrame(frame)
        }
      }
      const stop = () => {
        running = false
        cancelAnimationFrame(raf)
      }

      let io: IntersectionObserver | undefined
      if (reduce) {
        renderer.render(scene, camera)
      } else {
        window.addEventListener('pointermove', onMove, { passive: true })
        el.addEventListener('click', onClick)
        io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
        io.observe(el)
      }

      const ro = new ResizeObserver(() => {
        const d = size()
        renderer.setSize(d, d)
        if (reduce) renderer.render(scene, camera)
      })
      ro.observe(el)

      // swap in once the 3D mark is live
      el.classList.remove('mark3d-loading')

      cleanup = () => {
        stop()
        io?.disconnect()
        ro.disconnect()
        themeWatcher.disconnect()
        window.removeEventListener('pointermove', onMove)
        el.removeEventListener('click', onClick)
        group.children.forEach((m) => (m as InstanceType<typeof THREE.Mesh>).geometry.dispose())
        material.dispose()
        envRT.dispose()
        pmrem.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    }

    return () => {
      cancelled = true
      cancelDefer()
      cleanup?.()
    }
  }, [])

  return (
    <div
      ref={holder}
      className={`mark3d-loading group/mark relative flex cursor-pointer items-center justify-center [&.mark3d-loading>canvas]:opacity-0 [&>canvas]:transition-opacity [&>canvas]:duration-700 [&.mark3d-loading>img]:opacity-100 [&>img]:opacity-0 ${className}`}
    >
      <img src={markCyan} alt="" aria-hidden className="absolute w-[58%] transition-opacity duration-700" />
      {/* horizontal-only blur primitive for the spin's directional motion blur */}
      <svg aria-hidden className="absolute h-0 w-0">
        <filter id="vela-motion-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0 0" />
        </filter>
      </svg>
    </div>
  )
}
