"use client";
import Link from "next/link";
import { useRef } from "react";

export type TItem = { id: string; name: string; role: string; company: string; text: string; rating: number | null; isSample: boolean; serviceName: string };
const COLORS = ["#22D3EE", "#BAC095", "#8686AC", "#FFC107"];
const Stars = ({ n }: { n: number }) => <div className="tracking-[3px] text-sun" aria-label={`${n} out of 5 stars`}>{"★".repeat(n)}<span className="text-slate-300">{"★".repeat(5 - n)}</span></div>;

export function TCard({ t, i, big }: { t: TItem; i: number; big?: boolean }) {
  const init = t.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
  return (
    <figure className={`relative flex h-full flex-col gap-4 rounded-[1.75rem] border p-8 shadow-xl transition hover:-translate-y-1 ${big ? "border-transparent bg-gradient-to-br from-ink to-[#123e52] text-white" : "border-white bg-white"}`}>
      {t.isSample && <span className="absolute right-4 top-4 rounded-full bg-sun px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-navy">Sample</span>}
      <span aria-hidden className="font-display text-6xl leading-none text-cyan">“</span>
      {t.rating ? <Stars n={t.rating} /> : null}
      <blockquote className={big ? "font-display text-2xl leading-snug" : "leading-relaxed text-slate-700"}>{t.text}</blockquote>
      {t.serviceName && <span className={`self-start rounded-full px-3 py-0.5 text-xs font-bold ${big ? "bg-cyan/15 text-[#9bf3ff]" : "bg-cyan/15 text-teal"}`}>{t.serviceName}</span>}
      <figcaption className="mt-auto flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full font-bold text-navy" style={{ background: COLORS[i % 4] }}>{init}</span>
        <span><b className="block">{t.name}</b><span className={`text-sm ${big ? "text-white/70" : "text-slate-500"}`}>{[t.role, t.company].filter(Boolean).join(", ")}</span></span>
      </figcaption>
    </figure>
  );
}

/** Featured review + carousel (scroll-snap, buttons, keyboard-scrollable region) + feedback CTA. */
export function TestimonialsSection({ items, heading, description }: { items: TItem[]; heading: string; description?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [big, ...rest] = items;
  const scroll = (dir: number) => { const t = track.current; if (!t?.firstElementChild) return; t.scrollBy({ left: dir * ((t.firstElementChild as HTMLElement).offsetWidth + 20), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  const sample = items.every((i) => i.isSample);
  return (
    <section className="cv relative overflow-hidden bg-gradient-to-b from-lilac to-white px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl"><span className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-teal"><i className="h-1.5 w-1.5 rounded-full bg-cyan" />Testimonials</span><h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>{description && <p className="mt-2 text-slate-600">{description}</p>}</div>
        <div className="mb-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <TCard t={big} i={0} big />
          <div className="grid content-start gap-4"><h3 className="font-display text-xl font-bold">Trusted by sellers, studios and agencies</h3><p className="text-slate-600">{sample ? "These are placeholder reviews. Replace them with real customer feedback in Admin → Testimonials." : "Feedback from real customers, shown as written."}</p>
            <div className="grid grid-cols-3 gap-3 text-center">{[[String(items.length), "Reviews shown"], [String(new Set(items.map((i) => i.serviceName).filter(Boolean)).size || "—"), "Services mentioned"], [sample ? "Sample" : "Real", "Content type"]].map(([v, l]) => <div key={l} className="rounded-3xl border border-lilac bg-white p-4"><b className="block font-display text-2xl text-indigo">{v}</b><span className="text-xs text-slate-500">{l}</span></div>)}</div></div>
        </div>
        {rest.length > 0 && <>
          <div className="mb-3 flex justify-end gap-2"><button type="button" onClick={() => scroll(-1)} aria-label="Previous reviews" className="h-11 w-11 rounded-full border border-lilac bg-white text-lg hover:bg-navy hover:text-white">←</button><button type="button" onClick={() => scroll(1)} aria-label="Next reviews" className="h-11 w-11 rounded-full border border-lilac bg-white text-lg hover:bg-navy hover:text-white">→</button></div>
          <div ref={track} role="region" aria-label="Customer reviews" tabIndex={0} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{rest.map((t, i) => <div key={t.id} className="w-[min(380px,86%)] flex-none snap-start"><TCard t={t} i={i + 1} /></div>)}</div></>}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-lilac bg-white p-6"><div><b>Worked with us?</b><p className="text-sm text-slate-600">Share your experience and help other sellers decide.</p></div><div className="flex gap-3"><Link href="/contact" className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-teal">Share your feedback</Link><Link href="/testimonials" className="rounded-full border border-mist px-6 py-3 text-sm font-semibold hover:bg-ice">Read all reviews</Link></div></div>
      </div>
    </section>
  );
}
