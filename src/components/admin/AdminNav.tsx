"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const GROUPS: { title: string; items: [string, string][] }[] = [
  { title: "Overview", items: [["/admin", "Dashboard"]] },
  { title: "Content", items: [["/admin/homepage", "Homepage Builder"], ["/admin/services", "Services"], ["/admin/pricing", "Pricing"], ["/admin/portfolio", "Portfolio"], ["/admin/blog", "Blog"], ["/admin/testimonials", "Testimonials"], ["/admin/faqs", "FAQs"], ["/admin/offers", "Offers"], ["/admin/pages", "Pages (About, Contact, Legal…)"]] },
  { title: "Requests", items: [["/admin/chat", "Live chat"], ["/admin/quotes", "Quotes"], ["/admin/free-trial", "Free Trials"], ["/admin/contacts", "Contact messages"], ["/admin/subscribers", "Newsletter subscribers"]] },
  { title: "Site", items: [["/admin/navigation", "Header & Footer"], ["/admin/chat-settings", "Chat settings"], ["/admin/editing-settings", "Online editing (AI-ready)"], ["/admin/edit-jobs", "Editing jobs"], ["/admin/site-settings", "Site Settings"], ["/admin/media", "Media Library"], ["/admin/seo", "SEO Center"], ["/admin/redirects", "Redirects"]] },
  { title: "Account", items: [["/admin/account", "Account & Password"]] },
];
export function AdminNav() {
  const path = usePathname(); const [open, setOpen] = useState(false); const [unread, setUnread] = useState(0);
  useEffect(() => { let on = true; const load = async () => { try { const r = await fetch("/api/admin/chat/unread"); if (r.ok && on) setUnread((await r.json()).unread); } catch { /* ignore */ } }; void load(); const id = setInterval(() => { if (!document.hidden) void load(); }, 20000); return () => { on = false; clearInterval(id); }; }, []);
  const active = (h: string) => (h === "/admin" ? path === h : path === h || path.startsWith(`${h}/`));
  return (<>
    <button type="button" className="mb-3 rounded-lg border border-white/20 px-3 py-1.5 text-sm md:hidden" aria-expanded={open} aria-controls="admin-nav" onClick={() => setOpen((v) => !v)}>{open ? "Close menu" : "Menu"}</button>
    <nav id="admin-nav" aria-label="Admin" className={`${open ? "block" : "hidden"} md:block`}>
      {GROUPS.map((g) => (<div key={g.title} className="mb-4"><p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">{g.title}</p>
        <ul>{g.items.map(([h, l]) => <li key={h}><Link href={h} onClick={() => setOpen(false)} aria-current={active(h) ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-sm ${active(h) ? "bg-white/15 font-semibold" : "hover:bg-white/10"}`}>{l}{h === "/admin/chat" && unread > 0 && <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold">{unread}</span>}</Link></li>)}</ul></div>))}
    </nav></>);
}
