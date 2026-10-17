import Link from "next/link";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/cms";
import { SINGLETONS, PAGE_PATH } from "@/lib/defs";

type Row = { type: string; title: string; path: string; seoTitle: string; desc: string; noindex: boolean; edit: string; og: boolean };
export default async function SeoCenter() {
  const [svc, port, blog, offers] = await Promise.all([
    db.service.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true, slug: true, seoTitle: true, metaDescription: true, noindex: true, ogImageId: true } }),
    db.portfolioItem.findMany({ where: { status: "PUBLISHED" }, select: { id: true, title: true, slug: true, seoTitle: true, metaDescription: true, noindex: true, ogImageId: true } }),
    db.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { id: true, title: true, slug: true, seoTitle: true, metaDescription: true, noindex: true, ogImageId: true } }),
    db.offer.findMany({ where: { status: "PUBLISHED" }, select: { id: true, title: true, slug: true, seoTitle: true, metaDescription: true, noindex: true, ogImageId: true } }),
  ]);
  const rows: Row[] = [];
  for (const k of Object.keys(PAGE_PATH)) { const def = SINGLETONS[k]; const s = await getSetting(k); rows.push({ type: "Page", title: def.label, path: PAGE_PATH[k], seoTitle: s.seoTitle, desc: s.metaDescription, noindex: !!s.noindex, edit: def.route, og: !!s.ogImageId }); }
  svc.forEach((x) => rows.push({ type: "Service", title: x.name, path: `/services/${x.slug}`, seoTitle: x.seoTitle, desc: x.metaDescription, noindex: x.noindex, edit: `/admin/services/${x.id}`, og: !!x.ogImageId }));
  port.forEach((x) => rows.push({ type: "Portfolio", title: x.title, path: `/portfolio/${x.slug}`, seoTitle: x.seoTitle, desc: x.metaDescription, noindex: x.noindex, edit: `/admin/portfolio/${x.id}`, og: !!x.ogImageId }));
  blog.forEach((x) => rows.push({ type: "Blog", title: x.title, path: `/blog/${x.slug}`, seoTitle: x.seoTitle, desc: x.metaDescription, noindex: x.noindex, edit: `/admin/blog/${x.id}`, og: !!x.ogImageId }));
  offers.forEach((x) => rows.push({ type: "Offer", title: x.title, path: `/offers#${x.slug}`, seoTitle: x.seoTitle, desc: x.metaDescription, noindex: x.noindex, edit: `/admin/offers/${x.id}`, og: !!x.ogImageId }));
  const count = (f: (r: Row) => string) => { const m = new Map<string, number>(); rows.forEach((r) => { const v = f(r).trim().toLowerCase(); if (v) m.set(v, (m.get(v) ?? 0) + 1); }); return m; };
  const dupT = count((r) => r.seoTitle), dupD = count((r) => r.desc);
  const issues = (r: Row) => { const i: string[] = []; if (!r.seoTitle) i.push("Missing title"); else if (r.seoTitle.length > 70) i.push("Title too long"); else if ((dupT.get(r.seoTitle.trim().toLowerCase()) ?? 0) > 1) i.push("Duplicate title");
    if (!r.desc) i.push("Missing description"); else if (r.desc.length > 170) i.push("Description too long"); else if ((dupD.get(r.desc.trim().toLowerCase()) ?? 0) > 1) i.push("Duplicate description");
    if (!r.og) i.push("No social image"); if (r.noindex) i.push("noindex"); return i; };
  const total = rows.reduce((n, r) => n + issues(r).length, 0);
  return (<div className="max-w-6xl"><h1 className="mb-1 text-2xl font-bold">SEO Center</h1>
    <p className="mb-4 text-sm text-neutral-600">Checks published content for missing or duplicated metadata. A clean report does not guarantee search rankings. Global defaults: <Link className="underline" href="/admin/site-settings">Site Settings → Default SEO</Link> · <Link className="underline" href="/admin/redirects">Redirects</Link> · <a className="underline" href="/sitemap.xml" target="_blank">sitemap.xml</a> · <a className="underline" href="/robots.txt" target="_blank">robots.txt</a></p>
    <p className="mb-4 rounded-2xl bg-white p-4 text-sm">{rows.length} indexable entries checked · <b>{total}</b> suggestion(s)</p>
    <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-neutral-50 text-neutral-500"><tr><th className="p-3">Type</th><th>Name</th><th>Path</th><th>Suggestions</th><th /></tr></thead>
      <tbody className="divide-y">{rows.map((r) => { const i = issues(r); return (<tr key={r.type + r.path}><td className="p-3">{r.type}</td><td className="font-medium">{r.title}</td><td className="text-neutral-500">{r.path}</td><td>{i.length ? i.map((x) => <span key={x} className="mr-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">{x}</span>) : <span className="text-green-700">✓ OK</span>}</td><td className="p-3 text-right"><Link className="rounded-full border px-3 py-1" href={r.edit}>Edit</Link></td></tr>); })}</tbody></table></div></div>);
}
