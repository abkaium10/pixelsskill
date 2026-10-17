import type { Metadata } from "next";
import { getSetting } from "@/lib/cms";
import { getTestimonials, pageMetadata } from "@/lib/public";
import { PageHero } from "@/components/public/PageHero";
import { Band, CtaBand, IconCards, SectionHead } from "@/components/public/Extras";
import { TCard } from "@/components/public/Testimonials";
export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_testimonials", "Customer Reviews"); }
export default async function Testimonials() {
  const [items, p] = await Promise.all([getTestimonials(), getSetting("page_testimonials")]);
  return (
    <>
      <PageHero path="/testimonials" title={p.heading} description={p.description} tone="lavender" />
      <section className="bg-gradient-to-b from-lilac to-white px-4 py-14"><div className="mx-auto max-w-7xl"><h2 className="vh">All reviews</h2>
        {items.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map((t, i) => <TCard key={t.id} t={t} i={i} />)}</div> : <p className="rounded-2xl bg-white p-10 text-center text-slate-500">Reviews will appear here once they are published.</p>}</div></section>
      <Band tone="white"><SectionHead kicker="Transparency" title="How we collect" accent="reviews" /><IconCards cols={3} items={[{ title: "Real customers only", description: "Reviews are published with the customer’s permission." }, { title: "Specific and honest", description: "We show feedback as written, without invented ratings." }, { title: "Tell us how we did", description: "Send your feedback through the contact page." }]} /></Band>
      <CtaBand title="Ready to see the difference yourself?" text="Try a free trial or request a quote." />
    </>
  );
}
