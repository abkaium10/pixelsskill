import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { ZodTypeAny, z } from "zod";
import { rateLimit } from "./rateLimit";
import { flattenIssues } from "./schemaFromDefs";

/** Shared protection for public form endpoints: size, same-origin, rate limit, validation, honeypot. */
export async function readPublicForm<S extends ZodTypeAny>(req: Request, name: string, schema: S, max = 5, windowMin = 10): Promise<{ data: z.infer<S> } | { res: NextResponse }> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`${name}:${ip}`, max, windowMin * 60 * 1000)) return { res: NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 }) };
  const origin = h.get("origin");
  if (origin && new URL(origin).host !== h.get("host")) return { res: NextResponse.json({ error: "Bad origin" }, { status: 403 }) };
  if (Number(h.get("content-length") ?? 0) > 100_000) return { res: NextResponse.json({ error: "Request too large" }, { status: 413 }) };
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return { res: NextResponse.json({ error: "Please check the highlighted fields", fields: flattenIssues(parsed.error) }, { status: 422 }) };
  if ((parsed.data as { website?: string }).website) return { res: NextResponse.json({ ok: true }) }; // bots get a fake success
  return { data: parsed.data };
}
