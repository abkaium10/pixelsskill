"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function ResourceRowActions({ resource, id, status, publicHref, canArchive }: { resource: string; id: string; status?: string; publicHref?: string | null; canArchive: boolean }) {
  const router = useRouter(); const [msg, setMsg] = useState("");
  async function del(hard: boolean) {
    if (!confirm(hard ? "Permanently delete this item? This cannot be undone." : "Archive this item? It will be hidden from the website.")) return;
    const r = await fetch(`/api/admin/r/${resource}/${id}${hard ? "?hard=1" : ""}`, { method: "DELETE" });
    if (r.ok) router.refresh(); else setMsg("Failed");
  }
  const b = "rounded-full border px-3 py-1 hover:bg-neutral-50";
  return (<span className="inline-flex flex-wrap justify-end gap-2">
    <Link href={`/admin/${resource}/${id}`} className={b}>Edit</Link>
    {status === "PUBLISHED" && publicHref && <a href={publicHref} target="_blank" rel="noreferrer" className={b}>Open</a>}
    {canArchive && status !== "ARCHIVED" && <button type="button" onClick={() => del(false)} className={b}>Archive</button>}
    <button type="button" onClick={() => del(true)} className={`${b} text-red-600`}>Delete</button>{msg && <span role="alert" className="text-red-600">{msg}</span>}
  </span>);
}
