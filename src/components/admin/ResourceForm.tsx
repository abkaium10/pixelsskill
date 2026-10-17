"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MediaPicker, type MediaItem } from "@/components/media/MediaPicker";
import { Markdown } from "@/components/Markdown";
import { blank, type Field } from "@/lib/defs";
import { slugify } from "@/lib/slug";

type Rel = Record<string, { id: string; label: string }[]>;
type Ctx = { errors: Record<string, string[]>; media: Record<string, MediaItem>; addMedia: (m: MediaItem) => void; relations: Rel };
const inp = "w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-black";
const area = "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-black";

function Label({ f, children, error, path }: { f: Field; children: React.ReactNode; error?: string; path: string }) {
  return (<div className="mb-4"><label htmlFor={`f-${path}`} className="mb-1 block text-sm font-semibold text-neutral-600">{f.label}{f.required && <span className="text-red-600"> *</span>}</label>{children}{f.hint && <p className="mt-1 text-xs text-neutral-500">{f.hint}</p>}{error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}</div>);
}
const toLocal = (iso: string | null) => { if (!iso) return ""; const d = new Date(iso); if (Number.isNaN(+d)) return ""; return new Date(+d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

function FieldInput({ f, value, onChange, path, ctx }: { f: Field; value: any; onChange: (v: any) => void; path: string; ctx: Ctx }) {
  const err = ctx.errors[path]?.[0];
  const id = `f-${path}`;
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  switch (f.type) {
    case "text": case "url": case "slug": case "money":
      return <Label f={f} error={err} path={path}><input id={id} type="text" inputMode={f.type === "money" ? "decimal" : undefined} className={inp} value={value ?? ""} placeholder={f.placeholder} maxLength={f.max} onChange={(e) => onChange(f.type === "slug" ? slugify(e.target.value) : e.target.value)} /></Label>;
    case "textarea": return <Label f={f} error={err} path={path}><textarea id={id} rows={3} className={area} value={value ?? ""} placeholder={f.placeholder} maxLength={f.max} onChange={(e) => onChange(e.target.value)} /></Label>;
    case "number": return <Label f={f} error={err} path={path}><input id={id} type="number" className={inp} min={f.min} max={f.max} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? (f.nullable ? null : 0) : Number(e.target.value))} /></Label>;
    case "checkbox": return <div className="mb-4"><label className="flex items-center gap-2 text-sm"><input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {f.label}</label>{f.hint && <p className="mt-1 text-xs text-neutral-500">{f.hint}</p>}</div>;
    case "select": return <Label f={f} error={err} path={path}><select id={id} className={inp} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Label>;
    case "relation": return <Label f={f} error={err} path={path}><select id={id} className={inp} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}><option value="">— None —</option>{(ctx.relations[f.name] ?? []).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select></Label>;
    case "datetime": return <Label f={f} error={err} path={path}><input id={id} type="datetime-local" className={inp} value={toLocal(value)} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} /></Label>;
    case "tags": return <Label f={f} error={err} path={path}><input id={id} type="text" className={inp} defaultValue={(value ?? []).join(", ")} onBlur={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="tag one, tag two" /></Label>;
    case "media": case "video": {
      const m = value ? ctx.media[value] ?? null : null;
      return <div className="mb-4"><MediaPicker label={f.label} type={f.type === "video" ? "video" : "image"} value={m} error={err} onChange={(x) => { if (x) ctx.addMedia(x); onChange(x?.id ?? null); }} />{f.hint && <p className="mt-1 text-xs text-neutral-500">{f.hint}</p>}</div>;
    }
    case "markdown": {
      const wrap = (a: string, b = a) => { const t = taRef.current; if (!t) return; const s = t.selectionStart, e = t.selectionEnd; const v = String(value ?? ""); onChange(v.slice(0, s) + a + (v.slice(s, e) || "text") + b + v.slice(e)); };
      const line = (p: string) => { const t = taRef.current; const v = String(value ?? ""); const s = t?.selectionStart ?? v.length; onChange(v.slice(0, s) + (s && v[s - 1] !== "\n" ? "\n" : "") + p + v.slice(s)); };
      const btn = "rounded-full border px-3 py-1 text-xs font-semibold hover:bg-neutral-50";
      return <Label f={f} error={err} path={path}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <button type="button" className={btn} onClick={() => line("## ")}>H2</button><button type="button" className={btn} onClick={() => line("### ")}>H3</button>
          <button type="button" className={btn} onClick={() => wrap("**")}>Bold</button><button type="button" className={btn} onClick={() => wrap("*")}>Italic</button>
          <button type="button" className={btn} onClick={() => line("- ")}>Bullets</button><button type="button" className={btn} onClick={() => line("1. ")}>Numbered</button>
          <button type="button" className={btn} onClick={() => line("> ")}>Quote</button><button type="button" className={btn} onClick={() => wrap("[", "](https://)")}>Link</button>
          <button type="button" className={`${btn} ml-auto`} onClick={() => setPreview((p) => !p)}>{preview ? "Edit" : "Preview"}</button>
        </div>
        {preview ? <div className="min-h-40 rounded-2xl border bg-white p-4"><Markdown source={value ?? ""} /></div> : <textarea id={id} ref={taRef} rows={14} className={`${area} font-mono`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />}
        <div className="mt-2 max-w-xs"><MediaPicker label="Insert image from library" value={null} onChange={(m) => { if (m) line(`![${m.alt ?? ""}](${m.secureUrl})\n`); }} /></div>
      </Label>;
    }
    case "list": {
      const items: any[] = value ?? [];
      const move = (i: number, d: number) => { const a = [...items]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); };
      return <fieldset className="mb-6 rounded-2xl border border-neutral-200 p-4"><legend className="px-2 text-sm font-semibold">{f.label}</legend>{f.hint && <p className="mb-3 text-xs text-neutral-500">{f.hint}</p>}
        {items.map((it, i) => (
          <div key={it.id ?? i} className="mb-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-3">
            <div className="mb-2 flex items-center justify-between"><b className="text-sm">#{i + 1}{f.itemLabel && it[f.itemLabel] ? ` — ${String(it[f.itemLabel]).slice(0, 50)}` : ""}</b>
              <span className="flex gap-1 text-xs"><button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-full border px-2 py-1 disabled:opacity-30">↑</button><button type="button" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="rounded-full border px-2 py-1 disabled:opacity-30">↓</button><button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded-full border px-3 py-1 text-red-600">Remove</button></span></div>
            {(f.fields ?? []).map((sf) => <FieldInput key={sf.name} f={sf} path={`${path}.${i}.${sf.name}`} value={it[sf.name]} ctx={ctx} onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, [sf.name]: v } : x)))} />)}
          </div>))}
        {(!f.maxItems || items.length < f.maxItems) && <button type="button" onClick={() => onChange([...items, blank(f.fields ?? [])])} className="w-full rounded-full border border-dashed border-neutral-400 px-4 py-2 text-sm font-medium hover:bg-neutral-50">+ Add {f.label.replace(/s$/i, "").toLowerCase()}</button>}
      </fieldset>;
    }
  }
}

