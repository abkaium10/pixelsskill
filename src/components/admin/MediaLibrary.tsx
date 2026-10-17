"use client";
import { useCallback, useEffect, useState } from "react";
import { cld } from "@/lib/cld";
type M = { id: string; secureUrl: string; resourceType: string; originalName: string | null; alt: string | null; width: number | null; height: number | null; bytes: number | null; format: string | null; publicId: string; isSample: boolean };

export function MediaLibrary() {
  const [items, setItems] = useState<M[]>([]); const [q, setQ] = useState(""); const [type, setType] = useState(""); const [page, setPage] = useState(1); const [pages, setPages] = useState(1);
  const [sel, setSel] = useState<M | null>(null); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [usedBy, setUsedBy] = useState<string[]>([]);
  const load = useCallback(async () => { const r = await fetch(`/api/admin/media?type=${type}&q=${encodeURIComponent(q)}&page=${page}`); if (r.ok) { const j = await r.json(); setItems(j.items); setPages(j.pages); } }, [q, type, page]);
  useEffect(() => { void load(); }, [load]);

  async function upload(file: File) {
    setBusy(true); setMsg("");
    try {
      const kind = file.type.startsWith("video") ? "video" : "image";
      const s = await (await fetch("/api/admin/media/sign", { method: "POST" })).json(); if (!s.signature) throw new Error("Cloudinary is not configured");
      const fd = new FormData(); fd.append("file", file); fd.append("api_key", s.apiKey); fd.append("timestamp", String(s.timestamp)); fd.append("signature", s.signature); fd.append("folder", s.folder);
      const up = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/${kind}/upload`, { method: "POST", body: fd }); const uj = await up.json(); if (!up.ok) throw new Error(uj.error?.message ?? "Upload failed");
      const reg = await fetch("/api/admin/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId: uj.public_id, resourceType: kind, originalName: file.name }) }); if (!reg.ok) throw new Error((await reg.json()).error ?? "Could not register asset");
      setMsg("Uploaded."); setPage(1); void load();
    } catch (e) { setMsg(e instanceof Error ? e.message : "Upload failed"); } finally { setBusy(false); }
  }
  async function saveAlt() { if (!sel) return; const r = await fetch(`/api/admin/media/${sel.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alt: sel.alt ?? "" }) }); setMsg(r.ok ? "Alt text saved." : "Could not save"); void load(); }
  async function del() {
    if (!sel || !confirm("Delete this asset from the library and Cloudinary?")) return;
    const r = await fetch(`/api/admin/media/${sel.id}`, { method: "DELETE" }); const j = await r.json();
    if (r.ok) { setSel(null); setUsedBy([]); setMsg("Deleted."); void load(); } else { setUsedBy(j.usedBy ?? []); setMsg(j.error ?? "Could not delete"); }
  }
  const b = "rounded-full border px-4 py-2 text-sm hover:bg-neutral-50";
  return (<div className="max-w-6xl"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Media Library</h1><label className="cursor-pointer rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">{busy ? "Uploading…" : "Upload image or video"}<input type="file" hidden disabled={busy} accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label></div>
    <div className="mb-4 flex flex-wrap gap-2"><input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name, alt text or ID…" aria-label="Search media" className="rounded-full border px-4 py-2 text-sm" /><select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} aria-label="Type" className="rounded-full border px-4 py-2 text-sm"><option value="">All types</option><option value="image">Images</option><option value="video">Videos</option></select></div>
    {msg && <p role="status" className="mb-3 text-sm">{msg}</p>}
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{items.map((m) => (<button key={m.id} type="button" onClick={() => { setSel(m); setUsedBy([]); }} className={`overflow-hidden rounded-2xl border bg-white text-left ${sel?.id === m.id ? "ring-2 ring-black" : ""}`}>{/* eslint-disable-next-line @next/next/no-img-element */}{m.resourceType === "image" ? <img src={cld(m.secureUrl, 300)} alt={m.alt ?? ""} loading="lazy" className="aspect-square w-full object-cover" /> : <video src={m.secureUrl} muted className="aspect-square w-full object-cover" />}<span className="block truncate p-2 text-xs">{m.originalName ?? m.publicId}</span></button>))}{!items.length && <p className="col-span-full p-10 text-center text-neutral-500">No assets found.</p>}</div>
        <div className="mt-4 flex items-center justify-between text-sm"><button className={b} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button><span>Page {page} / {pages}</span><button className={b} disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button></div></div>
      <aside className="rounded-2xl border bg-white p-4 text-sm" aria-label="Asset details">{sel ? (<div className="space-y-2"><b>{sel.originalName ?? sel.publicId}</b>{sel.isSample && <p className="rounded bg-amber-50 p-2 text-xs text-amber-900">Sample demonstration asset (not client work).</p>}
        <dl className="text-xs text-neutral-600"><div>Type: {sel.resourceType} {sel.format}</div><div>Size: {sel.width && sel.height ? `${sel.width}×${sel.height}` : "—"} · {sel.bytes ? `${(sel.bytes / 1024).toFixed(0)} KB` : "—"}</div><div className="break-all">ID: {sel.publicId}</div></dl>
        <label className="block text-xs font-semibold" htmlFor="alt">Alt text</label><input id="alt" className="w-full rounded-full border px-3 py-2" value={sel.alt ?? ""} onChange={(e) => setSel({ ...sel, alt: e.target.value })} />
        <div className="flex flex-wrap gap-2"><button className={b} onClick={saveAlt}>Save alt</button><button className={b} onClick={() => navigator.clipboard.writeText(sel.secureUrl).then(() => setMsg("URL copied."))}>Copy URL</button><button className={`${b} text-red-600`} onClick={del}>Delete</button></div>
        {usedBy.length > 0 && <div role="alert" className="rounded bg-red-50 p-2 text-xs text-red-800"><b>In use — remove these references first:</b><ul className="list-disc pl-4">{usedBy.map((u) => <li key={u}>{u}</li>)}</ul></div>}</div>) : <p className="text-neutral-500">Select an asset to see details, edit alt text, copy its URL or check where it is used.</p>}</aside></div></div>);
}
