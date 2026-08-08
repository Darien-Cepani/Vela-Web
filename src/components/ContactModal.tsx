import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiArrowRightUpLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiMailLine,
} from '@remixicon/react'
import { CONTACT_EMAIL } from '../lib/site'
import { onContactOpen } from '../lib/contact-modal'
import markWhite from '../assets/brand/mark-white.svg'

/** Where the form posts. Point it at Formspree / Resend / an n8n webhook and
 *  the form submits over the network; leave it empty and it falls back to a
 *  prefilled mail draft, so the page always has a working conversion path. */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT ?? ''

/* 'question' sits last on purpose: it is the catch-all for someone who is
   not buying yet, and putting it first would invite everyone to pick it. */
const NEEDS = ['shop', 'website', 'design', 'ads', 'question'] as const
type Need = (typeof NEEDS)[number]
type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * The contact dialog: a slab of liquid glass over the frozen page.
 *
 * Built on the native <dialog> element, which buys the things a hand-rolled
 * modal always gets wrong — the top layer (so it escapes every transformed
 * ancestor on this page), a real focus trap, Escape to dismiss, and the rest
 * of the document marked inert while it is open.
 *
 * The glass is deep-sea in both themes, like the product slices: it floats
 * over a cyan field in one place and a pale page in another, and only a fixed
 * dark base keeps the white type legible over both.
 */
export function ContactModal() {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState('cta')

  const close = useCallback(() => {
    const el = dialogRef.current
    if (!el?.open) return
    // let the exit transition run before the element leaves the top layer
    el.setAttribute('data-closing', '')
    window.setTimeout(() => {
      el.removeAttribute('data-closing')
      el.close()
    }, 220)
  }, [])

  useEffect(
    () =>
      onContactOpen((src) => {
        setSource(src)
        setOpen(true)
        const el = dialogRef.current
        if (el && !el.open) el.showModal()
      }, true),
    [],
  )

  // the page must not scroll behind the dialog
  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [open])

  // clicking the backdrop (i.e. the dialog element itself, outside the panel) dismisses
  const onDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) close()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="contact-modal-title"
      onClose={() => setOpen(false)}
      onCancel={(e) => {
        // intercept Escape so the exit transition still plays
        e.preventDefault()
        close()
      }}
      onClick={onDialogClick}
      className="vela-dialog"
    >
      <div className="vela-dialog-panel glass-refract glass-refract-deep">
        {/* liquid glass stack: gradient film, drifting specular, cyan horizon */}
        <span aria-hidden className="glass-overlay rounded-[26px]" />
        <span aria-hidden className="liquid-sheen" />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-24 h-56 bg-[radial-gradient(520px_180px_at_50%_100%,rgb(0_170_212/0.35),transparent_70%)]"
        />
        <img
          src={markWhite}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-12 -bottom-16 w-52 opacity-[0.07]"
        />

        <button
          type="button"
          onClick={close}
          aria-label={t('contact.form.close')}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-[background-color,transform] duration-300 hover:bg-white/20 active:scale-95"
        >
          <RiCloseLine size={19} aria-hidden />
        </button>

        <div className="vela-dialog-scroll relative max-h-[min(86dvh,860px)] overflow-y-auto overscroll-contain px-6 py-8 sm:px-9 sm:py-10">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-cyan">{t('contact.eyebrow')}</p>
          <h2
            id="contact-modal-title"
            className="mt-3 max-w-[16ch] font-display text-3xl font-semibold leading-[1.06] text-white sm:text-[2.5rem]"
          >
            {t('contact.h2')}
          </h2>
          <p className="mt-3 max-w-[46ch] leading-relaxed text-mist">{t('contact.sub')}</p>

          <ContactForm source={source} onDone={close} />
        </div>
      </div>
    </dialog>
  )
}

