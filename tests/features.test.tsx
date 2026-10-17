import { describe, it } from "vitest";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { COLLECTIONS, SINGLETONS, blank, walkMediaIds } from "../src/lib/defs";
import { buildSchema } from "../src/lib/schemaFromDefs";
import { trialSchema, quoteSchema, contactSchema } from "../src/lib/publicForms";
import { serviceSchema } from "../src/lib/validators";
import { Markdown } from "../src/components/Markdown";
import { LEGAL_PRIVACY, LEGAL_TERMS, LEGAL_COOKIES } from "../src/lib/legalDefaults";
import { DEFAULTS } from "../src/lib/defaults";
import { CARDS } from "../prisma/cardSeedData";
import { SERVICES } from "../prisma/serviceSeedData";

describe("CMS definitions, public forms, legal pages and Markdown", () => {
  const base = { name: "Jo Doe", email: "jo@example.com", outputFormat: "JPG" };

  it("every collection + singleton schema builds and accepts its own blank defaults where valid", () => { for (const c of Object.values(COLLECTIONS)) buildSchema(c.fields); for (const s of Object.values(SINGLETONS)) { const r = buildSchema(s.fields).safeParse(blank(s.fields)); assert.ok(r.success || JSON.stringify(r.error.issues).includes("required"), s.key + JSON.stringify(r.success ? "" : r.error.issues[0])); } });
  it("homepage defaults validate against the homepage schema", () => { const r = buildSchema(SINGLETONS.homepage.fields).safeParse({ ...blank(SINGLETONS.homepage.fields), ...DEFAULTS.homepage }); assert.ok(r.success, r.success ? "" : JSON.stringify(r.error.issues[0])); });
  it("navigation defaults validate and include Blog", () => { const r = buildSchema(SINGLETONS.navigation.fields).safeParse({ ...blank(SINGLETONS.navigation.fields), ...DEFAULTS.navigation }); assert.ok(r.success); assert.ok((DEFAULTS.navigation.navItems as { label: string }[]).some((x) => x.label === "Blog")); });
  it("navigation rejects javascript: links", () => assert.equal(buildSchema(SINGLETONS.navigation.fields).safeParse({ ...blank(SINGLETONS.navigation.fields), navItems: [{ label: "x", href: "javascript:alert(1)" }] }).success, false));
  it("pricing: bad money rejected; nested options accepted", () => { const s = buildSchema(COLLECTIONS.pricing.fields); assert.equal(s.safeParse({ ...blank(COLLECTIONS.pricing.fields), title: "A", startingPrice: "abc" }).success, false); assert.ok(s.safeParse({ ...blank(COLLECTIONS.pricing.fields), title: "A", startingPrice: "0.49", options: [{ title: "S", price: "0.49" }, { title: "C", price: "2.40" }] }).success); });
  it("SEO fields exist on portfolio/blog/offers and accept values", () => { for (const k of ["portfolio", "blog", "offers"]) { const names = COLLECTIONS[k].fields.map((f) => f.name); for (const n of ["seoTitle", "metaDescription", "canonicalUrl", "noindex", "nofollow", "ogTitle", "ogDescription", "ogImageId", "ogImageAlt"]) assert.ok(names.includes(n), k + ":" + n); } });
  it("page singletons carry full SEO field set", () => { for (const s of Object.values(SINGLETONS).filter((x) => x.group === "page")) { const n = s.fields.map((f) => f.name); for (const x of ["seoTitle", "metaDescription", "canonicalUrl", "noindex", "nofollow", "ogTitle", "ogImageId"]) assert.ok(n.includes(x), s.key + ":" + x); } });
  it("site settings include verification, twitter, org name, robots extras", () => { const n = SINGLETONS.site.fields.map((f) => f.name); for (const x of ["googleVerification", "bingVerification", "twitterSite", "orgLegalName", "extraDisallow", "seoTitleTemplate", "defaultOgImageId"]) assert.ok(n.includes(x), x); });
  it("free trial: rejects when no file and no link", () => { const r = trialSchema.safeParse({ ...base, imageCount: 3, files: [], fileLinks: [] }); assert.equal(r.success, false); });
  it("free trial: accepts a single https download link instead of files", () => assert.ok(trialSchema.safeParse({ ...base, imageCount: 3, fileLinks: ["https://drive.google.com/file/d/abc/view"] }).success));
  it("free trial: rejects http:// and non-URL links", () => { assert.equal(trialSchema.safeParse({ ...base, imageCount: 3, fileLinks: ["http://x.com/a"] }).success, false); assert.equal(trialSchema.safeParse({ ...base, imageCount: 3, fileLinks: ["not a url"] }).success, false); });
  it("free trial: max 10 links, custom quantity up to 50", () => { assert.equal(trialSchema.safeParse({ ...base, imageCount: 3, fileLinks: Array(11).fill("https://a.com/x") }).success, false); assert.equal(trialSchema.safeParse({ ...base, imageCount: 51, fileLinks: ["https://a.com/x"] }).success, false); assert.ok(trialSchema.safeParse({ ...base, imageCount: "7", fileLinks: ["https://a.com/x"] }).success); });
  it("quote: links optional, files optional, quantity required", () => { assert.ok(quoteSchema.safeParse({ ...base, quantity: 5, complexity: "MEDIUM" }).success); assert.equal(quoteSchema.safeParse({ ...base, complexity: "MEDIUM" }).success, false); assert.ok(quoteSchema.safeParse({ ...base, quantity: 5, complexity: "SIMPLE", fileLinks: ["https://www.dropbox.com/s/x/y.zip?dl=0"] }).success); });
  it("honeypot field must stay empty; contact message min length", () => { assert.equal(contactSchema.safeParse({ name: "Jo", email: "a@b.co", message: "Hello there friend", website: "bot" }).success, false); assert.equal(contactSchema.safeParse({ name: "Jo", email: "a@b.co", message: "short" }).success, false); });
  it("service schema: hiddenSections enum + new SEO fields", () => { const ok = serviceSchema.safeParse({ name: "Clip", slug: "clip", hiddenSections: ["faq", "related"], ogTitle: "T", nofollow: true }); assert.ok(ok.success); assert.equal(serviceSchema.safeParse({ name: "Clip", slug: "clip", hiddenSections: ["hack"] }).success, false); });
  it("walkMediaIds finds nested media ids (lists)", () => { const ids = walkMediaIds(COLLECTIONS.portfolio.fields, { beforeId: "a", examples: [{ beforeId: "b", afterId: "c" }] }); assert.deepEqual([...ids].sort(), ["a", "b", "c"]); });
  it("seed data: every service has 2 unique content cards", () => { for (const s of SERVICES) { assert.equal(CARDS[s.slug].length, 2, s.slug); assert.notEqual(CARDS[s.slug][0][0], CARDS[s.slug][1][0]); } });
  it("legal defaults are complete (sections, rights, cookie table)", () => { assert.ok((LEGAL_PRIVACY.match(/^## /gm) ?? []).length >= 12); assert.ok((LEGAL_TERMS.match(/^## /gm) ?? []).length >= 14); assert.ok(LEGAL_COOKIES.includes("ps_admin") && LEGAL_COOKIES.includes("| Name |")); assert.ok(LEGAL_PRIVACY.includes("Cloudinary") && LEGAL_PRIVACY.includes("California")); });
  it("Markdown renders legal tables + h2 and is XSS-safe", () => { const h = renderToStaticMarkup(<Markdown source={LEGAL_COOKIES} />); assert.ok(h.includes("<table") && h.includes("<h2")); const x = renderToStaticMarkup(<Markdown source={'<script>alert(1)</script> [bad](javascript:alert(1)) ![x](javascript:alert(2)) **ok**'} />); assert.ok(!x.includes("<script") && !x.includes('href="javascript') && !x.includes('src="javascript') && x.includes("<strong>ok</strong>")); });
  it("Markdown ## renders as <h2>, ### as <h3>", () => { const h = renderToStaticMarkup(<Markdown source={"## A\n\n### B"} />); assert.ok(h.includes("<h2") && h.includes("<h3")); });
});
