import { describe, it } from "vitest";
import assert from "node:assert/strict";
import { subscribeSchema, csvCell, xmlEscape, cleanQuery } from "../src/lib/subscribe";
import { COLLECTIONS, SINGLETONS, blank, singleton } from "../src/lib/defs";
import { buildSchema } from "../src/lib/schemaFromDefs";
import { DEFAULTS } from "../src/lib/defaults";
import { LEGAL_PRIVACY, LEGAL_COOKIES } from "../src/lib/legalDefaults";

describe("newsletter, CSV/RSS escaping, search query, site settings", () => {
  it("subscribe: valid email + consent accepted, email lower-cased and trimmed", () => { const r = subscribeSchema.safeParse({ email: "  Me@Example.COM ", consent: true }); assert.ok(r.success); assert.equal(r.success && r.data.email, "me@example.com"); });
  it("subscribe: rejects missing consent, bad email, honeypot", () => { assert.equal(subscribeSchema.safeParse({ email: "a@b.co", consent: false }).success, false); assert.equal(subscribeSchema.safeParse({ email: "nope", consent: true }).success, false); assert.equal(subscribeSchema.safeParse({ email: "a@b.co", consent: true, website: "bot" }).success, false); });
  it("CSV export neutralises formula injection and escapes quotes", () => { assert.equal(csvCell("=HYPERLINK(\"x\")"), `"'=HYPERLINK(""x"")"`); assert.equal(csvCell("+1"), `"'+1"`); assert.equal(csvCell("@cmd"), `"'@cmd"`); assert.equal(csvCell("-2"), `"'-2"`); assert.equal(csvCell('a"b'), '"a""b"'); assert.equal(csvCell(new Date("2026-10-14T00:00:00Z")), '"2026-10-14T00:00:00.000Z"'); });
  it("RSS escaping prevents XML injection", () => { const x = xmlEscape(`</title><script>alert("x")</script> & 'q'`); assert.ok(!x.includes("<") && !x.includes(">") && x.includes("&amp;")); });
  it("search query is length-limited and control/HTML chars stripped", () => { assert.equal(cleanQuery("a".repeat(500)).length, 80); assert.ok(!/[<>]/.test(cleanQuery("<img src=x onerror=1>")) && !cleanQuery("x\u0000y").includes("\u0000")); assert.equal(cleanQuery(undefined), ""); });
  it("site settings: booking URL + analytics domain fields exist; booking rejects javascript:", () => { const f = SINGLETONS.site.fields; assert.ok(f.some((x) => x.name === "bookingUrl") && f.some((x) => x.name === "plausibleDomain")); const s = buildSchema(f); assert.equal(s.safeParse({ ...blank(f), bookingUrl: "javascript:alert(1)" }).success, false); assert.ok(s.safeParse({ ...blank(f), bookingUrl: "https://cal.com/pixelskill" }).success); });
  it("reviews page settings + testimonial service field exist", () => { assert.ok(singleton("page_testimonials")); assert.ok(COLLECTIONS.testimonials.fields.some((x) => x.name === "serviceName") && COLLECTIONS.testimonials.fields.some((x) => x.name === "isSample")); });
  it("footer defaults link Reviews + Search; nav has Portfolio", () => { const cols = JSON.stringify(DEFAULTS.navigation.footerColumns); assert.ok(cols.includes("/testimonials") && cols.includes("/search")); assert.ok(JSON.stringify(DEFAULTS.navigation.navItems).includes("/portfolio")); });
  it("legal texts mention newsletter + analytics and are complete", () => { assert.ok(LEGAL_PRIVACY.includes("Newsletter") && LEGAL_PRIVACY.includes("cookieless")); assert.ok(LEGAL_COOKIES.includes("Analytics") && (LEGAL_COOKIES.match(/^## /gm) ?? []).length >= 9); });
  it("every singleton still validates with blank + defaults", () => { for (const s of Object.values(SINGLETONS)) { const r = buildSchema(s.fields).safeParse({ ...blank(s.fields), ...(DEFAULTS[s.key] ?? {}) }); assert.ok(r.success, s.key + (r.success ? "" : JSON.stringify(r.error.issues[0]))); } });
});
