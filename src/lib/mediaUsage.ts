/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "./db";
/** Finds everything that references a media asset (FK relations, plain-id columns and settings JSON). */
export async function mediaUsage(id: string): Promise<string[]> {
  const used: string[] = [];
  const [svc, cards, pc, pe, pi, bp, tm, of, ss] = await Promise.all([
    db.service.findMany({ where: { OR: [{ heroBeforeId: id }, { heroAfterId: id }, { ogImageId: id }] }, select: { name: true } }),
    db.serviceCard.findMany({ where: { OR: [{ beforeId: id }, { afterId: id }] }, select: { service: { select: { name: true } } } }),
    db.pricingCard.findMany({ where: { OR: [{ beforeId: id }, { afterId: id }] }, select: { title: true } }),
    db.portfolioExample.findMany({ where: { OR: [{ beforeId: id }, { afterId: id }] }, select: { item: { select: { title: true } } } }),
    db.portfolioItem.findMany({ where: { OR: [{ beforeId: id }, { afterId: id }, { thumbnailId: id }, { ogImageId: id }] }, select: { title: true } }),
    db.blogPost.findMany({ where: { OR: [{ coverId: id }, { ogImageId: id }] }, select: { title: true } }),
    db.testimonial.findMany({ where: { avatarId: id }, select: { name: true } }),
    db.offer.findMany({ where: { OR: [{ bannerId: id }, { ogImageId: id }] }, select: { title: true } }),
    db.siteSetting.findMany(),
  ]);
  svc.forEach((s) => used.push(`Service: ${s.name}`)); cards.forEach((c) => used.push(`Service card: ${c.service.name}`));
  pc.forEach((c) => used.push(`Pricing: ${c.title}`)); pe.forEach((c) => used.push(`Portfolio example: ${c.item.title}`)); pi.forEach((c) => used.push(`Portfolio: ${c.title}`));
  bp.forEach((c) => used.push(`Blog: ${c.title}`)); tm.forEach((c) => used.push(`Testimonial: ${c.name}`)); of.forEach((c) => used.push(`Offer: ${c.title}`));
  (ss as any[]).forEach((s) => { if (JSON.stringify(s.value).includes(id)) used.push(`Settings: ${s.key}`); });
  return used;
}
