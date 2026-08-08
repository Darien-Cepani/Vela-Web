/**
 * The showcase film for one project.
 *
 * Five acts, the same every time, so the set reads as a series:
 *
 *   1. Open      the client's logo over their own colours, accent sweeping in
 *   2. Services  what we actually did on this job, as chips that land in turn
 *   3. Beats     one screen per point, wiped in behind a caption
 *   4. Palette   the colours and the type the project is built from
 *   5. Sign-off  the Vela mark, on Vela's colours
 *
 * THREE RULES hold it together.
 *
 * The film wears the CLIENT's colours, not ours. A film about a cream-and-lime
 * agency rendered on our dark teal reads as a template they were dropped into.
 * Only the sign-off returns to Vela's palette, because that part is ours.
 *
 * Captions live in the UPPER half of the frame. These films play inside a
 * portfolio card that carries the project's name and logo across its foot, and
 * anything written along the bottom of the video disappears underneath it.
 *
 * Nothing fades OUT. Every act fades IN over whatever is beneath it and stays
 * mounted until its successor has fully arrived. Fading one out while the next
 * is still arriving leaves a hole where the frame is empty.
 */
import React from 'react'
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from 'remotion'

/**
 * One point in the film.
 *
 * `video` is a recording of the real page or app and is preferred; `img` is a
 * still and is the fallback where no recording exists. A still with a slow
 * scale on it reads as a slideshow ABOUT a product; the recording reads as the
 * product. The clips are captured a little longer than a beat and played
 * slightly fast, so each one still contains its whole eased scroll.
 */
export type Beat = { img?: string; video?: string; label: string; caption: string }
export type Theme = {
  /** the ground the film sits on: the client's, not ours */
  bg: string
  /** headline colour, chosen against `bg` */
  ink: string
  /** the client's accent */
  accent: string
  /** true when `bg` is light, which flips shadows, scrims and grain */
  light?: boolean
  /** the colours the project is actually built from, shown in the palette act */
  swatches: string[]
}
export type CaseFilmProps = {
  name: string
  kicker: string
  logo?: string
  /**
   * True when `logo` spells the client's name out. A wordmark already says the
   * name, so printing it again underneath reads as a mistake; a symbol says
   * nothing on its own and needs the name beside it.
   */
  logoWordmark?: boolean
  theme: Theme
  /** what we did on this job, shown as chips */
  services: string[]
  /** heading for the palette act, in the film's language */
  paletteLabel: string
  beats: Beat[]
  outro: string
}

/** Vela's own colours. The sign-off only. */
const SEA = '#071E26'
const MIST = '#9FBAC3'
const VELA = '#00AAD4'

const DISPLAY = '"Clash Display", "Segoe UI", system-ui, sans-serif'
const BODY = '"Satoshi", "Segoe UI", system-ui, sans-serif'

/** Frames each act owns. Beats share what is left. */
export const OPEN = 72
export const SERVICES = 60
export const PALETTE = 66
export const SIGNOFF = 66
/** How long one act takes to arrive over the one beneath it. */
const CROSS = 14
/** Clips are captured at 3.6s and a beat holds 3.0s. */
export const CLIP_RATE = 1.2

const ease = { damping: 200, mass: 0.7 } as const

