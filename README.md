# PixelSkill — Website + Admin CMS

Next.js (App Router) · TypeScript · Tailwind · Prisma (PostgreSQL / Neon) · Cloudinary · Framer Motion.
All public and admin text is English.

## First run (works the first time)
1. `cp .env.example .env` and fill in Neon + `NEXT_PUBLIC_SITE_URL` (Cloudinary and ADMIN_* for uploads / admin login)
2. `npm install`
3. `npm run setup` — checks your environment with clear messages, generates the Prisma client, creates the tables (`prisma db push`) and seeds content + the first admin
4. `npm run dev` → site on http://localhost:3000, admin on /admin/login
For production use migrations instead of `db push`: `npx prisma migrate dev --name init` locally, then `npm run db:deploy` on deploy. Never reset a production database.

## Live chat + AI-ready editing (latest)
- **Live chat:** floating widget on every public page. New visitors get an automatic welcome message (and an optional teaser bubble after N seconds, quick-reply buttons, optional name/email). Staff reply from **Admin → Live chat** (unread badge in the sidebar, close/reopen/delete). Works by polling, so it runs on Vercel without websockets. Configure everything in **Admin → Chat settings**. Email/Slack alerts: fill in the two empty functions in `src/lib/chatNotify.ts`. Optional retention job: call `/api/cron/chat-cleanup` daily with `Authorization: Bearer $CRON_SECRET`.
- **Online editing studio (OFF by default):** a ready-made, feature-flagged scaffold — upload images, pick a service, get results — so a future AI feature needs one provider file. See `docs/EXTENDING_EDITING.md`. Manage under **Admin → Online editing** and **Admin → Editing jobs**.

## Final-pass additions
- **Reviews:** homepage testimonials section (featured card + carousel + CTA) and a `/testimonials` page; 6 placeholder reviews seeded with a “Sample” badge — replace them in Admin → Testimonials. No ratings are ever invented.
- **Newsletter:** footer signup (consent checkbox, honeypot, rate limit, no subscriber enumeration), Admin → Newsletter subscribers with delete and CSV export (formula-injection safe).
- **Site search** (`/search`, noindex) + SearchAction structured data + search icon in the header.
- **Breadcrumbs** (visible + BreadcrumbList JSON-LD) on inner pages, **RSS** (`/blog/rss.xml`, auto-discovery link), `/.well-known/security.txt`, default social image, favicon, manifest.
- **Optional integrations** (Admin → Site Settings): booking link (Book a call button), WhatsApp floating button, cookieless Plausible analytics.
- **Colour system** refined (ice / mint / lilac tints instead of muddy greys, clearer contrast — the preview site passes an automated WCAG AA text-contrast audit on 15 key pages).
- **Per-section CTAs** on the homepage, case-study structure on portfolio pages, floating trust bar with count-up numbers, scroll-progress bar.

## What changed in the latest version
- Navbar: Portfolio added; top bar and footer now show social icons (set the URLs in Admin → Site Settings → Social; only filled-in ones appear). Footer lists all services; back-to-top button; sticky quote/trial bar on phones.
- Richer pages, all editable in Admin → Pages: Services (service chooser table, industries, process, formats, FAQ), Pricing (price factors, complexity guide, volume table, billing steps, FAQ), Offers (offer cards from Admin → Offers, how it works, volume table, terms, FAQ), Blog (featured post, category filter, topics, TOC + share on posts), About (stats, story, mission/vision/values, process timeline, quality checklist, team, contact, FAQ). Homepage gained “Industries” and “How we work with you” sections and a scrolling services strip.
- Performance: framer-motion removed (CSS transitions + IntersectionObserver), content-visibility on off-screen sections, long-term caching for static assets, poster preload, no backdrop blur on mobile. See PERFORMANCE below.
- Security: see SECURITY.md (CSP/HSTS, stricter origin checks, login timing, prototype-safe lookups, Cloudinary file-type enforcement).
- SEO: home gets ProfessionalService + OfferCatalog + FAQPage JSON-LD, /services gets ItemList, /blog gets Blog, Organization has sameAs/contactPoint; default 1200×630 social image, favicon, Apple icon and web manifest included.

## PERFORMANCE (measured on the static preview, 4× CPU + slow-4G emulation)
Home: LCP 1112→988 ms, total blocking time 231→112 ms, CLS 0, ~198 KB transferred (incl. 122 KB hero video). Re-measure the real Next.js build with Lighthouse after deploying.

