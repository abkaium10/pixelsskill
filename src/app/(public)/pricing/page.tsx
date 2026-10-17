import type { Metadata } from "next";
import Link from "next/link";
import { getSetting } from "@/lib/cms";
import { getPricing, pageMetadata } from "@/lib/public";
import { PricingCard } from "@/components/public/PricingCard";
import { PageHero } from "@/components/public/PageHero";
import { Band, DataTable, Faqs, IconCards, SectionHead, Steps } from "@/components/public/Extras";
export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_pricing", "Pricing"); }
export default async function Pricing() {
  const [cards, p] = await Promise.all([getPricing(), getSetting("page_pricing")]);
  return (
    <>
      <PageHero path="/pricing" title={p.heading} description={p.description} tone="teal" />
      <section className="bg-mint px-4 py-14"><div className="mx-auto max-w-7xl"><h2 className="vh">Pricing by service</h2>
        {cards.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{cards.map((c) => <PricingCard key={c.id} c={c} />)}</div> : <p className="rounded-2xl bg-white p-10 text-center text-slate-500">Pricing will appear here once it is published. <Link className="text-teal underline" href="/quote">Request a quote</Link> in the meantime.</p>}
        {p.note && <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-slate-600">{p.note}</p>}</div></section>
      {p.factors.length > 0 && <Band tone="white"><SectionHead kicker="Transparent pricing" title="What affects" accent="the price" text="These things decide the final quote." /><IconCards cols={3} items={p.factors} /></Band>}
      {p.complexity.length > 0 && <Band><SectionHead kicker="Know your level" title="Complexity" accent="guide" /><DataTable head={["Level", "What it means", "Typical examples"]} rows={p.complexity.map((c: { level: string; meaning: string; examples: string }) => [<b key="l">{c.level}</b>, c.meaning, c.examples])} /></Band>}
      {p.volume.length > 0 && <Band tone="white"><SectionHead kicker="Batches" title="Volume" accent="pricing" text="Bigger batches usually mean a better per-image price." /><DataTable head={["Batch size", "Pricing approach"]} rows={p.volume.map((v: { batch: string; approach: string }) => [<b key="b">{v.batch}</b>, v.approach])} /></Band>}
      {p.billing.length > 0 && <Band tone="navy"><SectionHead dark kicker="Simple and clear" title="How billing" accent="works" /><Steps items={p.billing} /></Band>}
      {p.faqs.length > 0 && <Band><SectionHead kicker="FAQ" title="Pricing" accent="FAQ" /><Faqs items={p.faqs} /></Band>}
      <section className="bg-gradient-to-br from-teal to-[#0a7a68] px-4 py-14 text-white"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6"><div><h2 className="font-display text-3xl font-bold">Not sure what your images need?</h2><p className="mt-2 text-white/85">Send a few originals for a free trial and get a tailored quote.</p></div><div className="flex gap-3"><Link href="/free-trial" className="rounded-full bg-sun px-7 py-3 font-semibold text-navy">Start Free Trial</Link><Link href="/quote" className="rounded-full bg-white px-7 py-3 font-semibold text-navy">Get a Quote</Link></div></div></section>
    </>
  );
}
