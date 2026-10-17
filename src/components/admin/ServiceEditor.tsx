"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaPicker, type MediaItem } from "@/components/media/MediaPicker";
import { slugify } from "@/lib/slug";

type Titled = { title: string; description: string };
type Faq = { question: string; answer: string };
type Card = { id?: string; title: string; description: string; before: MediaItem | null; after: MediaItem | null };
export type ServiceForm = {
  name: string; slug: string; shortDescription: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  displayOrder: number; featured: boolean; showInListing: boolean;
  heroHeading: string; heroDescription: string; heroBefore: MediaItem | null; heroAfter: MediaItem | null;
  beforeAlt: string; afterAlt: string; sliderPosition: number;
  introduction: string; features: Titled[]; benefits: Titled[]; workflow: Titled[]; useCases: Titled[]; outputFormats: string; faqs: Faq[]; relatedSlugs: string;
  seoTitle: string; metaDescription: string; canonicalUrl: string; focusKeyword: string; additionalKeywords: string; noindex: boolean; nofollow: boolean; ogTitle: string; ogDescription: string; ogImageAlt: string; hiddenSections: string[]; ogImage: MediaItem | null;
  cards: Card[];
};
export const emptyService: ServiceForm = {
  name: "", slug: "", shortDescription: "", status: "DRAFT", displayOrder: 0, featured: false, showInListing: true,
  heroHeading: "", heroDescription: "", heroBefore: null, heroAfter: null, beforeAlt: "", afterAlt: "", sliderPosition: 50,
  introduction: "", features: [], benefits: [], workflow: [], useCases: [], outputFormats: "JPG, PNG, TIFF, PSD, WEBP", faqs: [], relatedSlugs: "",
  seoTitle: "", metaDescription: "", canonicalUrl: "", focusKeyword: "", additionalKeywords: "", noindex: false, nofollow: false, ogTitle: "", ogDescription: "", ogImageAlt: "", hiddenSections: [], ogImage: null,
  cards: [{ title: "", description: "", before: null, after: null }],
};

const SECTIONS: [string, string][] = [["overview", "Overview"], ["examples", "Example cards"], ["features", "Features"], ["benefits", "Benefits"], ["workflow", "Workflow"], ["usecases", "Use cases"], ["formats", "Output formats"], ["faq", "FAQ"], ["related", "Related services"]];
const TABS = ["Basic Info", "Hero & Media", "Content Cards", "SEO"] as const;
const inp = "w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-black";
const area = "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-black";

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (<label className="mb-4 block"><span className="mb-1 block text-sm font-semibold text-neutral-600">{label}</span>{children}{hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}{error && <span role="alert" className="mt-1 block text-xs text-red-600">{error}</span>}</label>);
}

