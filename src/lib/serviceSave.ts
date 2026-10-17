import { Prisma } from "@prisma/client";
import { db } from "./db";
import { serviceSchema, type ServiceInput } from "./validators";
import { revalidateService } from "./revalidate";

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string[]>) { super(message); }
}

export function parseService(body: unknown): ServiceInput {
  const r = serviceSchema.safeParse(body);
  if (!r.success) throw new ApiError(422, "Validation failed", r.error.flatten().fieldErrors as Record<string, string[]>);
  return r.data;
}

async function assertMediaExists(ids: (string | null | undefined)[]) {
  const wanted = [...new Set(ids.filter((x): x is string => !!x))];
  if (!wanted.length) return;
  const found = await db.media.count({ where: { id: { in: wanted } } });
  if (found !== wanted.length) throw new ApiError(422, "One or more selected media assets no longer exist");
}

/** Publishing requires the minimum content that makes the public page non-broken. */
function assertPublishable(d: ServiceInput) {
  if (d.status !== "PUBLISHED") return;
  const missing: string[] = [];
  if (!d.heroHeading) missing.push("heroHeading");
  if (!d.heroBeforeId) missing.push("heroBeforeId");
  if (!d.heroAfterId) missing.push("heroAfterId");
  if (!d.beforeAlt || !d.afterAlt) missing.push("beforeAlt/afterAlt");
  if (missing.length) throw new ApiError(422, `Cannot publish: missing ${missing.join(", ")}`, { publish: missing });
}

export async function saveService(d: ServiceInput, id?: string) {
  assertPublishable(d);
  await assertMediaExists([d.heroBeforeId, d.heroAfterId, d.ogImageId, ...d.cards.flatMap((c) => [c.beforeId, c.afterId])]);

  const clash = await db.service.findFirst({ where: { slug: d.slug, NOT: id ? { id } : undefined }, select: { id: true } });
  if (clash) throw new ApiError(409, "Slug already in use", { slug: ["This slug is already used by another service"] });

  const { cards, ...rest } = d;
  const data = {
    ...rest,
    features: rest.features as Prisma.InputJsonValue,
    benefits: rest.benefits as Prisma.InputJsonValue,
    workflow: rest.workflow as Prisma.InputJsonValue,
    useCases: rest.useCases as Prisma.InputJsonValue,
    faqs: rest.faqs as Prisma.InputJsonValue,
  };

  const saved = await db.$transaction(async (tx) => {
    const prev = id ? await tx.service.findUnique({ where: { id }, select: { slug: true, status: true, publishedAt: true } }) : null;
    if (id && !prev) throw new ApiError(404, "Service not found");
    const publishedAt = d.status === "PUBLISHED" ? prev?.publishedAt ?? new Date() : prev?.publishedAt ?? null;

    const svc = id
      ? await tx.service.update({ where: { id }, data: { ...data, publishedAt } })
      : await tx.service.create({ data: { ...data, publishedAt } });

    // Replace-by-diff so editing one card never touches siblings
    const keepIds = cards.filter((c) => c.id).map((c) => c.id!) ;
    await tx.serviceCard.deleteMany({ where: { serviceId: svc.id, id: { notIn: keepIds } } });
    for (const [i, c] of cards.entries()) {
      const cardData = { title: c.title, description: c.description, beforeId: c.beforeId ?? null, afterId: c.afterId ?? null, displayOrder: i };
      if (c.id) await tx.serviceCard.updateMany({ where: { id: c.id, serviceId: svc.id }, data: cardData });
      else await tx.serviceCard.create({ data: { ...cardData, serviceId: svc.id } });
    }

    // Slug change on a published service -> permanent redirect from old URL
    if (prev && prev.slug !== svc.slug && prev.status === "PUBLISHED") {
      await tx.redirect.upsert({ where: { source: `/services/${prev.slug}` }, update: { target: `/services/${svc.slug}`, active: true }, create: { source: `/services/${prev.slug}`, target: `/services/${svc.slug}` } });
    }
    return { svc, oldSlug: prev?.slug };
  });

  revalidateService(saved.svc.slug, saved.oldSlug);
  return saved.svc;
}
