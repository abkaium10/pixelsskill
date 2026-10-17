import type { Metadata } from "next";
import { getSetting } from "@/lib/cms";
import { getSite, pageMetadata } from "@/lib/public";
import { PageHero } from "@/components/public/PageHero";
import { ContactForm } from "@/components/public/RequestForms";
export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_contact", "Contact"); }
export default async function Contact() {
  const [p, site] = await Promise.all([getSetting("page_contact"), getSite()]);
  return (<><PageHero path="/contact" title={p.heading} description={p.description} /><div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1fr_1.3fr]">
    <aside className="space-y-4"><div className="rounded-3xl bg-white p-6"><h2 className="font-bold">Get in touch</h2><p className="mt-2 text-sm"><a className="text-teal underline" href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>{site.phone}</a></p><p className="text-sm"><a className="text-teal underline" href={`mailto:${site.email}`}>{site.email}</a></p>{site.address && <p className="mt-2 whitespace-pre-line text-sm">{site.address}</p>}{site.hours && <p className="mt-2 text-sm text-slate-600">{site.hours}</p>}{site.bookingUrl && /^https:\/\//i.test(site.bookingUrl) && <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-teal">Book a call</a>}</div>
      {p.mapEmbedUrl && <iframe src={p.mapEmbedUrl} title="Map" loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin" className="h-64 w-full rounded-3xl border-0" />}</aside>
    <ContactForm heading={p.formHeading} description={p.formDescription} /></div></>);
}
