import type { Metadata } from "next";
import Link from "next/link";
import { getSetting } from "@/lib/cms";
import { getActiveOffers, pageMetadata } from "@/lib/public";
import { PageHero } from "@/components/public/PageHero";
import { Band, CtaBand, DataTable, Faqs, IconCards, SectionHead } from "@/components/public/Extras";
import { Markdown } from "@/components/Markdown";
import { cld } from "@/lib/cld";
export const revalidate = 600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_offers", "Offers"); }
const G = ["from-cyan", "from-sage", "from-lavender", "from-sun"];
export default async function Offers() {
  const [offers, p] = await Promise.all([getActiveOffers(), getSetting("page_offers")]);
  return (
    <>
      <PageHero path="/offers" title={p.heading} description={p.description} tone="lavender" />
      <section className="px-4 py-14"><div className="mx-auto max-w-7xl"><h2 className="vh">Available offers</h2>
        {offers.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{offers.map((o, i) => (
          <article key={o.id} id={o.slug} className="flex flex-col overflow-hidden rounded-[1.75rem] border border-mist/60 bg-white transition hover:-translate-y-1.5 hover:shadow-2xl">
            <div className={`relative grid h-36 place-items-center bg-gradient-to-br ${G[i % 4]} to-navy`}>{o.banner ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={cld(o.banner.secureUrl, 700)} alt={o.bannerAlt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : <span aria-hidden className="text-5xl text-white/90">★</span>}{o.badge && <span className="absolute right-3 top-3 rounded-full bg-sun px-3 py-0.5 text-[11px] font-extrabold text-navy">{o.badge}</span>}</div>
            <div className="flex flex-1 flex-col gap-2 p-6"><h3 className="font-display text-xl font-bold">{o.title}</h3><p className="whitespace-pre-line text-sm text-slate-600">{o.description}</p>{(o.startsAt || o.endsAt) && <p className="text-xs text-slate-500">{o.startsAt ? `From ${o.startsAt.toLocaleDateString("en-US", { dateStyle: "medium" })} ` : ""}{o.endsAt ? `until ${o.endsAt.toLocaleDateString("en-US", { dateStyle: "long" })}` : ""}</p>}<Link href={o.ctaUrl} className="mt-auto self-start rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal">{o.ctaLabel}</Link></div></article>))}</div>
          : <p className="rounded-2xl bg-white p-10 text-center text-slate-500">There are no active offers right now. <Link href="/quote" className="text-teal underline">Request a quote</Link> for current pricing.</p>}</div></section>
      {p.howItWorks.length > 0 && <Band tone="white"><SectionHead kicker="Simple" title="How offers" accent="work" /><IconCards cols={3} items={p.howItWorks} /></Band>}
      {p.volume.length > 0 && <Band tone="sage"><SectionHead kicker="Volume" title="Volume discount" accent="example" text="Edit this table in Admin → Pages → Offers." /><DataTable head={["Batch size", "Discount"]} rows={p.volume.map((v: { batch: string; discount: string }) => [<b key="b">{v.batch}</b>, v.discount])} /></Band>}
      {p.terms && <Band tone="white"><SectionHead kicker="Good to know" title="Offer" accent="terms" /><Markdown source={p.terms} className="max-w-3xl" /></Band>}
      {p.faqs.length > 0 && <Band><SectionHead kicker="FAQ" title="Offers" accent="FAQ" /><Faqs items={p.faqs} /></Band>}
      <CtaBand title="Ready to claim an offer?" text="Tell us about your project and we will confirm the best option." />
    </>
  );
}
