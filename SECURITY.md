# Security review — PixelSkill

Reviewed in this version (code review + automated tests; no external penetration test was performed).

## Controls in place
| Area | Control |
|---|---|
| Authentication | scrypt password hashing (per-user salt), 12+ character passwords, DB-backed sessions storing only a SHA-256 hash of the token, HttpOnly + SameSite=Lax + Secure (prod) cookie, 12 h expiry, password change revokes every session |
| Login | per-IP rate limit, constant-time style check (a dummy hash is verified when the account does not exist), same error for wrong email/password, Origin check |
| Authorization | every `/api/admin/*` route verifies the session itself; admin pages also check in the layout. Mutations additionally require same-origin (Origin or Fetch-Metadata) and are rate limited per admin |
| Input validation | every write validated by zod schemas generated from one definition file; slugs, URLs (`/`, `http(s)`, `mailto`, `tel` only), money, enums, ids and media references checked server-side |
| Prototype/lookup safety | resource and settings keys are resolved with own-property lookups (`__proto__`, `constructor` → 404) |
| Uploads | signed Cloudinary uploads (API secret never leaves the server); `allowed_formats` is inside the signature so Cloudinary rejects other types; size/format re-verified server side after upload; customer files stored with *authenticated* delivery and opened by admins through 10-minute signed links |
| Public forms | honeypot, per-IP rate limit, Origin check, body-size limit, zod validation, https-only file links |
| Output encoding | React escapes all text; Markdown is rendered to React elements (no raw HTML), images limited to Cloudinary/same-origin, links limited to safe schemes; JSON-LD escaped (`<` → `\u003c`); customer links are shown to admins with `rel="noopener noreferrer nofollow"` |
| SQL injection | Prisma parameterised queries only; no raw SQL; sort fields come from static definitions |
| Headers | CSP (default-src 'self', Cloudinary allow-list, frame-ancestors 'none', object-src 'none', upgrade-insecure-requests), HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP/CORP; `poweredByHeader` off; admin and API responses are `no-store` and `noindex` |
| Secrets | server-only env vars; `.env` excluded from the ZIP; `.env.example` has placeholders only |

## Added in the final pass
- Newsletter endpoint: zod validation, explicit consent, honeypot, per-IP rate limit, Origin check, constant response (no enumeration), unique email.
- Subscriber CSV export is admin-only, `no-store`, and every cell is neutralised against spreadsheet formula injection (`= + - @`).
- Search: query length-limited, control/HTML characters stripped, rendered through React (escaped), per-IP rate limited, results pages `noindex`.
- RSS output is XML-escaped. `security.txt` published for responsible disclosure.
- Optional analytics script is only rendered for a validated bare domain; CSP allows only `https://plausible.io` for it.
- Setup script refuses placeholder secrets and passwords shorter than 12 characters.

## Live chat and editing studio
- Chat visitors are identified by a 192-bit random token kept in their browser; only its SHA-256 hash is stored and the token is sent in a header (not the URL).
- Public chat endpoints: feature-flagged, same-origin check, per-IP and per-session rate limits, message length/count limits, control characters stripped, plain-text rendering (React escapes), admin replies guarded like every admin write.
- Chat retention is configurable; the cleanup endpoint requires a secret compared in constant time.
- Editing studio: returns 404 until enabled; jobs are rate limited, uploads re-verified server side, outputs are signed 10-minute links; the webhook requires an HMAC-SHA256 signature; the `mock` provider is disabled in production.

## Known limitations / do before launch
1. **Rate limiting is in-memory** (per server instance, trusts `x-forwarded-for`). On Vercel use Upstash/Redis or Vercel Firewall rate limits.
2. **CSP keeps `'unsafe-inline'` for scripts** because Next.js injects inline bootstrap scripts. Move to nonce-based CSP via middleware for a stricter policy.
3. Run `npm audit` and keep dependencies updated; this sandbox had no network so dependencies were not audited.
4. Enable 2FA/SSO on Vercel, Neon and Cloudinary accounts; rotate the Cloudinary secret if it was ever shared.
5. Cloudinary `max_file_size` is not part of a signed upload: oversize files are rejected and deleted after upload by the server check. Add an upload preset with a size limit for stricter control.
6. No CAPTCHA is used. If spam appears, add Cloudflare Turnstile or hCaptcha to the three public forms.
7. Backups: enable Neon point-in-time recovery.
8. A professional penetration test is recommended before handling real customer data at scale.
