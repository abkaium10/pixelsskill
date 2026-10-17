import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedServices } from "@/lib/services";
import { getSetting } from "@/lib/cms";
import { pageMetadata } from "@/lib/public";
import { ServiceCardPreview } from "@/components/public/ServiceCardPreview";
import { PageHero } from "@/components/public/PageHero";
import { Band, CtaBand, DataTable, Faqs, IconCards, Marquee, SectionHead, Steps } from "@/components/public/Extras";
import { jsonLd } from "@/lib/jsonld";
import { SITE_URL, serviceUrl } from "@/lib/site";

export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_services", "Image Editing Services"); }
type L<T> = T[];
export default async function ServicesPage() {
  const [services, p] = await Promise.all([getPublishedServices(), getSetting("page_services")]);
  const name = (slug: string) => services.find((s) => s.slug === slug)?.name ?? slug;
  const ld = { "@context": "https://schema.org", "@type": "ItemList", name: "Image editing services", itemListElement: services.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: serviceUrl(s.slug) })) };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` }] };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([ld, crumbs]) }} />
      <PageHero path="/services" title={p.heading} description={p.description} />
      <section className="px-4 py-14"><div className="mx-auto max-w-7xl"><h2 className="vh">All services</h2>
        {services.length === 0 ? <p className="rounded-2xl bg-white p-8 text-center">No services are published yet.</p> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.map((s) => <ServiceCardPreview key={s.id} s={s} />)}</div>}</div></section>
      <Marquee words={services.map((s) => s.name)} />
      {(p.guide as L<{ need: string; serviceSlug: string }>).length > 0 && <Band tone="white"><SectionHead kicker="Find the right fit" title="Which service" accent="do you need?" text="A quick guide to matching your problem with the right editing service." />
        <DataTable head={["If you need…", "Choose"]} rows={(p.guide as L<{ need: string; serviceSlug: string }>).map((g) => [g.need, <Link key={g.serviceSlug} href={`/services/${g.serviceSlug}`} className="font-semibold text-teal hover:underline">{name(g.serviceSlug)}</Link>])} /></Band>}
      {(p.industries as L<{ title: string; description: string; serviceSlug: string }>).length > 0 && <Band><SectionHead kicker="Who we help" title="Industries we" accent="support" /><IconCards items={(p.industries as L<{ title: string; description: string; serviceSlug: string }>).map((i) => ({ title: i.title, description: i.description, href: i.serviceSlug ? `/services/${i.serviceSlug}` : undefined, meta: i.serviceSlug ? name(i.serviceSlug) : undefined }))} /></Band>}
      {(p.steps as L<{ title: string; description: string }>).length > 0 && <Band tone="navy"><SectionHead dark kicker="Process" title="How a project" accent="works" /><Steps items={p.steps} /></Band>}
      <Band tone="white"><SectionHead kicker="Delivery" title="Formats &" accent="deliverables" text="Choose the format that fits where the image will be used." />
        <IconCards cols={3} items={[{ title: "JPG & WEBP", description: "Small files for web and marketplaces. WEBP also supports transparency." }, { title: "PNG & TIFF", description: "Lossless, with transparency support. TIFF is common in print workflows." }, { title: "PSD", description: "Layered files with paths and masks for further editing." }]} /></Band>
      {(p.faqs as L<{ question: string; answer: string }>).length > 0 && <Band tone="sage"><SectionHead kicker="FAQ" title="Services" accent="FAQ" /><Faqs items={p.faqs} /></Band>}
      <CtaBand title="Not sure which service you need?" text="Send a sample image and we will recommend the right approach." />
    </>
  );
}
