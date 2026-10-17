"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploader, type UploadedFile } from "@/components/FileUploader";

type F = { publicId: string; name: string; bytes?: number; format?: string };
type Props = { kind: "quotes" | "free-trial"; id: string; status: string; notes: string; price?: string; turnaround?: string; files: F[]; fileLinks?: string[]; deliverables?: F[] };
const STATUSES = ["PENDING", "REVIEWING", "QUOTED", "APPROVED", "COMPLETED", "CANCELLED"];
const inp = "w-full rounded-full border border-neutral-300 px-4 py-2 text-sm";

export function RequestDetail(p: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(p.status); const [notes, setNotes] = useState(p.notes);
  const [price, setPrice] = useState(p.price ?? ""); const [turn, setTurn] = useState(p.turnaround ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false);
  const [up, setUp] = useState<UploadedFile[]>([]);

  async function save() {
    setBusy(true); setMsg(null);
    const body = p.kind === "quotes" ? { status, internalNotes: notes, proposedPrice: price, proposedTurnaround: turn } : { status, internalNotes: notes };
    const r = await fetch(`/api/admin/requests/${p.kind}/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false); setMsg(r.ok ? { ok: true, t: "Saved." } : { ok: false, t: "Could not save. Check the values." }); if (r.ok) router.refresh();
  }
  async function attach(files: UploadedFile[]) {
    setUp(files); if (!files.length) return;
    const r = await fetch(`/api/admin/requests/free-trial/${p.id}/deliverables`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ files }) });
    if (r.ok) { setUp([]); router.refresh(); setMsg({ ok: true, t: "Deliverables attached." }); } else setMsg({ ok: false, t: (await r.json()).error ?? "Could not attach files" });
  }
  async function del() { if (!confirm("Delete this request permanently?")) return; await fetch(`/api/admin/requests/${p.kind}/${p.id}`, { method: "DELETE" }); router.replace(`/admin/${p.kind}`); router.refresh(); }
  const link = (f: F) => `/api/admin/requests/${p.kind}/${p.id}/file?publicId=${encodeURIComponent(f.publicId)}`;
  const list = (title: string, fs: F[]) => (<div className="mb-4"><h3 className="mb-1 text-sm font-semibold">{title}</h3>{fs.length ? <ul className="space-y-1 text-sm">{fs.map((f) => <li key={f.publicId}><a className="text-teal underline" href={link(f)}>{f.name}</a> <span className="text-neutral-400">{f.format?.toUpperCase()} {f.bytes ? `· ${(f.bytes / 1048576).toFixed(1)} MB` : ""}</span></li>)}</ul> : <p className="text-sm text-neutral-500">None</p>}</div>);

  const linkList = (p.fileLinks ?? []).length ? <div className="mb-4"><h3 className="mb-1 text-sm font-semibold">Download links from the customer</h3><ul className="space-y-1 text-sm">{(p.fileLinks ?? []).map((u) => <li key={u}><a className="break-all text-teal underline" href={u} target="_blank" rel="noopener noreferrer nofollow">{u}</a></li>)}</ul><p className="mt-1 text-xs text-neutral-500">External links: only open links you trust.</p></div> : null;
  return (<div className="rounded-2xl border bg-white p-5">
    {linkList}
    {list(p.kind === "quotes" ? "Reference images (private, 10-minute links)" : "Original images (private, 10-minute links)", p.files)}
    <label className="mb-1 block text-sm font-semibold" htmlFor="st">Status</label>
    <select id="st" className={`${inp} mb-3`} value={status} onChange={(e) => setStatus(e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
    {p.kind === "quotes" && (<div className="mb-3 grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-semibold" htmlFor="pr">Proposed price (USD)</label><input id="pr" className={inp} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 120.00" inputMode="decimal" /></div><div><label className="mb-1 block text-sm font-semibold" htmlFor="tu">Proposed turnaround</label><input id="tu" className={inp} value={turn} onChange={(e) => setTurn(e.target.value)} placeholder="e.g. 3 business days" /></div></div>)}
    <label className="mb-1 block text-sm font-semibold" htmlFor="nt">Internal notes (never shown to the customer)</label>
    <textarea id="nt" rows={4} className="mb-3 w-full rounded-2xl border border-neutral-300 px-4 py-2 text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} />
    {p.kind === "free-trial" && (<div className="mb-4">{list("Completed deliverables", p.deliverables ?? [])}<p className="mb-1 text-sm font-semibold">Upload deliverables</p><FileUploader signUrl="/api/admin/uploads/sign" files={up} onChange={attach} /></div>)}
    <div aria-live="polite" className="min-h-6 text-sm">{msg && <p className={msg.ok ? "text-green-700" : "text-red-600"} role={msg.ok ? "status" : "alert"}>{msg.t}</p>}</div>
    <div className="mt-2 flex gap-3"><button type="button" disabled={busy} onClick={save} className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button><button type="button" onClick={del} className="rounded-full border px-5 py-2 text-sm text-red-600">Delete</button></div>
  </div>);
}
