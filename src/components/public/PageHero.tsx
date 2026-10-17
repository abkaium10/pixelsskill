import Link from "next/link";
import { jsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

const LABELS: Record<string, string> = { "/services": "Services", "/portfolio": "Portfolio", "/pricing": "Pricing", "/offers": "Offers", "/faq": "FAQ", "/about": "About", "/quote": "Get a Quote", "/free-trial": "Free Trial", "/contact": "Contact", "/blog": "Blog", "/privacy": "Privacy Policy", "/terms": "Terms & Conditions", "/cookies": "Cookie Policy", "/testimonials": "Reviews", "/search": "Search" };
/** Page header with visible breadcrumbs and BreadcrumbList structured data when a `path` is given. */
export function PageHero({ title, description, tone = "navy", path }: { title: string; description?: string; tone?: "navy" | "teal" | "lavender"; path?: string }) {
  const bg = tone === "teal" ? "bg-gradient-to-br from-[#00485a] to-[#007a8a] text-white" : tone === "lavender" ? "bg-gradient-to-br from-[#2e2d5e] to-[#5b5a9c] text-white" : "bg-navy text-white";
  const label = path ? LABELS[path] : undefined;
  const ld = label ? { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: label, item: `${SITE_URL}${path}` }] } : null;
  return (
    <section className={`${bg} relative isolate overflow-hidden px-4 py-16`}>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(700px_300px_at_90%_0%,rgba(34,211,238,.25),transparent_60%)]" />
      <div className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(90deg,transparent,#000_70%)]" />
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />}
      <div className="mx-auto max-w-5xl">
        {label && <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/70"><Link href="/" className="hover:text-cyan">Home</Link> / <span aria-current="page">{label}</span></nav>}
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl opacity-85">{description}</p>}
      </div>
    </section>
  );
}
