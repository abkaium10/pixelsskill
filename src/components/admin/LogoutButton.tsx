"use client";
import { useRouter } from "next/navigation";
export function LogoutButton() {
  const router = useRouter();
  return <button type="button" className="rounded-full border px-3 py-1 hover:bg-neutral-50" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }}>Logout</button>;
}
