import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/cms";
import { SITE_URL, serviceUrl } from "@/lib/site";
import { PAGE_PATH } from "@/lib/defs";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [services, portfolio, blog] = await Promise.all([
    db.service.findMany({ where: { status: "PUBLISHED", noindex: false }, select: { slug: true, updatedAt: true } }).catch(() => []),
    db.portfolioItem.findMany({ where: { status: "PUBLISHED", noindex: false }, select: { slug: true, updatedAt: true } }).catch(() => []),
    db.blogPost.findMany({ where: { status: "PUBLISHED", noindex: false, publishedAt: { lte: now } }, select: { slug: true, updatedAt: true } }).catch(() => []),
  ]);
  const pages: MetadataRoute.Sitemap = [];
  for (const [key, path] of Object.entries(PAGE_PATH)) { const s = await getSetting(key).catch(() => null); if (s && !s.noindex) pages.push({ url: path === "/" ? SITE_URL : `${SITE_URL}${path}` }); }
  return [...pages, ...services.map((s) => ({ url: serviceUrl(s.slug), lastModified: s.updatedAt })), ...portfolio.map((s) => ({ url: `${SITE_URL}/portfolio/${s.slug}`, lastModified: s.updatedAt })), ...blog.map((s) => ({ url: `${SITE_URL}/blog/${s.slug}`, lastModified: s.updatedAt }))];
}
