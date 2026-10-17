import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { flattenIssues } from "@/lib/schemaFromDefs";
import { createJob, editingConfig, jobSchema } from "@/features/editing/service";

/** Returns 404 unless the studio is switched on in Admin → Online editing. */
export async function POST(req: Request) {
  if (!(await editingConfig()).enabled) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const origin = h.get("origin");
  if (origin && new URL(origin).host !== h.get("host")) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!rateLimit(`edit:${ip}`, 10, 3600_000)) return NextResponse.json({ error: "Too many jobs. Please try again later." }, { status: 429 });
  if (Number(h.get("content-length") ?? 0) > 60_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const p = jobSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Please check the highlighted fields", fields: flattenIssues(p.error) }, { status: 422 });
  if (p.data.website) return NextResponse.json({ ok: true }); // honeypot
  try {
    return NextResponse.json(await createJob(p.data), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not create the job" }, { status: 422 });
  }
}
