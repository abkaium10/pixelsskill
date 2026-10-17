/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { ApiError } from "./serviceSave";
import { COLLECTIONS, SINGLETONS, blank, walkMediaIds, singleton, collection, type Collection, type Field } from "./defs";
import { buildSchema, flattenIssues } from "./schemaFromDefs";

export type MediaLite = { id: string; secureUrl: string; resourceType: string; originalName: string | null; alt: string | null; width: number | null; height: number | null };
const delegate = (tx: any, model: string) => tx[model];

export async function loadMedia(ids: Iterable<string>): Promise<Record<string, MediaLite>> {
  const list = [...ids]; if (!list.length) return {};
  const rows = await db.media.findMany({ where: { id: { in: list } }, select: { id: true, secureUrl: true, resourceType: true, originalName: true, alt: true, width: true, height: true } });
  return Object.fromEntries(rows.map((r) => [r.id, r]));
}
export const mediaMap = cache(async (ids: (string | null | undefined)[]) => loadMedia(new Set(ids.filter((x): x is string => !!x))));

export async function loadRelations(fields: Field[]) {
  const out: Record<string, { id: string; label: string }[]> = {};
  if (fields.some((f) => f.type === "relation")) {
    const services = await db.service.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
    for (const f of fields) if (f.type === "relation") out[f.name] = services.map((s) => ({ id: s.id, label: s.name }));
  }
  return out;
}

const plain = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

/* ---------- conversion ---------- */
function toDb(fields: Field[], d: Record<string, any>) {
  const o: Record<string, any> = {};
  for (const f of fields) {
    if (f.type === "list") continue;
    let v = d[f.name];
    if (f.type === "datetime") v = v ? new Date(v) : null;
    if (f.type === "money" && v === "") v = null;
    o[f.name] = v;
  }
  return o;
}

function cleanLinks(fields: Field[], d: Record<string, any>) {
  void fields; void d;
}

/* ---------- collections ---------- */
export async function listCollection(def: Collection, opts: { q?: string; status?: string; page?: number; take?: number }) {
  const take = opts.take ?? 20, page = Math.max(1, opts.page ?? 1);
  const where: any = {};
  if (opts.q) where.OR = def.search.map((f) => ({ [f]: { contains: opts.q, mode: "insensitive" } }));
  if (def.hasStatus && opts.status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(opts.status)) where.status = opts.status;
  const m = delegate(db, def.model);
  const [items, total] = await Promise.all([m.findMany({ where, orderBy: def.order, skip: (page - 1) * take, take }), m.count({ where })]);
  return { items: plain(items) as Record<string, any>[], total, pages: Math.max(1, Math.ceil(total / take)), page };
}

export async function getCollectionRecord(def: Collection, id: string) {
  const include: any = {};
  for (const f of def.fields) if (f.type === "list" && f.child) include[f.name] = { orderBy: { displayOrder: "asc" } };
  const rec = await delegate(db, def.model).findUnique({ where: { id }, include: Object.keys(include).length ? include : undefined });
  if (!rec) return null;
  const r = plain(rec) as Record<string, any>;
  for (const f of def.fields) if (f.type === "datetime" && r[f.name]) r[f.name] = new Date(r[f.name]).toISOString();
  return r;
}

function assertPublishable(def: Collection, data: Record<string, any>) {
  if (!def.hasStatus || data.status !== "PUBLISHED") return;
  const req = [...(def.requiredToPublish ?? []), ...def.fields.filter((f) => f.publishRequired).map((f) => f.name)];
  const missing = [...new Set(req)].filter((n) => { const v = data[n]; return v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length); });
  if (missing.length) {
    const fields = Object.fromEntries(missing.map((n) => [n, ["Required to publish"]]));
    throw new ApiError(422, `Cannot publish: ${missing.join(", ")} required`, fields);
  }
}

