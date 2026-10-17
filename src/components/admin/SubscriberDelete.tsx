"use client";
import { useRouter } from "next/navigation";
export function SubscriberDelete({ id }: { id: string }) {
  const router = useRouter();
  return <button type="button" className="rounded-full border px-3 py-1 text-xs text-red-600 hover:bg-red-50" onClick={async () => { if (!confirm("Delete this subscriber permanently?")) return; await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" }); router.refresh(); }}>Delete</button>;
}
