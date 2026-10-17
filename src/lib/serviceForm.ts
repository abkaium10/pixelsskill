import type { ServiceForm } from "@/components/admin/ServiceEditor";
import type { MediaItem } from "@/components/media/MediaPicker";
import type { Media, Service, ServiceCard } from "@prisma/client";

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const m = (x: Media | null | undefined): MediaItem | null => (x ? { id: x.id, secureUrl: x.secureUrl, resourceType: x.resourceType, originalName: x.originalName, alt: x.alt, width: x.width, height: x.height } : null);
export type ServiceWithRels = Service & { heroBefore: Media | null; heroAfter: Media | null; ogImage: Media | null; cards: (ServiceCard & { before: Media | null; after: Media | null })[] };

export function toForm(s: ServiceWithRels): ServiceForm {
  return {
    name: s.name, slug: s.slug, shortDescription: s.shortDescription, status: s.status, displayOrder: s.displayOrder, featured: s.featured, showInListing: s.showInListing,
    heroHeading: s.heroHeading, heroDescription: s.heroDescription, heroBefore: m(s.heroBefore), heroAfter: m(s.heroAfter), beforeAlt: s.beforeAlt, afterAlt: s.afterAlt, sliderPosition: s.sliderPosition,
    introduction: s.introduction, features: arr(s.features), benefits: arr(s.benefits), workflow: arr(s.workflow), useCases: arr(s.useCases), outputFormats: s.outputFormats.join(", "), faqs: arr(s.faqs), relatedSlugs: s.relatedSlugs.join(", "),
    seoTitle: s.seoTitle, metaDescription: s.metaDescription, canonicalUrl: s.canonicalUrl, focusKeyword: s.focusKeyword, additionalKeywords: s.additionalKeywords, noindex: s.noindex, nofollow: s.nofollow, ogTitle: s.ogTitle, ogDescription: s.ogDescription, ogImageAlt: s.ogImageAlt, hiddenSections: s.hiddenSections, ogImage: m(s.ogImage),
    cards: s.cards.map((c) => ({ id: c.id, title: c.title, description: c.description, before: m(c.before), after: m(c.after) })),
  };
}
