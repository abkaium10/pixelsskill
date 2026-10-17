"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, Phone, Mail, Search } from "lucide-react";
import { SocialList, type SocialLink } from "./Social";

export type MenuService = { slug: string; name: string; shortDescription: string };
type NavLink = { label: string; href: string };
type Props = { services: MenuService[]; phone: string; email: string; logoUrl?: string | null; logoAlt?: string; navItems: NavLink[]; ctaLabel: string; ctaUrl: string; trustBar?: string; announcement?: string; announcementUrl?: string; socials: SocialLink[] };

/** CSS-transition navbar (no animation library -> smaller JS bundle on every page). Mega menu: hover (with grace delay), click/Enter pins it, Escape closes, arrow-down moves into it. */
export function Navbar({ services, phone, email, logoUrl, logoAlt = "PixelSkill", navItems, ctaLabel, ctaUrl, trustBar, announcement, announcementUrl, socials }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [acc, setAcc] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => { const on = () => setScrolled(window.scrollY > 24); on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on); }, []);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setMega(false); setPinned(false); setMobile(false); trigger.current?.focus(); } };
    const out = (e: MouseEvent) => { const t = e.target as Node; if (!panel.current?.contains(t) && !trigger.current?.contains(t)) { setMega(false); setPinned(false); } };
    window.addEventListener("keydown", esc); document.addEventListener("click", out);
    return () => { window.removeEventListener("keydown", esc); document.removeEventListener("click", out); };
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; }, [mobile]);

  const open = () => { if (timer.current) clearTimeout(timer.current); setMega(true); };
  const close = () => { if (pinned) return; timer.current = setTimeout(() => setMega(false), 140); };
  const link = "rounded-lg px-2.5 py-2 text-sm font-medium text-white/85 transition hover:text-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {announcement ? <div className="bg-sun px-4 py-1 text-center text-xs font-semibold text-navy">{announcementUrl ? <Link href={announcementUrl} className="underline">{announcement}</Link> : announcement}</div> : null}
      <div className={`overflow-hidden border-b border-cyan/40 bg-gradient-to-r from-teal to-navy text-xs text-white/90 transition-all duration-300 ${scrolled ? "max-h-0 border-transparent opacity-0" : "max-h-10 opacity-100"}`}>
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-5">
            <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-1.5 hover:text-cyan"><Phone size={13} />{phone}</a>
            <a href={`mailto:${email}`} className="hidden items-center gap-1.5 hover:text-cyan sm:flex"><Mail size={13} />{email}</a>
          </div>
          <div className="flex items-center gap-4">
            {trustBar ? <span className="hidden text-white/80 lg:inline">{trustBar}</span> : null}
            <SocialList links={socials} size={26} icon={15} className="[&_a]:border-transparent [&_a]:bg-transparent" />
            <Link href="/contact" className="hidden hover:text-cyan sm:inline">Contact us</Link>
          </div>
        </div>
      </div>

      <nav aria-label="Main" className={`border-b border-white/10 backdrop-blur-xl transition-colors duration-300 max-md:backdrop-blur-none ${scrolled ? "bg-navy/95 shadow-lg" : "bg-navy/80"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logoUrl ? <img src={logoUrl} alt={logoAlt} className="h-8 w-auto" width={120} height={32} /> : <span>Pixel<span className="text-cyan">Skill</span></span>}
          </Link>

          <div className="hidden items-center gap-0.5 xl:flex">
            <Link href="/" className={link}>Home</Link>
            <div onMouseEnter={open} onMouseLeave={close}>
              <button ref={trigger} type="button" aria-haspopup="true" aria-expanded={mega} aria-controls="mega-menu" className={`${link} flex items-center gap-1`}
                onClick={() => { if (pinned) { setPinned(false); setMega(false); } else { setPinned(true); open(); } }}
                onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setPinned(true); open(); setTimeout(() => panel.current?.querySelector("a")?.focus(), 0); } }}>
                Image Editing <ChevronDown size={15} className={`transition-transform ${mega ? "rotate-180" : ""}`} />
              </button>
            </div>
            {navItems.map((n) => <Link key={n.href + n.label} href={n.href} className={n.href === "/free-trial" ? "rounded-lg px-2.5 py-2 text-sm font-semibold text-sun hover:brightness-110" : link}>{n.label}</Link>)}
            <Link href="/search" aria-label="Search the site" title="Search" className="grid h-9 w-9 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-cyan"><Search size={17} /></Link>
            <Link href={ctaUrl} className="ml-1 rounded-full bg-cyan px-5 py-2 text-sm font-semibold text-navy shadow-[0_0_20px_rgba(34,211,238,.35)] transition hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{ctaLabel}</Link>
          </div>

          <button type="button" className="rounded-lg p-2 text-white xl:hidden" aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile} onClick={() => setMobile((v) => !v)}>{mobile ? <X /> : <Menu />}</button>
        </div>

        <div id="mega-menu" ref={panel} onMouseEnter={open} onMouseLeave={close} aria-hidden={!mega}
          className={`absolute inset-x-0 top-full hidden border-b border-white/10 bg-navy shadow-2xl transition duration-200 xl:block ${mega ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-[.985] opacity-0"}`}>
          <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-2 p-6 xl:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} onClick={() => { setMega(false); setPinned(false); }} tabIndex={mega ? 0 : -1} className="group block rounded-2xl border border-transparent p-3 transition hover:border-cyan/40 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan">
                  <span className="block font-semibold text-white group-hover:text-cyan">{s.name}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-white/60">{s.shortDescription}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {mobile && (
        <div className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-navy p-4 xl:hidden">
          <Link href="/" onClick={() => setMobile(false)} className="block border-b border-white/10 py-3 text-white">Home</Link>
          <button type="button" aria-expanded={acc} onClick={() => setAcc((v) => !v)} className="flex w-full items-center justify-between border-b border-white/10 py-3 text-white">Image Editing <ChevronDown className={`transition-transform ${acc ? "rotate-180" : ""}`} /></button>
          {acc && <ul className="mb-2 border-l border-cyan/40 pl-4">{services.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}`} onClick={() => setMobile(false)} className="block py-2 text-sm text-white/80">{s.name}</Link></li>)}</ul>}
          {navItems.map((n) => <Link key={n.href + n.label} href={n.href} onClick={() => setMobile(false)} className="block border-b border-white/10 py-3 text-white">{n.label}</Link>)}
          <Link href="/search" onClick={() => setMobile(false)} className="block border-b border-white/10 py-3 text-white">Search</Link>
          <Link href={ctaUrl} onClick={() => setMobile(false)} className="mt-4 block rounded-full bg-cyan py-3 text-center font-semibold text-navy">{ctaLabel}</Link>
          <div className="py-5"><SocialList links={socials} size={40} icon={20} className="text-white" /></div>
        </div>
      )}
    </header>
  );
}
