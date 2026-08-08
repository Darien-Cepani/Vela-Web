import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { prefersReducedMotion } from '../lib/gsap'

export type WaterRipplesHandle = { drop: (strength?: number) => void }

/**
 * Real-time water surface behind the hero mark (WebGL2 shader):
 * a continuous height field of expanding ring trains, lit from the top-right
 * to match the 3D key light, with derivative normals for specular glints so
 * it reads as liquid rather than flat circles. Clicks inject damped "drops"
 * into the ongoing simulation; the phase never resets.
 */
const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec4 uDrops[8];
/* 0 on deep sea, 1 on paper */
uniform float uLight;
out vec4 outColor;
void main() {
  vec2 p = (gl_FragCoord.xy / uRes - 0.5) * 2.0;
  float r = length(p);
  if (r > 1.0) { outColor = vec4(0.0); return; }

  /* idle swell: two ring trains breathing outward forever */
  float att = exp(-r * 1.8);
  float h = sin(r * 24.0 - uTime * 2.4) * 0.30 * att
          + sin(r * 38.0 - uTime * 3.6 + 1.7) * 0.16 * att;

  /* click drops: a wave packet expanding from the center, damped in time */
  for (int i = 0; i < 8; i++) {
    float t = uTime - uDrops[i].z;
    float s = uDrops[i].w;
    if (s > 0.0 && t > 0.0 && t < 5.0) {
      float d = r - t * 0.42;
      h += cos(d * 46.0) * exp(-d * d * 90.0) * exp(-t * 1.05) * s;
    }
  }

  /* surface normal from the height gradient; light from the top-right */
  vec3 n = normalize(vec3(-dFdx(h) * 140.0, -dFdy(h) * 140.0, 1.0));
  vec3 L = normalize(vec3(0.55, 0.65, 0.52));
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 60.0);

  /* On deep sea the water is lit cyan against near-black, so the shaded side
     of every wave reads as depth. On paper that same shading is the darkest
     thing on the screen and the rings turn to soot. The light theme therefore
     gets a brighter body, a much stronger specular, and roughly half the
     opacity — the surface reads as glare on water rather than a hole in it. */
  vec3 deepCol = vec3(0.0, 0.667, 0.831) * (0.25 + diff * 0.5) + vec3(1.0) * spec * 0.9;
  vec3 liteCol = mix(vec3(0.29, 0.76, 0.89), vec3(1.0), 0.28 + diff * 0.42) + vec3(1.0) * spec * 1.15;
  vec3 col = mix(deepCol, liteCol, uLight);

  float deepA = clamp((abs(h) * 0.9 + spec * 0.8) * smoothstep(1.0, 0.55, r), 0.0, 0.85);
  float liteA = clamp((abs(h) * 0.5 + spec * 0.65) * smoothstep(1.0, 0.55, r), 0.0, 0.46);
  float a = mix(deepA, liteA, uLight);
  /* premultiplied output: composites correctly on every backend (ANGLE/D3D
     shows an opaque white backing for non-premultiplied alpha canvases) */
  outColor = vec4(col * a, a);
}`

const VERT = `#version 300 es
void main() {
  vec2 v = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);
}`

/**
 * No-WebGL path: the same idle ring-train and the same click drops, drawn as
 * stroked arcs on a 2D context. It is the shader's silhouette without the
 * specular lighting — quieter, but unmistakably the same water, and it runs
 * anywhere a canvas does.
 */
function start2DFallback(
  canvas: HTMLCanvasElement,
  dropsRef: { current: Float32Array },
  startRef: { current: number },
  show: () => void,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const resize = () => {
    const r = canvas.getBoundingClientRect()
    canvas.width = Math.max(1, r.width * dpr)
    canvas.height = Math.max(1, r.height * dpr)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  let raf = 0
  let running = false
  const frame = () => {
    const t = (performance.now() - startRef.current) / 1000
    const w = canvas.width
    const h = canvas.height
    const cx = w / 2
    const cy = h / 2
    const max = Math.min(w, h) / 2

    const light = document.documentElement.dataset.theme === 'light'
    ctx.clearRect(0, 0, w, h)
    ctx.lineWidth = Math.max(1, 1.15 * dpr)

    // idle swell: rings marching outward on the same period as the shader
    for (let i = 0; i < 9; i++) {
      const phase = (t * 0.16 + i / 9) % 1
      const radius = phase * max
      if (radius < 2) continue
      const fade = Math.sin(phase * Math.PI) * Math.exp(-phase * 1.4)
      ctx.strokeStyle = light
        ? `rgba(0, 140, 176, ${(fade * 0.22).toFixed(3)})`
        : `rgba(0, 170, 212, ${(fade * 0.34).toFixed(3)})`
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.stroke()
    }

    // click drops: a bright wavefront expanding and damping out
    for (let i = 0; i < 8; i++) {
      const age = t - dropsRef.current[i * 4 + 2]
      const strength = dropsRef.current[i * 4 + 3]
      if (!(strength > 0) || age <= 0 || age > 4) continue
      const radius = age * 0.42 * max
      if (radius < 2 || radius > max) continue
      const fade = Math.exp(-age * 1.05) * strength
      ctx.strokeStyle = light
        ? `rgba(0, 160, 200, ${(fade * 0.45).toFixed(3)})`
        : `rgba(150, 233, 255, ${(fade * 0.6).toFixed(3)})`
      ctx.lineWidth = Math.max(1, 2.2 * dpr * fade)
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.stroke()
    }

    show()
    raf = requestAnimationFrame(frame)
  }

  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) {
      running = true
      raf = requestAnimationFrame(frame)
    } else if (!e.isIntersecting) {
      running = false
      cancelAnimationFrame(raf)
    }
  })
  io.observe(canvas)

  return () => {
    running = false
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
  }
}

export const WaterRipples = forwardRef<WaterRipplesHandle, { className?: string }>(
  function WaterRipples({ className = '' }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dropsRef = useRef(new Float32Array(32))
    const dropIdx = useRef(0)
    const startRef = useRef(performance.now())

    useImperativeHandle(ref, () => ({
      drop(strength = 1) {
        const i = dropIdx.current
        dropsRef.current[i * 4 + 2] = (performance.now() - startRef.current) / 1000
        dropsRef.current[i * 4 + 3] = strength
        dropIdx.current = (i + 1) % 8
      },
    }))

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas || prefersReducedMotion()) return

      // A canvas whose context is lost composites as an OPAQUE WHITE quad in
      // Chromium — a 620px white square straight over the hero. The canvas is
      // therefore hidden by default and only revealed once a frame has landed,
      // and re-hidden the moment the context goes away.
      const show = () => canvas.classList.remove('gl-dead')
      const hide = () => canvas.classList.add('gl-dead')
      hide()

      // WebGL2 is the intended path (Chrome 56+, Firefox 51+, Safari 15+), but
      // it is not guaranteed: GPU blocklists, disabled WebGL and software-only
      // machines all hand back null. Those visitors get the same water drawn
      // with 2D canvas rings rather than an empty hole in the hero.
      const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true })
      if (!gl) return start2DFallback(canvas, dropsRef, startRef, show)

      // Re-entry (StrictMode, remount) hands back the SAME context object, and
      // cleanup below intentionally lost it. Ask for it back before giving up.
      if (gl.isContextLost()) {
        gl.getExtension('WEBGL_lose_context')?.restoreContext()
      }

      const compile = (type: number, src: string) => {
        const sh = gl.createShader(type)!
        gl.shaderSource(sh, src)
        gl.compileShader(sh)
        return sh
      }
      let uTime: WebGLUniformLocation | null = null
      let uRes: WebGLUniformLocation | null = null
      let uDrops: WebGLUniformLocation | null = null
      let uLight: WebGLUniformLocation | null = null
      // program setup lives in a function so a restored context can rebuild it
      const initGL = () => {
        const prog = gl.createProgram()!
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
        gl.linkProgram(prog)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false
        gl.useProgram(prog)
        gl.bindVertexArray(gl.createVertexArray())
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        uTime = gl.getUniformLocation(prog, 'uTime')
        uRes = gl.getUniformLocation(prog, 'uRes')
        uDrops = gl.getUniformLocation(prog, 'uDrops')
        uLight = gl.getUniformLocation(prog, 'uLight')
        return true
      }
      // a failed build is not fatal: the canvas simply stays hidden and the
      // hero falls back to its rings + atmosphere, which is a complete design
      const ready = initGL()

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const resize = () => {
        const r = canvas.getBoundingClientRect()
        canvas.width = Math.max(1, r.width * dpr)
        canvas.height = Math.max(1, r.height * dpr)
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(canvas)

      let raf = 0
      let running = false
      let live = ready
      const frame = () => {
        if (gl.isContextLost()) {
          hide()
          running = false
          return
        }
        gl.uniform1f(uTime, (performance.now() - startRef.current) / 1000)
        gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.uniform4fv(uDrops, dropsRef.current)
        gl.uniform1f(uLight, document.documentElement.dataset.theme === 'light' ? 1 : 0)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        show() // only ever revealed with real pixels behind it
        raf = requestAnimationFrame(frame)
      }
      const start = () => {
        if (!running && live && !gl.isContextLost()) {
          running = true
          raf = requestAnimationFrame(frame)
        }
      }
      const stop = () => {
        running = false
        cancelAnimationFrame(raf)
      }
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
      io.observe(canvas)

      // survive GPU context loss: hide instantly, rebuild the program on restore
      const onLost = (e: Event) => {
        e.preventDefault()
        live = false
        hide()
        stop()
      }
      const onRestored = () => {
        live = initGL()
        if (live) {
          resize()
          start()
        }
      }
      canvas.addEventListener('webglcontextlost', onLost)
      canvas.addEventListener('webglcontextrestored', onRestored)

      return () => {
        canvas.removeEventListener('webglcontextlost', onLost)
        canvas.removeEventListener('webglcontextrestored', onRestored)
        stop()
        io.disconnect()
        ro.disconnect()
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    }, [])

    return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />
  },
)
