"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function PasswordForm() {
  const router = useRouter(); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null); const fd = new FormData(e.currentTarget);
    if (fd.get("next") !== fd.get("confirm")) { setBusy(false); setMsg({ ok: false, t: "New passwords do not match" }); return; }
    const r = await fetch("/api/admin/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: fd.get("current"), next: fd.get("next") }) });
    setBusy(false);
    if (r.ok) { router.replace("/admin/login"); router.refresh(); } else setMsg({ ok: false, t: (await r.json()).error ?? "Could not change password" });
  }
  const c = "mb-4 w-full rounded-full border px-4 py-3 text-sm";
  return (<form onSubmit={submit} className="rounded-2xl border bg-white p-5"><h2 className="mb-3 font-bold">Change password</h2>
    <label htmlFor="cur" className="mb-1 block text-sm font-semibold">Current password</label><input id="cur" name="current" type="password" required autoComplete="current-password" className={c} />
    <label htmlFor="nw" className="mb-1 block text-sm font-semibold">New password (12+ characters)</label><input id="nw" name="next" type="password" required minLength={12} autoComplete="new-password" className={c} />
    <label htmlFor="cf" className="mb-1 block text-sm font-semibold">Confirm new password</label><input id="cf" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={c} />
    {msg && <p role="alert" className="mb-3 text-sm text-red-600">{msg.t}</p>}<p className="mb-3 text-xs text-neutral-500">Changing your password signs you out of every device.</p>
    <button disabled={busy} className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Update password"}</button></form>);
}
