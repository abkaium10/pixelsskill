"use client";
import { useRouter } from "next/navigation";
export function ContactActions({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  const patch = async () => { await fetch(`/api/admin/requests/contacts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: !read }) }); router.refresh(); };
  const del = async () => { if (!confirm("Delete this message?")) return; await fetch(`/api/admin/requests/contacts/${id}`, { method: "DELETE" }); router.refresh(); };
  const b = "rounded-full border px-3 py-1 text-xs hover:bg-neutral-50";
  return <span className="flex gap-2"><button type="button" className={b} onClick={patch}>{read ? "Mark unread" : "Mark read"}</button><button type="button" className={`${b} text-red-600`} onClick={del}>Delete</button></span>;
}
