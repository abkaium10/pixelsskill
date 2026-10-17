import Link from "next/link";
import { SINGLETONS } from "@/lib/defs";
import { getSetting } from "@/lib/cms";
export default async function PagesIndex() {
  const pages = Object.values(SINGLETONS).filter((s) => s.group === "page");
  const rows = await Promise.all(pages.map(async (p) => ({ p, s: await getSetting(p.key) })));
  return (<div className="max-w-5xl"><h1 className="mb-1 text-2xl font-bold">Pages</h1><p className="mb-6 text-sm text-neutral-600">Edit the text, images and SEO of every fixed page.</p>
    <ul className="grid gap-3 sm:grid-cols-2">{rows.map(({ p, s }) => (<li key={p.key}><Link href={p.route} className="block rounded-2xl border bg-white p-4 hover:border-black"><b>{p.label}</b><span className="block text-xs text-neutral-500">{p.paths[0]}</span>{!s.seoTitle && <span className="mt-1 block text-xs text-amber-700">SEO title missing</span>}</Link></li>))}</ul></div>);
}
