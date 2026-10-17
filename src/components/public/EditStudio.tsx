"use client";
import { useEffect, useState } from "react";
import { FileUploader, type UploadedFile } from "@/components/FileUploader";

type Svc = { slug: string; name: string; note: string };
type Out = { name: string; url: string };
const LABEL: Record<string, string> = { QUEUED: "Queued", PROCESSING: "Processing", DONE: "Done", FAILED: "Failed", CANCELLED: "Cancelled" };

/**
 * Generic online editing studio: pick a service, upload images, submit. What happens next is decided by the provider
 * selected in Admin → Online editing (human editors by default). New services appear here from the admin settings — no code change.
 */
export function EditStudio({ services, maxFiles, disclaimer }: { services: Svc[]; maxFiles: number; disclaimer: string }) {
  const [slug, setSlug] = useState(services[0]?.slug ?? "");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [instructions, setInstructions] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [job, setJob] = useState<{ id: string; token: string } | null>(null);
  const [status, setStatus] = useState("QUEUED");
  const [outputs, setOutputs] = useState<Out[]>([]);
  const note = services.find((s) => s.slug === slug)?.note;

  useEffect(() => {
    if (!job || status === "DONE" || status === "FAILED" || status === "CANCELLED") return;
    const tick = async () => {
      try {
        const r = await fetch(`/api/edit/jobs/${job.id}`, { headers: { "x-job-token": job.token } });
        if (!r.ok) return;
        const j = await r.json();
        setStatus(j.status);
        if (j.outputs?.length) setOutputs(j.outputs);
      } catch { /* offline: try again on the next tick */ }
    };
    const id = setInterval(tick, 5000);
    void tick();
    return () => clearInterval(id);
  }, [job, status]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!files.length) { setErr("Please upload at least one image."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/edit/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceSlug: slug, files, options: { instructions }, email }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error ?? "Could not start the job."); return; }
      setJob({ id: j.id, token: j.token });
      setStatus("QUEUED");
    } catch { setErr("Network error. Please try again."); } finally { setBusy(false); }
  }

  if (job) {
    return (
      <div role="status" className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="font-display text-2xl font-bold">Your job: {LABEL[status] ?? status}</h2>
        <p className="mt-2 text-slate-600">{status === "DONE" ? "Your files are ready." : status === "FAILED" ? "Something went wrong. Please contact us and mention this job." : "We are working on it. This page updates automatically — you can keep it open."}</p>
        {outputs.length > 0 && <ul className="mt-4 space-y-2">{outputs.map((o) => <li key={o.url}><a className="text-teal underline" href={o.url} rel="noopener noreferrer">{o.name}</a></li>)}</ul>}
        <p className="mt-4 text-xs text-slate-500">Download links expire after about 10 minutes; reload this page to get fresh links.</p>
      </div>
    );
  }
  const inp = "w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm";
  return (
    <form onSubmit={submit} noValidate className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4"><label htmlFor="svc" className="mb-1 block text-sm font-semibold">Service</label><select id="svc" value={slug} onChange={(e) => setSlug(e.target.value)} className={inp}>{services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>{note && <p className="mt-1 text-xs text-slate-500">{note}</p>}</div>
      <div className="mb-4"><span className="mb-1 block text-sm font-semibold">Images</span><FileUploader signUrl="/api/uploads/sign" scope="edit" files={files} onChange={setFiles} max={maxFiles} /></div>
      <div className="mb-4"><label htmlFor="ins" className="mb-1 block text-sm font-semibold">Instructions (optional)</label><textarea id="ins" rows={3} maxLength={500} value={instructions} onChange={(e) => setInstructions(e.target.value)} className={inp} /></div>
      <div className="mb-4"><label htmlFor="em" className="mb-1 block text-sm font-semibold">Email (optional)</label><input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} autoComplete="email" /></div>
      {disclaimer && <p className="mb-4 rounded-xl bg-cream p-3 text-xs text-slate-600">{disclaimer}</p>}
      {err && <p role="alert" className="mb-3 text-sm text-red-600">{err}</p>}
      <button disabled={busy} className="rounded-full bg-navy px-8 py-3 text-sm font-semibold text-white hover:bg-teal disabled:opacity-60">{busy ? "Starting…" : "Start editing"}</button>
    </form>
  );
}
