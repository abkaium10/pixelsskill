# Adding AI / automated image editing later

The site already contains a **disabled** online editing studio so that a future AI feature needs very little new code.

```
visitor → /edit (EditStudio) → POST /api/edit/jobs → EditJob row → Provider.submit()
                                                                  ↳ manual  : waits for a human (Admin → Editing jobs)
                                                                  ↳ mock    : returns the upload unchanged (dev only)
                                                                  ↳ http    : sends the job to your service, which calls /api/edit/webhook when done
                                                                  ↳ yours   : implement one interface (below)
visitor polls GET /api/edit/jobs/[id] (token in a header) → signed download links when DONE
```

## What is already built
| Piece | Where |
|---|---|
| Feature flag, provider choice, service list, limits, disclaimer | **Admin → Online editing (AI-ready)** (`SINGLETONS.editing` in `src/lib/defs.ts`) |
| Public studio (service picker, private uploads, status polling) | `src/components/public/EditStudio.tsx`, `src/app/(public)/edit/page.tsx` |
| Job model and status workflow | `EditJob` in `prisma/schema.prisma` |
| Job creation, validation, rate limit, private upload verification | `src/features/editing/service.ts`, `src/app/api/edit/jobs/route.ts` |
| Provider interface + registry | `src/features/editing/types.ts`, `src/features/editing/providers/` |
| Signed webhook for external engines | `src/app/api/edit/webhook/route.ts` |
| Staff view: list, status, notes, upload finished files | **Admin → Editing jobs** |

Everything is behind the flag: while it is OFF, `/edit` and `/api/edit/*` return **404**.

## Turn it on (no code)
1. Admin → Online editing → tick **Enable**, choose a provider (start with *Manual*).
2. Under **Services**, list the service slugs that should appear (add a row to add a service — no deployment needed).
3. Optionally add a link to `/edit` in Admin → Header & Footer.

## Plug in an AI engine (one file)
Create `src/features/editing/providers/myAi.ts`:

```ts
import type { EditProvider } from "../types";

export const myAiProvider: EditProvider = {
  id: "my-ai",
  label: "My AI engine",
  async submit(job) {
    // job.inputUrls = 1-hour signed download URLs of the visitor's files
    const res = await fetch(process.env.MY_AI_URL!, { method: "POST", headers: { Authorization: `Bearer ${process.env.MY_AI_KEY}` },
      body: JSON.stringify({ service: job.serviceSlug, images: job.inputUrls, options: job.options }) });
    const j = await res.json();
    return { status: "PROCESSING", externalId: j.id };          // or { status: "DONE", outputs: [...] } if it is synchronous
  },
  async poll(job) { /* optional: ask your engine for progress */ return { status: "PROCESSING" }; },
};
```
Register it with one line in `src/features/editing/providers/index.ts` (`case "my-ai": return myAiProvider;`), add the option to the *Editing provider* dropdown in `defs.ts`, set your secrets in `.env`, done.

## Per-service behaviour
Different services can use different options. Put service-specific logic inside your provider (`switch (job.serviceSlug)`), or keep one provider per engine. The studio shows a free-text *Instructions* field; to add structured options (e.g. background colour), add inputs in `EditStudio.tsx` and pass them in `options` — the API already accepts up to 20 small key/value options and stores them on the job.

## Safety checklist before going live
- Keep customer files **private**: uploads use Cloudinary authenticated delivery; give engines only short-lived signed URLs.
- Tell customers what is automated: edit the *notice* in the admin settings. Do not describe results as human-made if they are not.
- Rate limits are in-memory; use Upstash/Redis in production.
- Add the AI provider to your Privacy Policy (sub-processor, retention).
- Set `EDIT_WEBHOOK_SECRET` for the HTTP provider; the webhook rejects unsigned calls.
- The `mock` provider is disabled automatically in production builds.
