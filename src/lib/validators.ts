import { z } from "zod";

const safeUrl = z.string().trim().max(500).refine((v) => v === "" || /^https?:\/\//i.test(v) || v.startsWith("/"), "URL must start with http(s):// or /");
const text = (max: number) => z.string().trim().max(max);
const idOrNull = z.string().min(1).max(64).nullable().optional().transform((v) => v || null);

export const SECTION_KEYS = ["overview", "examples", "features", "benefits", "workflow", "usecases", "formats", "faq", "related"] as const;
export const titledItem = z.object({ title: text(120), description: text(600).default("") });
export const faqItem = z.object({ question: text(200), answer: text(1500) });

export const cardSchema = z.object({
  id: z.string().optional(),
  title: text(120).min(1, "Card title is required"),
  description: text(600).default(""),
  beforeId: idOrNull,
  afterId: idOrNull,
});

export const slugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");

export const serviceSchema = z.object({
  name: text(100).min(2, "Service name is required"),
  slug: slugSchema,
  shortDescription: text(300).default(""),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  displayOrder: z.coerce.number().int().min(0).max(10000).default(0),
  featured: z.boolean().default(false),
  showInListing: z.boolean().default(true),
  heroHeading: text(160).default(""),
  heroDescription: text(800).default(""),
  heroBeforeId: idOrNull,
  heroAfterId: idOrNull,
  beforeAlt: text(200).default(""),
  afterAlt: text(200).default(""),
  sliderPosition: z.coerce.number().int().min(0).max(100).default(50),
  introduction: text(3000).default(""),
  features: z.array(titledItem).max(50).default([]),
  benefits: z.array(titledItem).max(50).default([]),
  workflow: z.array(titledItem).max(50).default([]),
  useCases: z.array(titledItem).max(50).default([]),
  outputFormats: z.array(text(20)).max(20).default([]),
  faqs: z.array(faqItem).max(50).default([]),
  relatedSlugs: z.array(slugSchema).max(20).default([]),
  seoTitle: text(120).default(""),
  metaDescription: text(320).default(""),
  canonicalUrl: safeUrl.default(""),
  focusKeyword: text(120).default(""),
  additionalKeywords: text(500).default(""),
  noindex: z.boolean().default(false),
  ogImageId: idOrNull,
  ogTitle: text(120).default(""),
  ogDescription: text(300).default(""),
  ogImageAlt: text(200).default(""),
  nofollow: z.boolean().default(false),
  hiddenSections: z.array(z.enum(SECTION_KEYS)).max(20).default([]),
  cards: z.array(cardSchema).max(100).default([]),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const loginSchema = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) });

export const mediaRegisterSchema = z.object({
  publicId: z.string().min(1).max(300),
  resourceType: z.enum(["image", "video"]),
  originalName: z.string().max(300).optional(),
});
export const mediaUpdateSchema = z.object({ alt: z.string().max(300) });
