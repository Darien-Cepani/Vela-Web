/**
 * Contact endpoint — Resend.
 *
 * The site itself is static, so this has to run somewhere with a secret:
 * Vercel Functions, Netlify Functions and Cloudflare Workers all accept this
 * exact shape (a default export taking a Request, returning a Response).
 *
 * Environment:
 *   RESEND_API_KEY   required — from resend.com/api-keys
 *   CONTACT_TO       where enquiries land        (default: the studio inbox)
 *   CONTACT_FROM     a verified sender on your Resend domain
 *                    (default: Vela <hello@vela.al> — verify vela.al in Resend
 *                    first, or Resend will reject the send)
 *   ALLOWED_ORIGIN   the site origin, for CORS   (default: https://vela.al)
 *
 * The client posts to VITE_CONTACT_ENDPOINT; point that at this route's URL.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

type Payload = {
  name?: string
  email?: string
  business?: string
  needs?: string[]
  message?: string
  language?: string
  source?: string
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default async function handler(req: Request): Promise<Response> {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
  const origin = env.ALLOWED_ORIGIN ?? 'https://vela.al'
  const headers = { 'Content-Type': 'application/json', ...cors(origin) }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers })

  const apiKey = env.RESEND_API_KEY
  if (!apiKey) {
    // fail loudly in the log, quietly to the visitor — the form falls back to mailto
    console.error('[contact] RESEND_API_KEY is not set')
    return new Response(JSON.stringify({ error: 'not_configured' }), { status: 500, headers })
  }

  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return new Response(JSON.stringify({ error: 'bad_json' }), { status: 400, headers })
  }

  const name = String(body.name ?? '').trim().slice(0, 120)
  const email = String(body.email ?? '').trim().slice(0, 200)
  const business = String(body.business ?? '').trim().slice(0, 160)
  const message = String(body.message ?? '').trim().slice(0, 5000)
  const needs = Array.isArray(body.needs) ? body.needs.slice(0, 8).map((n) => String(n).slice(0, 40)) : []
  const language = body.language === 'sq' ? 'sq' : 'en'
  const source = String(body.source ?? 'cta').slice(0, 40)

  // the client validates too; this is the copy that actually protects the inbox
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 10) {
    return new Response(JSON.stringify({ error: 'invalid' }), { status: 422, headers })
  }

  const rows: Array<[string, string]> = [
    ['Name', name],
    ['Email', email],
    ['Business', business || '—'],
    ['Needs', needs.length ? needs.join(', ') : '—'],
    ['Language', language === 'sq' ? 'Shqip' : 'English'],
    ['Came from', source],
  ]

  const html = `<!doctype html><html><body style="margin:0;background:#071E26;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#0B303C;border-radius:20px;overflow:hidden">
    <tr><td style="padding:28px 32px;background:#00AAD4;color:#071E26">
      <div style="font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;opacity:.75">New enquiry</div>
      <div style="font-size:26px;font-weight:700;margin-top:6px">${esc(name)}${business ? ` · ${esc(business)}` : ''}</div>
    </td></tr>
    <tr><td style="padding:28px 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#9FBAC3">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:7px 0;width:120px;color:#7FA6B2">${esc(k)}</td><td style="padding:7px 0;color:#fff">${esc(v)}</td></tr>`,
          )
          .join('')}
      </table>
      <div style="margin-top:22px;padding-top:22px;border-top:1px solid #12404E;color:#fff;font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(message)}</div>
      <a href="mailto:${esc(email)}" style="display:inline-block;margin-top:26px;background:#00AAD4;color:#071E26;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px">Reply to ${esc(name)}</a>
    </td></tr>
  </table></body></html>`

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + '\n\n' + message

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM ?? 'Vela <hello@vela.al>',
      to: [env.CONTACT_TO ?? 'darien.cepani42@gmail.com'],
      // hitting reply in the inbox should write to the visitor, not to Vela
      reply_to: email,
      subject: `New project enquiry — ${name}${business ? ` (${business})` : ''}`,
      html,
      text,
    }),
  })

  if (!res.ok) {
    console.error('[contact] resend rejected the send:', res.status, await res.text())
    return new Response(JSON.stringify({ error: 'send_failed' }), { status: 502, headers })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
}
