import type { Metadata } from "next";
import { getSetting } from "@/lib/cms";
import { pageMetadata } from "@/lib/public";
import { PageHero } from "@/components/public/PageHero";
import { Markdown } from "@/components/Markdown";
export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_cookies", "Cookie Policy"); }
export default async function Page() {
  const p = await getSetting("page_cookies");
  return (<><PageHero path="/cookies" title={p.heading} description={p.description || undefined} /><div className="mx-auto max-w-3xl px-4 py-14"><Markdown source={p.body} /></div></>);
}