function ContactForm({ source, onDone }: { source: string; onDone: () => void }) {
  const { t, i18n } = useTranslation()
  const uid = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [needs, setNeeds] = useState<Need[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const firstFieldRef = useRef<HTMLInputElement>(null)
  // bots fill every field they find and submit instantly; humans do neither
  const openedAt = useRef(Date.now())

  // the dialog opens with focus on the first thing the visitor has to do
  useEffect(() => {
    const id = window.setTimeout(() => firstFieldRef.current?.focus(), 60)
    return () => window.clearTimeout(id)
  }, [])

  const toggleNeed = (n: Need) =>
    setNeeds((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]))

  const validate = (data: FormData) => {
    const next: Record<string, string> = {}
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    if (!name) next.name = t('contact.form.errName')
    // deliberately permissive: something@something.something, nothing cleverer
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = t('contact.form.errEmail')
    if (message.length < 10) next.message = t('contact.form.errMessage')
    return next
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const found = validate(data)
    setErrors(found)
    if (Object.keys(found).length) {
      // send focus to the first thing that needs fixing, not to the top
      const firstKey = ['name', 'email', 'message'].find((k) => found[k])
      form.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus()
      return
    }

    // silently accept and discard: telling a bot it was caught only helps it
    const trapped = String(data.get('company_website') ?? '').length > 0
    const tooFast = Date.now() - openedAt.current < 2500
    if (trapped || tooFast) {
      setStatus('sent')
      return
    }

    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      business: String(data.get('business') ?? ''),
      needs,
      message: String(data.get('message') ?? ''),
      language: i18n.language,
      source,
    }

    if (!ENDPOINT) {
      // no backend wired yet: hand the visitor a fully prefilled mail draft
      // rather than a dead button
      const body = [
        `${t('contact.form.name')}: ${payload.name}`,
        `${t('contact.form.email')}: ${payload.email}`,
        `${t('contact.form.business')}: ${payload.business || '—'}`,
        `${t('contact.form.needs')}: ${needs.map((n) => t(`contact.form.need.${n}`)).join(', ') || '—'}`,
        '',
        payload.message,
      ].join('\n')
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        t('contact.subject'),
      )}&body=${encodeURIComponent(body)}`
      setStatus('sent')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      form.reset()
      setNeeds([])
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="mt-8 flex flex-col items-start">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan text-sea shadow-[0_0_40px_rgb(0_170_212/0.45)]">
          <RiCheckLine size={28} aria-hidden />
        </span>
        <h3 className="mt-6 font-display text-2xl font-semibold text-white">{t('contact.form.sentTitle')}</h3>
        <p className="mt-3 max-w-[38ch] leading-relaxed text-mist">{t('contact.form.sentBody')}</p>
        <button
          onClick={onDone}
          className="mt-7 rounded-full bg-cyan px-7 py-3.5 text-[15px] font-bold text-sea transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >
          {t('contact.form.done')}
        </button>
      </div>
    )
  }

  const field = 'vela-glass-field'
  const invalid = (k: string) => (errors[k] ? 'vela-glass-field-invalid' : '')
  const label = 'block text-[12px] font-bold uppercase tracking-[0.14em] text-mist'
  const errText = 'mt-1.5 text-[13px] font-bold text-[#ff9d9d]'

  return (
    <form noValidate onSubmit={onSubmit} className="mt-8">
      {/* honeypot: off-screen, unlabelled to humans, irresistible to bots */}
      <div aria-hidden className="sr-only-label">
        <label htmlFor={`${uid}-cw`}>Company website</label>
        <input id={`${uid}-cw`} name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${uid}-name`}>
            {t('contact.form.name')}
          </label>
          <input
            ref={firstFieldRef}
            id={`${uid}-name`}
            name="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${uid}-name-err` : undefined}
            placeholder={t('contact.form.namePh')}
            className={`mt-2 ${field} ${invalid('name')}`}
          />
          {errors.name && (
            <p id={`${uid}-name-err`} className={errText}>
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className={label} htmlFor={`${uid}-email`}>
            {t('contact.form.email')}
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${uid}-email-err` : undefined}
            placeholder={t('contact.form.emailPh')}
            className={`mt-2 ${field} ${invalid('email')}`}
          />
          {errors.email && (
            <p id={`${uid}-email-err`} className={errText}>
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className={label} htmlFor={`${uid}-business`}>
          {t('contact.form.business')}{' '}
          <span className="font-medium normal-case tracking-normal opacity-70">({t('contact.form.optional')})</span>
        </label>
        <input
          id={`${uid}-business`}
          name="business"
          autoComplete="organization"
          placeholder={t('contact.form.businessPh')}
          className={`mt-2 ${field}`}
        />
      </div>

      <fieldset className="mt-5">
        <legend className={label}>{t('contact.form.needs')}</legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {NEEDS.map((n) => {
            const on = needs.includes(n)
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                onClick={() => toggleNeed(n)}
                className={`rounded-full border px-4 py-2 text-[13.5px] font-bold backdrop-blur-sm transition-[background-color,border-color,color] duration-300 ${
                  on
                    ? 'border-cyan bg-cyan text-sea'
                    : 'border-white/20 bg-white/[0.07] text-white hover:border-white/45 hover:bg-white/[0.14]'
                }`}
              >
                {t(`contact.form.need.${n}`)}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-5">
        <label className={label} htmlFor={`${uid}-message`}>
          {t('contact.form.message')}
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={4}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${uid}-message-err` : undefined}
          placeholder={t('contact.form.messagePh')}
          className={`mt-2 resize-y ${field} ${invalid('message')}`}
        />
        {errors.message && (
          <p id={`${uid}-message-err`} className={errText}>
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-sheen group mt-7 flex w-full items-center justify-between gap-3 rounded-full bg-cyan py-4 pl-7 pr-4 text-base font-bold text-sea shadow-cta transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99] disabled:cursor-progress disabled:opacity-70"
      >
        {status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sea/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          {status === 'sending' ? (
            <RiLoader4Line size={18} aria-hidden className="animate-spin" />
          ) : (
            <RiArrowRightUpLine size={18} aria-hidden />
          )}
        </span>
      </button>

      <p role="alert" aria-live="polite" className="mt-3 min-h-[1.25rem] text-[13.5px] font-bold text-[#ff9d9d]">
        {status === 'error' ? t('contact.form.errSend', { email: CONTACT_EMAIL }) : ''}
      </p>

      <a
        href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('contact.subject'))}`}
        className="mt-1 inline-flex items-center gap-2 py-2.5 text-[14px] font-bold text-mist transition-colors duration-300 hover:text-cyan"
      >
        <RiMailLine size={16} aria-hidden />
        {t('contact.orEmail')}
      </a>
    </form>
  )
}
