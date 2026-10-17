import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { getMenuServices } from "@/lib/services";
import { getSite } from "@/lib/public";
import { FloatingUI } from "@/components/public/FloatingUI";
import { ChatWidget } from "@/components/public/ChatWidget";
import { getSetting } from "@/lib/cms";
import { socialLinks } from "@/components/public/Social";
import { jsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [services, site, chat] = await Promise.all([getMenuServices(), getSite(), getSetting("chat")]);
  const org = { "@context": "https://schema.org", "@type": "Organization", name: site.orgLegalName || site.siteName, url: SITE_URL, sameAs: socialLinks(site).map((s) => s.url), ...(site.logoUrl ? {} : { logo: `${SITE_URL}/icon-512.png` }), ...(site.logoUrl ? { logo: site.logoUrl } : {}), ...(site.email ? { email: site.email } : {}), ...(site.phone ? { telephone: site.phone } : {}) };
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: site.siteName, url: SITE_URL, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } };
  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([org, website]) }} />
    {site.plausibleDomain && /^[a-z0-9.-]+$/i.test(site.plausibleDomain) && <script defer data-domain={site.plausibleDomain} src="https://plausible.io/js/script.js" />}
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded focus:bg-white focus:p-2">Skip to content</a>
    <Navbar services={services} phone={site.phone} email={site.email} logoUrl={site.logoUrl} logoAlt={site.logoAlt} navItems={site.nav.navItems} ctaLabel={site.nav.ctaLabel} ctaUrl={site.nav.ctaUrl} socials={socialLinks(site)} trustBar={site.trustBar} announcement={site.announcement} announcementUrl={site.announcementUrl} />
    <main id="main" className="pt-[104px]">{children}</main>
    <Footer site={site} services={services} socials={socialLinks(site)} />
    <FloatingUI whatsapp={site.whatsapp} chat={!!chat.enabled} />
    {chat.enabled && <ChatWidget s={{ title: chat.title, welcomeMessage: chat.welcomeMessage, teaser: chat.teaser, autoOpenDelay: chat.autoOpenDelay, quickReplies: chat.quickReplies, askContact: !!chat.askContact, hours: chat.hours, offlineNote: chat.offlineNote }} />}
  </>);
}
