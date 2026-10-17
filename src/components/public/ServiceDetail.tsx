import Link from "next/link";
import { BeforeAfterSlider } from "@/components/media/BeforeAfterSlider";
import { Reveal } from "@/components/public/Reveal";

type Titled = { title: string; description: string };
type Faq = { question: string; answer: string };
type M = { secureUrl: string } | null;
export type ServiceView = {
  name: string; slug: string; heroHeading: string; heroDescription: string; shortDescription: string; introduction: string;
  heroBefore: M; heroAfter: M; beforeAlt: string; afterAlt: string; sliderPosition: number;
  features: unknown; benefits: unknown; workflow: unknown; useCases: unknown; faqs: unknown; outputFormats: string[]; relatedSlugs: string[]; hiddenSections: string[];
  cards: { id: string; title: string; description: string; before: M; after: M }[];
};
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const Kicker = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => (
  <span className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest ${dark ? "bg-cyan/10 text-cyan" : "bg-teal/10 text-teal"}`}><i className="h-1.5 w-1.5 rounded-full bg-cyan" />{children}</span>
);
const Cards = ({ items }: { items: Titled[] }) => (<ul className="grid gap-4 md:grid-cols-3">{items.map((f, i) => <li key={i}><Reveal className="h-full"><div className="h-full rounded-3xl border border-mist/60 bg-white p-6 transition hover:-translate-y-1 hover:border-cyan hover:shadow-xl"><h3 className="font-bold">{f.title}</h3><p className="mt-1 text-sm text-slate-600">{f.description}</p></div></Reveal></li>)}</ul>);

export function ServiceDetail({ s, related }: { s: ServiceView; related: { slug: string; name: string; shortDescription: string }[] }) {
  const show = (k: string) => !s.hiddenSections.includes(k);
  const features = arr<Titled>(s.features), benefits = arr<Titled>(s.benefits), workflow = arr<Titled>(s.workflow), uses = arr<Titled>(s.useCases), faqs = arr<Faq>(s.faqs);
  const words = (s.heroHeading || s.name).split(" "); const last = words.pop();
  return (
    <>
      {/* HERO — the hero before/after pair is shown ONLY here (and on the listing card), never duplicated in the example cards */}
      <section className="relative isolate overflow-hidden bg-navy py-16 text-white">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(900px_500px_at_85%_10%,rgba(34,211,238,.28),transparent_60%),radial-gradient(700px_500px_at_0%_100%,rgba(134,134,172,.35),transparent_60%),linear-gradient(135deg,#07121C,#0a3347_55%,#005C73)]" />
        <div className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_70%_40%,#000,transparent_70%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1fr_1.08fr]">
          <div>
            <nav aria-label="Breadcrumb" className="mb-5 inline-flex gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs"><Link href="/" className="hover:text-cyan">Home</Link>/<Link href="/services" className="hover:text-cyan">Services</Link>/<span>{s.name}</span></nav>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan">{s.name}</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-6xl">{words.join(" ")} <span className="bg-gradient-to-r from-cyan to-[#a7f3ff] bg-clip-text text-transparent">{last}</span></h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">{s.heroDescription || s.shortDescription}</p>
            {features.length > 0 && <ul className="mt-6 grid gap-2">{features.slice(0, 3).map((f, i) => <li key={i} className="flex gap-3 text-white/90"><span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-cyan/20 text-xs font-extrabold text-cyan">✓</span><span><b>{f.title}.</b> {f.description}</span></li>)}</ul>}
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/quote" className="rounded-full bg-cyan px-7 py-3 font-semibold text-navy shadow-[0_0_28px_rgba(34,211,238,.35)] transition hover:-translate-y-0.5">Get a Quote</Link><Link href="/free-trial" className="rounded-full bg-sun px-7 py-3 font-semibold text-navy transition hover:-translate-y-0.5">Free Trial</Link></div>
            {s.outputFormats.length > 0 && <p className="mt-6 flex flex-wrap gap-2 text-xs">{s.outputFormats.map((f) => <span key={f} className="rounded-full border border-white/20 px-3 py-0.5 text-white/75">{f}</span>)}</p>}
          </div>
          <div className="relative rounded-[2rem] border border-white/20 bg-gradient-to-br from-white/20 to-white/5 p-3 shadow-[0_40px_90px_rgba(0,0,0,.45),0_0_90px_rgba(34,211,238,.18)]">
            <BeforeAfterSlider beforeSrc={s.heroBefore?.secureUrl} afterSrc={s.heroAfter?.secureUrl} beforeAlt={s.beforeAlt} afterAlt={s.afterAlt} initial={s.sliderPosition} aspect="4 / 3" priority className="rounded-3xl" />
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-xs font-bold text-navy shadow-lg">Move your mouse over the image to compare</span>
          </div>
        </div>
      </section>

      {show("overview") && s.introduction && (
        <section className="bg-white px-4 py-16"><div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1.4fr_1fr]"><Reveal><Kicker>Overview</Kicker><h2 className="font-display text-3xl font-bold">About {s.name}</h2><p className="mt-3 whitespace-pre-line text-slate-700">{s.introduction}</p></Reveal>
          <Reveal><aside className="rounded-3xl border border-mist/60 bg-cream p-6"><h3 className="font-bold">At a glance</h3>{s.outputFormats.length > 0 && <p className="mt-2 text-sm"><b>Output formats:</b> {s.outputFormats.join(", ")}</p>}{uses.length > 0 && <p className="mt-2 text-sm"><b>Best for:</b> {uses.map((u) => u.title).join(", ")}</p>}<Link href="/free-trial" className="mt-4 inline-block font-semibold text-teal hover:underline">Try it free →</Link></aside></Reveal></div></section>
      )}

      {/* Example cards: ONLY the cards the admin added in “Content Cards”. Nothing is auto-added from the hero pair. */}
      {show("examples") && s.cards.length > 0 && (
        <section className="bg-mint px-4 py-16"><div className="mx-auto max-w-7xl"><Reveal><Kicker>Examples</Kicker><h2 className="mb-8 font-display text-3xl font-bold md:text-4xl">Before and after examples</h2></Reveal>
          <div className="grid gap-6 md:grid-cols-2">{s.cards.map((c) => (<Reveal key={c.id}><article className="overflow-hidden rounded-3xl border border-mist/60 bg-white transition hover:-translate-y-1 hover:shadow-xl"><BeforeAfterSlider beforeSrc={c.before?.secureUrl} afterSrc={c.after?.secureUrl} beforeAlt={`${c.title} — before`} afterAlt={`${c.title} — after`} aspect="16 / 10" className="rounded-none" /><div className="p-5"><h3 className="font-bold">{c.title}</h3>{c.description && <p className="mt-1 text-sm text-slate-600">{c.description}</p>}</div></article></Reveal>))}</div></div></section>
      )}

      {show("features") && features.length > 0 && <section className="bg-white px-4 py-16"><div className="mx-auto max-w-7xl"><Reveal><Kicker>Features</Kicker><h2 className="mb-8 font-display text-3xl font-bold">Key features</h2></Reveal><Cards items={features} /></div></section>}
      {show("benefits") && benefits.length > 0 && <section className="bg-mint px-4 py-16"><div className="mx-auto max-w-7xl"><Reveal><Kicker>Why it matters</Kicker><h2 className="mb-8 font-display text-3xl font-bold">Benefits</h2></Reveal><Cards items={benefits} /></div></section>}
      {show("workflow") && workflow.length > 0 && <section className="bg-navy px-4 py-16 text-white"><div className="mx-auto max-w-5xl"><Reveal><Kicker dark>Process</Kicker><h2 className="mb-8 font-display text-3xl font-bold">Our workflow</h2></Reveal><ol className="grid gap-4 md:grid-cols-2">{workflow.map((w, i) => <li key={i} className="flex gap-4 rounded-3xl bg-white/5 p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan font-bold text-navy">{i + 1}</span><div><h3 className="font-semibold">{w.title}</h3><p className="text-sm text-white/70">{w.description}</p></div></li>)}</ol></div></section>}
      {show("usecases") && uses.length > 0 && <section className="px-4 py-16"><div className="mx-auto max-w-7xl"><Reveal><Kicker>Who it is for</Kicker><h2 className="mb-8 font-display text-3xl font-bold">Use cases</h2></Reveal><Cards items={uses} /></div></section>}
      {show("formats") && s.outputFormats.length > 0 && <section className="bg-white px-4 py-12"><div className="mx-auto max-w-5xl"><h2 className="text-xl font-bold">Supported output formats</h2><p className="mt-3 flex flex-wrap gap-2">{s.outputFormats.map((f) => <span key={f} className="rounded-full bg-lilac px-4 py-1 text-sm font-semibold">{f}</span>)}</p></div></section>}
      {show("faq") && faqs.length > 0 && <section className="px-4 py-16"><div className="mx-auto max-w-3xl"><Reveal><Kicker>FAQ</Kicker><h2 className="mb-6 font-display text-3xl font-bold">Frequently asked questions</h2></Reveal>{faqs.map((q, i) => <details key={i} className="mb-3 rounded-2xl border border-mist/60 bg-white p-4"><summary className="cursor-pointer font-semibold">{q.question}</summary><p className="mt-2 text-slate-700">{q.answer}</p></details>)}</div></section>}
      {show("related") && related.length > 0 && <section className="bg-white px-4 py-16"><div className="mx-auto max-w-7xl"><h2 className="mb-6 font-display text-3xl font-bold">Related services</h2><ul className="grid gap-4 md:grid-cols-3">{related.map((r) => <li key={r.slug}><Link href={`/services/${r.slug}`} className="block rounded-3xl border border-mist/60 p-5 transition hover:-translate-y-1 hover:border-teal hover:shadow-lg"><span className="font-bold">{r.name}</span><span className="mt-1 block text-sm text-slate-600">{r.shortDescription}</span></Link></li>)}</ul></div></section>}
      <section className="bg-gradient-to-br from-teal to-[#0a7a68] px-4 py-16 text-center text-white"><h2 className="font-display text-3xl font-bold">Try {s.name} on your own images</h2><div className="mt-6 flex justify-center gap-3"><Link href="/free-trial" className="rounded-full bg-sun px-7 py-3 font-semibold text-navy">Start Free Trial</Link><Link href="/quote" className="rounded-full bg-white px-7 py-3 font-semibold text-navy">Get a Quote</Link></div></section>
    </>
  );
}
