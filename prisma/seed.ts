import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth-hash";
import { SERVICES, f } from "./serviceSeedData";
import { CARDS } from "./cardSeedData";
import { BLOGS, OFFERS } from "./contentSeedData";

const db = new PrismaClient();

/** Idempotent. Never overwrites content an admin has edited: services are only CREATED when missing. */
async function main() {
  for (const [i, s] of SERVICES.entries()) {
    const mk = (kind: "before" | "after") => db.media.upsert({
      where: { publicId: `sample/${s.slug}-${kind}` }, update: {},
      create: { publicId: `sample/${s.slug}-${kind}`, url: `/samples/${s.slug}-${kind}.svg`, secureUrl: `/samples/${s.slug}-${kind}.svg`, resourceType: "image", format: "svg", width: 800, height: 600, originalName: `${s.slug}-${kind}.svg`, alt: `Sample demonstration (${kind}) — not client work`, isSample: true },
    });
    const [before, after] = await Promise.all([mk("before"), mk("after")]);
    const exists = await db.service.findUnique({ where: { slug: s.slug }, select: { id: true } });
    const cardMedia = async (i: number, kind: "before" | "after") => db.media.upsert({ where: { publicId: `sample/${s.slug}-c${i}-${kind}` }, update: {}, create: { publicId: `sample/${s.slug}-c${i}-${kind}`, url: `/samples/${s.slug}-c${i}-${kind}.svg`, secureUrl: `/samples/${s.slug}-c${i}-${kind}.svg`, resourceType: "image", format: "svg", width: 800, height: 600, originalName: `${s.slug}-c${i}-${kind}.svg`, alt: `Sample demonstration (${kind}) — not client work`, isSample: true } });
    const cardPairs = await Promise.all([1, 2].map(async (i) => ({ i, before: await cardMedia(i, "before"), after: await cardMedia(i, "after") })));
    if (exists) continue;
    await db.service.create({ data: {
      name: s.name, slug: s.slug, shortDescription: s.short, status: "PUBLISHED", displayOrder: i, publishedAt: new Date(),
      heroHeading: s.hero, heroDescription: s.short, heroBeforeId: before.id, heroAfterId: after.id,
      beforeAlt: `Sample original image for ${s.name} (demonstration)`, afterAlt: `Sample ${s.name} result (demonstration)`, sliderPosition: 50,
      introduction: s.intro, features: f(s.features), benefits: f(s.benefits), workflow: f(s.workflow), useCases: f(s.uses),
      outputFormats: ["JPG", "PNG", "TIFF", "PSD", "WEBP"], faqs: s.faqs.map(([question, answer]) => ({ question, answer })), relatedSlugs: s.related,
      seoTitle: `${s.name} Service | PixelSkill`, metaDescription: `${s.short} Compare before/after examples, see pricing and try it free.`.slice(0, 158),
      cards: { create: cardPairs.map(({ i, before, after }) => ({ title: CARDS[s.slug][i - 1][0], description: CARDS[s.slug][i - 1][1], beforeId: before.id, afterId: after.id, displayOrder: i - 1 })) },
    } });
  }
  const seeded = await db.siteSetting.findUnique({ where: { key: "seed_samples_v1" } });
  if (!seeded) {
    const svcs = await db.service.findMany({ select: { id: true, name: true, slug: true, heroBeforeId: true, heroAfterId: true }, orderBy: { displayOrder: "asc" } });
    // Pricing: PLACEHOLDER values, clearly badged. Replace with your real prices in Admin → Pricing.
    for (const [i, sv] of svcs.entries()) await db.pricingCard.create({ data: { title: sv.name, subtitle: "Placeholder pricing", description: "Placeholder price — edit in Admin → Pricing.", badge: "Sample price", serviceId: sv.id, currency: "USD", startingPrice: "1.00", priceUnit: "per image", beforeId: sv.heroBeforeId, afterId: sv.heroAfterId, beforeAlt: `Sample original (${sv.name})`, afterAlt: `Sample result (${sv.name})`, displayOrder: i, status: "PUBLISHED", options: { create: [{ title: "Simple", description: "Placeholder option", price: "1.00", displayOrder: 0 }, { title: "Complex", description: "Placeholder option", price: "3.00", displayOrder: 1 }] } } });
    // Portfolio: clearly labelled SAMPLE demonstrations (not client work).
    for (const [i, sv] of svcs.slice(0, 6).entries()) await db.portfolioItem.create({ data: { title: `${sv.name} — sample demonstration`, slug: `sample-${sv.slug}`, description: "Sample demonstration, not client work. Replace with real projects in Admin → Portfolio.", body: "This is a **sample demonstration** created to show how before/after comparisons work.", category: sv.name, serviceId: sv.id, beforeId: sv.heroBeforeId, afterId: sv.heroAfterId, beforeAlt: "Sample original", afterAlt: "Sample edited result", featured: i < 3, displayOrder: i, status: "PUBLISHED", publishedAt: new Date(), seoTitle: `${sv.name} sample | PixelSkill`, metaDescription: "Sample before/after demonstration." } });
    const faqs: [string, string][] = [["Which file formats can I receive?", "JPG, PNG, TIFF, PSD and WEBP are supported as output formats."], ["Can I try the service first?", "Yes. Use the Free Trial page to upload a few original images."], ["How do I get a price?", "Send the details through the Get a Quote page and we will reply with pricing and turnaround."], ["Are my uploaded files private?", "Uploads from the quote and free trial forms are stored privately and are only accessible to the editing team."]];
    for (const [i, [question, answer]] of faqs.entries()) await db.faq.create({ data: { question, answer, category: "General", displayOrder: i, status: "PUBLISHED" } });
    await db.siteSetting.create({ data: { key: "seed_samples_v1", value: true } });
  }
  const tFlag = await db.siteSetting.findUnique({ where: { key: "seed_testimonials_v1" } });
  if (!tFlag) {
    // Design placeholders, clearly badged "Sample". Delete or replace them with real customer feedback in Admin → Testimonials.
    const t: [string, string, string][] = [["Sample testimonial — replace this with a real review from a real customer. Name the result: faster listings, cleaner catalog, fewer returns.", "Store owner", "Clipping Path"], ["[Sample] Mention turnaround or communication here. Short, specific feedback is more believable than a long generic quote.", "Photographer", "Image Masking"], ["[Sample] Describe how the edits matched the brief and what changed for your business.", "Jewelry brand", "Jewelry Photo Retouching"], ["[Sample] Say what it was like to work with the team, from the quote to delivery.", "Agency", "E-commerce Photo Editing"], ["[Sample] A line about consistency across a large catalog is very useful to other sellers.", "Marketplace seller", "Color Correction"], ["[Sample] Share how the free trial helped you decide.", "Studio", "Ghost Mannequin"]];
    for (const [i, [text, role, serviceName]] of t.entries()) await db.testimonial.create({ data: { name: "Customer name", role, text, serviceName, isSample: true, rating: 5, featured: i === 0, displayOrder: i, status: "PUBLISHED" } });
    await db.siteSetting.create({ data: { key: "seed_testimonials_v1", value: true } });
  }
  const cFlag = await db.siteSetting.findUnique({ where: { key: "seed_content_v1" } });
  if (!cFlag) {
    for (const [i, b] of BLOGS.entries()) await db.blogPost.create({ data: { title: b.title, slug: b.slug, excerpt: b.excerpt, content: b.content, category: b.category, authorName: "Sample article — replace", status: "PUBLISHED", publishedAt: new Date(Date.now() - i * 86400000), seoTitle: b.seoTitle, metaDescription: b.excerpt.slice(0, 156), featured: i === 0 } });
    for (const [i, o] of OFFERS.entries()) await db.offer.create({ data: { title: o.title, slug: o.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), badge: o.badge, description: o.description, ctaLabel: o.ctaLabel, ctaUrl: o.ctaUrl, displayOrder: i, featured: i === 0, status: "PUBLISHED", seoTitle: o.title, metaDescription: o.description.slice(0, 156) } });
    await db.siteSetting.create({ data: { key: "seed_content_v1", value: true } });
  }
  await db.siteSetting.upsert({ where: { key: "contact" }, update: {}, create: { key: "contact", value: { phone: "+1 757 540-4885", email: "info@pixelskill.com" } } });

  const email = process.env.ADMIN_EMAIL?.toLowerCase(); const pw = process.env.ADMIN_PASSWORD;
  if (email && pw) {
    if (pw.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    await db.admin.upsert({ where: { email }, update: {}, create: { email, passwordHash: hashPassword(pw) } });
    console.log(`Admin ready: ${email}`);
  } else console.log("ADMIN_EMAIL/ADMIN_PASSWORD not set — no admin created.");
  console.log(`Seeded ${SERVICES.length} services (existing ones untouched).`);
}
main().finally(() => db.$disconnect());
