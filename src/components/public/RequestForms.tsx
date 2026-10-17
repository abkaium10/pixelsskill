"use client";
import { useState } from "react";
import { FileUploader, type UploadedFile } from "@/components/FileUploader";

type Svc = { slug: string; name: string };
const inp = "w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-cyan/40";
const FORMATS = ["JPG", "PNG", "TIFF", "PSD", "WEBP"];

function F({ label, name, errors, children, hint }: { label: string; name: string; errors: Record<string, string[]>; children: React.ReactNode; hint?: string }) {
  return <div className="mb-4"><label htmlFor={name} className="mb-1 block text-sm font-semibold">{label}</label>{children}{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}{errors[name] && <p role="alert" className="mt-1 text-xs text-red-600">{errors[name][0]}</p>}</div>;
}

function useSubmit(endpoint: string) {
  const [errors, setErrors] = useState<Record<string, string[]>>({}); const [state, setState] = useState<"idle" | "busy" | "done">("idle"); const [msg, setMsg] = useState("");
  async function send(body: unknown) {
    setState("busy"); setErrors({}); setMsg("");
    try {
      const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErrors(j.fields ?? {}); setMsg(j.error ?? "Something went wrong. Please try again."); setState("idle"); return false; }
      setState("done"); return true;
    } catch { setMsg("Network error. Please try again."); setState("idle"); return false; }
  }
  return { errors, state, msg, send };
}
function LinkInputs({ links, setLinks, errors }: { links: string[]; setLinks: (l: string[]) => void; errors: Record<string, string[]> }) {
  const err = Object.entries(errors).find(([k]) => k.startsWith("fileLinks"))?.[1]?.[0];
  return (
    <div className="mb-4">
      <p className="mb-1 text-sm font-semibold">Files too large to upload? Share a download link</p>
      <p className="mb-2 rounded-xl border border-sun/60 bg-sun/15 p-3 text-xs"><b>Tip:</b> upload to Google Drive, Dropbox, OneDrive, WeTransfer or similar, set sharing to “anyone with the link can view/download”, and paste the link here. Please keep the link active until we confirm delivery.</p>
      <div className="grid gap-2">{links.map((l, i) => <div key={i} className="flex gap-2"><input type="url" inputMode="url" aria-label={`File download link ${i + 1}`} placeholder="https://drive.google.com/…" value={l} onChange={(e) => setLinks(links.map((x, j) => (j === i ? e.target.value : x)))} className={inp} />{links.length > 1 && <button type="button" aria-label="Remove link" onClick={() => setLinks(links.filter((_, j) => j !== i))} className="rounded-xl border px-3 text-sm">✕</button>}</div>)}</div>
      {links.length < 10 && <button type="button" onClick={() => setLinks([...links, ""])} className="mt-2 rounded-full border border-dashed border-teal px-4 py-1.5 text-sm font-semibold text-teal hover:bg-teal/5">+ Add another link</button>}
      {err && <p role="alert" className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
const cleanLinks = (l: string[]) => l.map((x) => x.trim()).filter(Boolean);
const Done = ({ title, children }: { title: string; children: React.ReactNode }) => <div role="status" className="rounded-3xl bg-white p-8 text-center shadow-sm"><p className="text-4xl">✓</p><h2 className="mt-2 font-display text-2xl font-bold">{title}</h2><p className="mt-2 text-slate-600">{children}</p></div>;
const Honey = () => <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>;
const Submit = ({ busy, children }: { busy: boolean; children: React.ReactNode }) => <button disabled={busy} className="rounded-full bg-navy px-8 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal disabled:opacity-60">{busy ? "Sending…" : children}</button>;
const fd = (e: React.FormEvent<HTMLFormElement>) => Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;

export function ContactForm({ heading, description }: { heading: string; description: string }) {
  const { errors, state, msg, send } = useSubmit("/api/contact");
  if (state === "done") return <Done title="Message sent">Thank you. We will reply to your email address.</Done>;
  return <form onSubmit={(e) => { e.preventDefault(); void send(fd(e)); }} noValidate className="relative rounded-3xl bg-white p-6 shadow-sm"><h2 className="font-display text-2xl font-bold">{heading}</h2>{description && <p className="mb-4 text-sm text-slate-600">{description}</p>}<Honey />
    <F label="Name" name="name" errors={errors}><input id="name" name="name" required className={inp} autoComplete="name" /></F>
    <F label="Email" name="email" errors={errors}><input id="email" name="email" type="email" required className={inp} autoComplete="email" /></F>
    <F label="Subject (optional)" name="subject" errors={errors}><input id="subject" name="subject" className={inp} /></F>
    <F label="Message" name="message" errors={errors}><textarea id="message" name="message" rows={6} required className={inp} /></F>
    {msg && <p role="alert" className="mb-3 text-sm text-red-600">{msg}</p>}<Submit busy={state === "busy"}>Send message</Submit></form>;
}

export function QuoteForm({ services, defaultService }: { services: Svc[]; defaultService?: string }) {
  const { errors, state, msg, send } = useSubmit("/api/quote"); const [files, setFiles] = useState<UploadedFile[]>([]); const [links, setLinks] = useState<string[]>([""]);
  if (state === "done") return <Done title="Quote request received">We will review your details and reply by email with pricing and turnaround. Your reference images are stored privately.</Done>;
  return <form onSubmit={(e) => { e.preventDefault(); void send({ ...fd(e), files, fileLinks: cleanLinks(links) }); }} noValidate className="relative rounded-3xl bg-white p-6 shadow-sm"><Honey />
    <div className="grid gap-x-4 sm:grid-cols-2"><F label="Name" name="name" errors={errors}><input id="name" name="name" required className={inp} autoComplete="name" /></F><F label="Email" name="email" errors={errors}><input id="email" name="email" type="email" required className={inp} autoComplete="email" /></F>
      <F label="Company" name="company" errors={errors}><input id="company" name="company" className={inp} autoComplete="organization" /></F><F label="Phone" name="phone" errors={errors}><input id="phone" name="phone" type="tel" className={inp} autoComplete="tel" /></F>
      <F label="Service" name="serviceSlug" errors={errors}><select id="serviceSlug" name="serviceSlug" defaultValue={defaultService ?? ""} className={inp}><option value="">Not sure yet</option>{services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></F>
      <F label="Number of images" name="quantity" errors={errors}><input id="quantity" name="quantity" type="number" min={1} required className={inp} /></F>
      <F label="Image complexity" name="complexity" errors={errors}><select id="complexity" name="complexity" className={inp} defaultValue="MEDIUM"><option value="SIMPLE">Simple</option><option value="MEDIUM">Medium</option><option value="COMPLEX">Complex</option><option value="VERY_COMPLEX">Very complex</option></select></F>
      <F label="Output format" name="outputFormat" errors={errors}><select id="outputFormat" name="outputFormat" className={inp} defaultValue="JPG">{FORMATS.map((f) => <option key={f}>{f}</option>)}</select></F>
      <F label="Requested deadline (optional)" name="deadline" errors={errors}><input id="deadline" name="deadline" type="date" className={inp} /></F></div>
    <F label="Instructions" name="instructions" errors={errors}><textarea id="instructions" name="instructions" rows={4} className={inp} /></F>
    <F label="Reference images (optional)" name="files" errors={errors}><FileUploader signUrl="/api/uploads/sign" scope="quote" files={files} onChange={setFiles} /></F>
    <LinkInputs links={links} setLinks={setLinks} errors={errors} />
    {msg && <p role="alert" className="mb-3 text-sm text-red-600">{msg}</p>}<Submit busy={state === "busy"}>Request quote</Submit></form>;
}

export function TrialForm({ services, defaultService, instructions }: { services: Svc[]; defaultService?: string; instructions?: string }) {
  const { errors, state, msg, send } = useSubmit("/api/free-trial"); const [files, setFiles] = useState<UploadedFile[]>([]); const [links, setLinks] = useState<string[]>([""]); const [q, setQ] = useState("3");
  if (state === "done") return <Done title="Free trial request received">We will review your images and email you the next steps. Your uploads are stored privately and only visible to our editing team.</Done>;
  return <form onSubmit={(e) => { e.preventDefault(); const v = fd(e); void send({ ...v, imageCount: q === "custom" ? v.customCount : q, files, fileLinks: cleanLinks(links) }); }} noValidate className="relative rounded-3xl bg-white p-6 shadow-sm"><Honey />
    {instructions && <p className="mb-4 rounded-xl bg-cream p-3 text-sm">{instructions}</p>}
    <div className="grid gap-x-4 sm:grid-cols-2"><F label="Name" name="name" errors={errors}><input id="name" name="name" required className={inp} autoComplete="name" /></F><F label="Email" name="email" errors={errors}><input id="email" name="email" type="email" required className={inp} autoComplete="email" /></F>
      <F label="Company (optional)" name="company" errors={errors}><input id="company" name="company" className={inp} /></F><F label="Phone (optional)" name="phone" errors={errors}><input id="phone" name="phone" type="tel" className={inp} /></F>
      <F label="Service" name="serviceSlug" errors={errors}><select id="serviceSlug" name="serviceSlug" defaultValue={defaultService ?? ""} className={inp}><option value="">Not sure yet</option>{services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></F>
      <F label="Output format" name="outputFormat" errors={errors}><select id="outputFormat" name="outputFormat" className={inp} defaultValue="JPG">{FORMATS.map((f) => <option key={f}>{f}</option>)}</select></F>
      <F label="Number of images" name="imageCount" errors={errors}><select id="imageCount" className={inp} value={q} onChange={(e) => setQ(e.target.value)}><option value="3">3 images</option><option value="5">5 images</option><option value="10">10 images</option><option value="custom">Custom quantity</option></select></F>
      {q === "custom" && <F label="Custom quantity" name="customCount" errors={errors}><input id="customCount" name="customCount" type="number" min={1} max={50} required className={inp} /></F>}</div>
    <F label="Instructions" name="instructions" errors={errors}><textarea id="instructions" name="instructions" rows={4} className={inp} placeholder="Describe what you want done to these images." /></F>
    <F label="Original images" name="files" errors={errors}><FileUploader signUrl="/api/uploads/sign" scope="trial" files={files} onChange={setFiles} /></F>
    <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500"><span className="h-px flex-1 bg-mist" />or<span className="h-px flex-1 bg-mist" /></div>
    <LinkInputs links={links} setLinks={setLinks} errors={errors} />
    {msg && <p role="alert" className="mb-3 text-sm text-red-600">{msg}</p>}<Submit busy={state === "busy"}>Submit free trial request</Submit></form>;
}
