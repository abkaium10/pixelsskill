import Link from "next/link";
import type { Metadata } from "next";
import { getSetting, mediaMap } from "@/lib/cms";
import { getPublishedServices } from "@/lib/services";
import { getFaqs, getPortfolio, getPricing, getTestimonials, pageMetadata } from "@/lib/public";
import { HeroVideo, type VideoSource } from "@/components/public/HeroVideo";
import { Reveal } from "@/components/public/Reveal";
import { ServiceCardPreview } from "@/components/public/ServiceCardPreview";
import { BeforeAfterSlider } from "@/components/media/BeforeAfterSlider";
import { PricingCard } from "@/components/public/PricingCard";
import { Marquee, IconCards } from "@/components/public/Extras";
import { CountUp } from "@/components/public/CountUp";
import { TestimonialsSection } from "@/components/public/Testimonials";
import { cld } from "@/lib/cld";
import { jsonLd } from "@/lib/jsonld";
import { SITE_URL, serviceUrl } from "@/lib/site";

export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("homepage", "PixelSkill — Professional Image Editing"); }

type Sec = { key: string; enabled: boolean; heading: string; description: string };
const H = ({ s, light }: { s: Sec; light?: boolean }) => (s.heading ? <Reveal><div className="mb-10 max-w-2xl"><h2 className="font-display text-3xl font-bold md:text-4xl">{s.heading}</h2>{s.description && <p className={`mt-2 ${light ? "text-white/70" : "text-slate-600"}`}>{s.description}</p>}</div></Reveal> : null);

