"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Row = { id: string; name: string | null; email: string | null; page: string | null; status: "OPEN" | "CLOSED"; unread: number; lastAt: string; last: string };
type Msg = { id: string; sender: "VISITOR" | "ADMIN" | "SYSTEM"; body: string; at: string };
type Detail = { id: string; name: string | null; email: string | null; page: string | null; status: "OPEN" | "CLOSED"; createdAt: string };
const ago = (iso: string) => { const s = (Date.now() - +new Date(iso)) / 1000; if (s < 60) return "now"; if (s < 3600) return `${Math.floor(s / 60)}m`; if (s < 86400) return `${Math.floor(s / 3600)}h`; return new Date(iso).toLocaleDateString(); };

/** Admin live-chat inbox: conversation list, thread, reply box. Polls every few seconds (no websockets needed). */
export function ChatInbox() {
  const [rows, setRows] = useState<Row[]>([]); const [filter, setFilter] = useState<"OPEN" | "CLOSED" | "">("OPEN"); const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null); const [detail, setDetail] = useState<Detail | null>(null); const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const last = useRef<string | null>(null); const log = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => { const r = await fetch(`/api/admin/chat/sessions?status=${filter}&q=${encodeURIComponent(q)}`); if (r.ok) setRows((await r.json()).items); }, [filter, q]);
  useEffect(() => { void loadList(); const id = setInterval(() => { if (!document.hidden) void loadList(); }, 6000); return () => clearInterval(id); }, [loadList]);

  const loadThread = useCallback(async (id: string, reset: boolean) => {
    const r = await fetch(`/api/admin/chat/sessions/${id}${!reset && last.current ? `?after=${encodeURIComponent(last.current)}` : ""}`); if (!r.ok) return; const j = await r.json();
    setDetail(j.session);
    setMsgs((cur) => { const base = reset ? [] : cur; const ids = new Set(base.map((m) => m.id)); const add = (j.messages as Msg[]).filter((m) => !ids.has(m.id)); return add.length ? [...base, ...add] : base; });
    if (j.messages.length) last.current = j.messages[j.messages.length - 1].at; else if (reset) last.current = null;
  }, []);
  useEffect(() => { if (!sel) return; last.current = null; void loadThread(sel, true); const id = setInterval(() => { if (!document.hidden) void loadThread(sel, false); }, 4000); return () => clearInterval(id); }, [sel, loadThread]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [msgs]);

  async function send() {
    const b = text.trim(); if (!b || !sel) return; setBusy(true); setErr("");
    const r = await fetch(`/api/admin/chat/sessions/${sel}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: b }) }); const j = await r.json().catch(() => ({}));
    setBusy(false); if (!r.ok) { setErr(j.error ?? "Could not send"); return; } setText(""); await loadThread(sel, false); void loadList();
  }
  async function setStatus(status: "OPEN" | "CLOSED") { if (!sel) return; await fetch(`/api/admin/chat/sessions/${sel}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); await loadThread(sel, false); void loadList(); }
  async function del() { if (!sel || !confirm("Delete this conversation permanently?")) return; await fetch(`/api/admin/chat/sessions/${sel}`, { method: "DELETE" }); setSel(null); setDetail(null); setMsgs([]); void loadList(); }

  return (
    <div className="max-w-6xl">
      <h1 className="mb-1 text-2xl font-bold">Live chat</h1>
      <p className="mb-4 text-sm text-neutral-600">New visitors receive the automatic welcome message. Reply here — the visitor sees your answer in their chat window within a few seconds (or next time they visit).</p>
      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <aside aria-label="Conversations" className="rounded-2xl border bg-white">
          <div className="flex gap-2 border-b p-3"><select aria-label="Status" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="rounded-full border px-3 py-1.5 text-sm"><option value="OPEN">Open</option><option value="CLOSED">Closed</option><option value="">All</option></select><input aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="min-w-0 flex-1 rounded-full border px-3 py-1.5 text-sm" /></div>
          <ul className="max-h-[60vh] overflow-y-auto">{rows.map((r) => (
            <li key={r.id}><button type="button" onClick={() => setSel(r.id)} aria-current={sel === r.id} className={`block w-full border-b p-3 text-left hover:bg-neutral-50 ${sel === r.id ? "bg-neutral-100" : ""}`}>
              <span className="flex items-center justify-between"><b className="truncate">{r.name || r.email || "Visitor"}</b><span className="ml-2 flex items-center gap-1 text-xs text-neutral-500">{r.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{r.unread}</span>}{ago(r.lastAt)}</span></span>
              <span className="block truncate text-sm text-neutral-600">{r.last || "—"}</span></button></li>))}
            {!rows.length && <li className="p-8 text-center text-sm text-neutral-500">No conversations yet.</li>}</ul>
        </aside>
        <section aria-label="Conversation" className="flex min-h-[420px] flex-col rounded-2xl border bg-white">
          {!detail ? <div className="grid flex-1 place-items-center p-10 text-sm text-neutral-500">Select a conversation.</div> : <>
            <header className="flex flex-wrap items-center justify-between gap-2 border-b p-3"><div><b>{detail.name || "Visitor"}</b> {detail.email && <a className="text-sm text-teal underline" href={`mailto:${detail.email}`}>{detail.email}</a>}<p className="text-xs text-neutral-500">Started {new Date(detail.createdAt).toLocaleString()} · page {detail.page}</p></div>
              <div className="flex gap-2"><button type="button" onClick={() => void setStatus(detail.status === "OPEN" ? "CLOSED" : "OPEN")} className="rounded-full border px-3 py-1 text-xs">{detail.status === "OPEN" ? "Close" : "Reopen"}</button><button type="button" onClick={del} className="rounded-full border px-3 py-1 text-xs text-red-600">Delete</button></div></header>
            <div ref={log} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4" style={{ maxHeight: "50vh" }}>{msgs.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "ADMIN" ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${m.sender === "ADMIN" ? "bg-black text-white" : m.sender === "SYSTEM" ? "border border-dashed bg-white text-neutral-500" : "bg-white shadow-sm"}`}><span className="mb-0.5 block text-[11px] font-bold opacity-60">{m.sender === "ADMIN" ? "You" : m.sender === "SYSTEM" ? "Automatic message" : "Visitor"}</span>{m.body}<span className="mt-1 block text-[10px] opacity-50">{new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div></div>))}</div>
            {err && <p role="alert" className="px-4 py-1 text-xs text-red-600">{err}</p>}
            <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="flex items-end gap-2 border-t p-3"><label htmlFor="reply" className="sr-only">Reply</label><textarea id="reply" rows={2} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder="Write a reply… (Enter to send, Shift+Enter for a new line)" className="flex-1 resize-none rounded-2xl border px-3 py-2 text-sm" /><button disabled={busy || !text.trim()} className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Send</button></form></>}
        </section>
      </div>
    </div>
  );
}
