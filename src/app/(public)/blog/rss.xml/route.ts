import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/site";
import { xmlEscape } from "@/lib/subscribe";
export const revalidate = 600;
export async function GET() {
  const posts = await db.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" }, take: 30, select: { slug: true, title: true, excerpt: true, category: true, publishedAt: true } });
  const items = posts.map((p) => `<item><title>${xmlEscape(p.title)}</title><link>${SITE_URL}/blog/${p.slug}</link><guid>${SITE_URL}/blog/${p.slug}</guid><pubDate>${(p.publishedAt ?? new Date()).toUTCString()}</pubDate>${p.category ? `<category>${xmlEscape(p.category)}</category>` : ""}<description>${xmlEscape(p.excerpt)}</description></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>PixelSkill Blog</title><link>${SITE_URL}/blog</link><atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/><description>Guides and tips on product photo editing.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600" } });
}
