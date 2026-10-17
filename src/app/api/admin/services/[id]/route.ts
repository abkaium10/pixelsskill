import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { parseService, saveService } from "@/lib/serviceSave";
import { revalidateService } from "@/lib/revalidate";
import { handle } from "@/lib/apiError";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const g = await guardApi(); if ("error" in g) return g.error;
  const { id } = await params;
  const s = await db.service.findUnique({ where: { id }, include: { cards: { orderBy: { displayOrder: "asc" } } } });
  return s ? NextResponse.json(s) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  try {
    const { id } = await params;
    const svc = await saveService(parseService(await req.json()), id);
    return NextResponse.json({ id: svc.id, slug: svc.slug });
  } catch (e) { return handle(e); }
}

/** Soft delete: archive. Add ?hard=1 to permanently remove. */
export async function DELETE(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const { id } = await params;
  const hard = new URL(req.url).searchParams.get("hard") === "1";
  const s = await db.service.findUnique({ where: { id }, select: { slug: true } });
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (hard) await db.service.delete({ where: { id } });
  else await db.service.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateService(s.slug);
  return NextResponse.json({ ok: true });
}