type Props = { fields: Field[]; title: string; initial: Record<string, any>; media: Record<string, MediaItem>; relations: Rel;
  save: { url: string; method: "POST" | "PUT" }; hasStatus: boolean; backHref?: string; viewHref?: string | null; afterCreate?: (id: string) => string };

export function ResourceForm({ fields, title, initial, media, relations, save, hasStatus, backHref, viewHref, afterCreate }: Props) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, any>>({ ...blank(fields), ...initial });
  const [cache, setCache] = useState(media);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false); const [dirty, setDirty] = useState(false);
  const slugTouched = useRef<Record<string, boolean>>({ ...(initial.id ? Object.fromEntries(fields.filter((f) => f.type === "slug").map((f) => [f.name, true])) : {}) });
  const tabs = useMemo(() => { const t: string[] = []; for (const f of fields) { const n = f.tab || "General"; if (!t.includes(n)) t.push(n); } return t; }, [fields]);
  const [tab, setTab] = useState(tabs[0]);
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);

  const setTop = (f: Field, v: any) => {
    setDirty(true);
    setData((d) => {
      const n = { ...d, [f.name]: v };
      for (const s of fields) if (s.type === "slug" && s.from === f.name && !slugTouched.current[s.name]) n[s.name] = slugify(String(v));
      if (f.type === "slug") slugTouched.current[f.name] = true;
      return n;
    });
  };
  const ctx: Ctx = { errors, media: cache, addMedia: (m) => setCache((c) => ({ ...c, [m.id]: m })), relations };
  const tabHasError = (t: string) => fields.some((f) => (f.tab || "General") === t && Object.keys(errors).some((k) => k === f.name || k.startsWith(`${f.name}.`)));

  async function submit(status?: "DRAFT" | "PUBLISHED") {
    setBusy(true); setMsg(null); setErrors({});
    const body = { ...data, ...(status ? { status } : {}) };
    try {
      const r = await fetch(save.url, { method: save.method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const fe: Record<string, string[]> = j.fields ?? {}; setErrors(fe); setMsg({ ok: false, text: j.error ?? "Save failed" });
        const first = Object.keys(fe)[0]?.split(".")[0]; const ft = fields.find((f) => f.name === first); if (ft) setTab(ft.tab || "General"); return;
      }
      setDirty(false); if (status) setData((d) => ({ ...d, status }));
      setMsg({ ok: true, text: status === "PUBLISHED" ? "Published. Public pages were refreshed." : status === "DRAFT" ? "Saved as draft." : "Saved. Changes are live." });
      if (save.method === "POST" && j.id && afterCreate) router.replace(afterCreate(j.id)); else router.refresh();
    } catch { setMsg({ ok: false, text: "Network error. Please try again." }); } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2"><h1 className="text-xl font-bold">{title}</h1>{backHref && <Link href={backHref} className="text-sm underline-offset-4 hover:underline">← Back</Link>}</div>
      {tabs.length > 1 && <div role="tablist" className="mb-4 flex flex-wrap gap-2 border-b pb-4">{tabs.map((t) => <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${tab === t ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"}`}>{t}{tabHasError(t) && <span className="ml-1 text-red-500">●</span>}</button>)}</div>}
      <div>{fields.filter((f) => (f.tab || "General") === tab).map((f) => <FieldInput key={f.name} f={f} path={f.name} value={data[f.name]} ctx={ctx} onChange={(v) => setTop(f, v)} />)}</div>
      <div aria-live="polite" className="mt-3 min-h-6 text-sm">{msg && <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "text-green-700" : "text-red-600"}>{msg.text}</p>}</div>
      <div className="mt-2 grid gap-3 border-t pt-4 sm:grid-cols-3">
        {viewHref && data.status === "PUBLISHED" ? <a href={viewHref} target="_blank" rel="noreferrer" className="rounded-full border border-neutral-300 px-4 py-3 text-center text-sm font-semibold hover:bg-neutral-50">View on site ↗</a> : <span className="rounded-full border border-dashed px-4 py-3 text-center text-sm text-neutral-400">{hasStatus ? "Publish to view on site" : " "}</span>}
        {hasStatus ? (<><button type="button" disabled={busy} onClick={() => submit("DRAFT")} className="rounded-full border border-neutral-300 px-4 py-3 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50">Save Draft</button>
          <button type="button" disabled={busy} onClick={() => submit("PUBLISHED")} className="rounded-full bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save / Publish"}</button></>)
          : <button type="button" disabled={busy} onClick={() => submit()} className="rounded-full bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">{busy ? "Saving…" : "Save changes"}</button>}
      </div>
    </div>
  );
}
