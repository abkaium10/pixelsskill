import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { mediaUpdateSchema } from "@/lib/validators";
import { mediaUsage } from "@/lib/mediaUsage";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const p = mediaUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  const { id } = await params;
  return NextResponse.json(await db.media.update({ where: { id }, data: { alt: p.data.alt } }));
}

/** Refuses to delete an asset that is still referenced anywhere. */
export async function DELETE(_: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const { id } = await params;
  const m = await db.media.findUnique({ where: { id } });
  if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const usedBy = await mediaUsage(id);
  if (usedBy.length) return NextResponse.json({ error: "Asset is in use", usedBy }, { status: 409 });
  if (!m.isSample) await cloudinary.uploader.destroy(m.publicId, { resource_type: m.resourceType });
  await db.media.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
