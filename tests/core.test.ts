import { describe, it, expect } from "vitest";
import { slugify } from "../src/lib/slug";
import { serviceSchema } from "../src/lib/validators";
import { hashPassword, verifyPassword } from "../src/lib/auth-hash";
import { cld } from "../src/lib/cld";
import { jsonLd } from "../src/lib/jsonld";

describe("core", () => {
  it("slugifies", () => { expect(slugify("E-commerce Photo Editing")).toBe("e-commerce-photo-editing"); });
  it("rejects bad slug and javascript: canonical", () => {
    expect(serviceSchema.safeParse({ name: "X Y", slug: "Bad Slug" }).success).toBe(false);
    expect(serviceSchema.safeParse({ name: "X Y", slug: "ok", canonicalUrl: "javascript:alert(1)" }).success).toBe(false);
  });
  it("accepts minimal service", () => { const r = serviceSchema.safeParse({ name: "Clipping", slug: "clipping" }); expect(r.success).toBe(true); });
  it("hash verify", () => { const h = hashPassword("correct horse battery"); expect(verifyPassword("correct horse battery", h)).toBe(true); expect(verifyPassword("nope", h)).toBe(false); });
  it("cld transforms only cloudinary urls", () => { expect(cld("https://res.cloudinary.com/x/image/upload/a.jpg", 300)).toContain("f_auto,q_auto,w_300"); expect(cld("/samples/a.svg")).toBe("/samples/a.svg"); });
  it("jsonld escapes script close", () => { expect(jsonLd({ a: "</script>" })).not.toContain("</script>"); });
});

import { COLLECTIONS, SINGLETONS, blank } from "../src/lib/defs";
import { buildSchema } from "../src/lib/schemaFromDefs";
describe("definition-driven validation", () => {
  it("pricing: rejects bad money, accepts nested options", () => {
    const s = buildSchema(COLLECTIONS.pricing.fields);
    expect(s.safeParse({ ...blank(COLLECTIONS.pricing.fields), title: "Clipping", startingPrice: "abc" }).success).toBe(false);
    const ok = s.safeParse({ ...blank(COLLECTIONS.pricing.fields), title: "Clipping", startingPrice: "0.49", options: [{ title: "Simple", price: "0.49" }, { title: "Complex", price: "2.40" }] });
    expect(ok.success).toBe(true);
  });
  it("urls: blocks javascript: links in navigation", () => {
    const s = buildSchema(SINGLETONS.navigation.fields);
    const bad = s.safeParse({ ...blank(SINGLETONS.navigation.fields), navItems: [{ label: "x", href: "javascript:alert(1)" }] });
    expect(bad.success).toBe(false);
  });
  it("every collection and singleton schema builds with its own blank defaults", () => {
    for (const c of Object.values(COLLECTIONS)) expect(() => buildSchema(c.fields)).not.toThrow();
    for (const s of Object.values(SINGLETONS)) expect(() => buildSchema(s.fields)).not.toThrow();
  });
});
