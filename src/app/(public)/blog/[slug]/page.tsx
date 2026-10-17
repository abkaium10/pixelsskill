
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getSite, buildMetadata } from "@/lib/public";
import { Markdown } from "@/components/Markdown";
import { SITE_URL } from "@/lib/site";
import { jsonLd } from "@/lib/jsonld";
import { cld } from "@/lib/cld";

export const revalidate = 600;

type P = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: P): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBlogPost(slug);

  if (!b) {
    return {
      title: "Post not found",
      robots: { index: false },
    };
  }

  return buildMetadata({
    title: b.seoTitle || b.title,
    description: b.metaDescription || b.excerpt || undefined,
    canonical: b.canonicalUrl || `${SITE_URL}/blog/${b.slug}`,
    noindex: b.noindex,
    nofollow: b.nofollow,
    ogTitle: b.ogTitle,
    ogDescription: b.ogDescription,
    image: b.og?.secureUrl ?? b.cover?.secureUrl,
    imageAlt: b.ogImageAlt || b.coverAlt,
    type: "article",
    publishedTime: b.publishedAt?.toISOString(),
    modifiedTime: b.updatedAt.toISOString(),
    authors: b.authorName ? [b.authorName] : undefined,
  });
}

export default async function Post({ params }: P) {
  const { slug } = await params;
  const b = await getBlogPost(slug);

  if (!b) {
    notFound();
  }

  const site = await getSite();

  const toc = [...b.content.matchAll(/^##\s+(.+)$/gm)].map((m) => ({
    text: m[1],
    id: m[1]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  }));

  const enc = encodeURIComponent(`${SITE_URL}/blog/${b.slug}`);

  const mins = Math.max(
    1,
    Math.round(b.content.trim().split(/\s+/).length / 200),
  );

  const publisherName = "PixelSkill";

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: b.title,
      description: b.metaDescription || b.excerpt,
      datePublished: b.publishedAt?.toISOString(),
      dateModified: b.updatedAt.toISOString(),
      ...(b.authorName
        ? {
            author: {
              "@type": "Person",
              name: b.authorName,
            },
          }
        : {}),
      publisher: {
        "@type": "Organization",
        name: publisherName,
        ...(site.logoUrl
          ? {
              logo: {
                "@type": "ImageObject",
                url: site.logoUrl,
              },
            }
          : {}),
      },
      ...((b.og ?? b.cover)
        ? { image: (b.og ?? b.cover)!.secureUrl }
        : {}),
      mainEntityOfPage: `${SITE_URL}/blog/${b.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${SITE_URL}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: b.title,
          item: `${SITE_URL}/blog/${b.slug}`,
        },
      ],
    },
  ];

  const shareLinks = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
    },
    {
      name: "X",
      url: `https://twitter.com/intent/tweet?url=${enc}`,
    },
  ];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(ld),
        }}
      />

      <header className="bg-navy px-4 py-14 text-white">
        <div className="mx-auto max-w-3xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-3 text-sm text-white/60"
          >
            <Link href="/blog" className="hover:text-cyan">
              Blog
            </Link>
          </nav>

          <h1 className="font-display text-4xl font-bold">
            {b.title}
          </h1>

          <p className="mt-3 text-sm text-white/70">
            {b.authorName} ·{" "}
            {b.publishedAt?.toLocaleDateString("en-US", {
              dateStyle: "long",
            })}
            {b.category && ` · ${b.category}`} · {mins} min read
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav
            aria-label="In this article"
            className="sticky top-28 text-sm"
          >
            <b className="mb-2 block">In this article</b>

            {toc.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="block border-l-2 border-mist py-1.5 pl-3 text-slate-600 hover:border-cyan hover:text-teal"
              >
                {t.text}
              </a>
            ))}

            <b className="mb-2 mt-6 block">Share</b>

            <div className="flex gap-2">
              {shareLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${item.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-mist text-xs font-bold hover:bg-cyan"
                >
                  {item.name[0]}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <div className="min-w-0">
          {b.cover && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cld(b.cover.secureUrl, 1200)}
              alt={b.coverAlt}
              className="mb-8 w-full rounded-3xl"
            />
          )}

          <Markdown source={b.content} />

          {b.service && (
            <p className="mt-10 rounded-2xl bg-cream p-4 text-sm">
              Related service:{" "}
              <Link
                className="font-semibold text-teal underline"
                href={`/services/${b.service.slug}`}
              >
                {b.service.name}
              </Link>
            </p>
          )}

          {b.related.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-3 font-display text-xl font-bold">
                Related posts
              </h2>

              <ul className="space-y-2">
                {b.related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      className="text-teal underline"
                      href={`/blog/${r.slug}`}
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
