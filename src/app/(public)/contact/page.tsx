
import type { Metadata } from "next";
import { getSetting } from "@/lib/cms";
import { getSite, pageMetadata } from "@/lib/public";
import { PageHero } from "@/components/public/PageHero";
import { ContactForm } from "@/components/public/RequestForms";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("page_contact", "Contact");
}

export default async function Contact() {
  const [p, site] = await Promise.all([
    getSetting("page_contact"),
    getSite(),
  ]);

  // Read contact details safely without assuming they exist in the type.
  const contact = site as typeof site & {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    hours?: string | null;
    bookingUrl?: string | null;
  };

  const phone = contact.phone?.trim() ?? "";
  const email = contact.email?.trim() ?? "";
  const address = contact.address?.trim() ?? "";
  const hours = contact.hours?.trim() ?? "";
  const bookingUrl = contact.bookingUrl?.trim() ?? "";

  return (
    <>
      <PageHero
        path="/contact"
        title={p.heading}
        description={p.description}
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1fr_1.3fr]">
        <aside className="space-y-4">
          <div className="rounded-3xl bg-white p-6">
            <h2 className="font-bold">Get in touch</h2>

            {phone && (
              <p className="mt-2 text-sm">
                <a
                  className="text-teal underline"
                  href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                >
                  {phone}
                </a>
              </p>
            )}

            {email && (
              <p className="text-sm">
                <a
                  className="text-teal underline"
                  href={`mailto:${email}`}
                >
                  {email}
                </a>
              </p>
            )}

            {address && (
              <p className="mt-2 whitespace-pre-line text-sm">
                {address}
              </p>
            )}

            {hours && (
              <p className="mt-2 text-sm text-slate-600">
                {hours}
              </p>
            )}

            {bookingUrl && /^https:\/\//i.test(bookingUrl) && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-teal"
              >
                Book a call
              </a>
            )}
          </div>

          {p.mapEmbedUrl && (
            <iframe
              src={p.mapEmbedUrl}
              title="Map"
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin"
              className="h-64 w-full rounded-3xl border-0"
            />
          )}
        </aside>

        <ContactForm
          heading={p.formHeading}
          description={p.formDescription}
        />
      </div>
    </>
  );
}
