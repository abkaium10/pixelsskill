import type { Metadata } from "next";
import Link from "next/link";
import { getSetting, mediaMap } from "@/lib/cms";
import { pageMetadata } from "@/lib/public";
import { getPublishedServices } from "@/lib/services";
import { PageHero } from "@/components/public/PageHero";
import { Band, CtaBand, Faqs, IconCards, Kicker, SectionHead } from "@/components/public/Extras";
import { Reveal } from "@/components/public/Reveal";
import { Markdown } from "@/components/Markdown";
import { BeforeAfterSlider } from "@/components/media/BeforeAfterSlider";
import { cld } from "@/lib/cld";
export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("page_about", "About"); }
type T = { title: string; description: string };
export default async function About() {
  const [p, site, services] = await Promise.all([getSetting("page_about"), getSetting("site"), getPublishedServices()]);
  const m = await mediaMap([p.heroImageId, ...p.team.map((t: { photoId: string }) => t.photoId)]);
  const showcase = services.find((s) => s.heroBefore && s.heroAfter);
  return (
    <>
      <PageHero path="/about" title={p.heading} description={p.description} />
      {p.stats.length > 0 && <section className="bg-white px-4 py-10"><ul className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">{p.stats.map((s: { value: string; label: string }, i: number) => <li key={i} className="rounded-3xl border border-mist/60 p-5 text-center"><b className="block font-display text-4xl text-teal">{s.value}</b><span className="text-sm text-slate-600">{s.label}</span></li>)}</ul></section>}
      <section className="bg-mint px-4 py-16"><div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <Reveal><Kicker>Our story</Kicker><Markdown source={p.story} className="max-w-xl" /></Reveal>
        <Reveal>{m[p.heroImageId ?? ""] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={cld(m[p.heroImageId].secureUrl, 900)} alt={p.heroImageAlt} loading="lazy" className="rounded-[2rem] shadow-2xl" /> : showcase ? <BeforeAfterSlider beforeSrc={showcase.heroBefore?.secureUrl} afterSrc={showcase.heroAfter?.secureUrl} beforeAlt={showcase.beforeAlt} afterAlt={showcase.afterAlt} className="shadow-2xl" /> : null}</Reveal></div></section>
      {p.mission.length > 0 && <Band><SectionHead kicker="What guides us" title="Mission, vision" accent="& values" /><IconCards cols={3} items={p.mission} /></Band>}
      {p.process.length > 0 && <Band tone="white"><SectionHead kicker="Process" title="How we" accent="work" text="Six steps from brief to delivery." />
        <ol className="relative grid gap-6 before:absolute before:bottom-3 before:left-[19px] before:top-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan before:to-lavender">{(p.process as T[]).map((s, i) => <li key={i} className="relative flex items-start gap-5"><span className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-4 border-white bg-navy font-bold text-cyan">{i + 1}</span><div><b className="block">{s.title}</b><span className="text-sm text-slate-600">{s.description}</span></div></li>)}</ol></Band>}
      {p.quality.length > 0 && <Band tone="navy"><SectionHead dark kicker="Quality" title="Our quality" accent="checklist" text="What every image goes through before delivery." /><ul className="grid gap-3 md:grid-cols-3">{p.quality.map((q: { text: string }, i: number) => <li key={i} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"><span className="text-cyan">✓</span>{q.text}</li>)}</ul></Band>}
      {p.team.length > 0 && <Band tone="white"><SectionHead kicker="People" title="Meet the" accent="team" /><div className="grid gap-5 sm:grid-cols-3">{p.team.map((t: { name: string; role: string; photoId: string; photoAlt: string }, i: number) => <Reveal key={i}><div className="rounded-3xl border border-mist/60 p-6 text-center">{m[t.photoId ?? ""] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={cld(m[t.photoId].secureUrl, 400)} alt={t.photoAlt} loading="lazy" className="mx-auto mb-3 h-28 w-28 rounded-full object-cover" /> : <span className="mx-auto mb-3 grid h-28 w-28 place-items-center rounded-full bg-sage text-3xl font-bold text-navy">{t.name[0]}</span>}<b>{t.name}</b><p className="text-sm text-slate-500">{t.role}</p></div></Reveal>)}</div></Band>}
      <Band><SectionHead kicker="Contact" title="Get in" accent="touch" /><div className="grid gap-5 md:grid-cols-3"><div className="rounded-3xl border border-mist/60 bg-white p-6"><b>Phone</b><p className="mt-1"><a className="text-teal underline" href={`tel:${String(site.phone).replace(/[^+\d]/g, "")}`}>{site.phone}</a></p></div><div className="rounded-3xl border border-mist/60 bg-white p-6"><b>Email</b><p className="mt-1"><a className="text-teal underline" href={`mailto:${site.email}`}>{site.email}</a></p></div><div className="rounded-3xl border border-mist/60 bg-white p-6"><b>{site.address ? "Address" : "Online service"}</b><p className="mt-1 whitespace-pre-line text-sm text-slate-600">{site.address || "Send files from anywhere through our quote and free trial forms."}</p>{site.hours && <p className="mt-2 text-sm">{site.hours}</p>}</div></div></Band>
      {p.faqs.length > 0 && <Band tone="sage"><SectionHead kicker="FAQ" title="About" accent="FAQ" /><Faqs items={p.faqs} /></Band>}
      <CtaBand title="Let's work together" text="Tell us about your images and get a quote." />
    </>
  );
}
