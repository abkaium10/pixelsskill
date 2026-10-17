import type { Metadata } from "next";
import { getSetting } from "@/lib/cms";
import { getFaqs, pageMetadata } from "@/lib/public";
import { PageHero } from "@/components/public/PageHero";
import { jsonLd } from "@/lib/jsonld";
export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_faq", "FAQ"); }
export default async function Faq() {
  const [faqs, p] = await Promise.all([getFaqs(), getSetting("page_faq")]);
  const groups = [...new Set(faqs.map((f) => f.category))];
  const ld = faqs.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) } : null;
  return (<><PageHero path="/faq" title={p.heading} description={p.description} />{ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />}
    <div className="mx-auto max-w-3xl px-4 py-14">{groups.map((g) => <section key={g} className="mb-10"><h2 className="mb-4 font-display text-2xl font-bold">{g}</h2>{faqs.filter((f) => f.category === g).map((f) => <details key={f.id} className="mb-3 rounded-2xl border border-mist/60 bg-white p-4"><summary className="cursor-pointer font-semibold">{f.question}</summary><p className="mt-2 whitespace-pre-line text-slate-700">{f.answer}</p></details>)}</section>)}
      {!faqs.length && <p className="rounded-2xl bg-white p-10 text-center text-slate-500">No questions published yet.</p>}</div></>);
}
