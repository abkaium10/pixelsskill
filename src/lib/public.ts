/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from "react";
import type { Metadata } from "next";
import { db } from "./db";
import { getSetting, mediaMap } from "./cms";
import { SITE_URL } from "./site";
import { PAGE_PATH } from "./defs";

export type Img = { secureUrl: string; width: number | null; height: number | null } | undefined;
const pick = (m: Record<string, any>, id?: string | null): Img => (id ? m[id] : undefined);

export const getSite = cache(async () => {
  const [site, nav] = await Promise.all([getSetting("site"), getSetting("navigation")]);
  const m = await mediaMap([site.logoId, site.faviconId, site.defaultOgImageId]);
  return { ...site, nav, logoUrl: (pick(m, site.logoId)?.secureUrl as string | undefined) ?? null, faviconUrl: pick(m, site.faviconId)?.secureUrl ?? null, defaultOg: pick(m, site.defaultOgImageId)?.secureUrl ?? `${SITE_URL}/og-default.jpg` };
});

/** Metadata for fixed pages: page-level SEO overrides global defaults. */
type SeoInput = { title: string; description?: string; canonical: string; noindex?: boolean; nofollow?: boolean; ogTitle?: string; ogDescription?: string; image?: string | null; imageAlt?: string; type?: "website" | "article"; publishedTime?: string; modifiedTime?: string; authors?: string[] };
/** Single place that turns saved SEO fields into Next.js metadata (explicit item fields > page fields > site defaults). */
export async function buildMetadata(i: SeoInput): Promise<Metadata> {
  const site = await getSite(); const ogTitle = i.ogTitle || i.title; const ogDesc = i.ogDescription || i.description; const img = i.image ?? site.defaultOg;
  return {
    title: i.title, description: i.description, alternates: { canonical: i.canonical },
    robots: i.noindex || i.nofollow ? { index: !i.noindex, follow: !i.nofollow } : undefined,
    openGraph: { type: i.type ?? "website", title: ogTitle, description: ogDesc, url: i.canonical, siteName: site.siteName, images: img ? [{ url: img, alt: i.imageAlt || ogTitle }] : undefined, publishedTime: i.publishedTime, modifiedTime: i.modifiedTime, authors: i.authors },
    twitter: { card: "summary_large_image", title: ogTitle, description: ogDesc, site: site.twitterSite || undefined, images: img ? [img] : undefined },
  };
}

export async function pageMetadata(key: string, fallbackTitle: string): Promise<Metadata> {
  const [s, site] = await Promise.all([getSetting(key), getSite()]);
  const path = PAGE_PATH[key] ?? "/";
  const og = (await mediaMap([s.ogImageId]))[s.ogImageId ?? ""]?.secureUrl;
  const base = await buildMetadata({ title: s.seoTitle || fallbackTitle, description: s.metaDescription || s.description || site.defaultDescription || undefined, canonical: s.canonicalUrl || `${SITE_URL}${path === "/" ? "" : path}`, noindex: s.noindex, nofollow: s.nofollow, ogTitle: s.ogTitle, ogDescription: s.ogDescription, image: og, imageAlt: s.ogImageAlt });
  return key === "homepage" && s.seoTitle ? { ...base, title: { absolute: s.seoTitle } } : base;
}

export async function getPricing() {
  const cards = await db.pricingCard.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ displayOrder: "asc" }, { title: "asc" }], include: { options: { where: { visible: true }, orderBy: { displayOrder: "asc" } } } });
  const m = await mediaMap(cards.flatMap((c) => [c.beforeId, c.afterId]));
  return cards.map((c) => ({ ...c, startingPrice: c.startingPrice.toString(), options: c.options.map((o) => ({ ...o, price: o.price.toString() })), before: pick(m, c.beforeId), after: pick(m, c.afterId) }));
}

export async function getPortfolio(opts: { featured?: boolean; take?: number } = {}) {
  const items = await db.portfolioItem.findMany({ where: { status: "PUBLISHED", ...(opts.featured ? { featured: true } : {}) }, orderBy: [{ displayOrder: "asc" }, { title: "asc" }], take: opts.take, include: { service: { select: { name: true, slug: true } } } });
  const m = await mediaMap(items.flatMap((i) => [i.beforeId, i.afterId, i.thumbnailId]));
  return items.map((i) => ({ ...i, before: pick(m, i.beforeId), after: pick(m, i.afterId), thumb: pick(m, i.thumbnailId) }));
}
export async function getPortfolioItem(slug: string) {
  const i = await db.portfolioItem.findFirst({ where: { slug, status: "PUBLISHED" }, include: { service: { select: { name: true, slug: true } }, examples: { orderBy: { displayOrder: "asc" } } } });
  if (!i) return null;
  const m = await mediaMap([i.beforeId, i.afterId, i.ogImageId, ...i.examples.flatMap((e) => [e.beforeId, e.afterId])]);
  return { ...i, before: pick(m, i.beforeId), after: pick(m, i.afterId), og: pick(m, i.ogImageId), examples: i.examples.map((e) => ({ ...e, before: pick(m, e.beforeId), after: pick(m, e.afterId) })) };
}

export async function getTestimonials(take?: number) {
  const t = await db.testimonial.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ displayOrder: "asc" }], take });
  const m = await mediaMap(t.map((x) => x.avatarId)); return t.map((x) => ({ ...x, avatar: pick(m, x.avatarId) }));
}
export const getFaqs = (take?: number) => db.faq.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ category: "asc" }, { displayOrder: "asc" }], take });

/** Active = published AND within its validity window. Expired/future offers are never shown as current. */
export async function getActiveOffers() {
  const now = new Date();
  const o = await db.offer.findMany({ where: { status: "PUBLISHED", AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] }, orderBy: { displayOrder: "asc" } });
  const m = await mediaMap(o.map((x) => x.bannerId)); return o.map((x) => ({ ...x, banner: pick(m, x.bannerId) }));
}

export async function getBlogList(page = 1, take = 9, category?: string) {
  const where = { status: "PUBLISHED" as const, publishedAt: { lte: new Date() }, ...(category ? { category } : {}) };
  const [items, total] = await Promise.all([db.blogPost.findMany({ where, orderBy: { publishedAt: "desc" }, skip: (page - 1) * take, take }), db.blogPost.count({ where })]);
  const m = await mediaMap(items.map((i) => i.coverId)); return { items: items.map((i) => ({ ...i, cover: pick(m, i.coverId) })), total, pages: Math.max(1, Math.ceil(total / take)) };
}
export async function getBlogPost(slug: string) {
  const p = await db.blogPost.findFirst({ where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } } }); if (!p) return null;
  const m = await mediaMap([p.coverId, p.ogImageId]);
  const related = await db.blogPost.findMany({ where: { status: "PUBLISHED", NOT: { id: p.id }, ...(p.category ? { category: p.category } : {}) }, orderBy: { publishedAt: "desc" }, take: 3, select: { slug: true, title: true, excerpt: true } });
  const service = p.serviceId ? await db.service.findFirst({ where: { id: p.serviceId, status: "PUBLISHED" }, select: { slug: true, name: true } }) : null;
  return { ...p, cover: pick(m, p.coverId), og: pick(m, p.ogImageId), related, service };
}