function TitledList({ label, items, onChange }: { label: string; items: Titled[]; onChange: (v: Titled[]) => void }) {
  return (
    <fieldset className="mb-6 rounded-2xl border border-neutral-200 p-4">
      <legend className="px-2 text-sm font-semibold">{label}</legend>
      {items.map((it, i) => (
        <div key={i} className="mb-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <input aria-label={`${label} title ${i + 1}`} className={inp} placeholder="Title" value={it.title} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
          <input aria-label={`${label} description ${i + 1}`} className={inp} placeholder="Description" value={it.description} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded-full border px-3 text-sm">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { title: "", description: "" }])} className="rounded-full border border-dashed px-4 py-2 text-sm">+ Add</button>
    </fieldset>
  );
}

export function ServiceEditor({ initial, id }: { initial: ServiceForm; id?: string }) {
  const router = useRouter();
  const [f, setF] = useState<ServiceForm>(initial);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Basic Info");
  const [slugTouched, setSlugTouched] = useState(!!id);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const set = <K extends keyof ServiceForm>(k: K, v: ServiceForm[K]) => { setF((p) => ({ ...p, [k]: v })); setDirty(true); };

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const payload = useMemo(() => (status: ServiceForm["status"]) => ({
    name: f.name, slug: f.slug, shortDescription: f.shortDescription, status, displayOrder: f.displayOrder, featured: f.featured, showInListing: f.showInListing,
    heroHeading: f.heroHeading, heroDescription: f.heroDescription, heroBeforeId: f.heroBefore?.id ?? null, heroAfterId: f.heroAfter?.id ?? null,
    beforeAlt: f.beforeAlt, afterAlt: f.afterAlt, sliderPosition: f.sliderPosition,
    introduction: f.introduction, features: f.features, benefits: f.benefits, workflow: f.workflow, useCases: f.useCases,
    outputFormats: f.outputFormats.split(",").map((s) => s.trim()).filter(Boolean), faqs: f.faqs,
    relatedSlugs: f.relatedSlugs.split(",").map((s) => s.trim()).filter(Boolean),
    seoTitle: f.seoTitle, metaDescription: f.metaDescription, canonicalUrl: f.canonicalUrl, focusKeyword: f.focusKeyword, additionalKeywords: f.additionalKeywords, noindex: f.noindex, nofollow: f.nofollow, ogTitle: f.ogTitle, ogDescription: f.ogDescription, ogImageAlt: f.ogImageAlt, hiddenSections: f.hiddenSections, ogImageId: f.ogImage?.id ?? null,
    cards: f.cards.filter((c) => c.title.trim() || c.before || c.after).map((c) => ({ id: c.id, title: c.title, description: c.description, beforeId: c.before?.id ?? null, afterId: c.after?.id ?? null })),
  }), [f]);

  async function save(status: ServiceForm["status"]) {
    setSaving(true); setMsg(null); setErrors({});
    try {
      const r = await fetch(id ? `/api/admin/services/${id}` : "/api/admin/services", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(status)) });
      const j = await r.json();
      if (!r.ok) { setErrors(j.fields ?? {}); setMsg({ ok: false, text: j.error ?? "Save failed" }); return; }
      setDirty(false); set("status", status); setDirty(false);
      setMsg({ ok: true, text: status === "PUBLISHED" ? "Published — public pages refreshed." : "Saved as draft." });
      if (!id) router.replace(`/admin/services/${j.id}`); else router.refresh();
    } catch { setMsg({ ok: false, text: "Network error" }); } finally { setSaving(false); }
  }
  const err = (k: string) => errors[k]?.[0];

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h1 className="mb-3 text-xl font-bold">{id ? "Edit Service" : "Create Service"}</h1>
      <div role="tablist" className="mb-4 flex flex-wrap gap-2 border-b pb-4">
        {TABS.map((t) => (<button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${tab === t ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"}`}>{t}</button>))}
      </div>

      {tab === "Basic Info" && (<section>
        <h2 className="font-bold">Basic Information</h2><p className="mb-4 text-sm text-neutral-600">Name and URL of the service</p>
        <Field label="Service Name" error={err("name")}><input className={inp} placeholder="e.g. Clipping Path" value={f.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} /></Field>
        <Field label="URL Slug" error={err("slug")} hint={id && initial.status === "PUBLISHED" ? "Changing a published slug creates a 301 redirect from the old URL automatically." : `Public URL: /services/${f.slug || "…"}`}><input className={inp} placeholder="clipping-path" value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></Field>
        <Field label="Short Description" error={err("shortDescription")}><textarea rows={3} className={area} placeholder="Describe the service in a sentence or two…" value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service Status"><select className={inp} value={f.status} onChange={(e) => set("status", e.target.value as ServiceForm["status"])}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></Field>
          <Field label="Display Order"><input type="number" min={0} className={inp} value={f.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value))} /></Field>
        </div>
        <label className="mr-6 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
        <label className="text-sm"><input type="checkbox" checked={f.showInListing} onChange={(e) => set("showInListing", e.target.checked)} /> Show in listing & menu</label>
      </section>)}

      {tab === "Hero & Media" && (<section>
        <h2 className="font-bold">Hero Section & Before/After Images</h2><p className="mb-4 text-sm text-neutral-600">Top of the service detail page, and the image pair used on the service listing card.</p>
        <Field label="Hero Heading" error={err("heroHeading")}><input className={inp} placeholder="Professional Clipping Path Service" value={f.heroHeading} onChange={(e) => set("heroHeading", e.target.value)} /></Field>
        <Field label="Hero Description"><textarea rows={3} className={area} placeholder="Hero section description…" value={f.heroDescription} onChange={(e) => set("heroDescription", e.target.value)} /></Field>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <MediaPicker label="Before Image" value={f.heroBefore} onChange={(m) => set("heroBefore", m)} error={err("heroBeforeId")} />
          <MediaPicker label="After Image" value={f.heroAfter} onChange={(m) => set("heroAfter", m)} error={err("heroAfterId")} />
        </div>
        <Field label="Before Image Alt Text" error={err("beforeAlt")}><input className={inp} placeholder="Describe the before image" value={f.beforeAlt} onChange={(e) => set("beforeAlt", e.target.value)} /></Field>
        <Field label="After Image Alt Text" error={err("afterAlt")}><input className={inp} placeholder="Describe the after image" value={f.afterAlt} onChange={(e) => set("afterAlt", e.target.value)} /></Field>
        <Field label={`Slider default position: ${f.sliderPosition}%`}><input type="range" min={0} max={100} value={f.sliderPosition} onChange={(e) => set("sliderPosition", Number(e.target.value))} className="w-full" /></Field>
      </section>)}

      {tab === "Content Cards" && (<section>
        <div className="flex items-start justify-between"><div><h2 className="font-bold">Service Content Cards</h2><p className="mb-4 text-sm text-neutral-600">Add as many content cards as you need inside one service.</p></div><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">Dynamic</span></div>
        {f.cards.map((c, i) => {
          const upd = (patch: Partial<Card>) => set("cards", f.cards.map((x, j) => (j === i ? { ...x, ...patch } : x)));
          return (
            <div key={c.id ?? i} className="mb-4 rounded-2xl border border-neutral-200 p-4">
              <div className="mb-2 flex items-center justify-between"><h3 className="font-bold">Card #{i + 1}{c.title ? ` — ${c.title}` : ""}</h3>
                <div className="flex gap-1 text-xs">
                  <button type="button" disabled={i === 0} onClick={() => { const a = [...f.cards]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; set("cards", a); }} className="rounded-full border px-2 py-1 disabled:opacity-30" aria-label="Move up">↑</button>
                  <button type="button" disabled={i === f.cards.length - 1} onClick={() => { const a = [...f.cards]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; set("cards", a); }} className="rounded-full border px-2 py-1 disabled:opacity-30" aria-label="Move down">↓</button>
                  <button type="button" onClick={() => set("cards", f.cards.filter((_, j) => j !== i))} className="rounded-full border px-3 py-1 text-red-600">Delete</button>
                </div></div>
              <Field label="Card Title"><input className={inp} placeholder="Card title" value={c.title} onChange={(e) => upd({ title: e.target.value })} /></Field>
              <Field label="Description"><textarea rows={3} className={area} placeholder="Card description" value={c.description} onChange={(e) => upd({ description: e.target.value })} /></Field>
              <div className="grid gap-3 sm:grid-cols-2"><MediaPicker label="Before Image" value={c.before} onChange={(m) => upd({ before: m })} /><MediaPicker label="After Image" value={c.after} onChange={(m) => upd({ after: m })} /></div>
            </div>);
        })}
        <button type="button" onClick={() => set("cards", [...f.cards, { title: "", description: "", before: null, after: null }])} className="mb-8 w-full rounded-full border border-neutral-300 px-4 py-3 text-sm font-medium hover:bg-neutral-50">+ Add New Card</button>

        <h2 className="mb-2 font-bold">Detail Page Content</h2>
        <Field label="Introduction"><textarea rows={4} className={area} value={f.introduction} onChange={(e) => set("introduction", e.target.value)} /></Field>
        <TitledList label="Features" items={f.features} onChange={(v) => set("features", v)} />
        <TitledList label="Benefits" items={f.benefits} onChange={(v) => set("benefits", v)} />
        <TitledList label="Workflow steps" items={f.workflow} onChange={(v) => set("workflow", v)} />
        <TitledList label="Use cases" items={f.useCases} onChange={(v) => set("useCases", v)} />
        <Field label="Supported output formats (comma separated)"><input className={inp} value={f.outputFormats} onChange={(e) => set("outputFormats", e.target.value)} /></Field>
        <fieldset className="mb-6 rounded-2xl border border-neutral-200 p-4"><legend className="px-2 text-sm font-semibold">FAQs</legend>
          {f.faqs.map((q, i) => (<div key={i} className="mb-3 grid gap-2"><input aria-label={`Question ${i + 1}`} className={inp} placeholder="Question" value={q.question} onChange={(e) => set("faqs", f.faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))} /><textarea aria-label={`Answer ${i + 1}`} rows={2} className={area} placeholder="Answer" value={q.answer} onChange={(e) => set("faqs", f.faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))} /><button type="button" className="justify-self-start rounded-full border px-3 py-1 text-xs" onClick={() => set("faqs", f.faqs.filter((_, j) => j !== i))}>Remove</button></div>))}
          <button type="button" onClick={() => set("faqs", [...f.faqs, { question: "", answer: "" }])} className="rounded-full border border-dashed px-4 py-2 text-sm">+ Add FAQ</button></fieldset>
        <fieldset className="mb-6 rounded-2xl border border-neutral-200 p-4"><legend className="px-2 text-sm font-semibold">Show / hide sections on the service page</legend>
          <div className="grid gap-2 sm:grid-cols-3">{SECTIONS.map(([k, l]) => (<label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!f.hiddenSections.includes(k)} onChange={(ev) => set("hiddenSections", ev.target.checked ? f.hiddenSections.filter((x) => x !== k) : [...f.hiddenSections, k])} /> {l}</label>))}</div>
          <p className="mt-2 text-xs text-neutral-500">The hero is always shown. The hero before/after pair appears only in the hero (and on the listing card) — it is never repeated in the example cards below. Example cards show only the cards you add above.</p></fieldset>
        <Field label="Related service slugs (comma separated)"><input className={inp} placeholder="photo-retouching, image-masking" value={f.relatedSlugs} onChange={(e) => set("relatedSlugs", e.target.value)} /></Field>
      </section>)}

      {tab === "SEO" && (<section>
        <h2 className="font-bold">Service SEO Settings</h2><p className="mb-4 text-sm text-neutral-600">Search engine, social sharing and indexing settings. Empty fields fall back to the service content.</p>
        <Field label={`SEO Title (${f.seoTitle.length}/60)`} error={err("seoTitle")} hint={f.seoTitle.length > 60 ? "Longer than ~60 characters may be truncated in search results." : undefined}><input className={inp} placeholder="Clipping Path Services | PixelSkill" value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></Field>
        <Field label={`Meta Description (${f.metaDescription.length}/160)`} error={err("metaDescription")} hint={f.metaDescription.length > 160 ? "Longer than ~160 characters may be truncated." : undefined}><textarea rows={3} className={area} placeholder="Description shown in search results…" value={f.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></Field>
        <Field label="Canonical URL" error={err("canonicalUrl")} hint="Leave empty to use the default /services/[slug] URL."><input className={inp} placeholder={`https://pixelskill.com/services/${f.slug || "clipping-path"}`} value={f.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)} /></Field>
        <Field label="Focus Keyword"><input className={inp} placeholder="clipping path service" value={f.focusKeyword} onChange={(e) => set("focusKeyword", e.target.value)} /></Field>
        <Field label="Additional Keywords" hint="Editorial notes only; not output as a meta keywords tag."><input className={inp} value={f.additionalKeywords} onChange={(e) => set("additionalKeywords", e.target.value)} /></Field>
        <div className="mb-4 flex flex-wrap gap-6 text-sm"><label><input type="checkbox" checked={f.noindex} onChange={(e) => set("noindex", e.target.checked)} /> noindex</label><label><input type="checkbox" checked={f.nofollow} onChange={(e) => set("nofollow", e.target.checked)} /> nofollow</label></div>
        <h3 className="mb-2 mt-6 font-semibold">Social sharing (Facebook, LinkedIn, X)</h3>
        <Field label="Social title" hint="Falls back to the SEO title."><input className={inp} maxLength={120} value={f.ogTitle} onChange={(e) => set("ogTitle", e.target.value)} /></Field>
        <Field label="Social description" hint="Falls back to the meta description."><textarea rows={2} className={area} maxLength={300} value={f.ogDescription} onChange={(e) => set("ogDescription", e.target.value)} /></Field>
        <div className="mb-4"><MediaPicker label="Social sharing image (1200×630 recommended)" value={f.ogImage} onChange={(m) => set("ogImage", m)} /></div>
        <Field label="Social image alt text"><input className={inp} maxLength={200} value={f.ogImageAlt} onChange={(e) => set("ogImageAlt", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-neutral-50 p-4 text-sm"><p className="text-xs text-neutral-500">Search preview</p><p className="text-lg text-blue-700">{f.seoTitle || f.name || "Service title"}</p><p className="text-green-700">pixelskill.com › services › {f.slug || "slug"}</p><p className="text-neutral-600">{f.metaDescription || f.shortDescription || "Meta description will appear here."}</p></div>
          <div className="overflow-hidden rounded-2xl border text-sm">{f.ogImage ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={f.ogImage.secureUrl} alt="" className="h-28 w-full object-cover" /> : <div className="grid h-28 place-items-center bg-neutral-100 text-xs text-neutral-400">No social image</div>}<div className="p-3"><p className="text-xs uppercase text-neutral-500">pixelskill.com</p><p className="font-semibold">{f.ogTitle || f.seoTitle || f.name || "Title"}</p><p className="text-neutral-600">{f.ogDescription || f.metaDescription || f.shortDescription || "Description"}</p></div></div>
        </div>
        <ul className="mt-4 list-disc pl-5 text-xs text-neutral-600">{[!f.seoTitle && "Add an SEO title.", !f.metaDescription && "Add a meta description.", !f.ogImage && "Add a social sharing image.", f.noindex && "This service is set to noindex and will not appear in the sitemap.", f.focusKeyword && !(f.seoTitle + f.name + f.metaDescription).toLowerCase().includes(f.focusKeyword.toLowerCase()) && "The focus keyword does not appear in the title or description."].filter(Boolean).map((m) => <li key={String(m)}>{m}</li>)}</ul>
      </section>)}

      <div aria-live="polite" className="mt-4 min-h-6 text-sm">{msg && <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "text-green-700" : "text-red-600"}>{msg.text}</p>}</div>
      <div className="mt-2 grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-3">
        {id ? <a href={`/admin/services/${id}/preview`} target="_blank" rel="noreferrer" className="rounded-full border border-neutral-300 px-4 py-3 text-center text-sm font-semibold hover:bg-neutral-50">Preview</a> : <button type="button" disabled className="rounded-full border px-4 py-3 text-sm text-neutral-400">Preview (save first)</button>}
        <button type="button" disabled={saving} onClick={() => save("DRAFT")} className="rounded-full border border-neutral-300 px-4 py-3 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50">Save Draft</button>
        <button type="button" disabled={saving} onClick={() => save("PUBLISHED")} className="rounded-full bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save / Publish"}</button>
      </div>
    </div>
  );
}
