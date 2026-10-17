import type { Metadata } from "next";
import { getSetting } from "@/lib/cms";
import { getMenuServices } from "@/lib/services";
import { pageMetadata } from "@/lib/public";
import { PageHero } from "@/components/public/PageHero";
import { TrialForm } from "@/components/public/RequestForms";
export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_freetrial", "Free Trial"); }
export default async function FreeTrial() {
  const [p, services] = await Promise.all([getSetting("page_freetrial"), getMenuServices()]);
  return (<><PageHero path="/free-trial" title={p.heading} description={p.description} tone="teal" /><div className="mx-auto max-w-4xl px-4 py-14"><TrialForm services={services} instructions={p.instructions} /></div></>);
}
