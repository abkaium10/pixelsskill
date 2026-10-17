"use client";
import { useRef, useState } from "react";

export type UploadedFile = { publicId: string; resourceType: "image" | "raw" | "video"; name: string };
const OK = ["image/jpeg", "image/png", "image/webp", "image/tiff", "image/vnd.adobe.photoshop", "application/x-photoshop", "application/octet-stream"];
const EXT = /\.(jpe?g|png|webp|tiff?|psd)$/i;
const MAX = 25 * 1024 * 1024;

/** Uploads straight to Cloudinary's PRIVATE area using a short-lived server signature, with per-file progress. */
export function FileUploader({ signUrl, scope, files, onChange, max = 20, error }: { signUrl: string; scope?: string; files: UploadedFile[]; onChange: (f: UploadedFile[]) => void; max?: number; error?: string }) {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  function uploadOne(file: File, s: Record<string, string | number>): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append("file", file); fd.append("api_key", String(s.apiKey)); fd.append("timestamp", String(s.timestamp)); fd.append("signature", String(s.signature)); fd.append("folder", String(s.folder)); fd.append("type", String(s.type)); fd.append("allowed_formats", String(s.allowed_formats));
      const x = new XMLHttpRequest(); x.open("POST", `https://api.cloudinary.com/v1_1/${s.cloudName}/auto/upload`);
      x.upload.onprogress = (e) => e.lengthComputable && setProgress((p) => ({ ...p, [file.name]: Math.round((e.loaded / e.total) * 100) }));
      x.onload = () => { try { const j = JSON.parse(x.responseText); x.status < 300 ? resolve({ publicId: j.public_id, resourceType: j.resource_type, name: file.name }) : reject(new Error(j.error?.message ?? "Upload failed")); } catch { reject(new Error("Upload failed")); } };
      x.onerror = () => reject(new Error("Network error during upload"));
      x.send(fd);
    });
  }

  async function pick(list: FileList | null) {
    if (!list) return; setErr("");
    const chosen = [...list];
    if (files.length + chosen.length > max) { setErr(`You can upload up to ${max} files.`); return; }
    for (const f of chosen) {
      if (!EXT.test(f.name) || (f.type && !OK.includes(f.type))) { setErr(`"${f.name}" is not supported. Use JPG, PNG, TIFF, PSD or WEBP.`); return; }
      if (f.size > MAX) { setErr(`"${f.name}" is larger than 25 MB.`); return; }
    }
    const added: UploadedFile[] = [];
    for (const f of chosen) {
      try {
        const sr = await fetch(signUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope }) });
        const s = await sr.json(); if (!sr.ok) throw new Error(s.error ?? "Could not start upload");
        setProgress((p) => ({ ...p, [f.name]: 0 }));
        added.push(await uploadOne(f, s));
      } catch (e) { setErr(e instanceof Error ? e.message : "Upload failed"); break; }
    }
    if (added.length) onChange([...files, ...added]);
    setProgress({}); if (input.current) input.current.value = "";
  }

  const uploading = Object.keys(progress).length > 0;
  return (
    <div>
      <input ref={input} type="file" multiple accept=".jpg,.jpeg,.png,.tif,.tiff,.psd,.webp" onChange={(e) => pick(e.target.files)} disabled={uploading} className="block w-full rounded-2xl border border-dashed border-neutral-400 bg-white p-4 text-sm" aria-label="Upload images" />
      <p className="mt-1 text-xs text-neutral-500">JPG, PNG, TIFF, PSD or WEBP · up to 25 MB each · up to {max} files. Files are stored privately.</p>
      {Object.entries(progress).map(([n, p]) => <div key={n} className="mt-2 text-xs"><span>{n} — {p}%</span><div className="h-1.5 rounded bg-neutral-200"><div className="h-1.5 rounded bg-cyan-500" style={{ width: `${p}%` }} /></div></div>)}
      {(err || error) && <p role="alert" className="mt-2 text-sm text-red-600">{err || error}</p>}
      {files.length > 0 && <ul className="mt-3 space-y-1 text-sm">{files.map((f) => <li key={f.publicId} className="flex items-center justify-between rounded-xl bg-neutral-100 px-3 py-1.5"><span className="truncate">{f.name}</span><button type="button" className="text-xs text-red-600" onClick={() => onChange(files.filter((x) => x.publicId !== f.publicId))}>Remove</button></li>)}</ul>}
    </div>
  );
}
