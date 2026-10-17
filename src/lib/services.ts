import { cache } from "react";
import { db } from "./db";

const mediaSel = { select: { id: true, secureUrl: true, width: true, height: true, alt: true } } as const;
export const serviceInclude = {
  heroBefore: mediaSel, heroAfter: mediaSel, ogImage: mediaSel,
  cards: { orderBy: { displayOrder: "asc" as const }, include: { before: mediaSel, after: mediaSel } },
} as const;

export const getPublishedServices = cache(() =>
  db.service.findMany({ where: { status: "PUBLISHED", showInListing: true }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }], include: { heroBefore: mediaSel, heroAfter: mediaSel } }),
);
export const getPublishedService = cache((slug: string) =>
  db.service.findFirst({ where: { slug, status: "PUBLISHED" }, include: serviceInclude }),
);
export const getMenuServices = cache(() =>
  db.service.findMany({ where: { status: "PUBLISHED", showInListing: true }, orderBy: [{ displayOrder: "asc" }], select: { slug: true, name: true, shortDescription: true } }),
);
