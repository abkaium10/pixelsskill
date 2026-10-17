import type { Metadata } from "next";
import { getSetting } from "@/lib/cms";
import { getPortfolio, pageMetadata } from "@/lib/public";
import { PortfolioGrid } from "@/components/public/PortfolioGrid";
import { PageHero } from "@/components/public/PageHero";
export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_portfolio", "Portfolio"); }
export default async function Portfolio() {
  const [items, p] = await Promise.all([getPortfolio(), getSetting("page_portfolio")]);
  return (<><PageHero path="/portfolio" title={p.heading} description={p.description} tone="lavender" /><div className="mx-auto max-w-7xl px-4 py-14">
    {items.length ? <PortfolioGrid items={items.map((i) => ({ id: i.id, slug: i.slug, title: i.title, description: i.description, category: i.category, beforeAlt: i.beforeAlt, afterAlt: i.afterAlt, sliderPosition: i.sliderPosition, before: i.before?.secureUrl, after: i.after?.secureUrl }))} /> : <p className="rounded-2xl bg-white p-10 text-center text-slate-500">Portfolio projects will appear here once published.</p>}</div></>);
}
