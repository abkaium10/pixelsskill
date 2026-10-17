"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BeforeAfterSlider } from "@/components/media/BeforeAfterSlider";
export type PItem = { id: string; slug: string; title: string; description: string; category: string; beforeAlt: string; afterAlt: string; sliderPosition: number; before?: string; after?: string };
export function PortfolioGrid({ items }: { items: PItem[] }) {
  const cats = useMemo(() => [...new Set(items.map((i) => i.category).filter(Boolean))].sort(), [items]);
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? items : items.filter((i) => i.category === cat);
  return (<div>
    {cats.length > 0 && <div role="group" aria-label="Filter by category" className="mb-8 flex flex-wrap gap-2">{["All", ...cats].map((c) => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${cat === c ? "border-navy bg-navy text-white" : "border-mist bg-white hover:border-teal"}`}>{c}</button>)}</div>}
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map((i) => (<article key={i.id} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-mist/60 transition hover:-translate-y-1 hover:shadow-xl">
      <BeforeAfterSlider beforeSrc={i.before} afterSrc={i.after} beforeAlt={i.beforeAlt || `${i.title} before`} afterAlt={i.afterAlt || `${i.title} after`} initial={i.sliderPosition} className="rounded-none" />
      <div className="p-5">{i.category && <span className="text-xs font-semibold uppercase tracking-wide text-teal">{i.category}</span>}<h3 className="mt-1 font-bold">{i.title}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-600">{i.description}</p><Link href={`/portfolio/${i.slug}`} className="mt-3 inline-block text-sm font-semibold text-teal hover:underline">View project →</Link></div></article>))}
      {!shown.length && <p className="col-span-full rounded-2xl bg-white p-10 text-center text-slate-500">No projects in this category yet.</p>}</div></div>);
}
