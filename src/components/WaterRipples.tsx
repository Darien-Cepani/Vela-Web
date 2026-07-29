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

  vec3 col = vec3(0.0, 0.667, 0.831) * (0.25 + diff * 0.5) + vec3(1.0) * spec * 0.9;
  float a = clamp((abs(h) * 0.9 + spec * 0.8) * smoothstep(1.0, 0.55, r), 0.0, 0.85);
  /* premultiplied output: composites correctly on every backend (ANGLE/D3D
     shows an opaque white backing for non-premultiplied alpha canvases) */
  outColor = vec4(col * a, a);
}`

const VERT = `#version 300 es
void main() {
  vec2 v = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);
}`

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
      const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true })
      if (!gl) return

      const compile = (type: number, src: string) => {
        const sh = gl.createShader(type)!
        gl.shaderSource(sh, src)
        gl.compileShader(sh)
        return sh
      }
      let uTime: WebGLUniformLocation | null = null
      let uRes: WebGLUniformLocation | null = null
      let uDrops: WebGLUniformLocation | null = null
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
        return true
      }
      if (!initGL()) return

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
      const frame = () => {
        gl.uniform1f(uTime, (performance.now() - startRef.current) / 1000)
        gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.uniform4fv(uDrops, dropsRef.current)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        raf = requestAnimationFrame(frame)
      }
      const start = () => {
        if (!running && !gl.isContextLost()) {
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

      // survive GPU context loss: pause on lost, rebuild the program on restore
      const onLost = (e: Event) => {
        e.preventDefault()
        stop()
      }
      const onRestored = () => {
        if (initGL()) {
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
