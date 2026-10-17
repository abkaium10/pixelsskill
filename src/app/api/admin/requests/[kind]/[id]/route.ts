import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";

type Ctx = { params: Promise<{ kind: string; id: string }> };
const status = z.enum(["PENDING", "REVIEWING", "QUOTED", "APPROVED", "COMPLETED", "CANCELLED"]);
const quotePatch = z.object({ status, internalNotes: z.string().max(5000).default(""), proposedPrice: z.string().regex(/^\d{1,8}(\.\d{1,2})?$/).or(z.literal("")).default(""), proposedTurnaround: z.string().max(120).default("") });
const trialPatch = z.object({ status, internalNotes: z.string().max(5000).default("") });
const contactPatch = z.object({ read: z.boolean() });

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const { kind, id } = await params; const body = await req.json().catch(() => null);
  try {
    if (kind === "quotes") { const p = quotePatch.parse(body); await db.quote.update({ where: { id }, data: { status: p.status, internalNotes: p.internalNotes, proposedPrice: p.proposedPrice === "" ? null : p.proposedPrice, proposedTurnaround: p.proposedTurnaround || null } }); }
    else if (kind === "free-trial") { const p = trialPatch.parse(body); await db.freeTrial.update({ where: { id }, data: p }); }
    else if (kind === "contacts") { await db.contactMessage.update({ where: { id }, data: contactPatch.parse(body) }); }
    else return NextResponse.json({ error: "Unknown kind" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e instanceof z.ZodError ? "Invalid values" : "Not found" }, { status: 422 }); }
}
export async function DELETE(_: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const { kind, id } = await params;
  if (kind === "contacts") await db.contactMessage.delete({ where: { id } }).catch(() => undefined);
  else if (kind === "quotes") await db.quote.delete({ where: { id } }).catch(() => undefined);
  else if (kind === "free-trial") await db.freeTrial.delete({ where: { id } }).catch(() => undefined);
  else return NextResponse.json({ error: "Unknown kind" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
