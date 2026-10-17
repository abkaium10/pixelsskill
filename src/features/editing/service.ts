import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/cms";
import { fileRef, privateDownloadUrl, verifyPrivateFiles } from "@/lib/privateUploads";
import { getProvider } from "./providers";
import type { FileRef } from "./types";

export const jobSchema = z.object({
  serviceSlug: z.string().trim().min(1).max(80),
  files: z.array(fileRef).min(1, "Upload at least one image").max(20),
  options: z.record(z.string().max(60), z.union([z.string().max(500), z.number(), z.boolean()])).refine((o) => Object.keys(o).length <= 20, "Too many options").default({}),
  email: z.union([z.literal(""), z.string().trim().email().max(200)]).optional().default(""),
  website: z.string().max(0).optional().default(""), // honeypot
});
const hash = (t: string) => createHash("sha256").update(t).digest("hex");

/** Feature gate: everything under /edit and /api/edit returns 404 unless it is switched on in Admin → Online editing. */
export async function editingConfig() {
  const c = await getSetting("editing");
  return { enabled: !!c.enabled, provider: String(c.provider), webhookUrl: String(c.webhookUrl ?? ""), maxFiles: Number(c.maxFiles) || 5, disclaimer: String(c.disclaimer ?? ""), services: (c.services ?? []) as { serviceSlug: string; enabled: boolean; label: string; note: string }[] };
}
export async function availableServices() {
  const cfg = await editingConfig(); const on = cfg.services.filter((s) => s.enabled);
  if (!on.length) return [];
  const rows = await db.service.findMany({ where: { status: "PUBLISHED", slug: { in: on.map((s) => s.serviceSlug) } }, select: { slug: true, name: true } });
  return rows.map((r) => { const s = on.find((x) => x.serviceSlug === r.slug)!; return { slug: r.slug, name: s.label || r.name, note: s.note }; });
}

export async function createJob(input: z.infer<typeof jobSchema>) {
  const cfg = await editingConfig();
  const svc = (await availableServices()).find((s) => s.slug === input.serviceSlug);
  if (!svc) throw new Error("This service is not available in the online studio");
  if (input.files.length > cfg.maxFiles) throw new Error(`You can upload up to ${cfg.maxFiles} files`);
  const inputs = await verifyPrivateFiles(input.files, "edit");
  const token = randomBytes(24).toString("hex");
  const job = await db.editJob.create({ data: { tokenHash: hash(token), serviceSlug: input.serviceSlug, provider: cfg.provider, email: input.email || null, inputs, options: input.options } });
  try {
    const provider = getProvider(cfg.provider, { webhookUrl: cfg.webhookUrl });
    const inputUrls = inputs.map((f) => privateDownloadUrl(f.publicId, f.format, f.resourceType));
    const r = await provider.submit({ id: job.id, serviceSlug: job.serviceSlug, inputs, options: input.options, inputUrls });
    await db.editJob.update({ where: { id: job.id }, data: { status: r.status ?? "PROCESSING", externalId: r.externalId ?? null, outputs: (r.outputs ?? []) as object[], error: r.error ?? null } });
  } catch (e) { await db.editJob.update({ where: { id: job.id }, data: { status: "FAILED", error: e instanceof Error ? e.message.slice(0, 300) : "Provider error" } }); }
  return { id: job.id, token };
}

export async function jobForToken(id: string, token: string | null) {
  if (!token || !/^[a-f0-9]{48}$/.test(token)) return null;
  const j = await db.editJob.findUnique({ where: { id } });
  return j && j.tokenHash === hash(token) ? j : null;
}
/** Output list with short-lived signed download URLs (private files) or the provider's https link. */
export function outputLinks(outputs: unknown): { name: string; url: string }[] {
  return ((outputs as FileRef[]) ?? []).flatMap((o) => (o.publicId ? [{ name: o.name, url: privateDownloadUrl(o.publicId, o.format ?? "jpg", o.resourceType ?? "image") }] : o.url && /^https:\/\//i.test(o.url) ? [{ name: o.name, url: o.url }] : []));
}
