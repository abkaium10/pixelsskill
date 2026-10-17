"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function RowActions({ id, slug, status }: { id: string; slug: string; status: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  async function archive() {
    if (!confirm("Archive this service? It will be removed from the public site.")) return;
    const r = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (r.ok) router.refresh(); else setMsg("Failed");
  }
  return (
    <span className="inline-flex gap-2">
      <Link href={`/admin/services/${id}`} className="rounded-full border px-3 py-1 hover:bg-neutral-50">Edit</Link>
      {status === "PUBLISHED" && <a href={`/services/${slug}`} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1 hover:bg-neutral-50">Open</a>}
      <button type="button" onClick={() => navigator.clipboard.writeText(`${location.origin}/services/${slug}`)} className="rounded-full border px-3 py-1 hover:bg-neutral-50">Copy URL</button>
      {status !== "ARCHIVED" && <button type="button" onClick={archive} className="rounded-full border px-3 py-1 text-red-600 hover:bg-red-50">Archive</button>}
      {msg && <span role="alert" className="text-red-600">{msg}</span>}
    </span>
  );
}
