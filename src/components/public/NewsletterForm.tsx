"use client";
import { useState } from "react";
import Link from "next/link";
export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle"); const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); const fd = new FormData(e.currentTarget);
    setState("busy");
    try {
      const r = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: fd.get("email"), consent: fd.get("consent") === "on", website: fd.get("website") }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.fields ? Object.values<string[]>(j.fields)[0]?.[0] ?? j.error : j.error ?? "Something went wrong"); setState("idle"); return; }
      setState("done");
    } catch { setErr("Network error. Please try again."); setState("idle"); }
  }
  if (state === "done") return <div role="status" className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white"><b>You are subscribed.</b><p className="text-sm text-white/70">Thanks! You can unsubscribe at any time.</p></div>;
  return (
    <form onSubmit={submit} noValidate className="relative rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="font-display text-xl font-bold text-white">Editing tips, occasionally</p>
      <p className="mb-3 text-sm text-white/70">Short guides on product photo editing. No spam.</p>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="flex flex-wrap gap-2"><label className="sr-only" htmlFor="nl-email">Email</label><input id="nl-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="min-w-[200px] flex-1 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/60" /><button disabled={state === "busy"} className="rounded-full bg-cyan px-6 py-2.5 text-sm font-semibold text-navy disabled:opacity-60">{state === "busy" ? "…" : "Subscribe"}</button></div>
      <label className="mt-3 flex items-start gap-2 text-xs text-white/75"><input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 accent-cyan" /><span>I agree to receive emails and understand I can unsubscribe at any time. See our <Link href="/privacy" className="underline">Privacy Policy</Link>.</span></label>
      {err && <p role="alert" className="mt-2 text-xs text-red-300">{err}</p>}
    </form>
  );
}
