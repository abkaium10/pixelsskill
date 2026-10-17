"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { id: string; sender: "VISITOR" | "ADMIN" | "SYSTEM"; body: string; at: string };
export type ChatSettings = { title: string; welcomeMessage: string; teaser: string; autoOpenDelay: number; quickReplies: { text: string }[]; askContact: boolean; hours: string; offlineNote: string };
const KEY = "ps_chat";
const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** Floating live-chat widget. New visitors see an automatic welcome message; the team replies from Admin → Live chat. Messages are fetched by polling (works on serverless hosting). */
export function ChatWidget({ s }: { s: ChatSettings }) {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const [unread, setUnread] = useState(0);
  const last = useRef<string | null>(null); const logRef = useRef<HTMLDivElement>(null); const inputRef = useRef<HTMLTextAreaElement>(null);

  const merge = useCallback((incoming: Msg[]) => {
    if (!incoming.length) return;
    setMsgs((cur) => { const ids = new Set(cur.map((m) => m.id)); const add = incoming.filter((m) => !ids.has(m.id)); return add.length ? [...cur, ...add] : cur; });
    last.current = incoming[incoming.length - 1].at;
  }, []);
  const api = useCallback(async (path: string, init: RequestInit & { tok?: string | null } = {}) => {
    const { tok, ...rest } = init;
    return fetch(path, { ...rest, headers: { "Content-Type": "application/json", ...(tok ? { "x-chat-token": tok } : {}) } });
  }, []);

  // restore session + show teaser after a delay (never when dismissed this session)
  useEffect(() => {
    try { const t = localStorage.getItem(KEY); if (t) setToken(JSON.parse(t).t); } catch { /* storage unavailable */ }
    let dismissed = false; try { dismissed = sessionStorage.getItem("ps_chat_teaser") === "1"; } catch { /* ignore */ }
    if (s.teaser && s.autoOpenDelay > 0 && !dismissed) { const id = setTimeout(() => setTeaser(true), s.autoOpenDelay * 1000); return () => clearTimeout(id); }
  }, [s.teaser, s.autoOpenDelay]);

  const start = useCallback(async (tok: string | null, n = "", e = "") => {
    setBusy(true); setErr("");
    try {
      const r = await api("/api/chat/start", { method: "POST", tok, body: JSON.stringify({ name: n, email: e, page: location.pathname }) }); const j = await r.json().catch(() => ({}));
      if (!r.ok) { if (r.status === 401) { localStorage.removeItem(KEY); setToken(null); } setErr(j.error ?? "Chat is unavailable right now."); return false; }
      if (j.token) { setToken(j.token); try { localStorage.setItem(KEY, JSON.stringify({ t: j.token })); } catch { /* ignore */ } }
      setMsgs(j.messages); last.current = j.messages.at(-1)?.at ?? null; return true;
    } catch { setErr("Network error. Please try again."); return false; } finally { setBusy(false); }
  }, [api]);

  // opening: resume an existing session, or (when contact is not requested) start one immediately
  useEffect(() => { if (open && token && !msgs.length) void start(token); else if (open && !token && !s.askContact && !msgs.length) void start(null); }, [open, token, msgs.length, s.askContact, start]);
  useEffect(() => { if (open) { setTeaser(false); setUnread(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [msgs, open]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);

  // polling: fast while open, slow in the background (shows an unread dot)
  useEffect(() => {
    if (!token) return;
    const tick = async () => {
      if (document.hidden) return;
      try { const r = await api(`/api/chat/messages${last.current ? `?after=${encodeURIComponent(last.current)}` : ""}`, { tok: token }); if (r.status === 401) { localStorage.removeItem(KEY); setToken(null); setMsgs([]); return; } const j = await r.json(); if (j.messages?.length) { merge(j.messages); if (!open) setUnread((u) => u + j.messages.filter((m: Msg) => m.sender === "ADMIN").length); } } catch { /* offline */ }
    };
    const id = setInterval(tick, open ? 4000 : 30000); return () => clearInterval(id);
  }, [token, open, api, merge]);

  async function send(body: string) {
    const b = body.trim(); if (!b || busy) return; setErr(""); setText("");
    let tok = token; if (!tok) { const ok = await start(null, name, email); if (!ok) { setText(b); return; } tok = JSON.parse(localStorage.getItem(KEY) ?? "{}").t ?? null; if (!tok) return; }
    setBusy(true);
    try { const r = await api("/api/chat/message", { method: "POST", tok, body: JSON.stringify({ body: b }) }); const j = await r.json().catch(() => ({})); if (!r.ok) { setErr(j.error ?? "Could not send your message."); setText(b); if (r.status === 401) { localStorage.removeItem(KEY); setToken(null); setMsgs([]); } } else merge(j.messages); } catch { setErr("Network error. Please try again."); setText(b); } finally { setBusy(false); }
  }

  const shown: Msg[] = msgs.length ? msgs : [{ id: "welcome", sender: "SYSTEM", body: s.welcomeMessage, at: new Date().toISOString() }];
  const noVisitorYet = !msgs.some((m) => m.sender === "VISITOR");
  return (
    <>
      {!open && teaser && s.teaser && (
        <div className="fixed bottom-36 right-4 z-[57] max-w-[260px] rounded-2xl rounded-br-sm bg-white p-3 pr-8 text-sm text-ink shadow-2xl ring-1 ring-black/5 md:bottom-24">
          <button type="button" className="text-left" onClick={() => setOpen(true)}>{s.teaser}</button>
          <button type="button" aria-label="Dismiss" className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700" onClick={() => { setTeaser(false); try { sessionStorage.setItem("ps_chat_teaser", "1"); } catch { /* ignore */ } }}>×</button>
        </div>
      )}
      <button type="button" aria-label={open ? "Close chat" : "Open chat"} aria-expanded={open} onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-[58] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyan to-[#5EEAD4] text-navy shadow-[0_10px_30px_rgba(34,211,238,.45)] transition hover:scale-105 md:bottom-5">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z" />}</svg>
        {!open && unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white" aria-label={`${unread} new messages`}>{unread}</span>}
      </button>
      {open && (
        <section role="dialog" aria-label={s.title} aria-modal="false" className="fixed inset-x-2 bottom-36 z-[58] flex max-h-[min(560px,calc(100dvh-10rem))] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 sm:inset-x-auto sm:right-4 sm:w-[380px] md:bottom-24">
          <header className="flex items-center justify-between bg-gradient-to-r from-navy to-teal px-4 py-3 text-white"><div><p className="font-display font-bold">{s.title}</p><p className="text-xs text-white/75">{s.hours}</p></div><button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/10">✕</button></header>
          <div ref={logRef} role="log" aria-live="polite" aria-label="Conversation" className="flex-1 space-y-3 overflow-y-auto bg-ice/60 p-4">
            {shown.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "VISITOR" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${m.sender === "VISITOR" ? "rounded-br-sm bg-navy text-white" : "rounded-bl-sm bg-white text-ink shadow-sm"}`}>
                  {m.sender === "ADMIN" && <span className="mb-0.5 block text-[11px] font-bold text-teal">Team</span>}
                  {m.body}<span className={`mt-1 block text-[10px] ${m.sender === "VISITOR" ? "text-white/60" : "text-slate-400"}`}>{m.id === "welcome" ? "" : time(m.at)}</span>
                </div>
              </div>
            ))}
            {noVisitorYet && s.quickReplies.length > 0 && <div className="flex flex-wrap gap-2 pt-1">{s.quickReplies.map((q) => <button key={q.text} type="button" onClick={() => void send(q.text)} className="rounded-full border border-cyan/60 bg-white px-3 py-1 text-xs font-semibold text-teal hover:bg-cyan/10">{q.text}</button>)}</div>}
            {!token && s.askContact && (
              <div className="space-y-2 rounded-2xl bg-white p-3 text-sm shadow-sm"><p className="font-semibold">Before we start (optional)</p>
                <label className="block text-xs">Name<input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-1 w-full rounded-xl border border-mist px-3 py-1.5 text-sm" /></label>
                <label className="block text-xs">Email (so we can follow up)<input type="email" value={email} maxLength={200} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-1 w-full rounded-xl border border-mist px-3 py-1.5 text-sm" /></label>
                <button type="button" disabled={busy} onClick={() => void start(null, name, email)} className="w-full rounded-full bg-navy py-2 text-sm font-semibold text-white disabled:opacity-60">Start chat</button></div>
            )}
          </div>
          {err && <p role="alert" className="bg-red-50 px-4 py-2 text-xs text-red-700">{err}</p>}
          <form onSubmit={(e) => { e.preventDefault(); void send(text); }} className="border-t border-mist/50 p-3">
            <div className="flex items-end gap-2"><label className="sr-only" htmlFor="chat-input">Your message</label>
              <textarea id="chat-input" ref={inputRef} value={text} rows={1} maxLength={1000} placeholder="Type your message…" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(text); } }} className="max-h-28 flex-1 resize-none rounded-2xl border border-mist px-3 py-2 text-sm" />
              <button disabled={busy || !text.trim()} className="rounded-full bg-cyan px-4 py-2 text-sm font-bold text-navy disabled:opacity-50">Send</button></div>
            <p className="mt-2 text-[11px] text-slate-500">{s.offlineNote} Chats are stored so we can reply — see our <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
          </form>
        </section>
      )}
    </>
  );
}
