"use client";
import { useCallback, useEffect, useState } from "react";
import { cld } from "@/lib/cld";

export type MediaItem = { id: string; secureUrl: string; resourceType: string; originalName?: string | null; alt?: string | null; width?: number | null; height?: number | null };

type Props = { label: string; value: MediaItem | null; onChange: (m: MediaItem | null) => void; type?: "image" | "video"; error?: string };

export function MediaPicker({ label, value, onChange, type = "image", error }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/media?type=${type}&q=${encodeURIComponent(q)}&page=${page}`);
    if (!r.ok) { setMsg("Could not load media"); return; }
    const j = await r.json(); setItems(j.items); setPages(j.pages);
  }, [q, page, type]);
  useEffect(() => { if (open) void load(); }, [open, load]);

  async function upload(file: File) {
    setBusy(true); setMsg("");
    try {
      const s = await (await fetch("/api/admin/media/sign", { method: "POST" })).json();
      if (!s.signature) throw new Error("Upload not configured (check Cloudinary env vars)");
      const fd = new FormData();
      fd.append("file", file); fd.append("api_key", s.apiKey); fd.append("timestamp", String(s.timestamp)); fd.append("signature", s.signature); fd.append("folder", s.folder);
      const up = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/${type}/upload`, { method: "POST", body: fd });
      const uj = await up.json();
      if (!up.ok) throw new Error(uj.error?.message ?? "Upload failed");
      const reg = await fetch("/api/admin/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId: uj.public_id, resourceType: type, originalName: file.name }) });
      if (!reg.ok) throw new Error((await reg.json()).error ?? "Could not register asset");
      onChange(await reg.json()); setOpen(false);
    } catch (e) { setMsg(e instanceof Error ? e.message : "Upload failed"); } finally { setBusy(false); }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <p className="mb-2 text-sm font-semibold text-neutral-700">{label}</p>
      {value ? (
        <div className="mb-2 overflow-hidden rounded-xl bg-neutral-100">
          {value.resourceType === "video" ? <video src={value.secureUrl} className="h-32 w-full object-cover" muted /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={cld(value.secureUrl, 400)} alt={value.alt ?? ""} className="h-32 w-full object-cover" />}
        </div>
      ) : <div className="mb-2 grid h-32 place-items-center rounded-xl bg-neutral-50 text-xs text-neutral-400">No {type} selected</div>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(true)} className="flex-1 rounded-full border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50">{value ? "Replace" : "Select from Cloudinary"}</button>
        {value && <button type="button" onClick={() => onChange(null)} className="rounded-full border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">Clear</button>}
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Media library" className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex gap-2">
              <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search media…" className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm" />
              <label className="cursor-pointer rounded-full bg-black px-4 py-2 text-sm font-medium text-white">{busy ? "Uploading…" : "Upload"}<input type="file" hidden accept={type === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} disabled={busy} /></label>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border px-4 py-2 text-sm">Close</button>
            </div>
            {msg && <p role="alert" className="mb-2 text-sm text-red-600">{msg}</p>}
            <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
              {items.map((m) => (
                <button key={m.id} type="button" onClick={() => { onChange(m); setOpen(false); }} className="overflow-hidden rounded-xl border border-neutral-200 text-left hover:ring-2 hover:ring-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {m.resourceType === "image" ? <img src={cld(m.secureUrl, 300)} alt={m.alt ?? ""} loading="lazy" className="aspect-square w-full object-cover" /> : <video src={m.secureUrl} className="aspect-square w-full object-cover" muted />}
                  <span className="block truncate px-2 py-1 text-xs text-neutral-600">{m.originalName ?? m.id}</span>
                </button>
              ))}
              {!items.length && <p className="col-span-full py-10 text-center text-sm text-neutral-500">No assets found.</p>}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-full border px-3 py-1 disabled:opacity-40">Prev</button>
              <span>{page} / {pages || 1}</span>
              <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-full border px-3 py-1 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
