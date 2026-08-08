import React from 'react'
import { Composition } from 'remotion'
import { CaseFilm } from './CaseFilm'
import { loadBrandFonts } from './fonts'

loadBrandFonts()

/**
 * One composition, driven entirely by input props. Each project renders the
 * same film with its own name, theme and beats — one structure wearing five
 * different sets of colours, which is what makes them read as a series without
 * making them look like the same video five times.
 */
export const RemotionRoot: React.FC = () => (
  <Composition
    id="CaseFilm"
    component={CaseFilm as never}
    durationInFrames={420}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{
      name: 'Project',
      kicker: 'Case study',
      logo: 'mark-cyan.svg',
      theme: { bg: '#071E26', ink: '#FFFFFF', accent: '#00AAD4', swatches: ['#00AAD4', '#0B303C', '#9FBAC3'] },
      services: [],
      paletteLabel: 'What we did|The palette',
      outro: 'Built by Vela',
      beats: [],
    }}
  />
)