export async function saveCollection(def: Collection, input: unknown, id?: string) {
  const parsed = buildSchema(def.fields).safeParse(input);
  if (!parsed.success) throw new ApiError(422, "Validation failed", flattenIssues(parsed.error));
  const data = parsed.data as Record<string, any>;
  assertPublishable(def, data);

  // redirect-specific rules
  if (def.key === "redirects") {
    const errs: Record<string, string[]> = {};
    if (!data.source.startsWith("/") || data.source.startsWith("//")) errs.source = ["Source must start with a single /"];
    if (!(data.target.startsWith("/") && !data.target.startsWith("//")) && !/^https?:\/\//i.test(data.target)) errs.target = ["Destination must be a path or http(s) URL"];
    if (data.source === data.target) errs.target = ["A redirect cannot point to itself"];
    if (Object.keys(errs).length) throw new ApiError(422, "Validation failed", errs);
  }

  const m = delegate(db, def.model);
  const slugField = def.fields.find((f) => f.type === "slug");
  if (slugField) {
    const clash = await m.findFirst({ where: { [slugField.name]: data[slugField.name], NOT: id ? { id } : undefined }, select: { id: true } });
    if (clash) throw new ApiError(409, "Slug already in use", { [slugField.name]: ["This slug is already used"] });
  }
  if (def.key === "redirects") {
    const clash = await m.findFirst({ where: { source: data.source, NOT: id ? { id } : undefined }, select: { id: true } });
    if (clash) throw new ApiError(409, "Duplicate redirect", { source: ["A redirect for this path already exists"] });
  }

  // referenced media must exist
  const mediaIds = walkMediaIds(def.fields, data);
  if (mediaIds.size) { const n = await db.media.count({ where: { id: { in: [...mediaIds] } } }); if (n !== mediaIds.size) throw new ApiError(422, "One or more selected media assets no longer exist"); }

  const scalars = toDb(def.fields, data);
  const saved = await db.$transaction(async (tx) => {
    const t = delegate(tx, def.model);
    const prev = id ? await t.findUnique({ where: { id } }) : null;
    if (id && !prev) throw new ApiError(404, "Not found");
    if (def.publishedAt) scalars.publishedAt = data.status === "PUBLISHED" ? prev?.publishedAt ?? new Date() : prev?.publishedAt ?? null;
    const rec = id ? await t.update({ where: { id }, data: scalars }) : await t.create({ data: scalars });
    for (const f of def.fields) {
      if (f.type !== "list" || !f.child) continue;
      const items: Record<string, any>[] = data[f.name] ?? [];
      const keep = items.filter((i) => i.id).map((i) => i.id as string);
      const c = delegate(tx, f.child.model);
      await c.deleteMany({ where: { [f.child.fk]: rec.id, id: { notIn: keep } } });
      for (const [i, item] of items.entries()) {
        const { id: itemId, ...rest } = item;
        const row = { ...toDb(f.fields ?? [], rest), displayOrder: i };
        if (itemId) await c.updateMany({ where: { id: itemId, [f.child.fk]: rec.id }, data: row });
        else await c.create({ data: { ...row, [f.child.fk]: rec.id } });
      }
    }
    return rec;
  });
  revalidateCollection(def, saved.slug);
  return saved;
}

export async function deleteCollection(def: Collection, id: string, hard: boolean) {
  const m = delegate(db, def.model);
  const rec = await m.findUnique({ where: { id } });
  if (!rec) throw new ApiError(404, "Not found");
  if (hard || !def.hasStatus) await m.delete({ where: { id } }); else await m.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateCollection(def, rec.slug);
}

export function revalidateCollection(def: Collection, slug?: string) {
  const base: Record<string, string[]> = { pricing: ["/pricing"], portfolio: ["/portfolio"], blog: ["/blog"], testimonials: [], faqs: ["/faq"], offers: ["/offers"], redirects: [] };
  for (const p of base[def.key] ?? []) revalidatePath(p);
  if (def.publicPath && slug) revalidatePath(def.publicPath({ slug }) ?? "/");
  revalidatePath("/"); revalidatePath("/sitemap.xml"); revalidatePath("/services/[slug]", "page");
}

/* ---------- singleton settings ---------- */
function merge(base: any, over: any): any {
  if (Array.isArray(over)) return over;
  if (over && typeof over === "object" && base && typeof base === "object" && !Array.isArray(base)) { const o = { ...base }; for (const k of Object.keys(over)) o[k] = merge(base[k], over[k]); return o; }
  return over === undefined ? base : over;
}
import { DEFAULTS } from "./defaults";
export const getSetting = cache(async (key: string): Promise<Record<string, any>> => {
  const def = singleton(key);
  const row = await db.siteSetting.findUnique({ where: { key } }).catch(() => null);
  return merge(merge(def ? blank(def.fields) : {}, DEFAULTS[key] ?? {}), row?.value ?? {});
});

export async function saveSetting(key: string, input: unknown) {
  const def = singleton(key); if (!def) throw new ApiError(404, "Unknown settings group");
  const parsed = buildSchema(def.fields).safeParse(input);
  if (!parsed.success) throw new ApiError(422, "Validation failed", flattenIssues(parsed.error));
  const data = parsed.data as Record<string, any>;
  const ids = walkMediaIds(def.fields, data);
  if (ids.size) { const n = await db.media.count({ where: { id: { in: [...ids] } } }); if (n !== ids.size) throw new ApiError(422, "One or more selected media assets no longer exist"); }
  if (key === "homepage") {
    const seen = new Set<string>();
    for (const s of data.sections as { key: string }[]) { if (seen.has(s.key)) throw new ApiError(422, "Each section can appear only once", { sections: [`Duplicate section: ${s.key}`] }); seen.add(s.key); }
  }
  if (key === "site" && data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) throw new ApiError(422, "Validation failed", { email: ["Enter a valid email address"] });
  if (key === "site" && (data.extraDisallow as string[]).some((p) => !p.startsWith("/") || p.startsWith("//") || /\s/.test(p))) throw new ApiError(422, "Validation failed", { extraDisallow: ["Each path must start with a single / and contain no spaces"] });
  if (key === "site" && data.plausibleDomain && !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(data.plausibleDomain)) throw new ApiError(422, "Validation failed", { plausibleDomain: ["Enter a bare domain such as example.com"] });
  if (key === "page_contact" && data.mapEmbedUrl && !/^https:\/\//i.test(data.mapEmbedUrl)) throw new ApiError(422, "Validation failed", { mapEmbedUrl: ["Map URL must start with https://"] });
  await db.siteSetting.upsert({ where: { key }, update: { value: data as Prisma.InputJsonValue }, create: { key, value: data as Prisma.InputJsonValue } });
  for (const p of def.paths) revalidatePath(p);
  if (def.group === "core") revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  return data;
}

export { COLLECTIONS, SINGLETONS, collection, singleton };
void cleanLinks;
