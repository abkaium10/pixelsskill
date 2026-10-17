import type { Metadata } from "next";
import { getSetting } from "@/lib/cms";
import { getMenuServices } from "@/lib/services";
import { pageMetadata } from "@/lib/public";
import { PageHero } from "@/components/public/PageHero";
import { QuoteForm } from "@/components/public/RequestForms";
export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_quote", "Get a Quote"); }
export default async function Quote() {
  const [p, services] = await Promise.all([getSetting("page_quote"), getMenuServices()]);
  return (<><PageHero path="/quote" title={p.heading} description={p.description} /><div className="mx-auto max-w-4xl px-4 py-14">{p.sideNote && <p className="mb-6 rounded-2xl bg-cream p-4 text-sm">{p.sideNote}</p>}<QuoteForm services={services} /></div></>);
}
