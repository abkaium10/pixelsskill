import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioItem, buildMetadata } from "@/lib/public";
import { BeforeAfterSlider } from "@/components/media/BeforeAfterSlider";
import { Markdown } from "@/components/Markdown";
import { SITE_URL } from "@/lib/site";
import { jsonLd } from "@/lib/jsonld";
export const revalidate = 3600;
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const i = await getPortfolioItem((await params).slug); if (!i) return { title: "Project not found", robots: { index: false } };
  return buildMetadata({ title: i.seoTitle || i.title, description: i.metaDescription || i.description || undefined, canonical: i.canonicalUrl || `${SITE_URL}/portfolio/${i.slug}`, noindex: i.noindex, nofollow: i.nofollow, ogTitle: i.ogTitle, ogDescription: i.ogDescription, image: i.og?.secureUrl ?? i.after?.secureUrl, imageAlt: i.ogImageAlt });
}
export default async function Project({ params }: P) {
  const i = await getPortfolioItem((await params).slug); if (!i) notFound();
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Portfolio", item: `${SITE_URL}/portfolio` }, { "@type": "ListItem", position: 3, name: i.title, item: `${SITE_URL}/portfolio/${i.slug}` }] };
  return (<article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }} />
    <header className="bg-navy px-4 py-12 text-white"><div className="mx-auto max-w-5xl"><nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/60"><Link href="/portfolio" className="hover:text-cyan">Portfolio</Link> / {i.title}</nav><h1 className="font-display text-4xl font-bold">{i.title}</h1>{i.description && <p className="mt-3 max-w-2xl text-white/75">{i.description}</p>}
      <p className="mt-3 flex flex-wrap gap-2 text-xs">{i.category && <span className="rounded-full bg-cyan px-3 py-1 font-semibold text-navy">{i.category}</span>}{i.service && <Link href={`/services/${i.service.slug}`} className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/20">{i.service.name}</Link>}{i.tags.map((t) => <span key={t} className="rounded-full bg-white/10 px-3 py-1">{t}</span>)}</p></div></header>
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-12"><BeforeAfterSlider beforeSrc={i.before?.secureUrl} afterSrc={i.after?.secureUrl} beforeAlt={i.beforeAlt || `${i.title} before`} afterAlt={i.afterAlt || `${i.title} after`} initial={i.sliderPosition} aspect="16 / 10" priority className="shadow-xl" />
      {i.body && <Markdown source={i.body} className="max-w-3xl" />}
      {i.examples.length > 0 && <section><h2 className="mb-6 font-display text-2xl font-bold">More examples</h2><div className="grid gap-6 md:grid-cols-2">{i.examples.map((e) => <figure key={e.id}><BeforeAfterSlider beforeSrc={e.before?.secureUrl} afterSrc={e.after?.secureUrl} beforeAlt={e.beforeAlt || "Before"} afterAlt={e.afterAlt || "After"} />{e.caption && <figcaption className="mt-2 text-sm text-slate-600">{e.caption}</figcaption>}</figure>)}</div></section>}
      <div className="flex flex-wrap gap-3 rounded-3xl bg-teal p-8 text-white"><p className="flex-1 font-display text-2xl font-bold">Want results like this?</p><Link href="/free-trial" className="rounded-full bg-sun px-6 py-3 font-semibold text-navy">Free Trial</Link><Link href="/quote" className="rounded-full bg-white px-6 py-3 font-semibold text-navy">Get a Quote</Link></div></div></article>);
}
