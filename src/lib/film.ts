/**
 * Which cut of a project's film to play.
 *
 * The films carry captions in the viewer's language, so an Albanian visitor
 * shown the English cut is the same defect as an untranslated paragraph, only
 * harder to spot. `filmPerLanguage` projects have `<stem>-en.mp4` and
 * `<stem>-sq.mp4`; anything older is a single file and is returned unchanged.
 *
 * MP4 comes first and WebM second wherever these are used. Chrome reports that
 * it can play our VP9 WebM files and then fails on the actual stream with
 * PIPELINE_ERROR_DECODE, which left every card frozen on its poster.
 */
import type { Project } from '../content/projects'

export type FilmSources = { mp4: string; webm?: string }

/**
 * The cut a portfolio CARD plays: smaller, and already starting at the first
 * screen rather than at the title.
 *
 * The card used to play the full film and seek past the title card on hover.
 * Seeking meant the browser had to fetch that byte range before it could show
 * anything, so the first hover sat on a poster for most of a second no matter
 * how early the file was warmed. This cut begins where the seek used to land,
 * so playback starts as soon as the first frames arrive, and at 1280 wide it
 * is roughly a fifth of the size.
 */
export function cardFilmFor(project: Project, language: string): FilmSources | null {
  const stem = project.coverVideo
  if (!stem || !project.filmPerLanguage) return filmFor(project, language)
  const lang = language.toLowerCase().startsWith('sq') ? 'sq' : 'en'
  return { mp4: `${stem.replace(/-film$/, '')}-card-${lang}.mp4` }
}

export function filmFor(project: Project, language: string): FilmSources | null {
  const stem = project.coverVideo
  if (!stem) return null
  if (!project.filmPerLanguage) {
    return { mp4: stem.replace(/\.webm$/, '.mp4'), webm: stem }
  }
  const lang = language.toLowerCase().startsWith('sq') ? 'sq' : 'en'
  return { mp4: `${stem}-${lang}.mp4` }
}
