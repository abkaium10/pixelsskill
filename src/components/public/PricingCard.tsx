import Link from "next/link";
import { BeforeAfterSlider } from "@/components/media/BeforeAfterSlider";
type Opt = { id: string; title: string; description: string; price: string; priceUnit: string; badge: string };
export type PricingView = { id: string; title: string; subtitle: string; description: string; badge: string; currency: string; startingPrice: string; priceUnit: string; showSlider: boolean; showOptions: boolean; showStartingPrice: boolean; sliderPosition: number; beforeAlt: string; afterAlt: string; ctaLabel: string; ctaUrl: string; featured: boolean; before?: { secureUrl: string }; after?: { secureUrl: string }; options: Opt[] };
const money = (v: string, cur: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(Number(v));
export function PricingCard({ c }: { c: PricingView }) {
  return (<article className={`flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ${c.featured ? "ring-2 ring-teal" : "ring-mist/60"}`}>
    {c.showSlider && c.before && c.after && <BeforeAfterSlider beforeSrc={c.before.secureUrl} afterSrc={c.after.secureUrl} beforeAlt={c.beforeAlt || `${c.title} before`} afterAlt={c.afterAlt || `${c.title} after`} initial={c.sliderPosition} aspect="16 / 10" className="rounded-none" />}
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-start justify-between gap-2"><h3 className="text-xl font-bold">{c.title}</h3>{c.badge && <span className="rounded-full bg-sun px-3 py-1 text-xs font-bold text-navy">{c.badge}</span>}</div>
      {c.subtitle && <p className="text-sm text-slate-500">{c.subtitle}</p>}
      {c.showStartingPrice && <p className="mt-3"><span className="text-sm text-slate-500">Starting at </span><span className="text-3xl font-bold text-teal">{money(c.startingPrice, c.currency)}</span> <span className="text-sm text-slate-500">{c.priceUnit}</span></p>}
      {c.description && <p className="mt-2 text-sm text-slate-600">{c.description}</p>}
      {c.showOptions && c.options.length > 0 && <ul className="mt-4 divide-y rounded-2xl border border-mist/60 text-sm">{c.options.map((o) => <li key={o.id} className="flex items-start justify-between gap-3 p-3"><span><b>{o.title}</b>{o.badge && <span className="ml-2 rounded-full bg-lilac px-2 text-xs">{o.badge}</span>}{o.description && <span className="block text-xs text-slate-500">{o.description}</span>}</span><span className="whitespace-nowrap font-semibold">{money(o.price, c.currency)}<span className="block text-xs font-normal text-slate-500">{o.priceUnit}</span></span></li>)}</ul>}
      <Link href={c.ctaUrl} className="mt-5 inline-flex justify-center rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan">{c.ctaLabel}</Link>
    </div></article>);
}