/** Fades an act in over the one beneath it. Never fades anything out. */
const useArrival = () => {
  const frame = useCurrentFrame()
  return interpolate(frame, [0, CROSS], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

const Grain: React.FC<{ light?: boolean }> = ({ light }) => (
  <AbsoluteFill
    style={{
      opacity: light ? 0.03 : 0.05,
      mixBlendMode: light ? 'multiply' : 'normal',
      pointerEvents: 'none',
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
    }}
  />
)

/** A wash of the project's accent, so no act is ever flat colour. */
const Wash: React.FC<{ theme: Theme; at?: string }> = ({ theme, at = '78% 18%' }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(1100px 720px at ${at}, ${theme.accent}${
        theme.light ? '26' : '22'
      }, transparent 70%)`,
    }}
  />
)

/* ── 1. open ───────────────────────────────────────────────────────────────
   The client's mark, then their name, then a rule that draws across in their
   accent. Everything is legible from frame zero: a paused video, a poster
   fallback or a card that has not started yet all show this frame, and a
   spring starting at nothing would show them an empty rectangle. */
const Open: React.FC<{
  name: string
  kicker: string
  logo?: string
  logoWordmark?: boolean
  theme: Theme
}> = ({ name, kicker, logo, logoWordmark, theme }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const settle = spring({ frame, fps, config: ease })
  const rise = 0.35 + settle * 0.65
  const rule = spring({ frame: frame - 8, fps, config: { damping: 200 } })
  const markIn = spring({ frame: frame - 2, fps, config: { damping: 180, mass: 0.6 } })

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, justifyContent: 'center', padding: '0 140px' }}>
      <Wash theme={theme} />
      {logo && (
        <div
          style={{
            marginBottom: 40,
            opacity: markIn,
            transform: `translateY(${(1 - markIn) * 14}px)`,
          }}
        >
          <Img
            src={staticFile(logo)}
            style={{
              height: logoWordmark ? 104 : 64,
              width: 'auto',
              maxWidth: 700,
              objectFit: 'contain',
              objectPosition: 'left',
              // the marks arrive in their own colours; on a coloured ground
              // they are forced to the film's ink so five of them match
              filter: theme.light
                ? 'brightness(0) saturate(0)'
                : 'brightness(0) invert(1)',
            }}
          />
        </div>
      )}
      <div style={{ transform: `translateY(${(1 - settle) * 18}px)`, opacity: rise }}>
        <div
          style={{
            fontFamily: BODY,
            fontSize: 22,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: theme.accent,
            fontWeight: 700,
          }}
        >
          {kicker}
        </div>
        {!logoWordmark && (
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 122,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              color: theme.ink,
              fontWeight: 600,
              marginTop: 14,
            }}
          >
            {name}
          </div>
        )}
        <div
          style={{
            height: 3,
            marginTop: 30,
            width: `${(0.25 + rule * 0.75) * 460}px`,
            background: `linear-gradient(90deg, ${theme.accent}, transparent)`,
          }}
        />
      </div>
      <Grain light={theme.light} />
    </AbsoluteFill>
  )
}

/* ── 2. services ───────────────────────────────────────────────────────────
   What the job actually involved. A portfolio card shows what a thing looks
   like; this says what was done to make it, which is the part a prospect is
   trying to work out. */
const Services: React.FC<{ services: string[]; theme: Theme; label: string }> = ({
  services,
  theme,
  label,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const arrive = useArrival()
  const head = spring({ frame: frame - 4, fps, config: ease })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        opacity: arrive,
        justifyContent: 'center',
        padding: '0 140px',
      }}
    >
      <Wash theme={theme} at="22% 78%" />
      <div
        style={{
          fontFamily: BODY,
          fontSize: 21,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: theme.accent,
          fontWeight: 700,
          opacity: head,
          transform: `translateY(${(1 - head) * 12}px)`,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 34, maxWidth: 1500 }}>
        {services.map((s, i) => {
          const pop = spring({ frame: frame - 10 - i * 5, fps, config: { damping: 160, mass: 0.5 } })
          return (
            <div
              key={s}
              style={{
                fontFamily: DISPLAY,
                fontSize: 46,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: theme.ink,
                padding: '14px 34px',
                borderRadius: 999,
                border: `2px solid ${theme.accent}${theme.light ? '55' : '44'}`,
                background: `${theme.accent}${theme.light ? '18' : '14'}`,
                opacity: pop,
                transform: `translateY(${(1 - pop) * 26}px) scale(${0.94 + pop * 0.06})`,
              }}
            >
              {s}
            </div>
          )
        })}
      </div>
      <Grain light={theme.light} />
    </AbsoluteFill>
  )
}

/* ── 3. beats ──────────────────────────────────────────────────────────────
   One screen per point. The screenshot wipes in behind the caption rather
   than fading, which reads as deliberate rather than as a slideshow, and it
   keeps moving the whole time it is held so a still never looks frozen. */
const BeatShot: React.FC<{ beat: Beat; theme: Theme; length: number; index: number }> = ({
  beat,
  theme,
  length,
  index,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const arrive = useArrival()
  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.8 } })
  const capIn = spring({ frame: frame - 6, fps, config: ease })
  /* A slow scale so a held screenshot never looks like a frozen frame.
     It scales the FRAME, not the picture inside it, and it stays at or below
     1. Scaling the image past 1 inside a clipping frame pushed its own edges
     out of view: the screenshot lost a strip off every side, which on a
     screenshot is exactly the part that shows the interface ends where it is
     supposed to. Now the whole shot stays in view the entire time. */
  const drift = beat.video ? 1 : interpolate(frame, [0, length], [0.965, 1])
  // the wipe: the shot is revealed from one edge rather than faded up
  const wipe = interpolate(enter, [0, 1], [100, 0])

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, opacity: arrive }}>
      <Wash theme={theme} at={index % 2 === 0 ? '18% 12%' : '82% 16%'} />

      {/* the screen, held low so the caption above it always has clear air */}
      <AbsoluteFill style={{ padding: '300px 120px 90px', justifyContent: 'flex-end' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            border: theme.light
              ? '1px solid rgba(12,18,20,0.10)'
              : '1px solid rgba(255,255,255,0.10)',
            boxShadow: theme.light
              ? '0 40px 90px rgba(20,24,15,0.20)'
              : '0 50px 120px rgba(2,10,14,0.55)',
            clipPath: `inset(0 ${index % 2 === 0 ? wipe : 0}% 0 ${index % 2 === 0 ? 0 : wipe}%)`,
            transform: `translateY(${(1 - enter) * 26}px) scale(${drift})`,
            transformOrigin: index % 2 === 0 ? '30% 50%' : '70% 50%',
          }}
        >
          {beat.video ? (
            <OffthreadVideo
              src={staticFile(beat.video)}
              /* the clip runs 3.6s and a beat holds 3.0s, so it is nudged
                 along rather than cut short: the scroll still eases out */
              playbackRate={CLIP_RATE}
              muted
              style={{ display: 'block', width: '100%' }}
            />
          ) : (
            <Img src={staticFile(beat.img!)} style={{ display: 'block', width: '100%' }} />
          )}
        </div>
      </AbsoluteFill>

      {/* the caption, in the upper third, where the portfolio card's own
          name plate cannot sit on top of it */}
      <AbsoluteFill style={{ padding: '96px 120px', justifyContent: 'flex-start' }}>
        <div style={{ opacity: capIn, transform: `translateY(${(1 - capIn) * 16}px)` }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontFamily: BODY,
              fontSize: 19,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: theme.accent,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: `${capIn * 54}px`,
                height: 2,
                background: theme.accent,
              }}
            />
            {beat.label}
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 58,
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: theme.ink,
              fontWeight: 600,
              marginTop: 14,
              maxWidth: 1340,
            }}
          >
            {beat.caption}
          </div>
        </div>
      </AbsoluteFill>
      <Grain light={theme.light} />
    </AbsoluteFill>
  )
}

/* ── 4. palette ────────────────────────────────────────────────────────────
   The colours the thing is actually built from. This is the design half of
   the job made visible: a screenshot shows the result, the swatches show the
   decision behind it. */
const Palette: React.FC<{ theme: Theme; label: string; name: string }> = ({
  theme,
  label,
  name,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const arrive = useArrival()
  const head = spring({ frame: frame - 4, fps, config: ease })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        opacity: arrive,
        justifyContent: 'center',
        padding: '0 140px',
      }}
    >
      <Wash theme={theme} at="70% 30%" />
      <div
        style={{
          fontFamily: BODY,
          fontSize: 21,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: theme.accent,
          fontWeight: 700,
          opacity: head,
          transform: `translateY(${(1 - head) * 12}px)`,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 92,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: theme.ink,
          marginTop: 12,
          opacity: head,
        }}
      >
        {name}
      </div>
      <div style={{ display: 'flex', gap: 22, marginTop: 46 }}>
        {theme.swatches.map((c, i) => {
          const pop = spring({ frame: frame - 12 - i * 6, fps, config: { damping: 150, mass: 0.5 } })
          return (
            <div
              key={c + i}
              style={{
                width: 190,
                height: 190,
                borderRadius: 22,
                background: c,
                border: theme.light
                  ? '1px solid rgba(12,18,20,0.12)'
                  : '1px solid rgba(255,255,255,0.14)',
                transform: `translateY(${(1 - pop) * 30}px) scale(${0.9 + pop * 0.1})`,
                opacity: pop,
              }}
            />
          )
        })}
      </div>
      <Grain light={theme.light} />
    </AbsoluteFill>
  )
}

/* ── 5. sign-off ───────────────────────────────────────────────────────────
   Back to Vela's own palette. The body of the film belongs to the client;
   the signature at the end belongs to us. */
const SignOff: React.FC<{ outro: string }> = ({ outro }) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()
  const arrive = useArrival()
  const enter = spring({ frame: frame - 6, fps, config: { damping: 200 } })
  const rule = spring({ frame: frame - 18, fps, config: { damping: 200 } })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SEA,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: arrive,
      }}
    >
      <AbsoluteFill
        style={{ background: `radial-gradient(900px 620px at 50% 50%, ${VELA}22, transparent 70%)` }}
      />
      <div style={{ textAlign: 'center', opacity: enter, transform: `scale(${0.96 + enter * 0.04})` }}>
        <Img src={staticFile('mark.svg')} style={{ width: 104, marginBottom: 28 }} />
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 52,
            color: '#fff',
            fontWeight: 600,
            letterSpacing: '-0.015em',
          }}
        >
          {outro}
        </div>
        <div
          style={{
            height: 2,
            width: `${rule * 220}px`,
            margin: '22px auto 0',
            background: `linear-gradient(90deg, transparent, ${VELA}, transparent)`,
          }}
        />
        <div style={{ fontFamily: BODY, fontSize: 23, color: MIST, marginTop: 18, letterSpacing: '0.06em' }}>
          vela.al
        </div>
      </div>
      <Grain />
    </AbsoluteFill>
  )
}

export const CaseFilm: React.FC<CaseFilmProps> = ({
  name,
  kicker,
  logo,
  logoWordmark,
  theme,
  services,
  paletteLabel,
  beats,
  outro,
}) => {
  const { durationInFrames } = useVideoConfig()
  const body = durationInFrames - OPEN - SERVICES - PALETTE - SIGNOFF
  const per = Math.floor(body / Math.max(1, beats.length))

  // Every act outlives its own slot by CROSS frames so the next has something
  // to arrive over. Without the overlap the frame goes empty between acts.
  let at = 0
  const open = at
  at += OPEN
  const services0 = at
  at += SERVICES
  const beats0 = at
  at += per * beats.length
  const palette0 = at
  at += PALETTE
  const sign0 = at

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <Sequence from={open} durationInFrames={OPEN + CROSS}>
        <Open name={name} kicker={kicker} logo={logo} logoWordmark={logoWordmark} theme={theme} />
      </Sequence>
      <Sequence from={services0} durationInFrames={SERVICES + CROSS}>
        <Services services={services} theme={theme} label={paletteLabel.split('|')[0]} />
      </Sequence>
      {beats.map((b, i) => (
        <Sequence key={b.img + i} from={beats0 + i * per} durationInFrames={per + CROSS}>
          <BeatShot beat={b} theme={theme} length={per} index={i} />
        </Sequence>
      ))}
      <Sequence from={palette0} durationInFrames={PALETTE + CROSS}>
        <Palette theme={theme} label={paletteLabel.split('|')[1]} name={name} />
      </Sequence>
      <Sequence from={sign0} durationInFrames={SIGNOFF}>
        <SignOff outro={outro} />
      </Sequence>
    </AbsoluteFill>
  )
}
