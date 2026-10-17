import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { db } from "@/lib/db";
import { getPublishedService } from "@/lib/services";
import { ServiceDetail } from "@/components/public/ServiceDetail";
import { serviceUrl, SITE_URL } from "@/lib/site";
import { jsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/public";

export const revalidate = 3600;
export const dynamicParams = true;
type P = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try { return (await db.service.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } })).map((s) => ({ slug: s.slug })); } catch { return []; }
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const s = await getPublishedService(slug);
  if (!s) return { title: "Service not found", robots: { index: false } };
  return buildMetadata({ title: s.seoTitle || `${s.name} Service`, description: s.metaDescription || s.shortDescription || undefined, canonical: s.canonicalUrl || serviceUrl(s.slug), noindex: s.noindex, nofollow: s.nofollow, ogTitle: s.ogTitle, ogDescription: s.ogDescription, image: s.ogImage?.secureUrl ?? s.heroAfter?.secureUrl, imageAlt: s.ogImageAlt });
}

export default async function ServicePage({ params }: P) {
  const { slug } = await params;
  const s = await getPublishedService(slug);
  if (!s) {
    const r = await db.redirect.findUnique({ where: { source: `/services/${slug}` } });
    if (r?.active && r.target.startsWith("/")) permanentRedirect(r.target);
    notFound();
  }
  const related = s.relatedSlugs.length ? await db.service.findMany({ where: { slug: { in: s.relatedSlugs }, status: "PUBLISHED" }, select: { slug: true, name: true, shortDescription: true } }) : [];
  const ld = [
    { "@context": "https://schema.org", "@type": "Service", name: s.name, description: s.metaDescription || s.shortDescription, url: serviceUrl(s.slug), provider: { "@type": "Organization", name: "PixelSkill", url: SITE_URL } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` }, { "@type": "ListItem", position: 3, name: s.name, item: serviceUrl(s.slug) }] },
  ];
  const faqs = (Array.isArray(s.faqs) ? s.faqs : []) as { question: string; answer: string }[];
  if (faqs.length && !s.hiddenSections.includes("faq")) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) } as never);
  return (<><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} /><ServiceDetail s={s} related={related} /></>);
}
