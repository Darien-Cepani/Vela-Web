/**
 * Six diagrams, one per service, each drawn as a recognisable object rather
 * than an abstract bar so the point lands before the caption is read.
 *
 * Inline SVG rather than rendered video: these must flip with the light and
 * dark themes, carry no baked-in language, stay sharp on any display and cost
 * a couple of kilobytes. A video file fails all four.
 *
 * Two colours only — `currentColor` for the neutral furniture, which inherits
 * the card's text colour and therefore the theme, and brand cyan for the thing
 * the diagram is arguing. Motion runs off a `.dia-run` class added when the
 * card scrolls into view, so nothing animates off-screen and reduced motion
 * switches all of it off in one rule.
 */
export type DiagramKind = 'hours' | 'found' | 'craft' | 'reuse' | 'automate' | 'cited'

const BOX = 'h-full w-full'
const VB = '0 0 176 100'

export function ShiftDiagram({ kind }: { kind: DiagramKind }) {
  switch (kind) {
    /**
     * A 24-hour dial with midnight at the top.
     *
     * The claim is "sell while you sleep", and the note underneath it is
     * "orders land at 3am, you pack them at nine" — so the diagram has to
     * carry a whole sentence, not just the idea of time passing. One loop is
     * one day: the hand sweeps, a moon sits at the centre through the night,
     * three orders land ON the ring at the exact moment the hand passes 1am,
     * 3am and 6am, each dropping a receipt beside it. Then the sun comes up
     * and the receipts get ticked, one by one. That is the whole caption.
     *
     * Everything is angle-derived rather than hand-placed so the hours are
     * actually where they claim to be: midnight at the top, and hour h at
     * h * 15 degrees clockwise from it.
     */
    case 'hours': {
      // measured against the other five: they draw from x≈8 to x≈168, so the
      // dial and its receipts have to span the same width or this card reads
      // smaller and shunted right, which it did.
      const CX = 50
      const CY = 50
      const R = 38
      // midnight at 12 o'clock; SVG angles start at 3 o'clock, hence the -90
      const at = (hour: number, radius: number) => {
        const a = ((hour * 15 - 90) * Math.PI) / 180
        return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)] as const
      }
      const ORDERS = [1, 3, 6]

      return (
        <svg viewBox={VB} className={BOX} aria-hidden fill="none">
          <defs>
            {/* a real crescent: a disc with a disc bitten out of it, so it
                needs no background colour to fake the shadow side */}
            <mask id="vela-dia-moon">
              <circle cx={CX} cy={CY} r="10" fill="#fff" />
              <circle cx={CX + 5} cy={CY - 4} r="9" fill="#000" />
            </mask>
          </defs>

          {/* the twenty-four hours */}
          {Array.from({ length: 24 }, (_, h) => {
            const major = h % 6 === 0
            const [x1, y1] = at(h, R)
            const [x2, y2] = at(h, major ? R - 7 : R - 3.5)
            return (
              <line
                key={h}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="dia-stroke"
                strokeWidth={major ? 2 : 1.2}
                strokeOpacity={major ? 0.4 : 0.18}
                strokeLinecap="round"
              />
            )
          })}

          {/* the shop, open right around it */}
          <circle cx={CX} cy={CY} r={R} className="dia-h-ring" />

          {/* now: a bright arc and a hand, rotating together */}
          <g className="dia-h-sweep">
            <circle
              cx={CX}
              cy={CY}
              r={R}
              className="dia-h-seg"
              transform={`rotate(-90 ${CX} ${CY})`}
              strokeLinecap="round"
            />
            {/* the hour hand: short and thick, as on any clock. Both hands start
                at r=15, which clears the sun's rays (13) and the moon (10). */}
            <path
              d={`M${CX - 2.3} ${CY - 15} L${CX} ${CY - 28} L${CX + 2.3} ${CY - 15} Z`}
              className="dia-h-hand"
            />
            <circle cx={CX} cy={CY - 15} r="2.3" className="dia-h-hand" />
          </g>

          {/* The minute hand: long, thin, and turning twenty-four times for every
              one turn of the hour hand, because that is the real ratio on a
              24-hour dial. Over a 7s day that is 291ms a revolution — 20.6° per
              frame at 60Hz, far under the ~180° where a rotating shape starts to
              look like it is going backwards, so it reads as fast rather than
              broken. It is what makes the day feel like it is racing. */}
          <g className="dia-h-min">
            <path
              d={`M${CX - 1.3} ${CY - 15} L${CX} ${CY - 36} L${CX + 1.3} ${CY - 15} Z`}
              className="dia-h-hand-min"
            />
          </g>

          {/* night and day, at the heart of the dial */}
          <g className="dia-h-moon">
            <circle cx={CX} cy={CY} r="10" className="dia-fill-accent" mask="url(#vela-dia-moon)" />
          </g>
          <g className="dia-h-sun">
            <circle cx={CX} cy={CY} r="6" className="dia-fill-accent" />
            {Array.from({ length: 8 }, (_, i) => {
              const a = ((i * 45) * Math.PI) / 180
              return (
                <line
                  key={i}
                  x1={CX + 9 * Math.cos(a)}
                  y1={CY + 9 * Math.sin(a)}
                  x2={CX + 13 * Math.cos(a)}
                  y2={CY + 13 * Math.sin(a)}
                  className="dia-stroke-accent"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )
            })}
          </g>

          {/* orders landing on the ring, at the hour they arrive */}
          {ORDERS.map((h, i) => {
            const [x, y] = at(h, R)
            return (
              <g key={h} className={`dia-h-ord dia-h-ord-${i + 1}`}>
                <circle cx={x} cy={y} r="8" className="dia-h-ping" />
                <circle cx={x} cy={y} r="4.6" className="dia-fill-accent" />
              </g>
            )
          })}

          {/* the receipts they leave behind */}
          {[13, 39, 65].map((y, i) => (
            <g key={y} className={`dia-h-rcpt dia-h-rcpt-${i + 1}`}>
              <rect x="98" y={y} width="72" height="22" rx="7" className="dia-card" />
              <circle cx="110" cy={y + 11} r="4.5" className={`dia-fill-accent dia-h-pend dia-h-pend-${i + 1}`} />
              <path
                d={`M106 ${y + 11.5} l3.2 3.4 l6.6 -7.6`}
                className={`dia-stroke-accent dia-h-done dia-h-done-${i + 1}`}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="121" y={y + 8} width={[36, 29, 34][i]} height="6" rx="3" className="dia-track" />
            </g>
          ))}
        </svg>
      )
    }

    /**
     * A query is typed, the results come back, and yours climbs to the top —
     * while the same business drops a pin on the map beside it.
     *
     * The claim is "pages built to rank, and a Maps profile that is complete",
     * so the diagram has to show *movement up an order*, not just a highlighted
     * row. Your result therefore starts third and physically overtakes the
     * other two, which shift down to make room.
     *
     * Results are drawn as a title over a shorter breadcrumb, because that
     * silhouette is what a search result looks like anywhere in the world. The
     * map is a street grid rather than the crosshair it used to be — a square
     * with a plus through it reads as a viewfinder, not a place.
     *
     * The map itself stays still. Six diagrams all looping at once is already
     * a lot of motion, so here only the two things being claimed actually
     * move: the rank, and the pin.
     */
    case 'found':
      return (
        <svg viewBox={VB} className={BOX} aria-hidden fill="none">
          {/* ── the search field ── */}
          <rect x="8" y="6" width="96" height="21" rx="10.5" className="dia-card" />
          <circle cx="21" cy="16.5" r="5" className="dia-stroke" />
          <path d="M24.6 20.1 L28 23.5" className="dia-stroke" strokeLinecap="round" />
          {/* the query, arriving a word at a time */}
          <rect x="33" y="13.5" width="16" height="6" rx="3" className="dia-fill-accent dia-f-q dia-f-q1" />
          <rect x="52" y="13.5" width="23" height="6" rx="3" className="dia-fill-accent dia-f-q dia-f-q2" />
          <rect x="78" y="13.5" width="13" height="6" rx="3" className="dia-fill-accent dia-f-q dia-f-q3" />
          <rect x="94" y="10.5" width="1.8" height="12" rx="0.9" className="dia-fill-accent dia-f-caret" />

          {/* ── the results ──
              Two of them start at the top and are pushed down; yours starts
              third and takes first place. */}
          <g className="dia-f-res dia-f-res-b">
            <rect x="20" y="37" width="56" height="6" rx="3" className="dia-track" />
            <rect x="20" y="47" width="28" height="4" rx="2" className="dia-track" />
          </g>
          <g className="dia-f-res dia-f-res-c">
            <rect x="20" y="59" width="60" height="6" rx="3" className="dia-track" />
            <rect x="20" y="69" width="31" height="4" rx="2" className="dia-track" />
          </g>
          <g className="dia-f-res dia-f-res-a">
            <circle cx="12" cy="84" r="3.6" className="dia-fill-accent" />
            <rect x="20" y="81" width="62" height="6" rx="3" className="dia-fill-accent" />
            <rect x="20" y="91" width="34" height="4" rx="2" className="dia-track" />
          </g>

          {/* ── the map ──
              Two cross streets and two avenues, each a degree or two off square
              so the grid looks surveyed rather than ruled. The blocks are the
              negative space between them, with a few filled in; the pin stands
              in the middle one with its tip on the street. Clipped to the card
              so the streets run off the edges the way a map viewport does. */}
          <defs>
            <clipPath id="vela-dia-map">
              <rect x="110" y="34" width="58" height="58" rx="9" />
            </clipPath>
          </defs>
          <rect x="110" y="34" width="58" height="58" rx="9" className="dia-card" />
          <g clipPath="url(#vela-dia-map)">
            <rect x="112" y="58" width="13" height="19" rx="1.5" className="dia-track" />
            <rect x="135" y="36" width="18" height="12" rx="1.5" className="dia-track" />
            <rect x="161" y="58" width="9" height="19" rx="1.5" className="dia-track" />
            <path d="M108 55 L170 51" className="dia-f-road" strokeWidth="3.4" />
            <path d="M108 80 L170 77" className="dia-f-road" strokeWidth="3.4" />
            <path d="M127 32 L131 94" className="dia-f-road" strokeWidth="3.4" />
            <path d="M156 32 L158 94" className="dia-f-road" strokeWidth="2.2" />
          </g>
          {/* your place on it. The pin's eye is a real hole punched with a
              mask, not a disc painted in a background colour — the card behind
              it is translucent and flips with the theme. */}
          <defs>
            <mask id="vela-dia-pin">
              <path
                d="M143 52.5 c -5.8 0 -10.5 4.7 -10.5 10.5 c 0 7.9 10.5 16 10.5 16 c 0 0 10.5 -8.1 10.5 -16 c 0 -5.8 -4.7 -10.5 -10.5 -10.5 z"
                fill="#fff"
              />
              <circle cx="143" cy="63" r="3.7" fill="#000" />
            </mask>
          </defs>
          <g className="dia-f-pin">
            <circle cx="143" cy="63" r="9" className="dia-f-pinping" />
            <rect x="130" y="51" width="26" height="30" className="dia-fill-accent" mask="url(#vela-dia-pin)" />
          </g>
        </svg>
      )

    /**
     * Three shops a customer is choosing between. Yours is the one that got
     * designed, so it is the one that gets looked at.
     *
     * The claim is "elevate your image" and the note is "looks are the first
     * impression — grab the attention of potential customers", so the point is
     * comparative: standing out only means anything next to what you are
     * standing next to. A single card improving in isolation cannot say that.
     * The two neighbours are therefore identical in size, spacing and content
     * to yours, and never move — the only variable in the frame is the design.
     *
     * The middle card composes (crooked content snapping to a shared grid,
     * then the brand landing on it) and physically rises above the other two,
     * which is "elevate" meant literally. The lift begins the moment the brand
     * lands, before the loop has shown anything about what is being sold:
     * looks are the first impression.
     *
     * Every card is drawn from the same offsets so nothing about the neighbours
     * is quietly made worse to flatter the middle one.
     */
    case 'craft': {
      const CARD = { y: 28, w: 46, h: 56 }
      const Peer = ({ x }: { x: number }) => (
        <g>
          <rect x={x} y={CARD.y} width={CARD.w} height={CARD.h} rx="8" className="dia-card" />
          <rect x={x + 8} y="37" width="30" height="18" rx="4" className="dia-track" />
          <rect x={x + 8} y="61" width="24" height="5" rx="2.5" className="dia-track" />
          <rect x={x + 8} y="70" width="16" height="4" rx="2" className="dia-track" />
        </g>
      )

      return (
        <svg viewBox={VB} className={BOX} aria-hidden fill="none">
          <Peer x={9} />
          <Peer x={121} />

          {/* the glow it casts once it is up off the row */}
          <ellipse cx="88" cy="88" rx="26" ry="3.5" className="dia-fill-accent dia-c-glow" />

          {/* the grid the type snaps to — shown only during the snap, as guides are */}
          <g className="dia-c-guide">
            <path d="M73 33 V79" className="dia-stroke-accent" strokeWidth="1" strokeDasharray="2 3" />
            <path d="M103 33 V79" className="dia-stroke-accent" strokeWidth="1" strokeDasharray="2 3" />
          </g>

          {/* yours */}
          <g className="dia-c-card">
            <rect x="65" y={CARD.y} width={CARD.w} height={CARD.h} rx="8" className="dia-card" />
            <rect
              x="65"
              y={CARD.y}
              width={CARD.w}
              height={CARD.h}
              rx="8"
              className="dia-stroke-accent dia-c-on dia-c-edge"
              strokeWidth="1.5"
            />
            <g className="dia-c-hero">
              <rect x="73" y="37" width="30" height="18" rx="4" className="dia-track" />
              <rect x="73" y="37" width="30" height="18" rx="4" className="dia-c-on dia-c-on-hero" />
            </g>
            <g className="dia-c-t1">
              <rect x="73" y="61" width="20" height="5" rx="2.5" className="dia-track" />
              <rect x="73" y="61" width="20" height="5" rx="2.5" className="dia-fill-accent dia-c-on dia-c-on-t1" />
            </g>
            <rect x="73" y="70" width="14" height="4" rx="2" className="dia-track dia-c-t2" />
            <circle cx="99" cy="63.5" r="4.5" className="dia-fill-accent dia-c-chip" />
            {/* the notice it draws */}
            <rect x="65" y={CARD.y} width={CARD.w} height={CARD.h} rx="8" className="dia-c-ring" />
          </g>
        </svg>
      )
    }

    /**
     * One photograph, cropped into the three places it has to live.
     *
     * The old version fanned three wires out to three empty grey rectangles.
     * Empty rectangles cannot say "shop, feed and ads" — and because nothing
     * recognisable travelled down the wires, it read as a node graph rather
     * than as one asset being reused.
     *
     * So the picture itself is the argument: the same sun-over-hills scene is
     * drawn in the master frame and in all three destinations, each time
     * clipped to that destination's aspect — square for the feed, upright for
     * the shop, letterbox for the ad. You can see it is the same shot, which
     * is the entire claim. Each destination then builds its own furniture
     * around it (an avatar and handle; a title and a price; a headline and a
     * button), because that furniture is what identifies the place.
     *
     * `pathLength="1"` lets the wires draw themselves without anyone having to
     * measure a bezier.
     */
    case 'reuse': {
      // The crops carry the entire argument, so they have to be unmistakably
      // different shapes: 1.00 square for the feed, 0.73 upright for the shop,
      // 3.06 letterbox for the ad. An earlier pass had these at 1.25 / 1.67 /
      // 1.00, which made the ad the only square and the shop the widest — the
      // exact opposite of the claim.
      const SCENES = [
        { id: 'vela-dia-shot-0', x: 6, y: 30, w: 52, h: 40 },
        { id: 'vela-dia-shot-1', x: 100, y: 4, w: 28, h: 28 },
        { id: 'vela-dia-shot-2', x: 100, y: 38, w: 22, h: 30 },
        { id: 'vela-dia-shot-3', x: 100, y: 76, w: 52, h: 17 },
      ]
      // the same photograph every time; only the crop changes
      const Scene = ({ id, x, y, w, h }: (typeof SCENES)[number]) => (
        <g clipPath={`url(#${id})`}>
          <rect x={x} y={y} width={w} height={h} className="dia-fill-soft" />
          <circle cx={x + w * 0.74} cy={y + h * 0.3} r={Math.max(2, h * 0.14)} className="dia-fill-accent" />
          <path
            d={`M${x} ${y + h} L${x} ${y + h * 0.8} Q${x + w * 0.3} ${y + h * 0.4} ${x + w * 0.55} ${y + h * 0.78} Q${x + w * 0.76} ${y + h} ${x + w} ${y + h * 0.62} L${x + w} ${y + h} Z`}
            className="dia-fill-accent"
            fillOpacity="0.5"
          />
        </g>
      )

      return (
        <svg viewBox={VB} className={BOX} aria-hidden fill="none">
          <defs>
            {SCENES.map((sc) => (
              <clipPath key={sc.id} id={sc.id}>
                <rect x={sc.x} y={sc.y} width={sc.w} height={sc.h} rx="4" />
              </clipPath>
            ))}
          </defs>

          {/* ── the shot ── */}
          <g className="dia-r-master">
            <Scene {...SCENES[0]} />
            <rect x="6" y="30" width="52" height="40" rx="5" className="dia-stroke-accent" strokeWidth="1.5" />
            <rect x="6" y="30" width="52" height="40" rx="5" className="dia-r-flash" />
          </g>
          {/* the viewfinder closing on it, once, as the frame is taken */}
          <g className="dia-r-frame">
            {['M4 36 L4 28 L12 28', 'M52 28 L60 28 L60 36', 'M4 64 L4 72 L12 72', 'M52 72 L60 72 L60 64'].map((d) => (
              <path key={d} d={d} className="dia-stroke-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </g>

          {/* ── out to the three places it has to live ── */}
          <path d="M58 50 C 76 50, 78 18, 98 18" className="dia-stroke-accent dia-r-wire dia-r-wire-1" pathLength="1" />
          <path d="M58 50 C 76 50, 78 53, 98 53" className="dia-stroke-accent dia-r-wire dia-r-wire-2" pathLength="1" />
          <path d="M58 50 C 76 50, 78 84, 98 84" className="dia-stroke-accent dia-r-wire dia-r-wire-3" pathLength="1" />

          {/* the feed: a square post under a handle */}
          <g className="dia-r-shot dia-r-shot-1"><Scene {...SCENES[1]} /></g>
          <g className="dia-r-ui dia-r-ui-1">
            <circle cx="135" cy="12" r="3.2" className="dia-track" />
            <rect x="142" y="10.4" width="18" height="3.2" rx="1.6" className="dia-track" />
            <rect x="142" y="17" width="12" height="3" rx="1.5" className="dia-track" />
          </g>

          {/* the shop: an upright product card with a price */}
          <g className="dia-r-shot dia-r-shot-2"><Scene {...SCENES[2]} /></g>
          <g className="dia-r-ui dia-r-ui-2">
            <rect x="128" y="46" width="22" height="3.5" rx="1.75" className="dia-track" />
            <rect x="128" y="54" width="13" height="4" rx="2" className="dia-fill-accent" />
          </g>

          {/* the ad: a letterbox crop beside a headline and a button */}
          <g className="dia-r-shot dia-r-shot-3"><Scene {...SCENES[3]} /></g>
          <g className="dia-r-ui dia-r-ui-3">
            <rect x="156" y="79" width="13" height="3" rx="1.5" className="dia-track" />
            <rect x="156" y="85" width="13" height="5" rx="2.5" className="dia-fill-accent" />
          </g>
        </svg>
      )
    }

    /**
     * The routine work runs itself; the judgement call comes to you.
     *
     * The note splits the labour in two — "the software does the heavy
     * lifting, you make the decisions" — so the diagram is two panels, and the
     * split between them IS the point. The left panel is the machine: a gear
     * turning and a checklist ticking itself off with nobody touching it. The
     * right panel is you: the one thing that needed a person, presented as a
     * choice, with the option you picked lit.
     *
     * The connector between them only draws once the machine has finished its
     * three tasks, because the order matters — the software works first and
     * hands you what is left, rather than the two happening in parallel.
     *
     * The gear is the only element that runs on its own clock. Everything a
     * gear means — running, unattended, continuous — depends on it never
     * stopping, so it turns straight through the reset while the panels around
     * it rebuild.
     */
    case 'automate': {
      const ROWS = [46, 64, 82]
      const BARS = [40, 32, 44]

      return (
        <svg viewBox={VB} className={BOX} aria-hidden fill="none">
          {/* ── the software ── */}
          <g className="dia-a-machine">
            <rect x="6" y="14" width="84" height="76" rx="8" className="dia-card" />
            <rect x="32" y="23" width="32" height="5" rx="2.5" className="dia-track" />
            {ROWS.map((y, i) => (
              <g key={y} className={`dia-a-row dia-a-row-${i + 1}`}>
                <rect x="14" y={y - 5.5} width="11" height="11" rx="3" className="dia-stroke" strokeWidth="1.6" />
                <rect
                  x="14"
                  y={y - 5.5}
                  width="11"
                  height="11"
                  rx="3"
                  className={`dia-fill-soft dia-a-done dia-a-done-${i + 1}`}
                />
                <path
                  d={`M17 ${y} l2.4 2.6 l4.8 -5.6`}
                  className={`dia-stroke-accent dia-a-done dia-a-done-${i + 1}`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="31" y={y - 2.5} width={BARS[i]} height="5" rx="2.5" className="dia-track" />
              </g>
            ))}
          </g>
          {/* it never stops turning, including through the reset */}
          <g className="dia-a-gear">
            <circle cx="18" cy="26" r="6.5" className="dia-stroke-accent" strokeWidth="2" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <rect
                key={a}
                x="16.4"
                y="16.3"
                width="3.2"
                height="4"
                rx="1"
                className="dia-fill-accent"
                transform={`rotate(${a} 18 26)`}
              />
            ))}
            <circle cx="18" cy="26" r="2.4" className="dia-fill-accent" />
          </g>

          {/* ── and the one thing it hands to you ── */}
          <g className="dia-a-hand">
            <path d="M90 50 H 99" className="dia-stroke-accent" strokeWidth="1.8" pathLength="1" />
            <path d="M96 46.5 L99.5 50 L96 53.5" className="dia-stroke-accent" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
          </g>
          <g className="dia-a-choice">
            <rect x="100" y="26" width="70" height="48" rx="8" className="dia-card" />
            <rect x="110" y="36" width="30" height="5" rx="2.5" className="dia-track" />
            <rect x="110" y="48" width="24" height="14" rx="7" className="dia-stroke" strokeWidth="1.6" />
            <rect x="138" y="48" width="24" height="14" rx="7" className="dia-stroke" strokeWidth="1.6" />
            {/* the one you picked */}
            <g className="dia-a-pick">
              <rect x="138" y="48" width="24" height="14" rx="7" className="dia-fill-accent" />
              <rect x="138" y="48" width="24" height="14" rx="7" className="dia-a-pick-ping" />
            </g>
          </g>
        </svg>
      )
    }

    /**
     * Someone asks, and your name is inside the sentence that comes back.
     *
     * The old version put your name in a big pill UNDER two grey lines, which
     * read as a separate result card bolted onto the answer. That is exactly
     * the thing the claim denies: "be the answer, not a link". So the name is
     * now a lit token sitting mid-sentence on the second line, with plain text
     * either side of it — you are part of the answer, not an attachment to it.
     *
     * It is laid out as a chat because that is the shape of the thing being
     * described: a question on the right, a reply beneath it. The reply writes
     * itself left to right one run at a time, and the pause before the name
     * appears is what makes it land.
     *
     * A results list is deliberately absent — card 2 already owns that image,
     * and drawing links here would argue against the claim.
     */
    case 'cited':
      return (
        <svg viewBox={VB} className={BOX} aria-hidden fill="none">
          {/* the question */}
          <g className="dia-n-ask">
            <rect x="92" y="4" width="76" height="22" rx="11" className="dia-card" />
            <rect x="102" y="11.5" width="50" height="5" rx="2.5" className="dia-track" />
            <path d="M146 26 L156 26 L149 33 Z" className="dia-card" />
          </g>

          {/* the answer */}
          <g className="dia-n-panel">
            <rect x="8" y="36" width="160" height="58" rx="11" className="dia-card" />
          </g>
          {/* the assistant, twinkling on its own clock */}
          <path
            d="M24 42 Q25.4 48.6 32 50 Q25.4 51.4 24 58 Q22.6 51.4 16 50 Q22.6 48.6 24 42 Z"
            className="dia-fill-accent dia-n-spark"
          />

          <rect x="40" y="47.5" width="108" height="5" rx="2.5" className="dia-track dia-n-w1" />
          {/* … and here you are, mid-sentence */}
          <rect x="40" y="58.5" width="18" height="5" rx="2.5" className="dia-track dia-n-w2a" />
          <g className="dia-n-name">
            <rect x="62" y="55" width="44" height="12" rx="4" className="dia-hit-bg" />
            <rect x="66" y="58.5" width="36" height="5" rx="2.5" className="dia-fill-accent" />
            <rect x="62" y="55" width="44" height="12" rx="4" className="dia-n-ping" />
          </g>
          <rect x="110" y="58.5" width="28" height="5" rx="2.5" className="dia-track dia-n-w2b" />
          <rect x="40" y="72" width="80" height="5" rx="2.5" className="dia-track dia-n-w3" />

          {/* credited underneath, the way an assistant lists what it used */}
          <g className="dia-n-cite">
            <rect x="40" y="81" width="36" height="8" rx="4" className="dia-hit-bg" />
            <circle cx="46" cy="85" r="2.4" className="dia-fill-accent" />
            <rect x="52" y="83.5" width="20" height="3" rx="1.5" className="dia-fill-accent" />
          </g>
        </svg>
      )
  }
}
