"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const fd = new FormData(e.currentTarget);
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }) });
    setBusy(false);
    if (r.ok) { router.replace("/admin"); router.refresh(); } else setErr((await r.json()).error ?? "Login failed");
  }
  return (
    <div className="grid min-h-screen place-items-center bg-neutral-100 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold">PixelSkill CMS</h1>
        <label className="mb-1 block text-sm font-semibold" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="mb-4 w-full rounded-full border px-4 py-3 text-sm" />
        <label className="mb-1 block text-sm font-semibold" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="mb-4 w-full rounded-full border px-4 py-3 text-sm" />
        {err && <p role="alert" className="mb-3 text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
