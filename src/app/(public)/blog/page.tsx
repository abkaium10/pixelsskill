import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/cms";
import { getBlogList, pageMetadata } from "@/lib/public";
import { PageHero } from "@/components/public/PageHero";
import { Band, CtaBand, SectionHead, Kicker } from "@/components/public/Extras";
import { cld } from "@/lib/cld";
import { jsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";
export const revalidate = 600;
export async function generateMetadata(): Promise<Metadata> { const m = await pageMetadata("page_blog", "Blog"); return { ...m, alternates: { ...m.alternates, types: { "application/rss+xml": "/blog/rss.xml" } } }; }
const minutes = (t: string) => Math.max(1, Math.round(t.trim().split(/\s+/).length / 200));
export default async function Blog({ searchParams }: { searchParams: Promise<{ page?: string; category?: string }> }) {
  const sp = await searchParams; const page = Math.max(1, Number(sp.page ?? 1)); const category = sp.category?.slice(0, 60);
  const [{ items, pages }, p, cats, services, featuredRow] = await Promise.all([
    getBlogList(page, 9, category), getSetting("page_blog"),
    db.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() }, NOT: { category: "" } }, distinct: ["category"], select: { category: true } }),
    db.service.findMany({ where: { status: "PUBLISHED", showInListing: true }, orderBy: { displayOrder: "asc" }, take: 3, select: { slug: true, name: true, shortDescription: true } }),
    page === 1 && !category ? db.blogPost.findFirst({ where: { status: "PUBLISHED", featured: true, publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" } }) : Promise.resolve(null),
  ]);
  const feat = featuredRow ? items.find((i) => i.id === featuredRow.id) ?? null : null;
  const rest = items.filter((i) => i.id !== feat?.id);
  const href = (c?: string) => (c ? `/blog?category=${encodeURIComponent(c)}` : "/blog");
  const ld = { "@context": "https://schema.org", "@type": "Blog", name: "PixelSkill Blog", url: `${SITE_URL}/blog`, blogPost: items.map((b) => ({ "@type": "BlogPosting", headline: b.title, url: `${SITE_URL}/blog/${b.slug}`, datePublished: b.publishedAt?.toISOString() })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <PageHero path="/blog" title={p.heading} description={p.description} tone="lavender" />
      {feat && <section className="px-4 pt-14"><div className="mx-auto grid max-w-7xl items-center gap-10 rounded-[2rem] border border-mist/60 bg-white p-5 shadow-xl lg:grid-cols-[1.1fr_1fr]">
        {feat.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={cld(feat.cover.secureUrl, 1000)} alt={feat.coverAlt} className="aspect-[16/10] w-full rounded-3xl object-cover" /> : <div className="aspect-[16/10] rounded-3xl bg-gradient-to-br from-teal to-navy" />}
        <div className="p-2 lg:pr-8"><Kicker>Featured{feat.category ? ` · ${feat.category}` : ""}</Kicker><h2 className="font-display text-3xl font-bold"><Link href={`/blog/${feat.slug}`}>{feat.title}</Link></h2><p className="mt-3 text-slate-600">{feat.excerpt}</p><p className="mt-2 text-xs text-slate-500">{minutes(feat.content)} min read</p><Link href={`/blog/${feat.slug}`} className="mt-5 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-teal">Read article</Link></div></div></section>}
      <section className="bg-white px-4 py-14 mt-14"><div className="mx-auto max-w-7xl">
        {cats.length > 0 && <nav aria-label="Filter by category" className="mb-8 flex flex-wrap gap-2"><Link href={href()} aria-current={!category ? "true" : undefined} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${!category ? "border-navy bg-navy text-white" : "border-mist bg-white hover:border-teal"}`}>All</Link>{cats.map((c) => <Link key={c.category} href={href(c.category)} aria-current={category === c.category ? "true" : undefined} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${category === c.category ? "border-navy bg-navy text-white" : "border-mist bg-white hover:border-teal"}`}>{c.category}</Link>)}</nav>}
        <h2 className="vh">Articles</h2>
        <div className="grid gap-6 md:grid-cols-3">{rest.map((b) => (
          <article key={b.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-mist/60 transition hover:-translate-y-1 hover:shadow-xl">{b.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={cld(b.cover.secureUrl, 700)} alt={b.coverAlt} loading="lazy" className="aspect-[16/10] w-full object-cover" />}
            <div className="p-5"><div className="flex justify-between text-xs"><span className="font-bold uppercase text-teal">{b.category}</span><span className="text-slate-500">{minutes(b.content)} min</span></div><h3 className="mt-1 font-bold"><Link href={`/blog/${b.slug}`} className="hover:text-teal">{b.title}</Link></h3><p className="mt-1 line-clamp-3 text-sm text-slate-600">{b.excerpt}</p><p className="mt-2 text-xs text-slate-500">{b.authorName} · {b.publishedAt?.toLocaleDateString("en-US", { dateStyle: "medium" })}</p></div></article>))}</div>
        {!items.length && <p className="rounded-2xl bg-cream p-10 text-center text-slate-500">No posts published yet.</p>}
        {pages > 1 && <nav aria-label="Pagination" className="mt-8 flex justify-center gap-3 text-sm">{page > 1 && <Link className="rounded-full border px-4 py-2" href={`${href(category)}${category ? "&" : "?"}page=${page - 1}`}>Previous</Link>}<span className="py-2">Page {page} of {pages}</span>{page < pages && <Link className="rounded-full border px-4 py-2" href={`${href(category)}${category ? "&" : "?"}page=${page + 1}`}>Next</Link>}</nav>}</div></section>
      {p.topics?.length > 0 && <Band><SectionHead kicker="Explore" title="Popular" accent="topics" /><ul className="flex flex-wrap gap-2">{p.topics.map((t: string) => <li key={t} className="rounded-full bg-lilac px-4 py-1.5 text-sm font-semibold">{t}</li>)}</ul></Band>}
      {services.length > 0 && <Band tone="sage"><SectionHead title="Related" accent="services" text="Learn more about the work behind the guides." /><div className="grid gap-4 md:grid-cols-3">{services.map((s) => <Link key={s.slug} href={`/services/${s.slug}`} className="rounded-3xl border border-mist/60 bg-white p-5 transition hover:-translate-y-1 hover:border-cyan"><b>{s.name}</b><span className="mt-1 block text-sm text-slate-600">{s.shortDescription}</span></Link>)}</div></Band>}
      <CtaBand title="Have a question about your images?" text="Send a sample and we will recommend the right approach." />
    </>
  );
}
