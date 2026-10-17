import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getSetting } from "@/lib/cms";
export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSetting("site").catch(() => ({} as Record<string, unknown>));
  const extra = ((s.extraDisallow as string[]) ?? []).filter((p) => p.startsWith("/") && !p.startsWith("//"));
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", ...extra] }], sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