export default async function Home() {
  const h = await getSetting("homepage");
  const [services, portfolio, testimonials, pricing, faqs, m] = await Promise.all([
    getPublishedServices(), getPortfolio({ featured: true, take: h.portfolioLimit }), getTestimonials(7), getPricing(), getFaqs(8), mediaMap([h.heroVideoId, h.heroPosterId, h.heroMobileId]),
  ]);
  const portfolioShown = portfolio.length ? portfolio : await getPortfolio({ take: h.portfolioLimit });
  const sections = (h.sections as Sec[]).filter((s) => s.enabled);
  const align = h.align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const body = (s: Sec) => {
    switch (s.key) {
      case "trust": return h.trustItems.length ? <section key={s.key} className="relative z-10 -mt-14 px-4"><ul className="mx-auto grid max-w-7xl gap-2 rounded-[1.75rem] border border-mist/50 bg-white p-5 shadow-2xl sm:grid-cols-2 lg:grid-cols-4">{h.trustItems.map((t: { value: string; label: string }, i: number) => <li key={i} className="px-3 py-2 text-center lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-mist/50"><CountUp value={t.value} /><span className="text-sm text-slate-600">{t.label}</span></li>)}</ul></section> : null;
      case "services": return services.length ? <section key={s.key} id="services" className="bg-mint px-4 py-16"><div className="mx-auto max-w-7xl"><H s={s} /><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.slice(0, h.servicesLimit).map((x, i) => <Reveal key={x.id} delay={(i % 3) * 0.05}><ServiceCardPreview s={x} /></Reveal>)}</div><p className="mt-8 text-center"><Link href="/services" className="font-semibold text-teal underline-offset-4 hover:underline">View all services →</Link></p></div></section> : null;
      case "showcase": { const picks = portfolioShown.filter((p) => p.before && p.after).slice(0, 3); const fall = services.filter((x) => x.heroBefore && x.heroAfter).slice(0, 3); if (!picks.length && !fall.length) return null;
        return <section key={s.key} className="cv bg-navy px-4 py-16 text-white"><div className="mx-auto max-w-7xl"><H s={s} light /><div className="grid gap-6 md:grid-cols-3">{(picks.length ? picks.map((p) => ({ id: p.id, t: p.title, b: p.before?.secureUrl, a: p.after?.secureUrl, ba: p.beforeAlt, aa: p.afterAlt, pos: p.sliderPosition })) : fall.map((x) => ({ id: x.id, t: x.name, b: x.heroBefore?.secureUrl, a: x.heroAfter?.secureUrl, ba: x.beforeAlt, aa: x.afterAlt, pos: x.sliderPosition }))).map((x) => <Reveal key={x.id}><BeforeAfterSlider beforeSrc={x.b} afterSrc={x.a} beforeAlt={x.ba} afterAlt={x.aa} initial={x.pos} /><p className="mt-3 font-semibold">{x.t}</p></Reveal>)}</div></div></section>; }
      case "why": return h.whyItems.length ? <section key={s.key} className="cv bg-cream px-4 py-16"><div className="mx-auto max-w-7xl"><H s={s} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{h.whyItems.map((w: { title: string; description: string }, i: number) => <Reveal key={i}><div className="h-full rounded-3xl border border-mist/60 bg-white p-6"><span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-lilac font-bold text-navy">{i + 1}</span><h3 className="font-bold">{w.title}</h3><p className="mt-1 text-sm text-slate-600">{w.description}</p></div></Reveal>)}</div></div></section> : null;
      case "industries": return h.industries.length ? <section key={s.key} className="cv bg-white px-4 py-16"><div className="mx-auto max-w-7xl"><H s={s} /><IconCards items={h.industries.map((i: { title: string; description: string; serviceSlug: string }) => ({ title: i.title, description: i.description, href: i.serviceSlug ? `/services/${i.serviceSlug}` : undefined, meta: services.find((x) => x.slug === i.serviceSlug)?.name }))} /></div></section> : null;
      case "assurance": return h.assurance.length ? <section key={s.key} className="cv px-4 py-16"><div className="mx-auto max-w-7xl"><H s={s} /><IconCards items={h.assurance} /></div></section> : null;
      case "how": return h.steps.length ? <section key={s.key} className="cv bg-white px-4 py-16"><div className="mx-auto max-w-7xl"><H s={s} /><div className="grid gap-6 md:grid-cols-4">{h.steps.map((st: { title: string; description: string }, i: number) => <Reveal key={i}><div><span className="mb-3 grid h-12 w-12 place-items-center rounded-full text-lg font-bold text-navy" style={{ background: ["#22D3EE", "#BAC095", "#8686AC", "#FFC107"][i % 4] }}>{i + 1}</span><h3 className="font-bold">{st.title}</h3><p className="mt-1 text-sm text-slate-600">{st.description}</p></div></Reveal>)}</div></div></section> : null;
      case "portfolio": return portfolioShown.length ? <section key={s.key} className="cv bg-ice px-4 py-16"><div className="mx-auto max-w-7xl"><H s={s} /><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{portfolioShown.map((p) => <Reveal key={p.id}><article className="overflow-hidden rounded-3xl bg-white shadow-sm"><BeforeAfterSlider beforeSrc={p.before?.secureUrl} afterSrc={p.after?.secureUrl} beforeAlt={p.beforeAlt || `${p.title} before`} afterAlt={p.afterAlt || `${p.title} after`} initial={p.sliderPosition} className="rounded-none" /><div className="p-4"><h3 className="font-bold">{p.title}</h3><Link href={`/portfolio/${p.slug}`} className="text-sm font-semibold text-teal hover:underline">View project →</Link></div></article></Reveal>)}</div><p className="mt-8 text-center"><Link href="/portfolio" className="font-semibold text-teal hover:underline">See full portfolio →</Link></p></div></section> : null;
      case "freetrial": return <section key={s.key} className="cv bg-gradient-to-br from-teal to-[#0a7a68] px-4 py-16 text-white"><div className="mx-auto flex max-w-5xl flex-col items-start gap-6 md:flex-row md:items-center md:justify-between"><div><h2 className="font-display text-3xl font-bold">{s.heading}</h2><p className="mt-2 max-w-xl text-white/80">{s.description}</p></div><Link href="/free-trial" className="rounded-full bg-sun px-7 py-3 font-semibold text-navy transition hover:-translate-y-0.5">{h.freeTrialLabel}</Link></div></section>;
      case "testimonials": return testimonials.length ? <TestimonialsSection key={s.key} items={testimonials} heading={s.heading} description={s.description} /> : null;
      case "pricing": return pricing.length ? <section key={s.key} className="cv bg-mint px-4 py-16"><div className="mx-auto max-w-7xl"><H s={s} /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{pricing.slice(0, 3).map((c) => <PricingCard key={c.id} c={c} />)}</div><p className="mt-8 text-center"><Link href="/pricing" className="font-semibold text-teal hover:underline">See all pricing →</Link></p></div></section> : null;
      case "faq": return faqs.length ? <section key={s.key} className="cv bg-white px-4 py-16"><div className="mx-auto max-w-3xl"><H s={s} />{faqs.map((q) => <details key={q.id} className="mb-3 rounded-2xl border border-mist/60 bg-cream/50 p-4"><summary className="cursor-pointer font-semibold">{q.question}</summary><p className="mt-2 whitespace-pre-line text-slate-700">{q.answer}</p></details>)}<p className="mt-6 text-center"><Link href="/faq" className="font-semibold text-teal hover:underline">More questions →</Link></p></div></section> : null;
      case "finalcta": return <section key={s.key} className="cv bg-navy px-4 py-20 text-center text-white"><h2 className="font-display text-3xl font-bold md:text-4xl">{s.heading}</h2>{s.description && <p className="mx-auto mt-3 max-w-xl text-white/70">{s.description}</p>}<Link href={h.finalUrl || "/quote"} className="mt-8 inline-block rounded-full bg-cyan px-8 py-3 font-semibold text-navy shadow-[0_0_30px_rgba(34,211,238,.35)] transition hover:-translate-y-0.5">{h.finalLabel}</Link></section>;
      default: return null;
    }
  };
  const poster = m[h.heroPosterId ?? ""]?.secureUrl ?? "/samples/hero-poster.jpg";
  const adminVideo = h.videoEnabled ? m[h.heroVideoId ?? ""]?.secureUrl : null;
  // No admin video yet -> built-in sample loop so the hero is never empty. Upload your own in Admin → Homepage Builder.
  const sources: VideoSource[] = !h.videoEnabled ? [] : adminVideo ? [{ src: adminVideo, type: "video/mp4" }] : [{ src: "/samples/hero.mp4", type: "video/mp4" }, { src: "/samples/hero.webm", type: "video/webm" }];
  const site = await getSetting("site");
  const ld: unknown[] = [
    { "@context": "https://schema.org", "@type": "ProfessionalService", name: site.siteName, url: SITE_URL, description: site.defaultDescription || h.heroDescription, image: `${SITE_URL}/og-default.jpg`, telephone: site.phone, email: site.email, areaServed: "Worldwide",
      hasOfferCatalog: { "@type": "OfferCatalog", name: "Image editing services", itemListElement: services.map((x) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: x.name, url: serviceUrl(x.slug) } })) } },
  ];
  if (sections.some((x) => x.key === "faq") && faqs.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) });
  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
    {sources.length > 0 && <link rel="preload" as="image" href={poster} fetchPriority="high" />}
    <section className="relative isolate flex min-h-[calc(100svh-104px)] items-center overflow-hidden text-white">
      {sources.length ? <HeroVideo sources={sources} poster={poster} overlay={h.overlay} /> : <div className="absolute inset-0 bg-gradient-to-br from-navy via-[#0b2a3a] to-teal" />}
      <Reveal className={`relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-20 [&>*]:max-w-xl ${align}`}>
        {h.heroEyebrow && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">{h.heroEyebrow}</p>}
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">{h.heroHeading} {h.heroHighlight && <span className="text-cyan">{h.heroHighlight}</span>}</h1>
        <p className="max-w-xl text-lg text-white/80">{h.heroDescription}</p>
        <div className="flex flex-wrap gap-3">{h.cta1Label && <Link href={h.cta1Url || "/quote"} className="rounded-full bg-cyan px-7 py-3 font-semibold text-navy shadow-[0_0_30px_rgba(34,211,238,.35)] transition hover:-translate-y-0.5">{h.cta1Label}</Link>}{h.cta2Label && <Link href={h.cta2Url || "/free-trial"} className="rounded-full bg-sun px-7 py-3 font-semibold text-navy transition hover:-translate-y-0.5">{h.cta2Label}</Link>}</div>
      </Reveal>
    </section>
    {(() => { const marq = <Marquee words={(h.marquee as { text: string }[]).length ? (h.marquee as { text: string }[]).map((m2) => m2.text) : services.map((x) => x.name)} />; return sections[0]?.key === "trust" ? <>{body(sections[0])}{marq}{sections.slice(1).map(body)}</> : <>{marq}{sections.map(body)}</>; })()}
  </>);
}
void cld;
