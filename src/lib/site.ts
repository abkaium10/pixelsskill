/** Canonical base URL comes from env only — never from the Host header. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SERVICE_PATH = "/services";
export const serviceUrl = (slug: string) => `${SITE_URL}${SERVICE_PATH}/${slug}`;
