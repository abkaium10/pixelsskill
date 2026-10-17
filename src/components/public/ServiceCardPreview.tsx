import Link from "next/link";
import { BeforeAfterSlider } from "@/components/media/BeforeAfterSlider";
type S = { slug: string; name: string; shortDescription: string; beforeAlt: string; afterAlt: string; sliderPosition: number; heroBefore: { secureUrl: string } | null; heroAfter: { secureUrl: string } | null };
export function ServiceCardPreview({ s }: { s: S }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-mist/60 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <BeforeAfterSlider beforeSrc={s.heroBefore?.secureUrl} afterSrc={s.heroAfter?.secureUrl} beforeAlt={s.beforeAlt} afterAlt={s.afterAlt} initial={s.sliderPosition} aspect="4 / 3" className="rounded-none" />
      <div className="p-5"><h3 className="text-lg font-bold"><Link href={`/services/${s.slug}`} className="after:absolute-none hover:text-teal">{s.name}</Link></h3>
        <p className="mt-1 text-sm text-slate-600">{s.shortDescription}</p>
        <Link href={`/services/${s.slug}`} className="mt-3 inline-block text-sm font-semibold text-teal underline-offset-4 hover:underline">View service →</Link></div>
    </article>
  );
}
