import Link from "next/link";
import { SocialList, type SocialLink } from "./Social";
import { NewsletterForm } from "./NewsletterForm";
type L = { label: string; href: string };
export function Footer({ site, services, socials }: { services: { slug: string; name: string }[]; socials: SocialLink[]; site: { siteName: string; phone: string; email: string; address: string; hours: string; facebook: string; instagram: string; linkedin: string; youtube: string; x: string; nav: { footerDescription: string; footerColumns: { title: string; links: L[] }[]; legalLinks: L[]; copyright: string } } }) {
  return (
    <footer className="bg-navy text-white/80">
      <div className="mx-auto max-w-7xl px-4 pt-14"><div className="max-w-xl"><NewsletterForm /></div></div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_1.5fr_1fr_1fr_1.1fr]">
        <div><p className="text-xl font-bold text-white">{site.siteName}</p><p className="mt-3 text-sm">{site.nav.footerDescription}</p>
          <SocialList links={socials} className="mt-4 text-white" /></div>
        <nav aria-label="Services"><p className="mb-3 font-semibold text-white">Services</p><ul className="columns-2 gap-5 space-y-2 text-sm">{services.map((s) => <li key={s.slug} className="break-inside-avoid"><Link href={`/services/${s.slug}`} className="hover:text-cyan">{s.name}</Link></li>)}</ul></nav>
        {site.nav.footerColumns.map((c) => (<nav key={c.title} aria-label={c.title}><p className="mb-3 font-semibold text-white">{c.title}</p><ul className="space-y-2 text-sm">{c.links.map((l) => <li key={l.href + l.label}><Link href={l.href} className="hover:text-cyan">{l.label}</Link></li>)}</ul></nav>))}
        <div className="text-sm"><p className="mb-3 font-semibold text-white">Contact</p><p><a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="hover:text-cyan">{site.phone}</a></p><p><a href={`mailto:${site.email}`} className="hover:text-cyan">{site.email}</a></p>{site.address && <p className="mt-2 whitespace-pre-line">{site.address}</p>}{site.hours && <p className="mt-2">{site.hours}</p>}</div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-xs"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2"><p>© {new Date().getFullYear()} {site.nav.copyright}</p><ul className="flex gap-4">{site.nav.legalLinks.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-cyan">{l.label}</Link></li>)}<li><a href="/blog/rss.xml" className="hover:text-cyan">RSS</a></li></ul></div></div>
    </footer>
  );
}
