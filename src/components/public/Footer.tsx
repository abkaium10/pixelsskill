
import Link from "next/link";
import { SocialList, type SocialLink } from "./Social";
import { NewsletterForm } from "./NewsletterForm";
import type { SiteSettings } from "@/lib/public";

type L = {
  label: string;
  href: string;
};

type FooterSite = SiteSettings & {
  nav: SiteSettings["nav"] & {
    footerDescription?: string;
    footerColumns?: {
      title: string;
      links: L[];
    }[];
    legalLinks?: L[];
    copyright?: string;
  };
};

export function Footer({
  site,
  services,
  socials,
}: {
  services: {
    slug: string;
    name: string;
  }[];
  socials: SocialLink[];
  site: FooterSite;
}) {
  const phone = site.phone ?? "";
  const email = site.email ?? "";
  const footerColumns = site.nav.footerColumns ?? [];
  const legalLinks = site.nav.legalLinks ?? [];
  const copyright = site.nav.copyright || site.siteName || "PixelSkill";

  return (
    <footer className="bg-navy text-white/80">
      <div className="mx-auto max-w-7xl px-4 pt-14">
        <div className="max-w-xl">
          <NewsletterForm />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_1.5fr_1fr_1fr_1.1fr]">
        <div>
          <p className="text-xl font-bold text-white">
            {site.siteName || "PixelSkill"}
          </p>

          {site.nav.footerDescription && (
            <p className="mt-3 text-sm">
              {site.nav.footerDescription}
            </p>
          )}

          <SocialList links={socials} className="mt-4 text-white" />
        </div>

        <nav aria-label="Services">
          <p className="mb-3 font-semibold text-white">Services</p>

          <ul className="columns-2 gap-5 space-y-2 text-sm">
            {services.map((service) => (
              <li
                key={service.slug}
                className="break-inside-avoid"
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="hover:text-cyan"
                >
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="mb-3 font-semibold text-white">
              {column.title}
            </p>

            <ul className="space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="text-sm">
          <p className="mb-3 font-semibold text-white">Contact</p>

          {phone && (
            <p>
              <a
                href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                className="hover:text-cyan"
              >
                {phone}
              </a>
            </p>
          )}

          {email && (
            <p>
              <a
                href={`mailto:${email}`}
                className="hover:text-cyan"
              >
                {email}
              </a>
            </p>
          )}

          {site.address && (
            <p className="mt-2 whitespace-pre-line">
              {site.address}
            </p>
          )}

          {site.hours && (
            <p className="mt-2">{site.hours}</p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} {copyright}
          </p>

          <ul className="flex gap-4">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-cyan"
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li>
              <a
                href="/blog/rss.xml"
                className="hover:text-cyan"
              >
                RSS
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