## What changed in an earlier version
- **Homepage hero:** full-background video that autoplays muted and loops forever (inline on mobile too, pause button, reduced-motion shows the poster). A sample loop ships in `public/samples/`; upload your own in Admin → Homepage Builder.
- **Testimonials:** designed homepage section (featured card + two cards). Placeholders are seeded with a “Sample” badge — replace/delete them in Admin → Testimonials (untick “placeholder” on real reviews).
- **Navbar:** Blog added (editable in Admin → Header & Footer).
- **Privacy, Terms, Cookies:** complete default texts written from a legal-content checklist and tailored to what this site actually does (forms, Cloudinary, Neon, Vercel, the `ps_admin` admin cookie). They are templates: have a qualified professional review them and fill in your jurisdiction.
- **Free trial / Quote:** besides uploads, customers can add up to 10 `https://` download links (Drive, Dropbox, WeTransfer…) for files too large to upload. Admin shows them on each request.
- **Service pages:** redesigned hero. The hero before/after pair appears only in the hero and on the listing card; the “Examples” section shows only the content cards you add. Each service can hide sections (Admin → Services → Content Cards).
- **Before/after slider:** hover with a mouse (no click); drag on touch; arrow keys for keyboard.
- **SEO:** per-item social title/description/image alt, nofollow, search + social preview and checklist in the Service editor; the same fields on Portfolio, Blog, Offers and every fixed page; site-level Bing verification, X handle, organization name, extra robots.txt paths; Organization/WebSite/Service/FAQPage/BlogPosting/Breadcrumb JSON-LD; sitemap and robots from the database.

## What is included

**Public website** (header/footer only in the `(public)` route group)
- `/` homepage: video hero + 11 reorderable sections (all driven by Admin → Homepage Builder)
- `/services`, `/services/[slug]` (one shared template, DB-driven; `/service/:slug` redirects here)
- `/portfolio`, `/portfolio/[slug]` (category filter, before/after sliders)
- `/pricing` (cards, nested options, sliders), `/offers` (expired offers hidden), `/faq`, `/about`, `/contact`
- `/quote`, `/free-trial` (validated forms, private uploads with progress)
- `/blog`, `/blog/[slug]` (safe Markdown renderer, BlogPosting JSON-LD)
- `/privacy`, `/terms`, `/cookies` (editable; seeded with TEMPLATE text you must replace)
- custom 404/error, `sitemap.xml`, `robots.txt`, admin-managed redirects (catch-all route)
- Navbar: 10-service mega menu (hover/click/keyboard/Escape, mobile accordion)

**Admin** (`/admin`, own layout, never shows public header/footer)
Dashboard (real counts), Homepage Builder, Services (4-tab editor), Pricing, Portfolio, Blog, Testimonials, FAQs, Offers,
Pages (About/Contact/Pricing/… + legal), Quotes, Free Trials (+ deliverable uploads), Contact messages, Header & Footer,
Site Settings, Media Library, SEO Center, Redirects, Account (password change revokes all sessions).

**Security**: scrypt password hashing, DB sessions (hashed token, HttpOnly cookie), login/form rate limits, per-route authorization,
Origin check on mutations, zod validation of every write, signed Cloudinary uploads (secret stays server-side), private
`authenticated` uploads for customer files with 10-minute signed download links, honeypot on public forms, no raw HTML rendering,
JSON-LD escaping, security headers, `/admin` + `/api/` disallowed in robots and `noindex`.

## Setup
1. Unzip and `cd pixelskill`
2. `cp .env.example .env` and fill in Neon, Cloudinary and `ADMIN_*` (password 12+ chars)
3. `npm install`
4. `npx prisma migrate dev --name init` (production: `npm run db:deploy`)
5. `npm run db:seed` (idempotent: 10 services, sample before/after assets, placeholder pricing, sample portfolio, FAQs, admin)
6. `npm run dev` → http://localhost:3000 and http://localhost:3000/admin/login
7. `npm run typecheck && npm test && npm run build`
8. Deploy: push to GitHub, import in Vercel, add the same env vars, set the build command to `npm run build`, run `npm run db:deploy` once against Neon.

## Honest notes / limitations
- In the offline sandbox the following DID run and pass: syntax check of every file, 20 logic tests against the real source with zod 3.23.8 and react-dom (form validation, SEO field coverage, file links, XSS-safe Markdown, legal text completeness) and a 49-check browser QA of the static preview site. Not run:  `npm install`, `prisma migrate`, `next build`, ESLint and a full TypeScript check with real Next/React types. Run step 7 and fix anything it reports before deploying.
- No migration SQL is bundled. Step 4 creates it from `prisma/schema.prisma`. If you already have a production database, run
  `prisma migrate diff` first and never reset it.
- Written for Prisma 6 (`prisma-client-js`). On Prisma 7 keep your existing `prisma.config.ts`/driver-adapter setup and copy only the models.
- Seeded pricing is PLACEHOLDER ($1.00, badge "Sample price"); seeded portfolio items and before/after SVGs are labelled SAMPLE
  demonstrations. Replace them from the admin. No testimonials or offers are seeded.
- Privacy/Terms/Cookies are templates, not legal advice.
- Media references on new content types are stored as ids without database foreign keys (to keep the schema small); `lib/mediaUsage.ts`
  blocks deleting an in-use asset. Services use real foreign keys.
- Blog editor is a Markdown editor with toolbar and preview (not WYSIWYG). Scheduled publishing is not offered (no scheduler).
- Rate limiting is in-memory; use Upstash/Redis for multi-instance production.
- Email notifications are not implemented; new requests appear in the admin dashboard.
- "Which services appear on the homepage" is controlled by service order/visibility and a max-count setting, and portfolio by the Featured flag — there is no manual picker.
