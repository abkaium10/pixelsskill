"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploader, type UploadedFile } from "@/components/FileUploader";

type F = { publicId?: string; name: string; format?: string; url?: string };
const STATUSES = ["QUEUED", "PROCESSING", "DONE", "FAILED", "CANCELLED"];

export function EditJobDetail({ id, status, notes, inputs, outputs, error }: { id: string; status: string; notes: string; inputs: F[]; outputs: F[]; error: string | null }) {
  const router = useRouter();
  const [st, setSt] = useState(status);
  const [n, setN] = useState(notes);
  const [msg, setMsg] = useState("");
  const [up, setUp] = useState<UploadedFile[]>([]);

  async function save() {
    const r = await fetch(`/api/admin/edit-jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: st, internalNotes: n }) });
    setMsg(r.ok ? "Saved." : "Could not save."); if (r.ok) router.refresh();
  }
  async function attach(files: UploadedFile[]) {
    setUp(files); if (!files.length) return;
    const r = await fetch(`/api/admin/edit-jobs/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ files }) });
    if (r.ok) { setUp([]); setMsg("Results attached. Set the status to DONE to release them to the visitor."); router.refresh(); } else setMsg((await r.json()).error ?? "Upload failed");
  }
  const list = (t: string, fs: F[]) => (<div className="mb-4"><h3 className="mb-1 text-sm font-semibold">{t}</h3>{fs.length ? <ul className="space-y-1 text-sm">{fs.map((f, i) => <li key={i}>{f.name} <span className="text-neutral-400">{f.format?.toUpperCase()}</span></li>)}</ul> : <p className="text-sm text-neutral-500">None</p>}</div>);
  return (
    <div className="rounded-2xl border bg-white p-5">
      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">Provider error: {error}</p>}
      {list("Uploaded by the visitor (private)", inputs)}
      {list("Results", outputs)}
      <label className="mb-1 block text-sm font-semibold" htmlFor="js">Status</label>
      <select id="js" className="mb-3 w-full rounded-full border px-4 py-2 text-sm" value={st} onChange={(e) => setSt(e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      <label className="mb-1 block text-sm font-semibold" htmlFor="jn">Internal notes</label>
      <textarea id="jn" rows={3} className="mb-3 w-full rounded-2xl border px-4 py-2 text-sm" value={n} onChange={(e) => setN(e.target.value)} />
      <p className="mb-1 text-sm font-semibold">Upload finished files</p>
      <div className="mb-3"><FileUploader signUrl="/api/admin/uploads/sign" files={up} onChange={attach} /></div>
      <div aria-live="polite" className="min-h-5 text-sm text-neutral-600">{msg}</div>
      <button type="button" onClick={save} className="mt-2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">Save changes</button>
    </div>
  );
}
