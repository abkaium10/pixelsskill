import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { cleanQuery } from "@/lib/subscribe";
import { PageHero } from "@/components/public/PageHero";

/** Server-side site search (services, guides, projects). Result pages are noindex; the query is length-limited, control-char stripped and escaped by React. */
export const metadata: Metadata = { title: "Search", description: "Search PixelSkill services, guides and projects.", robots: { index: false, follow: true } };
export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = cleanQuery((await searchParams).q);
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const allowed = rateLimit(`search:${ip}`, 60, 60_000);
  const c = { contains: q, mode: "insensitive" as const };
  const [services, posts, projects] = q.length >= 2 && allowed ? await Promise.all([
    db.service.findMany({ where: { status: "PUBLISHED", showInListing: true, OR: [{ name: c }, { shortDescription: c }, { introduction: c }] }, take: 8, select: { slug: true, name: true, shortDescription: true } }),
    db.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() }, OR: [{ title: c }, { excerpt: c }, { content: c }] }, take: 8, select: { slug: true, title: true, excerpt: true } }),
    db.portfolioItem.findMany({ where: { status: "PUBLISHED", OR: [{ title: c }, { description: c }, { category: c }] }, take: 8, select: { slug: true, title: true, description: true } }),
  ]) : [[], [], []];
  const total = services.length + posts.length + projects.length;
  const Row = ({ href, kind, title, text }: { href: string; kind: string; title: string; text: string }) => <Link href={href} className="block rounded-2xl border border-mist/60 bg-white p-4 transition hover:border-cyan"><span className="text-xs font-bold uppercase tracking-wide text-teal">{kind}</span><b className="block">{title}</b><p className="mt-1 line-clamp-2 text-sm text-slate-600">{text}</p></Link>;
  return (
    <>
      <PageHero title="Search" description="Search services, guides and projects." />
      <section className="px-4 py-12"><div className="mx-auto max-w-3xl">
        <form action="/search" role="search" className="flex gap-3"><label htmlFor="q" className="sr-only">Search the site</label><input id="q" name="q" type="search" defaultValue={q} maxLength={80} placeholder="Try “clipping path”, “pricing”, “free trial”…" className="flex-1 rounded-full border border-mist bg-white px-5 py-3" /><button className="rounded-full bg-navy px-6 py-3 font-semibold text-white">Search</button></form>
        {!allowed && <p role="alert" className="mt-6 text-sm text-red-600">Too many searches. Please wait a moment.</p>}
        {q && allowed && <p className="mt-6 text-sm text-slate-600" aria-live="polite">{total} result{total === 1 ? "" : "s"} for “{q}”</p>}
        <div className="mt-4 grid gap-3">{services.map((s) => <Row key={s.slug} href={`/services/${s.slug}`} kind="Service" title={s.name} text={s.shortDescription} />)}{posts.map((p) => <Row key={p.slug} href={`/blog/${p.slug}`} kind="Guide" title={p.title} text={p.excerpt} />)}{projects.map((p) => <Row key={p.slug} href={`/portfolio/${p.slug}`} kind="Project" title={p.title} text={p.description} />)}</div>
        {q && allowed && total === 0 && <p className="mt-6 rounded-2xl bg-white p-8 text-center text-slate-500">No results. Try <Link className="text-teal underline" href="/services">browsing services</Link> or <Link className="text-teal underline" href="/contact">contact us</Link>.</p>}
      </div></section>
    </>
  );
}
