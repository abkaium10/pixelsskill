import { z, type ZodTypeAny } from "zod";
import type { Field } from "./defs";

export const safeHref = (v: string) => v === "" || v.startsWith("/") && !v.startsWith("//") || /^https?:\/\//i.test(v) || /^(mailto|tel):/i.test(v);

function one(fl: Field): ZodTypeAny {
  const max = fl.max ?? 500;
  switch (fl.type) {
    case "text": case "textarea": case "markdown": {
      const s = z.string().trim().max(max);
      return fl.required ? s.min(1, `${fl.label} is required`) : s.default("");
    }
    case "slug": return z.string().trim().min(2, "Slug is required").max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");
    case "url": { const u = z.string().trim().max(fl.max ?? 500).refine(safeHref, "Use a path starting with / or an http(s) URL"); return fl.required ? u.refine((v) => v.length > 0, `${fl.label} is required`) : u.default(""); }
    case "money": { const s = z.string().trim().regex(/^\d{1,8}(\.\d{1,2})?$/, "Enter a valid amount, e.g. 0.49"); return fl.required ? s : s.or(z.literal("")); }
    case "number": {
      const n = z.coerce.number().finite().min(fl.min ?? -1e9).max(fl.max ?? 1e9);
      return fl.nullable ? z.union([z.literal("").transform(() => null), z.null(), n.transform((x) => x as number | null)]).default(null) : n.default(Number(fl.default ?? 0));
    }
    case "checkbox": return z.boolean().default(Boolean(fl.default));
    case "select": { const vals = (fl.options ?? []).map((o) => o.value); return z.string().refine((v) => vals.includes(v), "Invalid choice").default(String(fl.default ?? vals[0] ?? "")); }
    case "media": case "video": case "relation": return z.string().max(64).nullable().optional().transform((v) => v || null);
    case "datetime": return z.string().nullable().optional().transform((v) => (v ? v : null)).refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Invalid date");
    case "tags": return z.array(z.string().trim().min(1).max(40)).max(30).default([]);
    case "list": {
      const item = z.object({ id: z.string().optional(), ...shape(fl.fields ?? []) });
      return z.array(item).max(fl.maxItems ?? 100).default([]);
    }
  }
}
function shape(fields: Field[]) { return Object.fromEntries(fields.map((fl) => [fl.name, one(fl)])); }
export const buildSchema = (fields: Field[]) => z.object(shape(fields));

export function flattenIssues(err: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const i of err.issues) (out[i.path.join(".")] ??= []).push(i.message);
  return out;
}
