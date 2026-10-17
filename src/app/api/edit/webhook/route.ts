import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  jobId: z.string().min(1).max(64),
  status: z.enum(["PROCESSING", "DONE", "FAILED"]),
  error: z.string().max(300).optional(),
  outputs: z.array(z.object({ name: z.string().max(200), url: z.string().url().max(1000).refine((u) => u.startsWith("https://"), "https only") })).max(50).default([]),
});

/** Called by your external editing service (HTTP provider). Verifies an HMAC-SHA256 signature of the raw body. */
export async function POST(req: Request) {
  const secret = process.env.EDIT_WEBHOOK_SECRET;
  const raw = await req.text();
  const sig = req.headers.get("x-signature") ?? "";
  const want = secret ? createHmac("sha256", secret).update(raw).digest("hex") : "";
  if (!secret || sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const p = schema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  await db.editJob.updateMany({ where: { id: p.data.jobId }, data: { status: p.data.status, error: p.data.error ?? null, ...(p.data.outputs.length ? { outputs: p.data.outputs } : {}) } });
  return NextResponse.json({ ok: true });
}
